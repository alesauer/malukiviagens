import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(4000) })).min(1).max(30),
  tripId: z.string().uuid().optional(),
});

const TestInput = z.object({
  provider: z.enum(["deepseek", "openai"]),
  apiKey: z.string().min(10).max(300),
});

export const testAiConnection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => TestInput.parse(d))
  .handler(async ({ data }) => {
    try {
      const endpoint = data.provider === "deepseek"
        ? "https://api.deepseek.com/chat/completions"
        : "https://api.openai.com/v1/chat/completions";
      const model = data.provider === "deepseek" ? "deepseek-chat" : "gpt-4o-mini";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.apiKey.trim()}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 5,
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        if (res.status === 401) return { ok: false, message: "Chave inválida ou não autorizada (código 401)." };
        if (res.status === 402) return { ok: false, message: "Saldo insuficiente na conta da IA (código 402)." };
        if (res.status === 429) return { ok: false, message: "Limite de requisições excedido no provedor (código 429)." };
        return { ok: false, message: `Erro ao conectar com ${data.provider} (status ${res.status}).` };
      }

      return { ok: true, message: `Conexão com ${data.provider === "deepseek" ? "DeepSeek" : "OpenAI"} testada com sucesso!` };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Tempo limite de conexão esgotado.";
      return { ok: false, message: `Falha na conexão: ${msg}` };
    }
  });

async function getActiveAiConfig(context: { userId: string; supabase: any }) {
  let familyAi: { deepseek_api_key?: string | null; openai_api_key?: string | null; ai_provider?: string | null } | null = null;
  try {
    const { data: mems } = await context.supabase
      .from("family_members")
      .select("family_id, families(deepseek_api_key, openai_api_key, ai_provider)")
      .eq("user_id", context.userId)
      .order("joined_at", { ascending: false })
      .limit(1);
    const fam = mems?.[0]?.families as { deepseek_api_key?: string | null; openai_api_key?: string | null; ai_provider?: string | null } | undefined;
    if (fam) familyAi = fam;
  } catch {
    // Ignora se não encontrar
  }

  const preferredProvider = familyAi?.ai_provider || "deepseek";
  const familyDeepseek = familyAi?.deepseek_api_key?.trim() || undefined;
  const familyOpenai = familyAi?.openai_api_key?.trim() || undefined;
  const envDeepseek = process.env["DEEPSEEK_API_KEY"]?.trim() || undefined;
  const envOpenai = process.env["OPENAI_API_KEY"]?.trim() || undefined;
  const gatewayKey = process.env["LOVABLE_API_KEY"]?.trim() || undefined;
  const connectionKey = process.env["UDC_DEEPSEEK_API_KEY"]?.trim() || undefined;

  let activeKey: string | undefined;
  let activeProvider: "deepseek" | "openai" = "deepseek";

  if (preferredProvider === "openai" && (familyOpenai || envOpenai)) {
    activeKey = familyOpenai || envOpenai;
    activeProvider = "openai";
  } else if (familyDeepseek || envDeepseek) {
    activeKey = familyDeepseek || envDeepseek;
    activeProvider = "deepseek";
  } else if (familyOpenai || envOpenai) {
    activeKey = familyOpenai || envOpenai;
    activeProvider = "openai";
  }

  return { activeKey, activeProvider, gatewayKey, connectionKey };
}

export const askAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const { activeKey, activeProvider, gatewayKey, connectionKey } = await getActiveAiConfig(context);

    let tripInfo: { title: string; main_destination: string | null; start_date: string; end_date: string; budget: number | null; description: string | null } | null = null;
    let tripContext = "Nenhuma viagem selecionada.";
    if (data.tripId) {
      const { data: trip } = await context.supabase.from("trips").select("title, main_destination, start_date, end_date, budget, description").eq("id", data.tripId).maybeSingle();
      const { data: acts } = await context.supabase.from("activities").select("title, date, time, location").eq("trip_id", data.tripId).limit(60);
      if (trip) {
        tripInfo = trip;
        tripContext = `Viagem: ${JSON.stringify(trip)}. Atividades já planejadas: ${JSON.stringify(acts ?? [])}`;
      }
    }

    if (!activeKey && (!gatewayKey || !connectionKey)) {
      if (tripInfo) {
        return {
          reply: `Para respostas automáticas com IA, adicione sua chave \`DEEPSEEK_API_KEY\` ou \`OPENAI_API_KEY\` no menu **Outros > Geral > IA** ou no arquivo \`.env\` do servidor.\n\n` +
            `**Contexto da Viagem Atual (${tripInfo.title}):**\n` +
            `- **Destino:** ${tripInfo.main_destination || "Não informado"}\n` +
            `- **Período:** ${tripInfo.start_date} a ${tripInfo.end_date}\n` +
            (tripInfo.budget ? `- **Orçamento:** R$ ${tripInfo.budget}\n` : "") +
            `\nVocê pode planejar e ver os detalhes desta viagem diretamente nas abas de Roteiro, Reservas, Gastos e Checklist!`,
        };
      }
      return {
        reply: "Para ativar o assistente inteligente, adicione a chave do **DeepSeek** ou **OpenAI** no menu **Outros > Geral > IA** ou no seu arquivo `.env`.",
      };
    }

    try {
      const instructions =
        "Você é o assistente de viagens da família no app Maluki Viagens. Responda em português do Brasil, de forma calorosa e objetiva, com markdown simples (títulos curtos, listas). Para roteiros, organize por dia com horários sugeridos e estimativas de gastos em moeda local e/ou R$. Considere crianças e ritmo familiar quando fizer sentido. Contexto: " +
        tripContext;

      let endpoint = "https://api.deepseek.com/chat/completions";
      let model = "deepseek-chat";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (activeKey) {
        if (activeProvider === "openai") {
          endpoint = "https://api.openai.com/v1/chat/completions";
          model = "gpt-4o-mini";
          headers["Authorization"] = `Bearer ${activeKey}`;
        } else {
          endpoint = "https://api.deepseek.com/chat/completions";
          model = "deepseek-chat";
          headers["Authorization"] = `Bearer ${activeKey}`;
        }
      } else {
        endpoint = "https://connector-gateway.lovable.dev/udc_deepseek/chat/completions";
        model = "deepseek-flash";
        headers["Authorization"] = `Bearer ${gatewayKey}`;
        headers["X-Connection-Api-Key"] = connectionKey!;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          messages: [{ role: "system", content: instructions }, ...data.messages],
          stream: false,
          max_tokens: 3000,
        }),
        signal: AbortSignal.timeout(55000),
      });
      if (!response.ok) {
        const body = await response.text();
        const safeBody = body.split(activeKey || gatewayKey || "").join("[redacted]").replace(/sk-[a-zA-Z0-9_-]+/g, "[redacted]");
        console.error("AI assistant request failed", response.status, safeBody);
        if (response.status === 401) return { reply: "A chave da API de IA não é válida ou expirou. Verifique as configurações em Outros > Geral > IA." };
        if (response.status === 402) return { reply: "O saldo da conta de IA acabou. Adicione créditos para continuar." };
        if (response.status === 429) return { reply: "Muitas requisições enviadas ao provedor de IA. Aguarde um momento e tente novamente." };
        return { reply: `Não foi possível consultar a IA (código ${response.status}). Tente novamente em instantes.` };
      }
      const res = await response.json() as { choices?: { message?: { content?: string } }[] };
      const text = res.choices?.[0]?.message?.content?.trim();
      return { reply: text || "Não consegui gerar uma resposta agora. Tente reformular." };
    } catch (err: unknown) {
      console.error("AI assistant request error:", err);
      return { reply: "O assistente está indisponível no momento. Tente novamente em instantes." };
    }
  });

const SuggestAiInput = z.object({
  tripId: z.string().uuid(),
  customTheme: z.string().max(200).optional(),
});

export const generateItinerarySuggestionsAi = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => SuggestAiInput.parse(d))
  .handler(async ({ data, context }) => {
    const { activeKey, activeProvider, gatewayKey, connectionKey } = await getActiveAiConfig(context);

    if (!activeKey && (!gatewayKey || !connectionKey)) {
      return {
        ok: false as const,
        error: "NO_KEY" as const,
        message: "Para gerar sugestões com IA, adicione sua chave de API (DeepSeek ou OpenAI) em Outros > Geral > IA.",
      };
    }

    const { data: trip } = await context.supabase
      .from("trips")
      .select("title, main_destination, start_date, end_date, budget, description, category")
      .eq("id", data.tripId)
      .maybeSingle();

    if (!trip) {
      return { ok: false as const, error: "NOT_FOUND" as const, message: "Viagem não encontrada." };
    }

    const prompt = `Gere entre 6 e 8 atividades recomendadas e passeios para a viagem:
Destino: ${trip.main_destination || trip.title}
Título: ${trip.title}
Categoria: ${trip.category || "férias"}
Datas: ${trip.start_date} a ${trip.end_date}
${data.customTheme ? `Foco solicitado pelo usuário: ${data.customTheme}` : ""}

Responda ESTRITAMENTE em formato JSON (um array de objetos válido), sem blocos de texto antes ou depois, seguindo este formato:
[
  {
    "title": "Nome da Atração ou Passeio",
    "category": "passeio",
    "location": "Bairro ou Endereço com Cidade",
    "time": "09:30",
    "estimated_cost": 50,
    "notes": "Dica prática e breve descrição do que fazer.",
    "dayOffset": 0
  }
]
Categorias permitidas para "category": "imperdivel", "passeio", "gastronomia", "cultura", "natureza", "criancas".
"dayOffset" deve ser um número inteiro (0 = primeiro dia, 1 = segundo dia, etc.).`;

    let endpoint = "https://api.deepseek.com/chat/completions";
    let model = "deepseek-chat";
    const headers: Record<string, string> = { "Content-Type": "application/json" };

    if (activeKey) {
      if (activeProvider === "openai") {
        endpoint = "https://api.openai.com/v1/chat/completions";
        model = "gpt-4o-mini";
        headers["Authorization"] = `Bearer ${activeKey}`;
      } else {
        endpoint = "https://api.deepseek.com/chat/completions";
        model = "deepseek-chat";
        headers["Authorization"] = `Bearer ${activeKey}`;
      }
    } else {
      endpoint = "https://connector-gateway.lovable.dev/udc_deepseek/chat/completions";
      model = "deepseek-flash";
      headers["Authorization"] = `Bearer ${gatewayKey}`;
      headers["X-Connection-Api-Key"] = connectionKey!;
    }

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content: "Você é um assistente especialista em viagens da família Maluki. Responda apenas com o JSON puro solicitado.",
            },
            { role: "user", content: prompt },
          ],
        }),
        signal: AbortSignal.timeout(45000),
      });

      if (!response.ok) {
        return { ok: false as const, error: "API_ERROR" as const, message: `Erro no provedor de IA (código ${response.status}).` };
      }

      const res = (await response.json()) as { choices?: { message?: { content?: string } }[] };
      const rawText = res.choices?.[0]?.message?.content?.trim() || "";

      // Extrai JSON mesmo se envolto com markdown
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return { ok: false as const, error: "PARSE_ERROR" as const, message: "A IA não retornou o formato esperado." };
      }

      const parsed = JSON.parse(jsonMatch[0]) as Array<{
        title: string;
        category?: string;
        location?: string;
        time?: string;
        estimated_cost?: number;
        notes?: string;
        dayOffset?: number;
      }>;

      return { ok: true as const, suggestions: parsed };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Tempo limite esgotado";
      return { ok: false as const, error: "TIMEOUT" as const, message: `Falha ao consultar IA: ${msg}` };
    }
  });
