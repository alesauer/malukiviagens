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
    const gatewayKey = process.env["LOVABLE_API_KEY"];
    const connectionKey = process.env["UDC_DEEPSEEK_API_KEY"];
    if (!directApiKey && (!gatewayKey || !connectionKey)) {
      return { reply: "A conexão com o DeepSeek ainda não está disponível." };
    }

    let tripContext = "Nenhuma viagem selecionada.";
    if (data.tripId) {
      const { data: trip } = await context.supabase.from("trips").select("title, main_destination, start_date, end_date, budget, description").eq("id", data.tripId).maybeSingle();
      const { data: acts } = await context.supabase.from("activities").select("title, date, time, location").eq("trip_id", data.tripId).limit(60);
      if (trip) tripContext = `Viagem: ${JSON.stringify(trip)}. Atividades já planejadas: ${JSON.stringify(acts ?? [])}`;
    }

    try {
      const instructions =
        "Você é o assistente de viagens da família no app Maluki Viagens. Responda em português do Brasil, de forma calorosa e objetiva, com markdown simples (títulos curtos, listas). Para roteiros, organize por dia com horários sugeridos e estimativas em R$. Considere crianças e ritmo familiar quando fizer sentido. Contexto: " +
        tripContext;

      const endpoint = directApiKey
        ? "https://api.deepseek.com/chat/completions"
        : "https://connector-gateway.lovable.dev/udc_deepseek/chat/completions";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${directApiKey || gatewayKey}`,
        ...(directApiKey ? {} : { "X-Connection-Api-Key": connectionKey! }),
      };

      const model = directApiKey ? "deepseek-chat" : "deepseek-flash";

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
        const activeKey = directApiKey || gatewayKey || "";
        const safeBody = body.split(activeKey).join("[redacted]").replace(/sk-[a-zA-Z0-9_-]+/g, "[redacted]");
        console.error("DeepSeek request failed", response.status, safeBody);
        if (response.status === 402) return { reply: "O saldo da conta DeepSeek acabou. Adicione saldo no DeepSeek para continuar." };
        if (response.status === 429) return { reply: "O DeepSeek recebeu muitas perguntas. Aguarde um momento e tente novamente." };
        return { reply: `Não foi possível consultar o DeepSeek (erro ${response.status}). Tente novamente em instantes.` };
      }
      const res = await response.json() as { choices?: { message?: { content?: string } }[] };
      const text = res.choices?.[0]?.message?.content?.trim();
      return { reply: text || "Não consegui gerar uma resposta agora. Tente reformular." };
    } catch {
      console.error("DeepSeek request unavailable");
      return { reply: "O assistente está indisponível no momento. Tente novamente em instantes." };
    }
  });
