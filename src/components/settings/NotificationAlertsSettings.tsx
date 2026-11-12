import React, { useState, useEffect, useMemo } from "react";
import {
  Bell,
  BellRing,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MessageSquare,
  Clock,
  Calendar,
  Send,
  Loader2,
  ExternalLink,
  ChevronDown,
  Smartphone,
  Eye,
  Settings2,
  Users,
  Shield,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { testWebhookConnection } from "@/lib/webhook.functions";
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

  const [settings, setSettings] = useState<FamilyNotificationSettings>(
    DEFAULT_NOTIFICATION_SETTINGS
  );
  const [saving, setSaving] = useState(false);
  const [previewTab, setPreviewTab] = useState<
    "nova_viagem" | "programacao_do_dia" | "lembrete_viagem" | "atualizacao_viagem"
  >("nova_viagem");
  const [testingSend, setTestingSend] = useState(false);

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
        toast.error(`Erro ao salvar configurações de alertas: ${error.message}`);
        return;
      }

      await qc.invalidateQueries({ queryKey: ["family"] });
      toast.success("Configurações de notificações personalizadas salvas com sucesso!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(`Falha ao salvar: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  // Amostras realistas para a pré-visualização no WhatsApp
  const sampleTrip = {
    title: "Férias em Gramado e Canela ❄️",
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
      title: "Almoço na Cantina Pastasciutta",
      time: "13:00",
      location: "Av. Borges de Medeiros",
      notes: "Mesa reservada para a família",
    },
    {
      title: "Passeio pelo Lago Negro",
      time: "16:00",
      location: "Rua A. J. Renner",
      notes: "Passeio de pedalinho",
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
      toast.error("Configure uma URL de webhook na aba de Integrações antes de testar.");
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
        toast.success("Alerta de teste enviado com sucesso para o seu webhook!");
      } else {
        toast.error(`Falha ao disparar teste: ${res.message}`);
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
      {/* Banner de Status do Webhook */}
      <Card className="rounded-3xl border-border/70 shadow-soft overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-card/60">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex size-11 items-center justify-center rounded-2xl shrink-0",
                isWebhookReady
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              )}
            >
              {isWebhookReady ? <CheckCircle2 className="size-6" /> : <AlertCircle className="size-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-foreground">
                  Canal de Disparo WhatsApp & n8n
                </h3>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-medium",
                    isWebhookReady
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  )}
                >
                  {isWebhookReady ? "Ativo e Conectado" : "Pendente de Conexão"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isWebhookReady
                  ? "Suas notificações personalizadas são entregues em tempo real pelo webhook configurado."
                  : "Para que os alertas cheguem no WhatsApp, configure a URL do seu webhook n8n."}
              </p>
            </div>
          </div>

          {!isWebhookReady && onNavigateToIntegrations && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onNavigateToIntegrations}
              className="rounded-xl gap-1.5 text-xs border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"
            >
              <Settings2 className="size-3.5" />
              Configurar Webhook
            </Button>
          )}
        </div>
      </Card>

      {/* Grid: Configurações dos Alertas + Simulador WhatsApp */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Coluna Esquerda: Opções e Regras de Notificações (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Destinatários e Política de Envio */}
          <Card className="rounded-3xl border-border/70 shadow-soft">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Users className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg">Destinatários Padrão</CardTitle>
                  <CardDescription className="text-xs">
                    Defina quem recebe as mensagens disparadas pelo sistema.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/20 p-3.5">
                <div className="space-y-0.5 pr-4">
                  <Label htmlFor="only-trip-members" className="text-xs sm:text-sm font-semibold cursor-pointer">
                    Apenas membros autorizados na viagem
                  </Label>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    Quando ativado, respeita a permissão de cada membro da família. Apenas quem tem acesso à viagem recebe os alertas.
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
            </CardContent>
          </Card>

          {/* Card: 1. Alerta de Nova Viagem */}
          <Card className="rounded-3xl border-border/70 shadow-soft transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">✈️ Nova Viagem Cadastrada</CardTitle>
                    <CardDescription className="text-xs">
                      Enviado automaticamente quando uma nova viagem é criada.
                    </CardDescription>
                  </div>
                </div>
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
            </CardHeader>

            {settings.nova_viagem.enabled && (
              <CardContent className="space-y-4 pt-1">
                {/* Opções de Campos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <label className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-card/60 p-2.5 cursor-pointer text-xs">
                    <Switch
                      checked={settings.nova_viagem.include_category}
                      onCheckedChange={(c) =>
                        setSettings((prev) => ({
                          ...prev,
                          nova_viagem: { ...prev.nova_viagem, include_category: c },
                        }))
                      }
                    />
                    <span>Incluir categoria/tipo da viagem</span>
                  </label>

                  <label className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-card/60 p-2.5 cursor-pointer text-xs">
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

                {/* Saudação Personalizada */}
                <div className="space-y-1.5">
                  <Label htmlFor="nv-prefix" className="text-xs font-semibold">
                    Saudação / Título Inicial Personalizado
                  </Label>
                  <Input
                    id="nv-prefix"
                    value={settings.nova_viagem.custom_prefix}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        nova_viagem: { ...prev.nova_viagem, custom_prefix: e.target.value },
                      }))
                    }
                    placeholder="Ex: ✈️ *Partiu nova viagem, família!*"
                    className="h-9 rounded-xl text-xs"
                  />
                </div>

                {/* Mensagem Final Personalizada */}
                <div className="space-y-1.5">
                  <Label htmlFor="nv-suffix" className="text-xs font-semibold">
                    Mensagem de Encerramento (Rodapé)
                  </Label>
                  <Input
                    id="nv-suffix"
                    value={settings.nova_viagem.custom_suffix}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        nova_viagem: { ...prev.nova_viagem, custom_suffix: e.target.value },
                      }))
                    }
                    placeholder="Ex: 🌟 Acesse o app para planejar tudo juntos!"
                    className="h-9 rounded-xl text-xs"
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Card: 2. Programação do Dia */}
          <Card className="rounded-3xl border-border/70 shadow-soft transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                    <Calendar className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">📅 Programação do Dia</CardTitle>
                    <CardDescription className="text-xs">
                      Roteiro diário com atividades, passeios e horários para o grupo.
                    </CardDescription>
                  </div>
                </div>
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
            </CardHeader>

            {settings.programacao_do_dia.enabled && (
              <CardContent className="space-y-4 pt-1">
                {/* Horário Preferencial */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl border border-border/60 bg-muted/20 p-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold">Horário Preferencial de Envio</span>
                    <p className="text-[11px] text-muted-foreground">
                      Horário recomendado para disparo da rotina matinal pelo n8n.
                    </p>
                  </div>
                  <Select
                    value={settings.programacao_do_dia.preferred_time}
                    onValueChange={(val) =>
                      setSettings((prev) => ({
                        ...prev,
                        programacao_do_dia: { ...prev.programacao_do_dia, preferred_time: val },
                      }))
                    }
                  >
                    <SelectTrigger className="w-32 h-8 rounded-xl text-xs">
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

                {/* Opções das Atividades */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <label className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-card/60 p-2.5 cursor-pointer text-xs">
                    <Switch
                      checked={settings.programacao_do_dia.include_times}
                      onCheckedChange={(c) =>
                        setSettings((prev) => ({
                          ...prev,
                          programacao_do_dia: { ...prev.programacao_do_dia, include_times: c },
                        }))
                      }
                    />
                    <span>Incluir horários das atividades</span>
                  </label>

                  <label className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-card/60 p-2.5 cursor-pointer text-xs">
                    <Switch
                      checked={settings.programacao_do_dia.include_locations}
                      onCheckedChange={(c) =>
                        setSettings((prev) => ({
                          ...prev,
                          programacao_do_dia: { ...prev.programacao_do_dia, include_locations: c },
                        }))
                      }
                    />
                    <span>Incluir locais e endereços</span>
                  </label>

                  <label className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-card/60 p-2.5 cursor-pointer text-xs">
                    <Switch
                      checked={settings.programacao_do_dia.include_notes}
                      onCheckedChange={(c) =>
                        setSettings((prev) => ({
                          ...prev,
                          programacao_do_dia: { ...prev.programacao_do_dia, include_notes: c },
                        }))
                      }
                    />
                    <span>Incluir dicas e anotações</span>
                  </label>

                  <label className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-card/60 p-2.5 cursor-pointer text-xs">
                    <Switch
                      checked={settings.programacao_do_dia.include_count}
                      onCheckedChange={(c) =>
                        setSettings((prev) => ({
                          ...prev,
                          programacao_do_dia: { ...prev.programacao_do_dia, include_count: c },
                        }))
                      }
                    />
                    <span>Exibir total de atividades</span>
                  </label>
                </div>

                {/* Mensagens Personalizadas */}
                <div className="space-y-1.5">
                  <Label htmlFor="pd-prefix" className="text-xs font-semibold">
                    Saudação Matinal Personalizada
                  </Label>
                  <Input
                    id="pd-prefix"
                    value={settings.programacao_do_dia.custom_prefix}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        programacao_do_dia: { ...prev.programacao_do_dia, custom_prefix: e.target.value },
                      }))
                    }
                    placeholder="Ex: 📅 *Bom dia! Confira a programação de hoje:*"
                    className="h-9 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pd-suffix" className="text-xs font-semibold">
                    Mensagem de Encerramento
                  </Label>
                  <Input
                    id="pd-suffix"
                    value={settings.programacao_do_dia.custom_suffix}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        programacao_do_dia: { ...prev.programacao_do_dia, custom_suffix: e.target.value },
                      }))
                    }
                    placeholder="Ex: 🌟 Tenham um excelente dia de viagem!"
                    className="h-9 rounded-xl text-xs"
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Card: 3. Lembrete de Viagem */}
          <Card className="rounded-3xl border-border/70 shadow-soft transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <Clock className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">⏰ Lembrete de Viagem</CardTitle>
                    <CardDescription className="text-xs">
                      Contagem regressiva e aviso de preparativos para a família.
                    </CardDescription>
                  </div>
                </div>
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
            </CardHeader>

            {settings.lembrete_viagem.enabled && (
              <CardContent className="space-y-4 pt-1">
                {/* Dias de Antecedência */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Dias de Antecedência para Enviar Lembrete</Label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_DAYS_IN_ADVANCE.map(({ days, label }) => {
                      const isSelected = settings.lembrete_viagem.days_in_advance.includes(days);
                      return (
                        <button
                          key={days}
                          type="button"
                          onClick={() => toggleDayInAdvance(days)}
                          className={cn(
                            "rounded-xl border px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground shadow-xs"
                              : "border-border/70 bg-card hover:bg-secondary text-muted-foreground"
                          )}
                        >
                          {isSelected && <Check className="size-3" />}
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Opção Checklist */}
                <label className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-card/60 p-2.5 cursor-pointer text-xs">
                  <Switch
                    checked={settings.lembrete_viagem.include_checklist_warning}
                    onCheckedChange={(c) =>
                      setSettings((prev) => ({
                        ...prev,
                        lembrete_viagem: { ...prev.lembrete_viagem, include_checklist_warning: c },
                      }))
                    }
                  />
                  <span>Incluir alerta para conferir checklist de malas e reservas</span>
                </label>

                {/* Mensagens Personalizadas */}
                <div className="space-y-1.5">
                  <Label htmlFor="lv-prefix" className="text-xs font-semibold">
                    Título / Frase de Impacto
                  </Label>
                  <Input
                    id="lv-prefix"
                    value={settings.lembrete_viagem.custom_prefix}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        lembrete_viagem: { ...prev.lembrete_viagem, custom_prefix: e.target.value },
                      }))
                    }
                    placeholder="Ex: ⏰ *A contagem regressiva começou!*"
                    className="h-9 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="lv-suffix" className="text-xs font-semibold">
                    Mensagem de Encerramento
                  </Label>
                  <Input
                    id="lv-suffix"
                    value={settings.lembrete_viagem.custom_suffix}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        lembrete_viagem: { ...prev.lembrete_viagem, custom_suffix: e.target.value },
                      }))
                    }
                    placeholder="Ex: 📋 Não esqueça de conferir as malas!"
                    className="h-9 rounded-xl text-xs"
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Card: 4. Atualização de Viagem */}
          <Card className="rounded-3xl border-border/70 shadow-soft transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
                    <MessageSquare className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">✏️ Atualização de Viagem</CardTitle>
                    <CardDescription className="text-xs">
                      Enviado quando datas, destino ou status da viagem forem alterados.
                    </CardDescription>
                  </div>
                </div>
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
            </CardHeader>

            {settings.atualizacao_viagem.enabled && (
              <CardContent className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="av-prefix" className="text-xs font-semibold">
                    Mensagem de Aviso Personalizada
                  </Label>
                  <Input
                    id="av-prefix"
                    value={settings.atualizacao_viagem.custom_prefix}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        atualizacao_viagem: { ...prev.atualizacao_viagem, custom_prefix: e.target.value },
                      }))
                    }
                    placeholder="Ex: ✏️ *Atenção: uma viagem foi atualizada!*"
                    className="h-9 rounded-xl text-xs"
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Botão de Salvar Alterações */}
          <div className="pt-2">
            <Button
              type="button"
              onClick={handleSaveSettings}
              disabled={saving}
              className="w-full h-11 rounded-2xl gap-2 font-medium shadow-soft text-sm"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
              Salvar Configurações de Alertas
            </Button>
          </div>
        </div>

        {/* Coluna Direita: Simulador de WhatsApp em Tempo Real (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-6 space-y-4">
            <Card className="rounded-3xl border-border/80 bg-card shadow-soft overflow-hidden">
              <CardHeader className="pb-3 border-b border-border/50 bg-secondary/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <CardTitle className="text-sm font-semibold">
                      Simulador WhatsApp em Tempo Real
                    </CardTitle>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-muted-foreground">
                    Ao Vivo
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Veja exatamente como seus membros receberão cada mensagem no celular.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 space-y-3.5">
                {/* Seletor do Tipo no Simulador */}
                <Tabs
                  value={previewTab}
                  onValueChange={(v) => setPreviewTab(v as any)}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 h-8 w-full rounded-xl bg-muted/60 p-0.5 text-xs">
                    <TabsTrigger value="nova_viagem" className="rounded-lg text-[11px] px-1">
                      Nova Viagem
                    </TabsTrigger>
                    <TabsTrigger value="programacao_do_dia" className="rounded-lg text-[11px] px-1">
                      Programação
                    </TabsTrigger>
                    <TabsTrigger value="lembrete_viagem" className="rounded-lg text-[11px] px-1">
                      Lembrete
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Mockup do Balão do WhatsApp */}
                <div className="relative rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 shadow-inner min-h-[220px]">
                  {/* Cabeçalho fake de chat */}
                  <div className="mb-3 flex items-center justify-between border-b border-border/40 pb-2 text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                      Maluki Viagens (WhatsApp)
                    </span>
                    <span>10:42</span>
                  </div>

                  {/* Balão de Mensagem */}
                  <div className="relative ml-auto max-w-[95%] rounded-2xl rounded-tr-xs bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 p-3.5 text-xs text-foreground shadow-xs">
                    <pre className="font-sans whitespace-pre-wrap leading-relaxed break-words text-xs text-foreground">
                      {previewMessage}
                    </pre>

                    <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-muted-foreground">
                      <span>10:42</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓✓</span>
                    </div>
                  </div>
                </div>

                {/* Ação de Disparo Imediato de Teste */}
                <div className="pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSendTestCustomAlert}
                    disabled={testingSend}
                    className="w-full rounded-xl gap-2 text-xs border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
                  >
                    {testingSend ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Send className="size-3.5" />
                    )}
                    Disparar Alerta de Teste Agora no WhatsApp
                  </Button>
                  <p className="text-[10px] text-center text-muted-foreground mt-1.5">
                    Dispara uma requisição real para a URL do Webhook configurada no n8n.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
