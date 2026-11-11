import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(4000) })).min(1).max(30),
  tripId: z.string().uuid().optional(),
});

export const askAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const directApiKey = process.env["DEEPSEEK_API_KEY"];
    const openaiApiKey = process.env["OPENAI_API_KEY"];
    const gatewayKey = process.env["LOVABLE_API_KEY"];
    const connectionKey = process.env["UDC_DEEPSEEK_API_KEY"];

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

    if (!directApiKey && !openaiApiKey && (!gatewayKey || !connectionKey)) {
      if (tripInfo) {
        return {
          reply: `Para respostas automáticas com IA, adicione sua chave \`DEEPSEEK_API_KEY\` (ou \`OPENAI_API_KEY\`) no arquivo \`.env\` e reinicie com \`docker compose up -d app\`.\n\n` +
            `**Contexto da Viagem Atual (${tripInfo.title}):**\n` +
            `- **Destino:** ${tripInfo.main_destination || "Não informado"}\n` +
            `- **Período:** ${tripInfo.start_date} a ${tripInfo.end_date}\n` +
            (tripInfo.budget ? `- **Orçamento:** R$ ${tripInfo.budget}\n` : "") +
            `\nVocê pode planejar e ver os detalhes desta viagem diretamente nas abas de Roteiro, Reservas, Gastos e Checklist!`,
        };
      }
      return {
        reply: "Para ativar o assistente inteligente, adicione a chave `DEEPSEEK_API_KEY` (ou `OPENAI_API_KEY`) no seu arquivo `.env` e reinicie os containers com `docker compose up -d app`.",
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

      if (directApiKey) {
        endpoint = "https://api.deepseek.com/chat/completions";
        model = "deepseek-chat";
        headers["Authorization"] = `Bearer ${directApiKey}`;
      } else if (openaiApiKey) {
        endpoint = "https://api.openai.com/v1/chat/completions";
        model = "gpt-4o-mini";
        headers["Authorization"] = `Bearer ${openaiApiKey}`;
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
        const activeKey = directApiKey || openaiApiKey || gatewayKey || "";
        const safeBody = body.split(activeKey).join("[redacted]").replace(/sk-[a-zA-Z0-9_-]+/g, "[redacted]");
        console.error("AI assistant request failed", response.status, safeBody);
        if (response.status === 401) return { reply: "A chave da API de IA não é válida ou expirou. Verifique o arquivo .env." };
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
