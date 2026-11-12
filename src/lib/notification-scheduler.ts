import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getServiceSupabase } from "@/lib/supabase-service";
import { mergeNotificationSettings, type FamilyNotificationSettings } from "@/lib/notification-settings";
import { dispatchTripWebhook } from "@/lib/webhook.functions";

export interface AutomatedAlertsResult {
  ok: boolean;
  message: string;
  processedAt: string;
  totalTripsChecked: number;
  dailySchedulesSent: number;
  remindersSent: number;
  skippedAlreadySent: number;
  errors: string[];
}

/**
 * Calcula a data de hoje no formato YYYY-MM-DD no fuso horário do Brasil/América do Sul
 */
export function getTodayDateString(offsetDays = 0): string {
  const d = new Date();
  if (offsetDays !== 0) {
    d.setDate(d.getDate() + offsetDays);
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Calcula o número de dias restantes entre duas datas YYYY-MM-DD
 */
export function calculateDaysDifference(targetDate: string, baseDate: string): number {
  try {
    const target = new Date(targetDate + "T00:00:00Z");
    const base = new Date(baseDate + "T00:00:00Z");
    const diffMs = target.getTime() - base.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return -1;
  }
}

/**
 * Processa a varredura e o disparo automático de todos os alertas ativos:
 * 1. Programação do dia para viagens que estão acontecendo hoje
 * 2. Lembretes de contagem regressiva para viagens futuras nos dias configurados
 */
export async function processAllAutomatedAlerts(
  clientDb: any,
  todayStr: string = getTodayDateString(),
  filterFamilyId?: string
): Promise<AutomatedAlertsResult> {
  const result: AutomatedAlertsResult = {
    ok: true,
    message: "",
    processedAt: new Date().toISOString(),
    totalTripsChecked: 0,
    dailySchedulesSent: 0,
    remindersSent: 0,
    skippedAlreadySent: 0,
    errors: [],
  };

  try {
    // 1. Busca famílias com webhook habilitado
    let query = clientDb
      .from("families")
      .select("id, name, webhook_url, webhook_enabled, webhook_events, notification_settings")
      .eq("webhook_enabled", true)
      .not("webhook_url", "is", null);

    if (filterFamilyId) {
      query = query.eq("id", filterFamilyId);
    }

    const { data: families, error: famErr } = await query;

    if (famErr) {
      result.ok = false;
      result.errors.push(`Erro ao consultar famílias: ${famErr.message}`);
      result.message = "Falha ao consultar famílias com webhook habilitado.";
      return result;
    }

    if (!families || families.length === 0) {
      result.message = "Nenhuma família com webhook ativo configurado no momento.";
      return result;
    }

    for (const family of families) {
      if (!family.webhook_url?.trim()) continue;

      const settings: FamilyNotificationSettings = mergeNotificationSettings(
        family.notification_settings as any
      );

      // 2. Busca viagens ativas desta família
      const { data: trips, error: tripsErr } = await clientDb
        .from("trips")
        .select("id, title, start_date, end_date, main_destination, category, budget")
        .eq("family_id", family.id)
        .gte("end_date", todayStr);

      if (tripsErr) {
        result.errors.push(`Família ${family.name}: erro ao buscar viagens: ${tripsErr.message}`);
        continue;
      }

      if (!trips || trips.length === 0) continue;

      for (const trip of trips) {
        result.totalTripsChecked++;

        // A. Viagem em andamento hoje -> Dispara Programação do Dia
        const isInProgress = trip.start_date <= todayStr && trip.end_date >= todayStr;
        if (isInProgress && settings.programacao_do_dia.enabled) {
          const targetKey = `daily_${todayStr}`;

          // Checa idempotência (já disparou hoje?)
          const { data: alreadySent } = await clientDb
            .from("notification_history")
            .select("id")
            .eq("trip_id", trip.id)
            .eq("event", "daily_schedule")
            .eq("target_key", targetKey)
            .maybeSingle();

          if (alreadySent) {
            result.skippedAlreadySent++;
          } else {
            try {
              const dispatchRes = await dispatchTripWebhook({
                data: {
                  tripId: trip.id,
                  event: "daily_schedule",
                  targetDate: todayStr,
                },
              });

              if (dispatchRes.ok) {
                await clientDb.from("notification_history").insert({
                  family_id: family.id,
                  trip_id: trip.id,
                  event: "daily_schedule",
                  target_key: targetKey,
                  status: "sent",
                  details: { target_date: todayStr, title: trip.title },
                });
                result.dailySchedulesSent++;
              } else {
                result.errors.push(`Viagem ${trip.title}: erro webhook: ${dispatchRes.message}`);
              }
            } catch (err: any) {
              result.errors.push(`Erro ao enviar programação de ${trip.title}: ${err.message}`);
            }
          }
        }

        // B. Viagem futura -> Dispara Lembrete de Viagem
        const isFuture = trip.start_date > todayStr;
        if (isFuture && settings.lembrete_viagem.enabled) {
          const daysLeft = calculateDaysDifference(trip.start_date, todayStr);
          const daysInAdvance = settings.lembrete_viagem.days_in_advance || [15, 7, 1];

          if (daysInAdvance.includes(daysLeft)) {
            const targetKey = `reminder_${daysLeft}_days`;

            const { data: alreadySent } = await clientDb
              .from("notification_history")
              .select("id")
              .eq("trip_id", trip.id)
              .eq("event", "trip_reminder")
              .eq("target_key", targetKey)
              .maybeSingle();

            if (alreadySent) {
              result.skippedAlreadySent++;
            } else {
              try {
                const dispatchRes = await dispatchTripWebhook({
                  data: {
                    tripId: trip.id,
                    event: "trip_reminder",
                  },
                });

                if (dispatchRes.ok) {
                  await clientDb.from("notification_history").insert({
                    family_id: family.id,
                    trip_id: trip.id,
                    event: "trip_reminder",
                    target_key: targetKey,
                    status: "sent",
                    details: { days_in_advance: daysLeft, title: trip.title },
                  });
                  result.remindersSent++;
                } else {
                  result.errors.push(`Viagem ${trip.title}: erro lembrete: ${dispatchRes.message}`);
                }
              } catch (err: any) {
                result.errors.push(`Erro ao enviar lembrete de ${trip.title}: ${err.message}`);
              }
            }
          }
        }
      }
    }

    result.message = `Rotina automática executada: ${result.dailySchedulesSent} programação(ões) do dia e ${result.remindersSent} lembrete(s) enviados. (${result.skippedAlreadySent} já haviam sido enviados hoje).`;
    return result;
  } catch (err: any) {
    result.ok = false;
    result.errors.push(err.message || "Erro desconhecido");
    result.message = `Erro durante a rotina automática: ${err.message}`;
    return result;
  }
}

/**
 * Worker em background no Node.js para rodar periodicamente
 */
export function startBackgroundAlertsWorker() {
  const g = globalThis as any;
  if (g.__alertsWorkerStarted) return;
  g.__alertsWorkerStarted = true;

  console.log("[Background Alerts Worker] Iniciando serviço de disparo automático de alertas...");

  // Ciclo inicial 15 segundos após inicialização
  setTimeout(async () => {
    try {
      const db = getServiceSupabase();
      const res = await processAllAutomatedAlerts(db);
      console.log("[Background Alerts Worker] Ciclo inicial concluído:", res.message);
    } catch (e: any) {
      console.error("[Background Alerts Worker] Erro no ciclo inicial:", e.message);
    }
  }, 15000);

  // Intervalo a cada 15 minutos (900.000 ms)
  setInterval(async () => {
    try {
      const db = getServiceSupabase();
      const res = await processAllAutomatedAlerts(db);
      if (res.dailySchedulesSent > 0 || res.remindersSent > 0) {
        console.log("[Background Alerts Worker] Alertas automáticos enviados:", res.message);
      }
    } catch (e: any) {
      console.error("[Background Alerts Worker] Erro no ciclo periódico:", e.message);
    }
  }, 15 * 60 * 1000);
}

/**
 * Server function para disparar manualmente a rotina automática pela UI
 */
export const runAutomatedAlertsJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { familyId?: string | undefined } | undefined) => d || {})
  .handler(async ({ data }) => {
    const serviceDb = getServiceSupabase();
    return await processAllAutomatedAlerts(serviceDb, undefined, data?.familyId);
  });
