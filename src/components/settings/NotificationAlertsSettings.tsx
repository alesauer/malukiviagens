import React, { useState, useEffect, useMemo } from "react";
import {
  Bell,
  Sparkles,
  Calendar,
  Clock,
  Edit3,
  Send,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Check,
  Loader2,
  Play,
  Users,
  Settings2,
  ChevronRight,
  ShieldCheck,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { testWebhookConnection } from "@/lib/webhook.functions";
import { runAutomatedAlertsJob } from "@/lib/notification-scheduler";
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  mergeNotificationSettings,
  buildPersonalizedWhatsAppMessage,
  type FamilyNotificationSettings,
} from "@/lib/notification-settings";
import type { Family } from "@/lib/family";
import { cn } from "@/lib/utils";

interface NotificationAlertsSettingsProps {
  family?: Family | null | undefined;
  onNavigateToIntegrations?: () => void;
}

const PREFERRED_HOURS = [
  "06:00",
  "06:30",
  "07:00",
  "07:30",
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "11:00",
  "12:00",
];

const AVAILABLE_DAYS_IN_ADVANCE = [
  { days: 30, label: "30 dias" },
  { days: 15, label: "15 dias" },
  { days: 7, label: "7 dias" },
  { days: 3, label: "3 dias" },
  { days: 1, label: "1 dia (Véspera)" },
];

export function NotificationAlertsSettings({
  family,
  onNavigateToIntegrations,
}: NotificationAlertsSettingsProps) {
  const qc = useQueryClient();
  const testWebhookFn = useServerFn(testWebhookConnection);
  const runAutoJob = useServerFn(runAutomatedAlertsJob);

  const [settings, setSettings] = useState<FamilyNotificationSettings>(
    DEFAULT_NOTIFICATION_SETTINGS
  );
  const [saving, setSaving] = useState(false);
  const [runningAuto, setRunningAuto] = useState(false);
  const [autoStatusMessage, setAutoStatusMessage] = useState<string | null>(null);
  const [previewTab, setPreviewTab] = useState<
    "nova_viagem" | "programacao_do_dia" | "lembrete_viagem" | "atualizacao_viagem"
  >("nova_viagem");
  const [testingSend, setTestingSend] = useState(false);
  const [openAccordions, setOpenAccordions] = useState<string[]>(["nova_viagem"]);

  useEffect(() => {
    if (family?.notification_settings) {
      setSettings(mergeNotificationSettings(family.notification_settings));
    }
  }, [family]);

  async function handleSaveSettings() {
    if (!family) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("families")
        .update({
          notification_settings: settings as any,
        })
        .eq("id", family.id);

      if (error) {
        toast.error(`Erro ao salvar: ${error.message}`);
        return;
      }

      await qc.invalidateQueries({ queryKey: ["family"] });
      toast.success("Configurações salvas com sucesso!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(`Falha ao salvar: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleRunAutoJob() {
    setRunningAuto(true);
    setAutoStatusMessage(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await runAutoJob({
        data: family?.id ? { familyId: family.id } : {},
        headers,
      });

      if (res.ok) {
        setAutoStatusMessage(res.message);
        toast.success(res.message);
      } else {
        setAutoStatusMessage(res.message);
        toast.error(res.message || "Erro ao executar rotina");
      }
    } catch (err: any) {
      toast.error(err.message || "Falha na execução");
    } finally {
      setRunningAuto(false);
    }
  }

  // Amostra dinâmica para prévia do WhatsApp
  const sampleTrip = {
    title: "Férias em Gramado ❄️",
    destination: "Gramado, RS",
    start_date: "2026-11-20",
    end_date: "2026-11-26",
    category: "Férias",
    budget: 4500.0,
    days_count: 7,
  };

  const sampleActivities = [
    {
      title: "Snowland (Parque de Neve)",
      time: "09:30",
      location: "Rodovia RS-235",
      notes: "Levar casacos térmicos",
    },
    {
      title: "Cantina Pastasciutta",
      time: "13:00",
      location: "Borges de Medeiros",
      notes: "Mesa reservada",
    },
    {
      title: "Lago Negro",
      time: "16:00",
      location: "Rua A. J. Renner",
      notes: "Pedalinho",
    },
  ];

  const previewMessage = useMemo(() => {
    return buildPersonalizedWhatsAppMessage({
      event: previewTab,
      settings,
      familyName: family?.name || "Família Sauer",
      trip: sampleTrip,
      activities: sampleActivities,
      date: "2026-11-21",
      daysLeft: 5,
    });
  }, [previewTab, settings, family?.name]);

  function toggleDayInAdvance(day: number) {
    setSettings((prev) => {
      const current = prev.lembrete_viagem.days_in_advance || [];
      const updated = current.includes(day)
        ? current.filter((d) => d !== day)
        : [...current, day].sort((a, b) => b - a);

      return {
        ...prev,
        lembrete_viagem: {
          ...prev.lembrete_viagem,
          days_in_advance: updated.length > 0 ? updated : [1],
        },
      };
    });
  }

  async function handleSendTestCustomAlert() {
    if (!family?.webhook_url) {
      toast.error("Configure a URL do webhook em Integrações antes de testar.");
      onNavigateToIntegrations?.();
      return;
    }

    setTestingSend(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await testWebhookFn({
        data: {
          webhookUrl: family.webhook_url,
          webhookSecret: family.webhook_secret || undefined,
          familyName: family.name,
          familyId: family.id,
        },
        headers,
      });

      if (res.ok) {
        toast.success("Mensagem de teste enviada para o seu webhook!");
      } else {
        toast.error(`Falha no teste: ${res.message}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro no envio";
      toast.error(msg);
    } finally {
      setTestingSend(false);
    }
  }

  const isWebhookReady = Boolean(family?.webhook_url && family?.webhook_enabled);

  return (
    <div className="space-y-6">
      {/* 1. Barra de Status e Ações Rápidas (Compacta e Elegante) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/60 p-3 sm:px-4 shadow-soft">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Status Webhook */}
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "size-2 rounded-full",
                isWebhookReady ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              )}
            />
            <span className="font-medium text-foreground">
              {isWebhookReady ? "Webhook n8n Conectado" : "Webhook Pendente"}
            </span>
            {!isWebhookReady && onNavigateToIntegrations && (
              <button
                type="button"
                onClick={onNavigateToIntegrations}
                className="text-primary underline ml-1 hover:text-primary/80 font-medium"
              >
                Conectar
              </button>
            )}
          </div>

          <span className="text-border hidden sm:inline">•</span>

          {/* Status Robô Automático */}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="size-2 rounded-full bg-blue-500" />
            <span>Envio Automático Contínuo Ativo</span>
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRunAutoJob}
            disabled={runningAuto || !isWebhookReady}
            className="h-8 rounded-xl gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            title="Verifica viagens e envia programações e lembretes do dia imediatamente"
          >
            {runningAuto ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Play className="size-3 text-primary fill-primary" />
            )}
            Executar Agora
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSaveSettings}
            disabled={saving}
            className="h-8 rounded-xl gap-1.5 text-xs font-semibold shadow-soft"
          >
            {saving ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Check className="size-3.5" />
            )}
            Salvar
          </Button>
        </div>
      </div>

      {autoStatusMessage && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="size-3.5 shrink-0" />
          <span>{autoStatusMessage}</span>
        </div>
      )}

      {/* 2. Grid Principal: Configurações Limpas (Esquerda) + Simulador Discreto (Direita) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda: Lista de Alertas com Accordion (7 colunas) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Card: Destinatários */}
          <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
            <div className="space-y-0.5 pr-3">
              <div className="flex items-center gap-1.5">
                <Users className="size-4 text-primary" />
                <Label htmlFor="only-trip-members" className="text-xs sm:text-sm font-semibold cursor-pointer">
                  Apenas membros com acesso à viagem
                </Label>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Respeita as permissões da família. O usuário só recebe alertas das viagens em que está incluído.
              </p>
            </div>
            <Switch
              id="only-trip-members"
              checked={settings.only_trip_members}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, only_trip_members: checked }))
              }
            />
          </div>

          {/* Accordion dos Alertas (Progressive Disclosure) */}
          <Card className="rounded-3xl border-border/70 shadow-soft overflow-hidden">
            <Accordion
              type="multiple"
              value={openAccordions}
              onValueChange={setOpenAccordions}
              className="w-full divide-y divide-border/60"
            >
              {/* 1. NOVA VIAGEM */}
              <AccordionItem value="nova_viagem" className="border-0 px-4 sm:px-5">
                <AccordionTrigger
                  onClick={() => setPreviewTab("nova_viagem")}
                  className="py-4 hover:no-underline"
                >
                  <div className="flex items-center justify-between w-full pr-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
                        <Sparkles className="size-4" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs sm:text-sm text-foreground">
                            Nova Viagem Cadastrada
                          </span>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[10px] px-1.5 py-0 h-4.5 font-normal",
                              settings.nova_viagem.enabled ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                            )}
                          >
                            {settings.nova_viagem.enabled ? "Automático" : "Desativado"}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-normal">
                          Disparo instantâneo ao criar uma nova viagem.
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center pl-2"
                    >
                      <Switch
                        checked={settings.nova_viagem.enabled}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            nova_viagem: { ...prev.nova_viagem, enabled: checked },
                          }))
                        }
                      />
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pt-1 pb-5 space-y-3.5 border-t border-border/40">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <label className="flex items-center gap-2 rounded-xl bg-secondary/40 p-2.5 cursor-pointer text-xs transition-colors hover:bg-secondary/70">
                      <Switch
                        checked={settings.nova_viagem.include_category}
                        onCheckedChange={(c) =>
                          setSettings((prev) => ({
                            ...prev,
                            nova_viagem: { ...prev.nova_viagem, include_category: c },
                          }))
                        }
                      />
                      <span>Incluir categoria/tipo</span>
                    </label>

                    <label className="flex items-center gap-2 rounded-xl bg-secondary/40 p-2.5 cursor-pointer text-xs transition-colors hover:bg-secondary/70">
                      <Switch
                        checked={settings.nova_viagem.include_budget}
                        onCheckedChange={(c) =>
                          setSettings((prev) => ({
                            ...prev,
                            nova_viagem: { ...prev.nova_viagem, include_budget: c },
                          }))
                        }
                      />
                      <span>Incluir orçamento previsto</span>
                    </label>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">
                      Saudação / Título no WhatsApp
                    </Label>
                    <Input
                      value={settings.nova_viagem.custom_prefix}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          nova_viagem: { ...prev.nova_viagem, custom_prefix: e.target.value },
                        }))
                      }
                      placeholder="✈️ *Nova Viagem Planejada!*"
                      className="h-9 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">
                      Mensagem de Encerramento (Rodapé)
                    </Label>
                    <Input
                      value={settings.nova_viagem.custom_suffix}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          nova_viagem: { ...prev.nova_viagem, custom_suffix: e.target.value },
                        }))
                      }
                      placeholder="🌟 Acesse o app para planejar tudo juntos!"
                      className="h-9 rounded-xl text-xs"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 2. PROGRAMAÇÃO DO DIA */}
              <AccordionItem value="programacao_do_dia" className="border-0 px-4 sm:px-5">
                <AccordionTrigger
                  onClick={() => setPreviewTab("programacao_do_dia")}
                  className="py-4 hover:no-underline"
                >
                  <div className="flex items-center justify-between w-full pr-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 shrink-0">
                        <Calendar className="size-4" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs sm:text-sm text-foreground">
                            Programação do Dia
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 h-4.5 font-normal"
                          >
                            {settings.programacao_do_dia.preferred_time}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-normal">
                          Roteiro matinal com atividades da viagem em andamento.
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center pl-2"
                    >
                      <Switch
                        checked={settings.programacao_do_dia.enabled}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            programacao_do_dia: { ...prev.programacao_do_dia, enabled: checked },
                          }))
                        }
                      />
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pt-1 pb-5 space-y-3.5 border-t border-border/40">
                  <div className="flex items-center justify-between rounded-xl bg-secondary/30 p-2.5">
                    <span className="text-xs font-medium">Horário de Envio Matinal</span>
                    <Select
                      value={settings.programacao_do_dia.preferred_time}
                      onValueChange={(val) =>
                        setSettings((prev) => ({
                          ...prev,
                          programacao_do_dia: { ...prev.programacao_do_dia, preferred_time: val },
                        }))
                      }
                    >
                      <SelectTrigger className="w-28 h-8 rounded-lg text-xs">
                        <SelectValue placeholder="08:00" />
                      </SelectTrigger>
                      <SelectContent>
                        {PREFERRED_HOURS.map((hr) => (
                          <SelectItem key={hr} value={hr} className="text-xs">
                            {hr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 rounded-xl bg-secondary/40 p-2 cursor-pointer text-xs">
                      <Switch
                        checked={settings.programacao_do_dia.include_times}
                        onCheckedChange={(c) =>
                          setSettings((prev) => ({
                            ...prev,
                            programacao_do_dia: { ...prev.programacao_do_dia, include_times: c },
                          }))
                        }
                      />
                      <span>Horários</span>
                    </label>

                    <label className="flex items-center gap-2 rounded-xl bg-secondary/40 p-2 cursor-pointer text-xs">
                      <Switch
                        checked={settings.programacao_do_dia.include_locations}
                        onCheckedChange={(c) =>
                          setSettings((prev) => ({
                            ...prev,
                            programacao_do_dia: { ...prev.programacao_do_dia, include_locations: c },
                          }))
                        }
                      />
                      <span>Locais/Endereços</span>
                    </label>

                    <label className="flex items-center gap-2 rounded-xl bg-secondary/40 p-2 cursor-pointer text-xs">
                      <Switch
                        checked={settings.programacao_do_dia.include_notes}
                        onCheckedChange={(c) =>
                          setSettings((prev) => ({
                            ...prev,
                            programacao_do_dia: { ...prev.programacao_do_dia, include_notes: c },
                          }))
                        }
                      />
                      <span>Dicas/Notas</span>
                    </label>

                    <label className="flex items-center gap-2 rounded-xl bg-secondary/40 p-2 cursor-pointer text-xs">
                      <Switch
                        checked={settings.programacao_do_dia.include_count}
                        onCheckedChange={(c) =>
                          setSettings((prev) => ({
                            ...prev,
                            programacao_do_dia: { ...prev.programacao_do_dia, include_count: c },
                          }))
                        }
                      />
                      <span>Contador total</span>
                    </label>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">
                      Saudação Matinal
                    </Label>
                    <Input
                      value={settings.programacao_do_dia.custom_prefix}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          programacao_do_dia: { ...prev.programacao_do_dia, custom_prefix: e.target.value },
                        }))
                      }
                      placeholder="📅 *Bom dia! Confira a programação de hoje:*"
                      className="h-9 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">
                      Mensagem de Encerramento
                    </Label>
                    <Input
                      value={settings.programacao_do_dia.custom_suffix}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          programacao_do_dia: { ...prev.programacao_do_dia, custom_suffix: e.target.value },
                        }))
                      }
                      placeholder="🌟 Tenham um excelente dia de viagem!"
                      className="h-9 rounded-xl text-xs"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 3. LEMBRETE DE VIAGEM */}
              <AccordionItem value="lembrete_viagem" className="border-0 px-4 sm:px-5">
                <AccordionTrigger
                  onClick={() => setPreviewTab("lembrete_viagem")}
                  className="py-4 hover:no-underline"
                >
                  <div className="flex items-center justify-between w-full pr-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <Clock className="size-4" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs sm:text-sm text-foreground">
                            Lembrete de Viagem
                          </span>
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 h-4.5 font-normal"
                          >
                            {settings.lembrete_viagem.days_in_advance.join(", ")} dias
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-normal">
                          Contagem regressiva automática nos marcos de antecedência.
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center pl-2"
                    >
                      <Switch
                        checked={settings.lembrete_viagem.enabled}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            lembrete_viagem: { ...prev.lembrete_viagem, enabled: checked },
                          }))
                        }
                      />
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pt-1 pb-5 space-y-3.5 border-t border-border/40">
                  <div className="space-y-2">
                    <Label className="text-[11px] font-semibold text-muted-foreground">
                      Disparar automaticamente quantos dias antes da viagem:
                    </Label>
                    <div className="flex flex-wrap gap-1.5">
                      {AVAILABLE_DAYS_IN_ADVANCE.map(({ days, label }) => {
                        const isSelected = settings.lembrete_viagem.days_in_advance.includes(days);
                        return (
                          <button
                            key={days}
                            type="button"
                            onClick={() => toggleDayInAdvance(days)}
                            className={cn(
                              "rounded-lg border px-2.5 py-1 text-xs font-medium transition-all flex items-center gap-1",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground shadow-xs"
                                : "border-border/70 bg-secondary/40 hover:bg-secondary text-muted-foreground"
                            )}
                          >
                            {isSelected && <Check className="size-3" />}
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <label className="flex items-center gap-2 rounded-xl bg-secondary/40 p-2.5 cursor-pointer text-xs">
                    <Switch
                      checked={settings.lembrete_viagem.include_checklist_warning}
                      onCheckedChange={(c) =>
                        setSettings((prev) => ({
                          ...prev,
                          lembrete_viagem: { ...prev.lembrete_viagem, include_checklist_warning: c },
                        }))
                      }
                    />
                    <span>Incluir aviso para conferir checklist de malas e reservas</span>
                  </label>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">
                      Frase de Impacto
                    </Label>
                    <Input
                      value={settings.lembrete_viagem.custom_prefix}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          lembrete_viagem: { ...prev.lembrete_viagem, custom_prefix: e.target.value },
                        }))
                      }
                      placeholder="⏰ *A contagem regressiva começou!*"
                      className="h-9 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">
                      Mensagem de Encerramento
                    </Label>
                    <Input
                      value={settings.lembrete_viagem.custom_suffix}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          lembrete_viagem: { ...prev.lembrete_viagem, custom_suffix: e.target.value },
                        }))
                      }
                      placeholder="📋 Não esqueça de conferir as malas!"
                      className="h-9 rounded-xl text-xs"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 4. ATUALIZAÇÃO DE VIAGEM */}
              <AccordionItem value="atualizacao_viagem" className="border-0 px-4 sm:px-5">
                <AccordionTrigger
                  onClick={() => setPreviewTab("atualizacao_viagem")}
                  className="py-4 hover:no-underline"
                >
                  <div className="flex items-center justify-between w-full pr-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 shrink-0">
                        <Edit3 className="size-4" />
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs sm:text-sm text-foreground">
                            Atualização de Viagem
                          </span>
                          <Badge
                            variant="secondary"
                            className={cn(
                              "text-[10px] px-1.5 py-0 h-4.5 font-normal",
                              settings.atualizacao_viagem.enabled ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                            )}
                          >
                            {settings.atualizacao_viagem.enabled ? "Automático" : "Desativado"}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-normal">
                          Disparo automático ao editar datas ou destino.
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center pl-2"
                    >
                      <Switch
                        checked={settings.atualizacao_viagem.enabled}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            atualizacao_viagem: { ...prev.atualizacao_viagem, enabled: checked },
                          }))
                        }
                      />
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pt-1 pb-5 space-y-3.5 border-t border-border/40">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-muted-foreground">
                      Mensagem de Aviso
                    </Label>
                    <Input
                      value={settings.atualizacao_viagem.custom_prefix}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          atualizacao_viagem: { ...prev.atualizacao_viagem, custom_prefix: e.target.value },
                        }))
                      }
                      placeholder="✏️ *Atenção: uma viagem foi atualizada!*"
                      className="h-9 rounded-xl text-xs"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </div>

        {/* Coluna Direita: Simulador de WhatsApp Compacto (5 colunas) */}
        <div className="lg:col-span-5 space-y-3 sticky top-6">
          <Card className="rounded-3xl border-border/70 bg-card shadow-soft overflow-hidden">
            {/* Header do Mockup */}
            <div className="flex items-center justify-between border-b border-border/50 bg-secondary/25 px-4 py-3">
              <div className="flex items-center gap-2">
                <Smartphone className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-semibold text-foreground">
                  Prévia no WhatsApp
                </span>
              </div>

              {/* Seletor Compacto de Abas */}
              <div className="flex items-center gap-1 bg-secondary/60 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setPreviewTab("nova_viagem")}
                  className={cn(
                    "rounded px-2 py-0.5 text-[10px] font-medium transition-colors",
                    previewTab === "nova_viagem" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Nova
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("programacao_do_dia")}
                  className={cn(
                    "rounded px-2 py-0.5 text-[10px] font-medium transition-colors",
                    previewTab === "programacao_do_dia" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Roteiro
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab("lembrete_viagem")}
                  className={cn(
                    "rounded px-2 py-0.5 text-[10px] font-medium transition-colors",
                    previewTab === "lembrete_viagem" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Lembrete
                </button>
              </div>
            </div>

            <CardContent className="p-3.5 space-y-3">
              {/* Balão WhatsApp Clean */}
              <div className="rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 p-3.5 shadow-inner">
                <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-2.5 text-[10px] text-muted-foreground">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                    Maluki Viagens
                  </span>
                  <span>Agora</span>
                </div>

                <div className="ml-auto rounded-2xl rounded-tr-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/25 p-3 text-xs leading-relaxed text-foreground shadow-xs">
                  <pre className="font-sans whitespace-pre-wrap break-words text-xs text-foreground leading-relaxed">
                    {previewMessage}
                  </pre>

                  <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
                    <span>10:42</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓✓</span>
                  </div>
                </div>
              </div>

              {/* Botão de Disparo de Teste */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSendTestCustomAlert}
                disabled={testingSend || !isWebhookReady}
                className="w-full h-8.5 rounded-xl gap-2 text-xs border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
              >
                {testingSend ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Send className="size-3" />
                )}
                Enviar Teste Agora no WhatsApp
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
