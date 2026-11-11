import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Images, MapPin, Plus, Plane, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useFamily } from "@/lib/family";
import { CATEGORIES, brl, daysUntil, fmtDate, tripLength, tripPhase } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTripCover } from "@/lib/album-cover";
import { useFlagDetector } from "@/lib/flags";
import { LocationFlagBadge, InlineFlagIcon, TripFlagTitle } from "@/components/trip/LocationFlagBadge";
import { createDefaultTripChecklist } from "@/lib/checklist-template";
import { TripWeatherPreview } from "@/components/trip/TripWeatherPreview";
import { dispatchTripWebhook } from "@/lib/webhook.functions";

export const Route = createFileRoute("/_authenticated/viagens/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Minhas viagens — Maluki Viagens" },
      { name: "description", content: "Suas próximas viagens e as que já aconteceram." },
      { property: "og:title", content: "Minhas viagens — Maluki Viagens" },
      { property: "og:description", content: "Suas próximas viagens e as que já aconteceram." },
    ],
  }),
  component: TripsPage,
});

function useTrips() {
  return useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      const { data, error } = await supabase.from("trips").select("*").order("start_date");
      if (error) throw error;
      return data;
    },
  });
}

function TripsPage() {
  const { data: family } = useFamily();
  const { data: trips, isLoading } = useTrips();
  const upcoming = (trips ?? []).filter((t) => tripPhase(t.start_date, t.end_date) !== "realizada");
  const past = (trips ?? []).filter((t) => tripPhase(t.start_date, t.end_date) === "realizada").reverse();
  const next = upcoming[0];
  const firstName = family?.userName.split(" ")[0];

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs sm:text-sm text-muted-foreground">Olá{firstName ? `, ${firstName}` : ""} 👋</p>
          <h1 className="text-3xl sm:text-4xl font-semibold font-display tracking-tight">Suas viagens</h1>
        </div>
        <NewTripDialog />
      </div>

      {isLoading ? (
        <Skeleton className="h-56 rounded-3xl" />
      ) : next ? (
        <NextTripHero trip={next} />
      ) : (
        <EmptyState />
      )}

      {upcoming.length > 1 && (
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Também planejadas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.slice(1).map((t) => <TripCard key={t.id} trip={t} />)}
          </div>
        </section>
      )}
      {past.length > 0 && (
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Memórias</h2>
          <Timeline trips={past} />
        </section>
      )}
    </div>
  );
}

type Trip = NonNullable<ReturnType<typeof useTrips>["data"]>[number];

function Timeline({ trips }: { trips: Trip[] }) {
  const years = Array.from(new Set(trips.map((t) => t.start_date.slice(0, 4))));
  return (
    <ol className="relative ml-3 border-l-2 border-primary/25 md:ml-16">
      {years.map((y) => (
        <li key={y} className="pb-6">
          <div className="relative -ml-3 mb-3 flex items-center gap-3 md:-ml-[4.6rem]">
            <span className="hidden w-14 text-right font-display text-xl font-semibold text-primary md:block">{y}</span>
            <span className="size-5 shrink-0 rounded-full border-4 border-background bg-primary shadow-soft" />
            <span className="font-display text-xl font-semibold text-primary md:hidden">{y}</span>
          </div>
          <ul className="space-y-3 pl-6">
            {trips.filter((t) => t.start_date.startsWith(y)).map((t) => <TimelineItem key={t.id} t={t} />)}
          </ul>
        </li>
      ))}
    </ol>
  );
}

function TimelineItem({ t }: { t: Trip }) {
  const cover = useTripCover(t.cover_path);
  return (
              <li className="relative">
                <span className="absolute -left-[1.95rem] top-5 size-2.5 rounded-full bg-accent" />
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4 shadow-soft transition hover:border-primary/40">
                  {cover && <img src={cover} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-16 shrink-0 rounded-xl object-cover" />}
                  <Link to="/viagens/$id" params={{ id: t.id }} className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">
                      {fmtDate(t.start_date, { day: "2-digit", month: "short" })}
                      {t.end_date !== t.start_date && ` – ${fmtDate(t.end_date, { day: "2-digit", month: "short" })}`}
                    </p>
                    <h3 className="text-lg font-semibold hover:text-primary">
                      <TripFlagTitle title={t.title} destination={t.main_destination} />
                    </h3>
                    {t.main_destination && <p className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-3.5" />{t.main_destination}</p>}
                  </Link>
                  {t.photos_url && (
                    <Button asChild variant="secondary" size="sm" className="rounded-full">
                      <a href={t.photos_url} target="_blank" rel="noreferrer"><Images /> Fotos</a>
                    </Button>
                  )}
                </div>
              </li>
  );
}

function NextTripHero({ trip }: { trip: Trip }) {
  const d = daysUntil(trip.start_date);
  const phase = tripPhase(trip.start_date, trip.end_date);
  const cover = useTripCover(trip.cover_path);
  return (
    <Link
      to="/viagens/$id"
      params={{ id: trip.id }}
      style={
        cover
          ? {
              backgroundImage: `linear-gradient(to top, rgb(0 0 0 / 0.75), rgb(0 0 0 / 0.25)), url("${cover}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
      className="group block overflow-hidden rounded-3xl bg-sunset p-5 sm:p-8 md:p-10 text-primary-foreground shadow-lift transition hover:-translate-y-0.5"
    >
      <p className="text-xs sm:text-sm font-medium uppercase tracking-widest opacity-80">
        {phase === "em_andamento" ? "Acontecendo agora" : "Próxima viagem"}
      </p>
      <div className="mt-3 sm:mt-4 flex flex-wrap items-end justify-between gap-4 sm:gap-6">
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-semibold break-words leading-tight">
            <TripFlagTitle title={trip.title} destination={trip.main_destination} />
          </h2>
          <p className="mt-2 sm:mt-3 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-base opacity-90 flex-wrap">
            {trip.main_destination && <><MapPin className="size-3.5 sm:size-4 shrink-0" /> {trip.main_destination} · </>}
            {fmtDate(trip.start_date)} – {fmtDate(trip.end_date)} · {tripLength(trip.start_date, trip.end_date)} dias
          </p>
        </div>
        {phase === "futura" && (
          <div className="text-left sm:text-right shrink-0">
            <div className="font-display text-4xl sm:text-6xl font-semibold leading-none">{d}</div>
            <div className="text-xs sm:text-sm opacity-80">{d === 1 ? "dia para ir" : "dias para ir"}</div>
          </div>
        )}
      </div>
      <p className="mt-4 sm:mt-6 text-xs sm:text-sm font-medium opacity-90 group-hover:underline">Abrir planejamento →</p>
    </Link>
  );
}

function TripCard({ trip }: { trip: Trip }) {
  const cover = useTripCover(trip.cover_path);
  return (
    <Link to="/viagens/$id" params={{ id: trip.id }} className="block overflow-hidden rounded-2xl border bg-card shadow-soft transition hover:-translate-y-0.5 hover:border-primary/40">
      {cover && <img src={cover} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-40 w-full object-cover" />}
      <div className="p-5">
      <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">{CATEGORIES[trip.category] ?? trip.category}</span>
      <h3 className="mt-3 text-xl font-semibold">
        <TripFlagTitle title={trip.title} destination={trip.main_destination} />
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {trip.main_destination ? `${trip.main_destination} · ` : ""}
        {fmtDate(trip.start_date, { day: "2-digit", month: "short", year: "numeric" })}
      </p>
      {Number(trip.budget) > 0 && <p className="mt-3 text-sm">Orçamento {brl(trip.budget)}</p>}
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border border-dashed bg-card p-12 text-center">
      <Plane className="mx-auto size-10 text-accent" />
      <h2 className="mt-4 text-2xl font-semibold">Nenhuma viagem ainda</h2>
      <p className="mx-auto mt-2 max-w-sm text-muted-foreground">Crie a primeira e comece a montar o roteiro, as reservas e o orçamento.</p>
      <div className="mt-6 flex justify-center"><NewTripDialog /></div>
    </div>
  );
}

function NewTripDialog() {
  const { data: family } = useFamily();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const dispatchWebhook = useServerFn(dispatchTripWebhook);
  const [open, setOpen] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [autoChecklist, setAutoChecklist] = useState(true);
  const [form, setForm] = useState({
    title: "",
    main_destination: "",
    start_date: "",
    end_date: "",
    category: "ferias",
    budget: "",
    description: "",
    photos_url: "",
  });

  const { flag, loading: flagLoading } = useFlagDetector(form.title, form.main_destination);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const create = useMutation({
    mutationFn: async () => {
      if (!family) throw new Error("Família não carregada");
      if (form.end_date < form.start_date) throw new Error("A volta precisa ser depois da ida");
      let cover_path: string | null = null;
      if (coverFile) {
        cover_path = `${family.id}/covers/${crypto.randomUUID()}-${coverFile.name.replace(/[^\w.-]/g, "_")}`;
        const up = await supabase.storage.from("documents").upload(cover_path, coverFile, { contentType: coverFile.type });
        if (up.error) throw up.error;
      }
      const { data, error } = await supabase
        .from("trips")
        .insert({
          ...form,
          budget: Number(form.budget || 0),
          photos_url: form.photos_url.trim() || null,
          cover_path,
          family_id: family.id,
          created_by: family.userId,
        })
        .select("id")
        .single();
      if (error) throw error;

      // Gerar automaticamente o checklist de preparativos e malas se habilitado
      if (autoChecklist) {
        try {
          await createDefaultTripChecklist(data.id, family.id, {
            title: form.title,
            destination: form.main_destination,
            category: form.category,
          });
        } catch (err) {
          console.error("Erro ao gerar checklist inicial:", err);
        }
      }

      return data.id;
    },
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ["trips"] });
      setOpen(false);
      setCoverFile(null);
      setForm({
        title: "",
        main_destination: "",
        start_date: "",
        end_date: "",
        category: "ferias",
        budget: "",
        description: "",
        photos_url: "",
      });

      // Dispara webhook em background se a família tiver webhook configurado
      supabase.auth.getSession().then(({ data: sessionData }) => {
        const token = sessionData.session?.access_token;
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        dispatchWebhook({ data: { tripId: id, event: "trip_created" }, headers }).catch((err) => {
          console.warn("Aviso ao disparar webhook de nova viagem:", err);
        });
      }).catch((err) => {
        console.warn("Aviso ao obter sessão para webhook:", err);
      });

      toast.success(autoChecklist ? "Viagem criada com checklist e malas!" : "Viagem criada!");
      navigate({ to: "/viagens/$id", params: { id } });
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" size="lg">
          <Plus /> Nova viagem
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-lg max-h-[88dvh] overflow-y-auto overflow-x-hidden p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="font-display text-xl sm:text-2xl">Nova viagem</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          {/* Nome da viagem com detecção dinâmica de bandeira (cidade BR ou país/cidade exterior) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="trip-title">Nome da viagem</Label>
              {flag && (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground animate-in fade-in">
                  <InlineFlagIcon flag={flag} />
                  <span className="font-medium text-foreground">{flag.label}</span>
                </span>
              )}
            </div>

            <div className="relative flex items-center">
              <Input
                id="trip-title"
                required
                placeholder="Ex.: Férias em Floripa, Paris, Santiago ou Chile"
                value={form.title}
                onChange={set("title")}
                className={flag ? "pr-14" : ""}
                autoFocus
              />
              {flag && (
                <div className="absolute right-3 flex items-center gap-1 pointer-events-none">
                  <InlineFlagIcon flag={flag} />
                </div>
              )}
            </div>

            {/* Painel/Badge informativo da bandeira encontrada */}
            <LocationFlagBadge
              flag={flag}
              loading={flagLoading}
              titleValue={form.title}
              hasDestination={Boolean(form.main_destination.trim())}
              onApplyEmoji={(emoji) => {
                if (!form.title.includes(emoji)) {
                  setForm((prev) => ({
                    ...prev,
                    title: `${emoji} ${prev.title}`.trim(),
                  }));
                }
              }}
              onApplyDestination={(dest) => {
                setForm((prev) => ({
                  ...prev,
                  main_destination: dest,
                }));
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="trip-destination">Destino principal</Label>
            <Input
              id="trip-destination"
              placeholder="Florianópolis, SC ou Paris, França"
              value={form.main_destination}
              onChange={set("main_destination")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="trip-start-date">Ida</Label>
              <Input id="trip-start-date" type="date" required value={form.start_date} onChange={set("start_date")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trip-end-date">Volta</Label>
              <Input id="trip-end-date" type="date" required value={form.end_date} onChange={set("end_date")} />
            </div>
          </div>

          <TripWeatherPreview
            destination={form.main_destination || form.title}
            startDate={form.start_date}
            endDate={form.end_date}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div className="space-y-1.5">
              <Label>Tipo</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORIES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="trip-budget">Orçamento (R$)</Label>
              <Input
                id="trip-budget"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={form.budget}
                onChange={set("budget")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="trip-cover">Foto de capa (opcional)</Label>
            <Input
              id="trip-cover"
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="trip-photos-url">Álbum do Google Fotos (opcional)</Label>
            <Input
              id="trip-photos-url"
              type="url"
              placeholder="https://photos.app.goo.gl/..."
              value={form.photos_url}
              onChange={set("photos_url")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="trip-desc">Observações</Label>
            <Textarea id="trip-desc" rows={2} value={form.description} onChange={set("description")} />
          </div>

          {/* Opção Inteligente: Criar Checklist de Viagem e Malas Automaticamente */}
          <div className="rounded-2xl border border-primary/25 bg-primary/5 p-3.5 shadow-xs transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <Label
                  htmlFor="auto-checklist"
                  className="text-sm font-semibold flex items-center gap-1.5 cursor-pointer text-foreground"
                >
                  <Sparkles className="size-4 text-primary shrink-0" />
                  Criar checklist de viagem e malas automaticamente
                </Label>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Gera o checklist completo em 8 categorias (documentos, saúde, mala, casa, eletrônicos) com sugestões inteligentes para o destino.
                </p>
              </div>
              <Switch
                id="auto-checklist"
                checked={autoChecklist}
                onCheckedChange={setAutoChecklist}
              />
            </div>
          </div>

          <Button type="submit" className="w-full rounded-full" disabled={create.isPending}>
            {create.isPending ? "Criando…" : "Criar viagem"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
