import { useState, useMemo } from "react";
import { MessageSquare, Clock, Calendar, Send, Sparkles, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTripRows } from "@/lib/trip-data";
import { fmtDate, fmtLongDay, tripDays } from "@/lib/format";
import { formatPhoneDisplay } from "@/lib/phone";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { dispatchTripWebhook, type WebhookEventKind } from "@/lib/webhook.functions";
import { supabase } from "@/integrations/supabase/client";

interface SendTripNotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: {
    id: string;
    title: string;
    start_date: string;
    end_date: string;
    main_destination?: string | null;
  };
  familyName: string;
  recipients?: Array<{
    name: string;
    phone?: string | null;
    email?: string | null;
  }>;
}

export function SendTripNotificationModal({
  open,
  onOpenChange,
  trip,
  familyName,
  recipients = [],
}: SendTripNotificationModalProps) {
  const [eventType, setEventType] = useState<"trip_reminder" | "daily_schedule">("trip_reminder");
  const [sending, setSending] = useState(false);
  const dispatchWebhook = useServerFn(dispatchTripWebhook);

  const days = useMemo(() => tripDays(trip.start_date, trip.end_date), [trip.start_date, trip.end_date]);
  
  // Seleciona a data de hoje se estiver no período da viagem, senão pega o primeiro dia
  const todayIso = new Date().toISOString().split("T")[0] || "";
  const defaultDay: string = (todayIso && days.includes(todayIso)) ? todayIso : (days[0] ?? todayIso);
  const [selectedDate, setSelectedDate] = useState<string>(defaultDay);

  const { data: activities = [] } = useTripRows("activities", trip.id);
  const dayActivities = useMemo(() => {
    return activities
      .filter((a) => a.date === selectedDate)
      .sort((a, b) => (a.time ?? "99").localeCompare(b.time ?? "99"));
  }, [activities, selectedDate]);

  async function handleSend() {
    setSending(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const result = await dispatchWebhook({
        data: {
          tripId: trip.id,
          event: eventType,
          targetDate: eventType === "daily_schedule" ? selectedDate : undefined,
        },
        headers,
      });

      if (result.ok) {
        toast.success(
          eventType === "daily_schedule"
            ? "Programação do dia enviada para o WhatsApp da família via n8n!"
            : "Lembrete da viagem enviado para o WhatsApp da família via n8n!"
        );
        onOpenChange(false);
      } else {
        toast.error(result.message || "Erro ao disparar mensagem para o n8n.");
      }
    } catch (err: any) {
      toast.error(err.message || "Falha ao conectar com servidor do webhook.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[95vw] rounded-3xl p-5 sm:p-6 max-h-[90dvh] overflow-y-auto">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <MessageSquare className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-display font-semibold">
                Notificar Família no WhatsApp
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Envie alertas estruturados com dados de controle direto para o n8n.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Seleção do Tipo de Mensagem */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Tipo de Mensagem a Enviar</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setEventType("trip_reminder")}
                className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all ${
                  eventType === "trip_reminder"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 shadow-xs"
                    : "border-border/70 hover:bg-muted/40 text-foreground"
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
                  <Clock className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  Lembrete de Viagem
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Contagem regressiva, aviso de malas e checagem de documentos.
                </p>
                <Badge variant="outline" className="mt-2 text-[10px] uppercase font-mono">
                  tipo: lembrete_viagem
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => setEventType("daily_schedule")}
                className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all ${
                  eventType === "daily_schedule"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100 shadow-xs"
                    : "border-border/70 hover:bg-muted/40 text-foreground"
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs sm:text-sm">
                  <Calendar className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  Programação do Dia
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Lista com as atividades, passeios e horários planejados.
                </p>
                <Badge variant="outline" className="mt-2 text-[10px] uppercase font-mono">
                  tipo: programacao_do_dia
                </Badge>
              </button>
            </div>
          </div>

          {/* Seletor de Data para Programação do Dia */}
          {eventType === "daily_schedule" && (
            <div className="space-y-2 rounded-2xl border border-border/70 bg-card/60 p-3 sm:p-4">
              <Label htmlFor="date-select" className="text-xs font-semibold flex items-center justify-between">
                <span>Data da Programação</span>
                <span className="text-[11px] text-muted-foreground font-normal">
                  {dayActivities.length} {dayActivities.length === 1 ? "atividade" : "atividades"}
                </span>
              </Label>
              <Select value={selectedDate} onValueChange={setSelectedDate}>
                <SelectTrigger id="date-select" className="h-10 rounded-xl text-xs sm:text-sm">
                  <SelectValue placeholder="Selecione a data" />
                </SelectTrigger>
                <SelectContent className="max-h-60 text-xs">
                  {days.map((day, idx) => (
                    <SelectItem key={day} value={day}>
                      Dia {idx + 1} — {fmtDate(day)} ({fmtLongDay(day)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Prévia rápida das atividades encontradas */}
              {dayActivities.length > 0 ? (
                <div className="space-y-1 pt-1 max-h-32 overflow-y-auto pr-1">
                  {dayActivities.map((act) => (
                    <div key={act.id} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-secondary/50">
                      <span className="truncate font-medium">{act.title}</span>
                      <span className="text-muted-foreground text-[11px] shrink-0 font-mono ml-2">
                        {act.time || "Dia todo"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic pt-1">
                  Nenhuma atividade cadastrada no roteiro para esta data.
                </p>
              )}
            </div>
          )}

          {/* Destinatários com WhatsApp */}
          <div className="space-y-1.5 rounded-2xl border border-border/70 bg-secondary/30 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                Destinatários Vinculados à Viagem
              </span>
              <span className="text-[11px] text-muted-foreground">
                {recipients.length} {recipients.length === 1 ? "membro" : "membros"}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {recipients.map((r, idx) => (
                <Badge key={idx} variant="secondary" className="gap-1 text-[11px] font-normal">
                  <span className="font-semibold">{r.name}</span>
                  {r.phone ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                      ({formatPhoneDisplay(r.phone)})
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 italic">(sem WhatsApp)</span>
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Informação sobre os dados de controle */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[11px] text-muted-foreground flex items-start gap-2">
            <Sparkles className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <p>
              O n8n receberá o campo de controle <code>control.type</code> com o valor{" "}
              <strong className="text-foreground">
                {eventType === "daily_schedule" ? '"programacao_do_dia"' : '"lembrete_viagem"'}
              </strong>{" "}
              para você usar em nós de decisão <em>Switch</em> ou <em>IF</em>.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs h-9"
            disabled={sending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="rounded-xl text-xs h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
          >
            {sending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Enviando ao n8n…
              </>
            ) : (
              <>
                <Send className="size-3.5" />
                Disparar no WhatsApp
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
