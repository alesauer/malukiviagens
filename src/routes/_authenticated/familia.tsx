import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Crown, Plane, CheckCircle2, ShieldCheck, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFamily } from "@/lib/family";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MemberTripAccessModal, type MemberAccessData } from "@/components/family/MemberTripAccessModal";

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
  const [selectedMember, setSelectedMember] = useState<MemberAccessData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: members = [] } = useQuery({
    queryKey: ["members", family?.id],
    enabled: !!family,
    queryFn: async () => {
      const { data: ms, error } = await supabase
        .from("family_members")
        .select("user_id, role, all_trips_access, allowed_trip_ids")
        .eq("family_id", family!.id);
      if (error) throw error;
      const { data: ps } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", ms.map((m) => m.user_id));
      return ms.map((m) => ({
        ...m,
        name: ps?.find((p) => p.id === m.user_id)?.full_name ?? "Membro",
        all_trips_access: m.all_trips_access !== false,
        allowed_trip_ids: m.allowed_trip_ids || [],
      }));
    },
  });

  if (!family) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-4xl font-semibold font-display tracking-tight text-foreground">
          {family.name}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gerencie os membros da família e defina a quais viagens cada um tem acesso.
        </p>
      </div>

      {family.role === "admin" && (
        <form
          className="flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const { error } = await supabase.from("families").update({ name }).eq("id", family.id);
            if (error) {
              toast.error(error.message);
              return;
            }
            qc.invalidateQueries({ queryKey: ["family"] });
            setName("");
            toast.success("Nome atualizado");
          }}
        >
          <Input placeholder="Renomear família" value={name} onChange={(e) => setName(e.target.value)} required />
          <Button type="submit" variant="outline">Salvar</Button>
        </form>
      )}

      {/* Convidar Alguém */}
      <section className="rounded-2xl border bg-card p-6 shadow-soft">
        <h2 className="text-xl font-semibold">Convidar alguém</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Envie este código. A pessoa pode informá-lo ao criar a conta para entrar na sua família.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="max-w-full break-all rounded-xl bg-secondary px-4 py-3 font-display text-2xl font-semibold sm:text-3xl">
            {family.invite_code}
          </span>
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(family.invite_code);
              toast.success("Código copiado");
            }}
          >
            <Copy className="size-4 mr-1.5" /> Copiar
          </Button>
        </div>
      </section>

      {/* Membros e Permissões de Viagem */}
      <section className="rounded-2xl border bg-card p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Membros da Família</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {family.role === "admin"
                ? "Como administrador, você pode gerenciar o acesso de cada membro às viagens."
                : "Membros da família e seus níveis de acesso."}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {members.length} {members.length === 1 ? "membro" : "membros"}
          </Badge>
        </div>

        <ul className="divide-y divide-border/60">
          {members.map((m) => (
            <li key={m.user_id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shrink-0">
                  {m.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground truncate">
                      {m.name}
                      {m.user_id === family.userId ? " (você)" : ""}
                    </span>
                    {m.role === "admin" && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                        <Crown className="size-3 text-accent" /> Admin
                      </span>
                    )}
                  </div>

                  {/* Status de acesso a viagens */}
                  <div className="mt-0.5 flex items-center gap-2">
                    {m.role === "admin" || m.all_trips_access ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="size-3" /> Todas as viagens permitidas
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 font-medium">
                        <Plane className="size-3" /> {m.allowed_trip_ids.length} {m.allowed_trip_ids.length === 1 ? "viagem permitida" : "viagens permitidas"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botão para o Admin gerenciar viagens do membro */}
              {family.role === "admin" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs h-8 gap-1.5 hover:bg-primary/5 hover:border-primary/40 shrink-0"
                  onClick={() => {
                    setSelectedMember({
                      userId: m.user_id,
                      name: m.name,
                      role: m.role,
                      allTripsAccess: m.all_trips_access,
                      allowedTripIds: m.allowed_trip_ids,
                    });
                    setModalOpen(true);
                  }}
                >
                  <Plane className="size-3.5 text-primary" />
                  Gerenciar viagens
                </Button>
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Entrar em outra família */}
      <section className="rounded-2xl border border-dashed p-6">
        <h2 className="text-xl font-semibold">Entrar em outra família</h2>
        <form
          className="mt-3 flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            const { error } = await supabase.rpc("join_family", { _code: code });
            if (error) {
              toast.error(error.message.includes("inválido") ? "Código de convite inválido" : error.message);
              return;
            }
            setCode("");
            qc.invalidateQueries();
            toast.success("Você entrou na família!");
          }}
        >
          <Input placeholder="Código de convite" value={code} onChange={(e) => setCode(e.target.value)} required className="uppercase" />
          <Button type="submit">Entrar</Button>
        </form>
      </section>

      {/* Modal de gerenciamento de permissões de viagem do membro */}
      <MemberTripAccessModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        member={selectedMember}
        familyId={family.id}
      />
    </div>
  );
}
