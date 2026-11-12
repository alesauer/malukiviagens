import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabase } from "@/integrations/supabase/client";
import { normalizeWhatsApp } from "@/lib/phone";

export type WebhookEventKind = "test" | "trip_created" | "trip_updated" | "trip_reminder";

export interface WebhookRecipient {
  name: string;
  email?: string | undefined;
  phone?: string | undefined;
}

export interface WebhookTripData {
  id?: string | undefined;
  title: string;
  destination?: string | undefined;
  start_date: string;
  end_date: string;
  category?: string | undefined;
  budget?: number | undefined;
  days_count?: number | undefined;
}

export interface WebhookPayload {
  event: WebhookEventKind;
  timestamp: string;
  family: {
    id: string;
    name: string;
  };
  trip: WebhookTripData;
  recipients: WebhookRecipient[];
  formatted_message: string;
}

/**
 * Monta a mensagem pré-formatada amigável para envio direto no WhatsApp (via Evolution API, Z-API, Baileys, etc.)
 */
export function buildTripWhatsAppMessage({
  event,
  trip,
  familyName,
}: {
  event: WebhookEventKind;
  trip: WebhookTripData;
  familyName: string;
}): string {
  const pad = (d: string) => {
    try {
      const [y, m, day] = d.split("-");
      return `${day}/${m}/${y}`;
    } catch {
      return d;
    }
  };

  const periodStr = `${pad(trip.start_date)} até ${pad(trip.end_date)}`;
  const daysText = trip.days_count ? ` (${trip.days_count} ${trip.days_count === 1 ? "dia" : "dias"})` : "";

  if (event === "test") {
    return (
      `🔔 *Teste de Integração — Maluki Viagens*\n\n` +
      `Olá! Este é um evento de teste enviado com sucesso pelo *Maluki Viagens* para o seu workflow no *n8n*.\n\n` +
      `👨‍👩‍👧‍👦 *Família:* ${familyName}\n` +
      `📍 *Destino exemplo:* ${trip.destination || "Gramado, RS"}\n` +
      `📅 *Período exemplo:* ${periodStr}${daysText}\n\n` +
      `✅ Sua automação no WhatsApp está pronta para receber os alertas de viagens!`
    );
  }

  if (event === "trip_reminder") {
    return (
      `⏰ *Lembrete de Viagem — ${familyName}*\n\n` +
      `A sua viagem está chegando!\n\n` +
      `🧳 *${trip.title}*\n` +
      `📍 *Destino:* ${trip.destination || "Não informado"}\n` +
      `📅 *Início:* ${pad(trip.start_date)}\n\n` +
      `📋 Não esqueça de conferir o checklist de malas e reservas no Maluki Viagens!`
    );
  }

  if (event === "trip_updated") {
    return (
      `✏️ *Atualização de Viagem — ${familyName}*\n\n` +
      `A viagem *${trip.title}* foi atualizada.\n\n` +
      `📍 *Destino:* ${trip.destination || "Não informado"}\n` +
      `📅 *Período:* ${periodStr}${daysText}\n\n` +
      `Confira o roteiro e os detalhes atualizados no aplicativo.`
    );
  }

  // Default: trip_created
  return (
    `✈️ *Nova Viagem Planejada — ${familyName}*\n\n` +
    `Uma nova viagem foi cadastrada para a família!\n\n` +
    `🧳 *${trip.title}*\n` +
    `📍 *Destino:* ${trip.destination || "Não informado"}\n` +
    `📅 *Período:* ${periodStr}${daysText}\n` +
    (trip.category ? `🏷️ *Tipo:* ${trip.category}\n` : "") +
    (trip.budget ? `💰 *Orçamento:* R$ ${trip.budget.toFixed(2)}\n` : "") +
    `\n🌟 Acesse o Maluki Viagens para planejar o roteiro e o checklist juntos!`
  );
}

const TestWebhookSchema = z.object({
  webhookUrl: z.string().url("A URL do webhook deve ser válida (iniciando com http:// ou https://)"),
  webhookSecret: z.string().optional(),
  familyName: z.string().optional(),
  familyId: z.string().optional(),
});

/**
 * Server function para testar a conexão com o endpoint do n8n
 */
export const testWebhookConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => TestWebhookSchema.parse(d))
  .handler(async ({ data, context }) => {
    const startMs = Date.now();
    const familyName = data.familyName || "Família Maluki";
    const familyId = data.familyId || "test-family-id";

    const testTrip: WebhookTripData = {
      id: "teste-viagem-001",
      title: "Férias em Família (Exemplo de Teste)",
      destination: "Gramado, RS",
      start_date: "2026-11-20",
      end_date: "2026-11-25",
      category: "Férias",
      budget: 3500.0,
      days_count: 6,
    };

    const userEmail = (context.claims?.email as string) || "viajante@malukiviagens.com";
    const userName = userEmail.split("@")[0] || "Viajante";

    const payload: WebhookPayload = {
      event: "test",
      timestamp: new Date().toISOString(),
      family: {
        id: familyId,
        name: familyName,
      },
      trip: testTrip,
      recipients: [
        {
          name: userName,
          email: userEmail,
          phone: "+5531999998888",
        },
      ],
      formatted_message: buildTripWhatsAppMessage({
        event: "test",
        trip: testTrip,
        familyName,
      }),
    };

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent": "MalukiViagens-Webhook/1.0",
      };

      if (data.webhookSecret?.trim()) {
        headers["X-Webhook-Secret"] = data.webhookSecret.trim();
        headers["Authorization"] = `Bearer ${data.webhookSecret.trim()}`;
      }

      const res = await fetch(data.webhookUrl.trim(), {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });

      const durationMs = Date.now() - startMs;

      if (!res.ok) {
        let detail = res.statusText || "";
        try {
          const bodyJson = await res.json();
          if (bodyJson.hint) {
            detail = bodyJson.hint;
          } else if (bodyJson.message) {
            detail = bodyJson.message;
          }
        } catch {
          // não é JSON, mantém statusText
        }

        return {
          ok: false,
          status: res.status,
          durationMs,
          message: `O n8n respondeu com erro HTTP ${res.status}${detail ? `: ${detail}` : "."}`,
        };
      }

      return {
        ok: true,
        status: res.status,
        durationMs,
        message: `Webhook recebido com sucesso pelo n8n! (HTTP ${res.status} em ${durationMs}ms)`,
      };
    } catch (err: unknown) {
      const durationMs = Date.now() - startMs;
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      return {
        ok: false,
        status: 0,
        durationMs,
        message: `Falha ao conectar com a URL do webhook: ${msg}`,
      };
    }
  });

const DispatchWebhookSchema = z.object({
  tripId: z.string().uuid(),
  event: z.enum(["trip_created", "trip_updated", "trip_reminder"]),
});

/**
 * Server function para disparar webhook real de uma viagem cadastrada ou atualizada
 */
export const dispatchTripWebhook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => DispatchWebhookSchema.parse(d))
  .handler(async ({ data, context }) => {
    try {
      const db = context.supabase;

      // 1. Busca os dados da viagem usando o cliente autenticado
      const { data: trip, error: tripErr } = await db
        .from("trips")
        .select("*")
        .eq("id", data.tripId)
        .maybeSingle();

      if (tripErr || !trip) {
        console.error("[Webhook] Erro ao buscar viagem:", tripErr);
        return { ok: false, message: `Viagem não encontrada: ${tripErr?.message || "Registro não localizado"}` };
      }

      // 2. Busca as configurações de webhook da família
      const { data: family, error: famErr } = await db
        .from("families")
        .select("id, name, webhook_url, webhook_enabled, webhook_secret, webhook_events")
        .eq("id", trip.family_id)
        .maybeSingle();

      if (famErr || !family) {
        console.error("[Webhook] Erro ao buscar família:", famErr);
        return { ok: false, message: `Família não encontrada: ${famErr?.message || "Registro não localizado"}` };
      }

      if (!family.webhook_enabled || !family.webhook_url?.trim()) {
        console.log(`[Webhook] Webhook desabilitado para a família ${family.name} (${family.id})`);
        return { ok: false, message: "Webhook desabilitado para esta família." };
      }

      const enabledEvents = family.webhook_events || ["trip_created"];
      if (!enabledEvents.includes(data.event)) {
        console.log(`[Webhook] Evento ${data.event} não está habilitado para ${family.name}. Ativos:`, enabledEvents);
        return { ok: false, message: `O evento ${data.event} não está habilitado para envio.` };
      }

      // 3. Busca os integrantes da família para compor os destinatários vinculados a esta viagem
      const { data: members, error: memErr } = await db
        .from("family_members")
        .select("user_id, role, all_trips_access, allowed_trip_ids")
        .eq("family_id", family.id);

      if (memErr) {
        console.error("[Webhook] Erro ao buscar membros da família:", memErr);
      }

      // Filtra apenas membros que possuem acesso a esta viagem (ou todos no caso de teste)
      const allowedMembers = (members || []).filter((m: any) => {
        if (!trip.id) return true; // evento de teste ou genérico
        if (m.role === "admin") return true; // admin sempre recebe
        if (m.all_trips_access !== false) return true; // acesso a todas as viagens
        const allowedIds: string[] = Array.isArray(m.allowed_trip_ids) ? m.allowed_trip_ids : [];
        return allowedIds.includes(trip.id);
      });

      const allowedUserIds = allowedMembers.map((m: any) => m.user_id);
      const { data: profiles, error: profErr } = allowedUserIds.length > 0
        ? await db.from("profiles").select("id, full_name, email, phone").in("id", allowedUserIds)
        : { data: [], error: null };

      if (profErr) {
        console.error("[Webhook] Erro ao buscar perfis dos membros:", profErr);
      }

      const recipients: WebhookRecipient[] = allowedMembers.map((m: any) => {
        const prof = (profiles || []).find((p: any) => p.id === m.user_id);
        return {
          name: prof?.full_name || "Membro da Família",
          email: prof?.email || undefined,
          phone: prof?.phone ? normalizeWhatsApp(prof.phone) : undefined,
        };
      });

      // Calcula a quantidade de dias
      let daysCount: number | undefined = undefined;
      try {
        const start = new Date(trip.start_date);
        const end = new Date(trip.end_date);
        daysCount = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
      } catch {}

      const tripData: WebhookTripData = {
        id: trip.id,
        title: trip.title,
        destination: trip.main_destination || undefined,
        start_date: trip.start_date,
        end_date: trip.end_date,
        category: trip.category || undefined,
        budget: trip.budget || undefined,
        days_count: daysCount,
      };

      const payload: WebhookPayload = {
        event: data.event,
        timestamp: new Date().toISOString(),
        family: {
          id: family.id,
          name: family.name,
        },
        trip: tripData,
        recipients,
        formatted_message: buildTripWhatsAppMessage({
          event: data.event,
          trip: tripData,
          familyName: family.name,
        }),
      };

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent": "MalukiViagens-Webhook/1.0",
      };

      if (family.webhook_secret?.trim()) {
        headers["X-Webhook-Secret"] = family.webhook_secret.trim();
        headers["Authorization"] = `Bearer ${family.webhook_secret.trim()}`;
      }

      console.log(`[Webhook] Enviando evento "${data.event}" para "${family.webhook_url}" com ${recipients.length} destinatários.`);

      const res = await fetch(family.webhook_url.trim(), {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(8000),
      });

      const resText = await res.text().catch(() => "");
      console.log(`[Webhook] Resposta n8n HTTP ${res.status}:`, resText);

      if (!res.ok) {
        let detail = res.statusText || "";
        try {
          const bodyJson = JSON.parse(resText);
          if (bodyJson.hint) {
            detail = bodyJson.hint;
          } else if (bodyJson.message) {
            detail = bodyJson.message;
          }
        } catch {}

        return {
          ok: false,
          status: res.status,
          message: `Erro ao enviar para n8n: HTTP ${res.status}${detail ? ` — ${detail}` : ""}`,
        };
      }

      return { ok: true, status: res.status, message: "Webhook enviado com sucesso ao n8n!" };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      console.error("[Webhook] Exceção ao enviar webhook:", err);
      return { ok: false, message: `Falha no envio do webhook: ${msg}` };
    }
  });
