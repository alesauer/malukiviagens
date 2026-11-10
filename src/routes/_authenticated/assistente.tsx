import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { ArrowUp, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { askAssistant } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/assistente")({
  validateSearch: z.object({ trip: z.string().optional() }),
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Assistente de viagem — Maluki Viagens" },
      { name: "description", content: "Peça roteiros, dicas de passeios e restaurantes para a sua viagem." },
      { property: "og:title", content: "Assistente de viagem — Maluki Viagens" },
      { property: "og:description", content: "Peça roteiros, dicas de passeios e restaurantes para a sua viagem." },
    ],
  }),
  component: Assistant,
});

type Msg = { role: "user" | "assistant"; content: string };
const PROMPTS = ["Monte um roteiro de 3 dias com crianças", "Onde comer bem e barato no destino?", "O que não pode faltar na mala?", "Passeios para dia de chuva"];

function Assistant() {
  const search = Route.useSearch();
  const ask = useServerFn(askAssistant);
  const [tripId, setTripId] = useState<string | undefined>(search.trip);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const { data: trips = [] } = useQuery({
    queryKey: ["trips"],
    queryFn: async () => (await supabase.from("trips").select("*").order("start_date")).data ?? [],
  });

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, busy]);

  async function send(text: string) {
    if (!text.trim() || busy) return;
    const next = [...msgs, { role: "user" as const, content: text.trim() }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const r = await ask({ data: { messages: next, tripId } });
      setMsgs([...next, { role: "assistant", content: r.reply }]);
    } catch {
      setMsgs([...next, { role: "assistant", content: "Não consegui responder agora. Tente novamente." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col" style={{ minHeight: "calc(100vh - 12rem)" }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-3xl font-semibold"><Sparkles className="size-6 text-accent" /> Assistente</h1>
        <Select value={tripId ?? "none"} onValueChange={(v) => setTripId(v === "none" ? undefined : v)}>
          <SelectTrigger className="w-60"><SelectValue placeholder="Sobre qual viagem?" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem viagem específica</SelectItem>
            {trips.map((t) => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6 flex-1 space-y-4">
        {msgs.length === 0 && (
          <div className="rounded-3xl border bg-card p-8 text-center shadow-soft">
            <p className="font-display text-2xl">Como posso ajudar na viagem?</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {PROMPTS.map((p) => (
                <button key={p} onClick={() => send(p)} className="rounded-full border px-4 py-2 text-sm hover:border-primary hover:text-primary">{p}</button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={cn("max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed", m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "border bg-card shadow-soft")}>
            {m.content}
          </div>
        ))}
        {busy && <div className="w-fit animate-pulse rounded-2xl border bg-card px-4 py-3 text-sm text-muted-foreground">Pensando…</div>}
        <div ref={endRef} />
      </div>

      <form className="sticky bottom-20 mt-6 flex items-end gap-2 rounded-3xl border bg-card p-2 shadow-soft md:bottom-4" onSubmit={(e) => { e.preventDefault(); send(input); }}>
        <Textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          placeholder="Pergunte qualquer coisa sobre a viagem…"
          className="min-h-10 resize-none border-0 shadow-none focus-visible:ring-0"
        />
        <Button type="submit" size="icon" className="shrink-0 rounded-full" disabled={busy || !input.trim()} aria-label="Enviar"><ArrowUp /></Button>
      </form>
    </div>
  );
}
