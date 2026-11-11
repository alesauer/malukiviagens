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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFamily } from "@/lib/family";
import { testAiConnection } from "@/lib/ai.functions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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

  const [deepseekKey, setDeepseekKey] = useState("");
  const [openaiKey, setOpenaiKey] = useState("");
  const [aiProvider, setAiProvider] = useState("deepseek");

  const [showDeepseek, setShowDeepseek] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);

  const [saving, setSaving] = useState(false);
  const [testingDeepseek, setTestingDeepseek] = useState(false);
  const [testingOpenai, setTestingOpenai] = useState(false);

  // Carrega chaves salvas da família quando os dados estiverem disponíveis
  useEffect(() => {
    if (family) {
      setDeepseekKey(family.deepseek_api_key || "");
      setOpenaiKey(family.openai_api_key || "");
      setAiProvider(family.ai_provider || "deepseek");
    }
  }, [family]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!family) return;
    setSaving(true);
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
      setSaving(false);
    }
  }

  async function handleTestKey(provider: "deepseek" | "openai") {
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
            Configurações gerais do sistema, chaves de inteligência artificial e integrações.
          </p>
        </div>
      </div>

      {/* Sistema de Abas */}
      <Tabs defaultValue="ia" className="w-full">
        <TabsList className="h-11 w-full justify-start rounded-2xl bg-secondary/80 p-1 md:w-auto">
          <TabsTrigger value="ia" className="rounded-xl px-5 text-sm data-[state=active]:bg-card data-[state=active]:shadow-soft">
            <Sparkles className="mr-2 size-4 text-accent" />
            IA (Inteligência Artificial)
          </TabsTrigger>
        </TabsList>

        {/* 1. ABA: IA */}
        <TabsContent value="ia" className="mt-6 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
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
                        onClick={() => handleTestKey("deepseek")}
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
                        onClick={() => handleTestKey("openai")}
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
                    disabled={saving || familyLoading}
                  >
                    {saving ? (
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
      </Tabs>
    </div>
  );
}

