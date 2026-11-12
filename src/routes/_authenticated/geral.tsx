import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Sparkles,
  Settings,
  KeyRound,
  ExternalLink,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Cpu,
  ShieldCheck,
  Webhook,
  Send,
  Copy,
  Check,
  Smartphone,
  MessageSquareCode,
  Radio,
  Info,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFamily } from "@/lib/family";
import { testAiConnection } from "@/lib/ai.functions";
import { testWebhookConnection } from "@/lib/webhook.functions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/_authenticated/geral")({
  head: () => ({
    meta: [
      { title: "Configurações Gerais — Maluki Viagens" },
      { name: "description", content: "Gerencie as configurações gerais, chaves de IA e integrações da família." },
    ],
  }),
  component: GeralPage,
});

function GeralPage() {
  const { data: family, isLoading: familyLoading } = useFamily();
  const qc = useQueryClient();
  const testConn = useServerFn(testAiConnection);
  const testWebhookFn = useServerFn(testWebhookConnection);

  // Estados de IA
  const [deepseekKey, setDeepseekKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [aiProvider, setAiProvider] = useState("deepseek");
  const [showDeepseek, setShowDeepseek] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);
  const [savingAi, setSavingAi] = useState(false);
  const [testingDeepseek, setTestingDeepseek] = useState(false);
  const [testingOpenai, setTestingOpenai] = useState(false);

  // Estados de Webhook & Integrações
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEnabled, setWebhookEnabled] = useState(false);
  const [webhookSecret, setWebhookSecret] = useState("");
  const [webhookEvents, setWebhookEvents] = useState<string[]>(["trip_created"]);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [savingWebhook, setSavingWebhook] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; durationMs?: number } | null>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  // Carrega chaves salvas da família quando os dados estiverem disponíveis
  useEffect(() => {
    if (family) {
      setDeepseekKey(family.deepseek_api_key || "");
      setOpenaiKey(family.openai_api_key || "");
      setAiProvider(family.ai_provider || "deepseek");

      setWebhookUrl(family.webhook_url || "");
      setWebhookEnabled(Boolean(family.webhook_enabled));
      setWebhookSecret(family.webhook_secret || "");
      setWebhookEvents(family.webhook_events || ["trip_created"]);
    }
  }, [family]);

  async function handleSaveAi(e: React.FormEvent) {
    e.preventDefault();
    if (!family) return;
    setSavingAi(true);
    try {
      const { error } = await supabase
        .from("families")
        .update({
          deepseek_api_key: deepseekKey.trim() || null,
          openai_api_key: openaiKey.trim() || null,
          ai_provider: aiProvider,
        })
        .eq("id", family.id);

      if (error) {
        toast.error(`Erro ao salvar: ${error.message}`);
        return;
      }

      await qc.invalidateQueries({ queryKey: ["family"] });
      toast.success("Configurações de IA salvas com sucesso!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(`Falha ao salvar configurações: ${msg}`);
    } finally {
      setSavingAi(false);
    }
  }

  async function handleTestAiKey(provider: "deepseek" | "openai") {
    const key = provider === "deepseek" ? deepseekKey.trim() : openaiKey.trim();
    if (!key) {
      toast.error(`Informe a chave da ${provider === "deepseek" ? "DeepSeek" : "OpenAI"} antes de testar.`);
      return;
    }

    const setTesting = provider === "deepseek" ? setTestingDeepseek : setTestingOpenai;
    setTesting(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const result = await testConn({
        data: { provider, apiKey: key },
        headers,
      });

      if (result.ok) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Não foi possível testar";
      toast.error(`Falha no teste: ${msg}`);
    } finally {
      setTesting(false);
    }
  }

  async function handleSaveWebhook(e: React.FormEvent) {
    e.preventDefault();
    if (!family) return;
    setSavingWebhook(true);
    try {
      const { error } = await supabase
        .from("families")
        .update({
          webhook_url: webhookUrl.trim() || null,
          webhook_enabled: webhookEnabled,
          webhook_secret: webhookSecret.trim() || null,
          webhook_events: webhookEvents,
        })
        .eq("id", family.id);

      if (error) {
        toast.error(`Erro ao salvar integração: ${error.message}`);
        return;
      }

      await qc.invalidateQueries({ queryKey: ["family"] });
      toast.success("Configurações de Webhook salvas com sucesso!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(`Falha ao salvar webhook: ${msg}`);
    } finally {
      setSavingWebhook(false);
    }
  }

  async function handleTestWebhook() {
    if (!webhookUrl.trim()) {
      toast.error("Informe a URL do webhook do n8n antes de testar.");
      return;
    }
    setTestingWebhook(true);
    setTestResult(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      const result = await testWebhookFn({
        data: {
          webhookUrl: webhookUrl.trim(),
          webhookSecret: webhookSecret.trim() || undefined,
          familyName: family?.name,
          familyId: family?.id,
        },
        headers,
      });

      setTestResult(result);
      if (result.ok) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Falha ao enviar requisição de teste";
      setTestResult({ ok: false, message: msg });
      toast.error(msg);
    } finally {
      setTestingWebhook(false);
    }
  }

  function toggleEvent(evt: string) {
    setWebhookEvents((prev) =>
      prev.includes(evt) ? prev.filter((e) => e !== evt) : [...prev, evt]
    );
  }

  const sampleJson = {
    event: "trip_created",
    message_type: "nova_viagem",
    control: {
      type: "nova_viagem",
      action: "trip_created",
      description: "Nova Viagem Cadastrada",
      category: "viagem",
      target_channel: "all",
    },
    timestamp: "2026-11-20T10:00:00.000Z",
    family: {
      id: family?.id || "familia-id",
      name: family?.name || "Família Maluki",
    },
    trip: {
      id: "trip-uuid-1234",
      title: "Férias em Gramado ❄️",
      destination: "Gramado, RS",
      start_date: "2026-11-20",
      end_date: "2026-11-25",
      category: "Férias",
      budget: 3500.0,
      days_count: 6,
    },
    recipients: [
      {
        name: family?.userName || "Membro da Família",
        email: family?.userEmail || "membro@email.com",
        phone: family?.userPhone || "+5531999998888",
      },
    ],
    formatted_message: `✈️ *Nova Viagem Planejada — ${family?.name || "Família Maluki"}*\n\n` +
      `Uma nova viagem foi cadastrada para a família!\n\n` +
      `🧳 *Férias em Gramado ❄️*\n` +
      `📍 *Destino:* Gramado, RS\n` +
      `📅 *Período:* 20/11/2026 até 25/11/2026 (6 dias)\n` +
      `🏷️ *Tipo:* Férias\n` +
      `💰 *Orçamento:* R$ 3500.00\n\n` +
      `🌟 Acesse o Maluki Viagens para planejar o roteiro e o checklist juntos!`,
  };

  function handleCopyPayload() {
    navigator.clipboard.writeText(JSON.stringify(sampleJson, null, 2));
    setCopiedPayload(true);
    toast.success("JSON de exemplo copiado para a área de transferência!");
    setTimeout(() => setCopiedPayload(false), 2000);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Cabeçalho da Seção */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            <Settings className="size-8 text-primary" />
            Geral
          </h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            Configurações gerais do sistema, chaves de inteligência artificial e integrações externas.
          </p>
        </div>
      </div>

      {/* Sistema de Abas (Zero scroll no mobile com grid equilibrado) */}
      <Tabs defaultValue="ia" className="w-full">
        <TabsList className="grid grid-cols-2 h-11 w-full rounded-2xl bg-secondary/80 p-1 md:inline-flex md:w-auto md:gap-2">
          <TabsTrigger value="ia" className="rounded-xl px-2 sm:px-5 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-soft">
            <Sparkles className="mr-1.5 sm:mr-2 size-3.5 sm:size-4 text-accent shrink-0" />
            <span className="truncate">IA</span>
          </TabsTrigger>
          <TabsTrigger value="integracoes" className="rounded-xl px-2 sm:px-5 text-xs sm:text-sm data-[state=active]:bg-card data-[state=active]:shadow-soft">
            <Webhook className="mr-1.5 sm:mr-2 size-3.5 sm:size-4 text-primary shrink-0" />
            <span className="truncate">Integrações & Webhook</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. ABA: IA */}
        <TabsContent value="ia" className="mt-6 space-y-6">
          <form onSubmit={handleSaveAi} className="space-y-6">
            <Card className="rounded-3xl border-border/70 shadow-soft">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-accent/15 text-accent">
                      <Cpu className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Provedor e Chaves de IA</CardTitle>
                      <CardDescription>
                        Configure as credenciais para ativar o Assistente de Viagens e a geração de ideias.
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Provedor Principal */}
                <div className="space-y-2">
                  <Label htmlFor="ai-provider" className="text-sm font-semibold">
                    Provedor Principal Ativo
                  </Label>
                  <Select value={aiProvider} onValueChange={setAiProvider}>
                    <SelectTrigger id="ai-provider" className="h-11 rounded-xl">
                      <SelectValue placeholder="Selecione o provedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deepseek">
                        DeepSeek (Recomendado — Excelente custo-benefício e respostas rápidas)
                      </SelectItem>
                      <SelectItem value="openai">
                        OpenAI (GPT-4o Mini — Alta qualidade e precisão)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    O provedor selecionado será usado prioritariamente nas conversas do assistente e roteiros automáticos.
                  </p>
                </div>

                {/* DeepSeek API Key */}
                <div className="space-y-3 rounded-2xl border border-border/60 bg-card/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="deepseek-key" className="text-base font-semibold">
                        Chave de API DeepSeek
                      </Label>
                      {deepseekKey.trim() ? (
                        <Badge variant="outline" className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="size-3" /> Configurada
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 border-muted text-muted-foreground">
                          <AlertCircle className="size-3" /> Não configurada
                        </Badge>
                      )}
                    </div>
                    <a
                      href="https://platform.deepseek.com/api_keys"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Obter chave no DeepSeek <ExternalLink className="size-3" />
                    </a>
                  </div>

                  <div className="relative">
                    <Input
                      id="deepseek-key"
                      type={showDeepseek ? "text" : "password"}
                      placeholder="sk-..."
                      value={deepseekKey}
                      onChange={(e) => setDeepseekKey(e.target.value)}
                      className="h-11 pr-24 rounded-xl font-mono text-sm"
                    />
                    <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowDeepseek(!showDeepseek)}
                        title={showDeepseek ? "Ocultar chave" : "Mostrar chave"}
                      >
                        {showDeepseek ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-8 rounded-lg text-xs"
                        disabled={testingDeepseek || !deepseekKey.trim()}
                        onClick={() => handleTestAiKey("deepseek")}
                      >
                        {testingDeepseek ? <Loader2 className="size-3.5 animate-spin" /> : "Testar"}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Modelo padrão utilizado: <code>deepseek-chat</code>.
                  </p>
                </div>

                {/* OpenAI API Key */}
                <div className="space-y-3 rounded-2xl border border-border/60 bg-card/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="openai-key" className="text-base font-semibold">
                        Chave de API OpenAI
                      </Label>
                      {openaiKey.trim() ? (
                        <Badge variant="outline" className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="size-3" /> Configurada
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 border-muted text-muted-foreground">
                          <AlertCircle className="size-3" /> Não configurada
                        </Badge>
                      )}
                    </div>
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Obter chave na OpenAI <ExternalLink className="size-3" />
                    </a>
                  </div>

                  <div className="relative">
                    <Input
                      id="openai-key"
                      type={showOpenai ? "text" : "password"}
                      placeholder="sk-proj-..."
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      className="h-11 pr-24 rounded-xl font-mono text-sm"
                    />
                    <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowOpenai(!showOpenai)}
                        title={showOpenai ? "Ocultar chave" : "Mostrar chave"}
                      >
                        {showOpenai ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="h-8 rounded-lg text-xs"
                        disabled={testingOpenai || !openaiKey.trim()}
                        onClick={() => handleTestAiKey("openai")}
                      >
                        {testingOpenai ? <Loader2 className="size-3.5 animate-spin" /> : "Testar"}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Modelo padrão utilizado: <code>gpt-4o-mini</code>.
                  </p>
                </div>

                {/* Informações de Segurança */}
                <div className="flex items-start gap-3 rounded-2xl bg-primary/5 p-4 text-xs text-muted-foreground border border-primary/10">
                  <ShieldCheck className="size-5 shrink-0 text-primary mt-0.5" />
                  <p className="leading-relaxed">
                    Suas chaves são salvas com segurança no banco de dados da sua família e são lidas exclusivamente pelo servidor do Maluki Viagens ao realizar chamadas de inteligência artificial. Nenhuma credencial fica visível publicamente.
                  </p>
                </div>

                {/* Botão de Salvar */}
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    className="h-11 rounded-full px-8 text-base font-semibold shadow-soft"
                    disabled={savingAi || familyLoading}
                  >
                    {savingAi ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Salvando…
                      </>
                    ) : (
                      <>
                        <KeyRound className="mr-2 size-4" />
                        Salvar configurações de IA
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        {/* 2. ABA: INTEGRAÇÕES & WEBHOOK (N8N / WHATSAPP) */}
        <TabsContent value="integracoes" className="mt-6 space-y-6">
          <form onSubmit={handleSaveWebhook} className="space-y-6">
            <Card className="rounded-3xl border-border/70 shadow-soft">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Webhook className="size-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Webhook & Alertas no n8n (WhatsApp)</CardTitle>
                      <CardDescription>
                        Envie eventos de viagens em tempo real para seu workflow no n8n e dispare mensagens para o WhatsApp da família.
                      </CardDescription>
                    </div>
                  </div>

                  {/* Toggle Geral de Ativação */}
                  <div className="flex items-center justify-between sm:justify-start gap-3 rounded-2xl border border-border/70 bg-card/70 px-4 py-2 w-full sm:w-auto">
                    <Label htmlFor="webhook-switch" className="cursor-pointer text-xs sm:text-sm font-semibold">
                      {webhookEnabled ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <Radio className="size-3.5 animate-pulse text-emerald-500" />
                          Integração Ativa
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Integração Pausada</span>
                      )}
                    </Label>
                    <Switch
                      id="webhook-switch"
                      checked={webhookEnabled}
                      onCheckedChange={setWebhookEnabled}
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* URL do Webhook */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="webhook-url" className="text-sm font-semibold">
                      URL do Endpoint Webhook (n8n)
                    </Label>
                    {webhookUrl.trim() ? (
                      <Badge variant="outline" className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs">
                        <CheckCircle2 className="size-3" /> Configurada
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 border-muted text-muted-foreground text-xs">
                        <AlertCircle className="size-3" /> Não configurada
                      </Badge>
                    )}
                  </div>
                  <Input
                    id="webhook-url"
                    type="url"
                    placeholder="https://seu-n8n.com/webhook/maluki-alertas"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="h-11 rounded-xl font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Cole aqui a URL de produção do nó <strong>Webhook</strong> do seu fluxo no n8n (Método <code>POST</code>).
                  </p>
                </div>

                {/* Token Secreto / Secret */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="webhook-secret" className="text-sm font-semibold">
                      Segredo de Autenticação / Token (Opcional)
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      Header: <code>X-Webhook-Secret</code>
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      id="webhook-secret"
                      type={showWebhookSecret ? "text" : "password"}
                      placeholder="Token secreto para validar a chamada no n8n..."
                      value={webhookSecret}
                      onChange={(e) => setWebhookSecret(e.target.value)}
                      className="h-11 pr-10 rounded-xl font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 size-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                    >
                      {showWebhookSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Se preenchido, o Maluki Viagens enviará este token nos headers <code>X-Webhook-Secret</code> e <code>Authorization: Bearer</code>.
                  </p>
                </div>

                {/* Eventos Selecionados */}
                <div className="space-y-3 rounded-2xl border border-border/60 bg-card/60 p-4">
                  <Label className="text-sm font-semibold">
                    Eventos para Disparo Automático
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Selecione quais ações da família devem acionar o webhook:
                  </p>

                  <div className="grid gap-3 pt-1 sm:grid-cols-2">
                    <div
                      className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                        webhookEvents.includes("trip_created")
                          ? "border-primary/50 bg-primary/5"
                          : "border-border/60 hover:bg-muted/40"
                      }`}
                      onClick={() => toggleEvent("trip_created")}
                    >
                      <Checkbox
                        id="evt-created"
                        checked={webhookEvents.includes("trip_created")}
                        onCheckedChange={() => toggleEvent("trip_created")}
                        className="mt-0.5"
                      />
                      <div className="space-y-0.5">
                        <Label htmlFor="evt-created" className="cursor-pointer font-medium text-xs sm:text-sm text-foreground">
                          ✈️ Nova viagem cadastrada
                        </Label>
                        <p className="text-[11px] text-muted-foreground leading-tight">
                          Dispara assim que qualquer membro salvar uma nova viagem.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                        webhookEvents.includes("trip_updated")
                          ? "border-primary/50 bg-primary/5"
                          : "border-border/60 hover:bg-muted/40"
                      }`}
                      onClick={() => toggleEvent("trip_updated")}
                    >
                      <Checkbox
                        id="evt-updated"
                        checked={webhookEvents.includes("trip_updated")}
                        onCheckedChange={() => toggleEvent("trip_updated")}
                        className="mt-0.5"
                      />
                      <div className="space-y-0.5">
                        <Label htmlFor="evt-updated" className="cursor-pointer font-medium text-xs sm:text-sm text-foreground">
                          ✏️ Viagem alterada
                        </Label>
                        <p className="text-[11px] text-muted-foreground leading-tight">
                          Dispara ao alterar datas, destino ou detalhes da viagem.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                        webhookEvents.includes("trip_reminder")
                          ? "border-primary/50 bg-primary/5"
                          : "border-border/60 hover:bg-muted/40"
                      }`}
                      onClick={() => toggleEvent("trip_reminder")}
                    >
                      <Checkbox
                        id="evt-reminder"
                        checked={webhookEvents.includes("trip_reminder")}
                        onCheckedChange={() => toggleEvent("trip_reminder")}
                        className="mt-0.5"
                      />
                      <div className="space-y-0.5">
                        <Label htmlFor="evt-reminder" className="cursor-pointer font-medium text-xs sm:text-sm text-foreground">
                          ⏰ Lembretes de contagem regressiva
                        </Label>
                        <p className="text-[11px] text-muted-foreground leading-tight">
                          Dispara avisos quando a data da viagem estiver se aproximando.
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors ${
                        webhookEvents.includes("daily_schedule")
                          ? "border-primary/50 bg-primary/5"
                          : "border-border/60 hover:bg-muted/40"
                      }`}
                      onClick={() => toggleEvent("daily_schedule")}
                    >
                      <Checkbox
                        id="evt-daily-schedule"
                        checked={webhookEvents.includes("daily_schedule")}
                        onCheckedChange={() => toggleEvent("daily_schedule")}
                        className="mt-0.5"
                      />
                      <div className="space-y-0.5">
                        <Label htmlFor="evt-daily-schedule" className="cursor-pointer font-medium text-xs sm:text-sm text-foreground">
                          📅 Programação do dia
                        </Label>
                        <p className="text-[11px] text-muted-foreground leading-tight">
                          Dispara a lista de atividades e passeios do dia para os participantes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Painel de Teste de Disparo Imediato */}
                <div className="rounded-2xl border border-sky-200/80 bg-sky-50/40 dark:border-sky-900/50 dark:bg-sky-950/20 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-300">
                        <Send className="size-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">Testar Disparo para o n8n</h4>
                        <p className="text-xs text-muted-foreground">
                          Envia um payload JSON de exemplo com dados de teste para validar o seu workflow.
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={testingWebhook || !webhookUrl.trim()}
                      onClick={handleTestWebhook}
                      className="rounded-xl border-sky-300 bg-white hover:bg-sky-50 dark:bg-card dark:border-sky-800"
                    >
                      {testingWebhook ? (
                        <>
                          <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                          Enviando teste...
                        </>
                      ) : (
                        <>
                          <Send className="mr-1.5 size-3.5 text-sky-600 dark:text-sky-400" />
                          Disparar teste agora
                        </>
                      )}
                    </Button>
                  </div>

                  {testResult && (
                    <div
                      className={`flex items-start gap-2.5 rounded-xl border p-3 text-xs ${
                        testResult.ok
                          ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                          : "border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300"
                      }`}
                    >
                      {testResult.ok ? (
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                      ) : (
                        <AlertCircle className="size-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                      )}
                      <div>
                        <p className="font-semibold">{testResult.ok ? "Sucesso!" : "Falha na resposta"}</p>
                        <p className="mt-0.5 leading-relaxed">{testResult.message}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Prévia do Payload JSON */}
                <div className="rounded-2xl border border-border/70 bg-card/60 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquareCode className="size-4 text-primary" />
                      <span className="text-xs font-semibold text-foreground">
                        Estrutura do JSON Enviado ao n8n
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyPayload}
                      className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {copiedPayload ? (
                        <>
                          <Check className="size-3 text-emerald-600" /> Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="size-3" /> Copiar JSON
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    O campo <code>formatted_message</code> já vem pronto com texto e formatação do WhatsApp para você plugar diretamente no seu nó do WhatsApp (Evolution API, Z-API, Baileys, etc.):
                  </p>

                  <pre className="max-h-56 overflow-y-auto rounded-xl bg-slate-950 p-3 text-[11px] text-slate-200 font-mono leading-relaxed border border-slate-800">
                    {JSON.stringify(sampleJson, null, 2)}
                  </pre>
                </div>

                {/* Dica de Configuração do n8n */}
                <div className="flex items-start gap-3 rounded-2xl bg-primary/5 p-4 text-xs text-muted-foreground border border-primary/10">
                  <Smartphone className="size-5 shrink-0 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">Como configurar no n8n:</p>
                    <ol className="list-decimal list-inside space-y-0.5 leading-relaxed">
                      <li>Adicione um nó <strong>Webhook</strong> com método <strong>POST</strong> e path <code>maluki-alertas</code>.</li>
                      <li>Copie a <strong>Production URL</strong> gerada no n8n e cole no campo acima.</li>
                      <li>Adicione o nó da sua API de WhatsApp e passe o campo <code>{`{{ $json.body.formatted_message }}`}</code> como texto da mensagem.</li>
                    </ol>
                  </div>
                </div>

                {/* Botão de Salvar Configurações */}
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    className="h-11 rounded-full px-8 text-base font-semibold shadow-soft"
                    disabled={savingWebhook || familyLoading}
                  >
                    {savingWebhook ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Salvando…
                      </>
                    ) : (
                      <>
                        <Webhook className="mr-2 size-4" />
                        Salvar configurações de Webhook
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
