import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Crown, Plane, CheckCircle2, ShieldCheck, Users, MessageSquare, Mail, Phone, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFamily } from "@/lib/family";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MemberTripAccessModal, type MemberAccessData } from "@/components/family/MemberTripAccessModal";
import { EditMemberContactModal, type MemberContactData } from "@/components/family/EditMemberContactModal";
import { formatPhoneDisplay } from "@/lib/phone";

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
  const [selectedContact, setSelectedContact] = useState<MemberContactData | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);

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
        .select("id, full_name, email, phone")
        .in("id", ms.map((m) => m.user_id));
      return ms.map((m) => {
        const prof = ps?.find((p) => p.id === m.user_id);
        return {
          ...m,
          name: prof?.full_name ?? "Membro",
          email: prof?.email ?? null,
          phone: prof?.phone ?? null,
          all_trips_access: m.all_trips_access !== false,
          allowed_trip_ids: m.allowed_trip_ids || [],
        };
      });
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
          className="flex flex-col sm:flex-row gap-2"
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
          <Input placeholder="Renomear família" value={name} onChange={(e) => setName(e.target.value)} required className="rounded-xl" />
          <Button type="submit" variant="outline" className="rounded-xl">Salvar</Button>
        </form>
      )}

      {/* Convidar Alguém */}
      <section className="rounded-2xl border bg-card p-4 sm:p-6 shadow-soft">
        <h2 className="text-xl font-semibold">Convidar alguém</h2>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Envie este código. A pessoa pode informá-lo ao criar a conta para entrar na sua família.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="max-w-full break-all rounded-xl bg-secondary px-4 py-2.5 sm:py-3 font-display text-xl sm:text-3xl font-semibold">
            {family.invite_code}
          </span>
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={() => {
              navigator.clipboard.writeText(family.invite_code);
              toast.success("Código copiado");
            }}
          >
            <Copy className="size-4 mr-1.5" /> Copiar
          </Button>
        </div>
      </section>

      {/* Card de Destaque: Notificações de Viagens por WhatsApp */}
      <section className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <MessageSquare className="size-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-foreground">
                Notificações por WhatsApp e E-mail
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Cadastre o WhatsApp e E-mail dos membros para envio de lembretes e alertas automáticos das viagens vinculadas via n8n.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="rounded-xl text-xs h-9 gap-1.5 shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => {
              const myProfile = members.find((m) => m.user_id === family.userId);
              setSelectedContact({
                userId: family.userId,
                name: myProfile?.name || family.userName,
                email: myProfile?.email || family.userEmail,
                phone: myProfile?.phone || family.userPhone,
                isSelf: true,
              });
              setContactModalOpen(true);
            }}
          >
            <Pencil className="size-3.5" />
            Meu WhatsApp & Contato
          </Button>
        </div>
      </section>

      {/* Membros e Permissões de Viagem */}
      <section className="rounded-2xl border bg-card p-4 sm:p-6 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">Membros da Família</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {family.role === "admin"
                ? "Como administrador, você pode gerenciar contatos e definir as viagens que cada membro acessa."
                : "Membros da família, dados de contato e viagens vinculadas."}
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {members.length} {members.length === 1 ? "membro" : "membros"}
          </Badge>
        </div>

        <ul className="divide-y divide-border/60">
          {members.map((m) => (
            <li key={m.user_id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground shrink-0 mt-0.5 sm:mt-0">
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

                  {/* Detalhes de Contato (WhatsApp e E-mail) */}
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                    {m.phone ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <MessageSquare className="size-3" />
                        {formatPhoneDisplay(m.phone)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground/70 italic">
                        <Phone className="size-3" />
                        Sem WhatsApp
                      </span>
                    )}

                    {m.email && (
                      <span className="inline-flex items-center gap-1 truncate max-w-[200px] sm:max-w-none">
                        <Mail className="size-3" />
                        {m.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Botões de Ação para o Membro */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0 justify-end">
                {/* Botão de Editar Contato */}
                {(m.user_id === family.userId || family.role === "admin") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-xs h-8 gap-1 hover:bg-secondary flex-1 sm:flex-initial"
                    onClick={() => {
                      setSelectedContact({
                        userId: m.user_id,
                        name: m.name,
                        email: m.email,
                        phone: m.phone,
                        isSelf: m.user_id === family.userId,
                      });
                      setContactModalOpen(true);
                    }}
                    title="Editar WhatsApp e E-mail"
                  >
                    <Pencil className="size-3.5 text-muted-foreground" />
                    <span>{m.user_id === family.userId ? "Meu Perfil" : "Contato"}</span>
                  </Button>
                )}

                {/* Botão para o Admin gerenciar viagens do membro */}
                {family.role === "admin" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs h-8 gap-1.5 hover:bg-primary/5 hover:border-primary/40 flex-1 sm:flex-initial"
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
                    <span>Viagens</span>
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Entrar em outra família */}
      <section className="rounded-2xl border border-dashed p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold">Entrar em outra família</h2>
        <form
          className="mt-3 flex flex-col sm:flex-row gap-2"
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

      {/* Modal de edição de dados de contato (WhatsApp e E-mail) */}
      <EditMemberContactModal
        open={contactModalOpen}
        onOpenChange={setContactModalOpen}
        member={selectedContact}
        onSaved={() => {
          qc.invalidateQueries({ queryKey: ["members", family.id] });
          qc.invalidateQueries({ queryKey: ["family"] });
        }}
      />
    </div>
  );
}
