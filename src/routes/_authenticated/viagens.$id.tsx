import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Camera, Images, ImagePlus, MapPin, Pencil, Sparkles, Trash2, Compass, Ticket, WalletCards, CheckSquare, FileText, PhoneCall, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useFamily } from "@/lib/family";
import { useTripCover } from "@/lib/album-cover";
import { useTripRows } from "@/lib/trip-data";
import { CATEGORIES, brl, daysUntil, fmtDate, tripLength, tripPhase } from "@/lib/format";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ItineraryTab } from "@/components/trip/ItineraryTab";
import { ExpensesTab, ReservationsTab } from "@/components/trip/MoneyTabs";
import { ChecklistTab, DocumentsTab, EmergencyTab } from "@/components/trip/OrganizeTabs";
import { LocationFlagBadge, InlineFlagIcon, TripFlagTitle } from "@/components/trip/LocationFlagBadge";
import { useFlagDetector } from "@/lib/flags";
import { TripWeatherPreview } from "@/components/trip/TripWeatherPreview";
import { dispatchTripWebhook } from "@/lib/webhook.functions";
import { SendTripNotificationModal } from "@/components/trip/SendTripNotificationModal";

export const Route = createFileRoute("/_authenticated/viagens/$id")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Planejamento da viagem — Maluki Viagens" },
      { name: "description", content: "Roteiro, reservas, gastos, malas e documentos desta viagem." },
      { property: "og:title", content: "Planejamento da viagem — Maluki Viagens" },
      { property: "og:description", content: "Roteiro, reservas, gastos, malas e documentos desta viagem." },
    ],
  }),
  component: TripPage,
});

const TRIP_TABS = [
  { id: "roteiro", label: "Roteiro", icon: Compass },
  { id: "reservas", label: "Reservas", icon: Ticket },
  { id: "gastos", label: "Gastos", icon: WalletCards },
  { id: "checklist", label: "Checklist", fullLabel: "Checklist e malas", icon: CheckSquare },
  { id: "documentos", label: "Documentos", icon: FileText },
  { id: "emergencia", label: "Emergência", icon: PhoneCall },
] as const;

function TripPage() {
  const { id } = Route.useParams();
  const { data: family } = useFamily();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const dispatchWebhook = useServerFn(dispatchTripWebhook);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [coverOpen, setCoverOpen] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverSaving, setCoverSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    main_destination: "",
    start_date: "",
    end_date: "",
    category: "ferias",
    budget: "",
    description: "",
  });

  const { flag: editFlag, loading: editFlagLoading } = useFlagDetector(editForm.title, editForm.main_destination);

  const { data: trip, isLoading } = useQuery({
    queryKey: ["trip", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("trips").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: tripRecipients = [] } = useQuery({
    queryKey: ["trip_recipients", id, family?.id],
    enabled: !!family?.id && !!id,
    queryFn: async () => {
      const { data: ms } = await supabase
        .from("family_members")
        .select("user_id, role, all_trips_access, allowed_trip_ids")
        .eq("family_id", family!.id);

      const allowed = (ms || []).filter(
        (m) => m.role === "admin" || m.all_trips_access !== false || m.allowed_trip_ids?.includes(id)
      );

      const userIds = allowed.map((m) => m.user_id);
      if (userIds.length === 0) return [];

      const { data: ps } = await supabase
        .from("profiles")
        .select("id, full_name, phone, email")
        .in("id", userIds);

      return allowed.map((m) => {
        const p = ps?.find((prof) => prof.id === m.user_id);
        return {
          name: p?.full_name || "Membro",
          phone: p?.phone || null,
          email: p?.email || null,
        };
      });
    },
  });
  const { data: checklist = [] } = useTripRows("checklist_items", id);
  const { data: expenses = [] } = useTripRows("expenses", id);
  const { data: reservations = [] } = useTripRows("reservations", id);

  const currentCover = useTripCover(trip?.cover_path);
  const coverPreview = useMemo(() => (coverFile ? URL.createObjectURL(coverFile) : null), [coverFile]);
  useEffect(() => () => { if (coverPreview) URL.revokeObjectURL(coverPreview); }, [coverPreview]);

  if (isLoading) return <Skeleton className="h-64 rounded-3xl" />;
  if (!trip) return <p className="text-muted-foreground">Viagem não encontrada. <Link to="/viagens" className="text-primary">Voltar</Link></p>;

  const fid = family?.id;
  const phase = tripPhase(trip.start_date, trip.end_date);
  const d = daysUntil(trip.start_date);
  const spent = expenses.reduce((s, e) => s + Number(e.amount), 0) + reservations.reduce((s, r) => s + Number(r.cost), 0);
  const ckDone = checklist.filter((c) => c.done).length;

  function openEdit() {
    if (!trip) return;
    setEditForm({
      title: trip.title,
      main_destination: trip.main_destination || "",
      start_date: trip.start_date,
      end_date: trip.end_date,
      category: trip.category,
      budget: trip.budget ? String(trip.budget) : "",
      description: trip.description || "",
    });
    setEditOpen(true);
  }

  async function saveEdit() {
    if (editForm.end_date < editForm.start_date) {
      toast.error("A volta precisa ser depois da ida");
      return;
    }
    const { error } = await supabase
      .from("trips")
      .update({
        title: editForm.title.trim(),
        main_destination: editForm.main_destination.trim() || null,
        start_date: editForm.start_date,
        end_date: editForm.end_date,
        category: editForm.category,
        budget: Number(editForm.budget || 0),
        description: editForm.description.trim() || null,
      })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["trip", id] });
    qc.invalidateQueries({ queryKey: ["trips"] });
    setEditOpen(false);

    // Dispara webhook se a família tiver webhook configurado
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const webhookRes = await dispatchWebhook({ data: { tripId: id, event: "trip_updated" }, headers });
      console.log("[Webhook trip_updated] Resposta:", webhookRes);
    } catch (err) {
      console.warn("Aviso ao disparar webhook de viagem atualizada:", err);
    }

    toast.success("Viagem atualizada com sucesso!");
  }

  function editPhotos() { setPhotoUrl(trip?.photos_url ?? ""); setPhotoOpen(true); }

  async function savePhotos() {
    const v = photoUrl.trim();
    if (v && !/^https?:\/\//i.test(v)) { toast.error("Informe um link começando com https://"); return; }
    const { error } = await supabase.from("trips").update({ photos_url: v || null }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["trip", id] });
    setPhotoOpen(false);
    toast.success(v ? "Link das fotos salvo" : "Link removido");
  }

  function openCover() { setCoverFile(null); setCoverOpen(true); }

  async function saveCover() {
    if (!family || !coverFile) return;
    if (!coverFile.type.startsWith("image/")) { toast.error("Escolha um arquivo de imagem"); return; }
    setCoverSaving(true);
    const old = trip?.cover_path ?? null;
    const path = `${family.id}/covers/${crypto.randomUUID()}-${coverFile.name.replace(/[^\w.-]/g, "_")}`;
    const up = await supabase.storage.from("documents").upload(path, coverFile, { contentType: coverFile.type });
    if (up.error) {
      toast.error(`Não deu para enviar a foto: ${up.error.message}`);
      setCoverSaving(false);
      return;
    }
    const { error } = await supabase.from("trips").update({ cover_path: path }).eq("id", id);
    if (error) {
      await supabase.storage.from("documents").remove([path]).catch(() => {});
      toast.error(error.message);
      setCoverSaving(false);
      return;
    }
    if (old) await supabase.storage.from("documents").remove([old]).catch(() => {});
    qc.invalidateQueries({ queryKey: ["trip", id] });
    qc.invalidateQueries({ queryKey: ["trips"] });
    setCoverOpen(false);
    setCoverFile(null);
    setCoverSaving(false);
    toast.success("Capa atualizada");
  }

  async function removeCover() {
    if (!trip?.cover_path) { setCoverOpen(false); return; }
    setCoverSaving(true);
    const { error } = await supabase.from("trips").update({ cover_path: null }).eq("id", id);
    if (error) { toast.error(error.message); setCoverSaving(false); return; }
    await supabase.storage.from("documents").remove([trip.cover_path]).catch(() => {});
    qc.invalidateQueries({ queryKey: ["trip", id] });
    qc.invalidateQueries({ queryKey: ["trips"] });
    setCoverOpen(false);
    setCoverFile(null);
    setCoverSaving(false);
    toast.success("Capa removida");
  }

  async function del() {
    if (!confirm("Excluir esta viagem e tudo dentro dela?")) return;
    const { error } = await supabase.from("trips").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["trips"] });
    navigate({ to: "/viagens" });
  }

  return (
    <div className="min-w-0 space-y-5 md:space-y-8">
      <Link to="/viagens" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Viagens</Link>
      <header className="relative overflow-hidden rounded-3xl bg-sunset p-4 text-primary-foreground shadow-lift sm:p-6 md:p-8">
        {currentCover ? (
          <>
            <img src={currentCover} alt="" aria-hidden referrerPolicy="no-referrer" className="absolute inset-0 size-full object-cover" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25" />
          </>
        ) : null}
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <span className="rounded-full bg-background/20 px-3 py-1 text-xs font-medium">{CATEGORIES[trip.category] ?? trip.category}</span>
            <h1 className="mt-2.5 sm:mt-3 break-words text-2xl sm:text-4xl md:text-5xl font-semibold leading-tight">
              <TripFlagTitle title={trip.title} destination={trip.main_destination} />
            </h1>
            <p className="mt-2 text-xs sm:text-sm opacity-90 md:text-base">
              {trip.main_destination && <><MapPin className="mr-1 inline size-3.5 sm:size-4" />{trip.main_destination} · </>}
              {fmtDate(trip.start_date)} – {fmtDate(trip.end_date, { day: "2-digit", month: "short", year: "numeric" })} · {tripLength(trip.start_date, trip.end_date)} dias
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Button variant="ghost" size="sm" className="rounded-full text-primary-foreground hover:bg-background/20 hover:text-primary-foreground min-h-[36px]" onClick={openEdit}>
              <Pencil className="size-3.5" /> Editar
            </Button>
            <Button variant="ghost" size="sm" className="rounded-full text-primary-foreground hover:bg-background/20 hover:text-primary-foreground min-h-[36px]" onClick={openCover}>
              {trip.cover_path ? <><Camera className="size-3.5" /> Capa</> : <><ImagePlus className="size-3.5" /> Capa</>}
            </Button>
            {trip.photos_url ? (
              <Button asChild variant="secondary" size="sm" className="rounded-full min-h-[36px]">
                <a href={trip.photos_url} target="_blank" rel="noreferrer"><Images className="size-3.5" /> Fotos</a>
              </Button>
            ) : null}
            <Button variant="ghost" size="sm" className="rounded-full text-primary-foreground hover:bg-background/20 hover:text-primary-foreground min-h-[36px]" onClick={editPhotos}>
              {trip.photos_url ? <Pencil className="size-3.5" /> : <><Images className="size-3.5" /> Fotos</>}
            </Button>
            <Button asChild variant="secondary" size="sm" className="rounded-full min-h-[36px]">
              <Link to="/assistente" search={{ trip: trip.id }}><Sparkles className="size-3.5" /> Ideias</Link>
            </Button>
            {family?.webhook_enabled && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-full min-h-[36px] bg-emerald-600 hover:bg-emerald-700 text-white border-0 gap-1.5 shadow-soft transition-all"
                onClick={() => setNotifyOpen(true)}
                title="Notificar participantes no WhatsApp (Lembrete ou Programação do Dia)"
              >
                <MessageSquare className="size-3.5" />
                <span>Notificar WhatsApp</span>
              </Button>
            )}
            <Button variant="ghost" size="icon" aria-label="Excluir viagem" onClick={del} className="size-9 text-primary-foreground hover:bg-background/20 hover:text-primary-foreground"><Trash2 className="size-4" /></Button>
          </div>
        </div>
        <dl className="relative mt-4 grid grid-cols-2 gap-2 sm:gap-3 md:mt-8 md:grid-cols-4 md:gap-4">
          <Stat label={phase === "futura" ? "Faltam" : "Status"} value={phase === "futura" ? `${d} dias` : phase === "em_andamento" ? "Em viagem" : "Realizada"} />
          <Stat label="Gasto previsto" value={brl(spent)} />
          <Stat label="Orçamento" value={Number(trip.budget) > 0 ? brl(trip.budget) : "—"} />
          <Stat label="Checklist" value={checklist.length ? `${ckDone}/${checklist.length}` : "—"} />
        </dl>
      </header>

      {/* Previsão do tempo compacta da viagem */}
      <TripWeatherPreview
        destination={trip.main_destination || trip.title}
        startDate={trip.start_date}
        endDate={trip.end_date}
        className="rounded-2xl border-border/70 bg-card/90 shadow-soft"
      />

      <Dialog open={photoOpen} onOpenChange={setPhotoOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-lg max-h-[88dvh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader><DialogTitle className="font-display text-xl sm:text-2xl">Álbum do Google Fotos</DialogTitle></DialogHeader>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); savePhotos(); }}>
            <div className="space-y-1.5">
              <Label htmlFor="photos-url">Link do álbum</Label>
              <Input id="photos-url" type="url" autoFocus placeholder="https://photos.app.goo.gl/..." value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
              <p className="text-xs text-muted-foreground">Deixe vazio e salve para remover o link.</p>
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setPhotoOpen(false)}>Cancelar</Button>
              <Button type="submit" className="rounded-full">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={coverOpen} onOpenChange={setCoverOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-lg max-h-[88dvh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader><DialogTitle className="font-display text-xl sm:text-2xl">Foto de capa</DialogTitle></DialogHeader>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); saveCover(); }}>
            <div className="aspect-video overflow-hidden rounded-2xl bg-secondary">
              {coverPreview ? (
                <img src={coverPreview} alt="Pré-visualização da nova foto" className="size-full object-cover" />
              ) : currentCover ? (
                <img src={currentCover} alt="Capa atual da viagem" className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center px-4 text-center text-sm text-muted-foreground">Nenhuma foto ainda</div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cover-file">Escolher nova foto</Label>
              <Input id="cover-file" type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)} />
              <p className="text-xs text-muted-foreground">A foto aparece nos cards de viagem e na linha do tempo de Memórias.</p>
            </div>
            <DialogFooter className="gap-2">
              {trip.cover_path && !coverFile ? (
                <Button type="button" variant="ghost" onClick={removeCover} disabled={coverSaving}>Remover capa</Button>
              ) : null}
              <Button type="button" variant="ghost" onClick={() => setCoverOpen(false)} disabled={coverSaving}>Cancelar</Button>
              <Button type="submit" className="rounded-full" disabled={!coverFile || coverSaving}>{coverSaving ? "Salvando…" : "Salvar capa"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-xl max-h-[88dvh] overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl sm:text-2xl">Editar viagem</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); saveEdit(); }}>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-title">Nome da viagem</Label>
                {editFlag && (
                  <LocationFlagBadge
                    flag={editFlag}
                    loading={editFlagLoading}
                    titleValue={editForm.title}
                    onApplyEmoji={(emoji) => {
                      if (!editForm.title.includes(emoji)) {
                        setEditForm((f) => ({ ...f, title: `${emoji} ${f.title}` }));
                      }
                    }}
                    onApplyDestination={(dest) => {
                      if (!editForm.main_destination) {
                        setEditForm((f) => ({ ...f, main_destination: dest }));
                      }
                    }}
                    hasDestination={Boolean(editForm.main_destination)}
                  />
                )}
              </div>
              <div className="relative">
                <Input
                  id="edit-title"
                  required
                  placeholder="Ex: Férias em Santiago, Beto Carrero..."
                  value={editForm.title}
                  onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                  className={editFlag ? "pr-10" : ""}
                />
                {editFlag && (
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                    <InlineFlagIcon flag={editFlag} className="size-5 rounded-sm object-cover shadow-xs" />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-dest">Destino principal (cidade ou país)</Label>
              <Input
                id="edit-dest"
                placeholder="Ex: Santiago, Chile ou Florianópolis, SC"
                value={editForm.main_destination}
                onChange={(e) => setEditForm((f) => ({ ...f, main_destination: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-start">Ida</Label>
                <Input
                  id="edit-start"
                  type="date"
                  required
                  value={editForm.start_date}
                  onChange={(e) => setEditForm((f) => ({ ...f, start_date: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-end">Volta</Label>
                <Input
                  id="edit-end"
                  type="date"
                  required
                  value={editForm.end_date}
                  onChange={(e) => setEditForm((f) => ({ ...f, end_date: e.target.value }))}
                />
              </div>
            </div>

            <TripWeatherPreview
              destination={editForm.main_destination || editForm.title}
              startDate={editForm.start_date}
              endDate={editForm.end_date}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-cat">Categoria</Label>
                <Select
                  value={editForm.category}
                  onValueChange={(v) => setEditForm((f) => ({ ...f, category: v }))}
                >
                  <SelectTrigger id="edit-cat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORIES).map(([k, label]) => (
                      <SelectItem key={k} value={k}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-budget">Orçamento estimado (R$)</Label>
                <Input
                  id="edit-budget"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={editForm.budget}
                  onChange={(e) => setEditForm((f) => ({ ...f, budget: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-desc">Anotações / Descrição</Label>
              <Textarea
                id="edit-desc"
                rows={3}
                placeholder="Detalhes ou planos gerais..."
                value={editForm.description}
                onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>Cancelar</Button>
              <Button type="submit" className="rounded-full">Salvar alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="roteiro" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-3 gap-1.5 rounded-2xl bg-secondary/80 p-1.5 md:flex md:flex-wrap md:justify-start md:gap-2">
          {TRIP_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex h-[52px] sm:h-10 flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-xl px-2 py-1.5 text-[11px] sm:text-xs md:text-sm font-semibold transition-all data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-soft"
              >
                <Icon className="size-4 shrink-0 text-primary" />
                <span className="truncate leading-none">
                  {tab.label}
                  {"fullLabel" in tab && <span className="hidden lg:inline"> e malas</span>}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        <div className="mt-6">
          <TabsContent value="roteiro">
            <ItineraryTab
              tripId={id}
              familyId={fid}
              start={trip.start_date}
              end={trip.end_date}
              tripTitle={trip.title}
              destination={trip.main_destination}
              category={trip.category}
            />
          </TabsContent>
          <TabsContent value="reservas"><ReservationsTab tripId={id} familyId={fid} /></TabsContent>
          <TabsContent value="gastos"><ExpensesTab tripId={id} familyId={fid} budget={Number(trip.budget)} /></TabsContent>
          <TabsContent value="checklist"><ChecklistTab tripId={id} familyId={fid} /></TabsContent>
          <TabsContent value="documentos"><DocumentsTab tripId={id} familyId={fid} /></TabsContent>
          <TabsContent value="emergencia"><EmergencyTab tripId={id} familyId={fid} /></TabsContent>
        </div>
      </Tabs>

      <SendTripNotificationModal
        open={notifyOpen}
        onOpenChange={setNotifyOpen}
        trip={trip}
        familyName={family?.name || "Família"}
        recipients={tripRecipients}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-background/15 p-2.5 sm:p-3 md:p-4">
      <dt className="text-[10px] sm:text-xs uppercase tracking-wider opacity-80">{label}</dt>
      <dd className="mt-0.5 sm:mt-1 truncate font-display text-base sm:text-xl md:text-2xl font-semibold">{value}</dd>
    </div>
  );
}
