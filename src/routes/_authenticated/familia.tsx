import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFamily } from "@/lib/family";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/familia")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Família — Maluki Viagens" },
      { name: "description", content: "Quem participa das viagens e como convidar mais gente." },
      { property: "og:title", content: "Família — Maluki Viagens" },
      { property: "og:description", content: "Quem participa das viagens e como convidar mais gente." },
    ],
  }),
  component: FamilyPage,
});

function FamilyPage() {
  const { data: family } = useFamily();
  const qc = useQueryClient();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const { data: members = [] } = useQuery({
    queryKey: ["members", family?.id],
    enabled: !!family,
    queryFn: async () => {
      const { data: ms, error } = await supabase.from("family_members").select("user_id, role").eq("family_id", family!.id);
      if (error) throw error;
      const { data: ps } = await supabase.from("profiles").select("id, full_name").in("id", ms.map((m) => m.user_id));
      return ms.map((m) => ({ ...m, name: ps?.find((p) => p.id === m.user_id)?.full_name ?? "Membro" }));
    },
  });

  if (!family) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-4xl font-semibold">{family.name}</h1>
        <p className="mt-1 text-muted-foreground">Todos aqui veem e editam as viagens da família.</p>
      </div>

      {family.role === "admin" && (
        <form className="flex gap-2" onSubmit={async (e) => {
          e.preventDefault();
          const { error } = await supabase.from("families").update({ name }).eq("id", family.id);
          if (error) { toast.error(error.message); return; }
          qc.invalidateQueries({ queryKey: ["family"] });
          setName("");
          toast.success("Nome atualizado");
        }}>
          <Input placeholder="Renomear família" value={name} onChange={(e) => setName(e.target.value)} required />
          <Button type="submit" variant="outline">Salvar</Button>
        </form>
      )}

      <section className="rounded-2xl border bg-card p-6 shadow-soft">
        <h2 className="text-xl font-semibold">Convidar alguém</h2>
        <p className="mt-1 text-sm text-muted-foreground">Envie este código. A pessoa pode informá-lo ao criar a conta para entrar na sua família.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="max-w-full break-all rounded-xl bg-secondary px-4 py-3 font-display text-2xl font-semibold sm:text-3xl">{family.invite_code}</span>
          <Button variant="outline" onClick={() => { navigator.clipboard.writeText(family.invite_code); toast.success("Código copiado"); }}><Copy /> Copiar</Button>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-6 shadow-soft">
        <h2 className="text-xl font-semibold">Membros</h2>
        <ul className="mt-4 divide-y">
          {members.map((m) => (
            <li key={m.user_id} className="flex items-center gap-3 py-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{m.name.slice(0, 1).toUpperCase()}</div>
              <span className="flex-1">{m.name}{m.user_id === family.userId ? " (você)" : ""}</span>
              {m.role === "admin" && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Crown className="size-3 text-accent" /> Admin</span>}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-dashed p-6">
        <h2 className="text-xl font-semibold">Entrar em outra família</h2>
        <form className="mt-3 flex gap-2" onSubmit={async (e) => {
          e.preventDefault();
          const { error } = await supabase.rpc("join_family", { _code: code });
          if (error) { toast.error(error.message.includes("inválido") ? "Código de convite inválido" : error.message); return; }
          setCode("");
          qc.invalidateQueries();
          toast.success("Você entrou na família!");
        }}>
          <Input placeholder="Código de convite" value={code} onChange={(e) => setCode(e.target.value)} required className="uppercase" />
          <Button type="submit">Entrar</Button>
        </form>
      </section>
    </div>
  );
}
