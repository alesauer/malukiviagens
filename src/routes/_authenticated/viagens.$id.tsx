import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Camera, Images, ImagePlus, MapPin, Pencil, Sparkles, Trash2 } from "lucide-react";
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
import { ItineraryTab } from "@/components/trip/ItineraryTab";
import { ExpensesTab, ReservationsTab } from "@/components/trip/MoneyTabs";
import { ChecklistTab, DocumentsTab, EmergencyTab } from "@/components/trip/OrganizeTabs";

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

function TripPage() {
  const { id } = Route.useParams();
  const { data: family } = useFamily();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [photoOpen, setPhotoOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [coverOpen, setCoverOpen] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverSaving, setCoverSaving] = useState(false);
  const { data: trip, isLoading } = useQuery({
    queryKey: ["trip", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("trips").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
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
      <header className="relative overflow-hidden rounded-3xl bg-sunset p-4 text-primary-foreground shadow-lift md:p-8">
        {currentCover ? (
          <>
            <img src={currentCover} alt="" aria-hidden referrerPolicy="no-referrer" className="absolute inset-0 size-full object-cover" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/25" />
          </>
        ) : null}
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="rounded-full bg-background/20 px-3 py-1 text-xs font-medium">{CATEGORIES[trip.category] ?? trip.category}</span>
            <h1 className="mt-3 break-words text-3xl font-semibold md:text-5xl">{trip.title}</h1>
            <p className="mt-2 text-sm opacity-90 md:text-base">
              {trip.main_destination && <><MapPin className="mr-1 inline size-4" />{trip.main_destination} · </>}
              {fmtDate(trip.start_date)} – {fmtDate(trip.end_date, { day: "2-digit", month: "short", year: "numeric" })} · {tripLength(trip.start_date, trip.end_date)} dias
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" className="rounded-full text-primary-foreground hover:bg-background/20 hover:text-primary-foreground" onClick={openCover}>
              {trip.cover_path ? <><Camera /> Trocar capa</> : <><ImagePlus /> Adicionar capa</>}
            </Button>
            {trip.photos_url ? (
              <Button asChild variant="secondary" size="sm" className="rounded-full">
                <a href={trip.photos_url} target="_blank" rel="noreferrer"><Images /> Fotos</a>
              </Button>
            ) : null}
            <Button variant="ghost" size="sm" className="rounded-full text-primary-foreground hover:bg-background/20 hover:text-primary-foreground" onClick={editPhotos}>
              {trip.photos_url ? <Pencil /> : <><Images /> Adicionar fotos</>}
            </Button>
            <Button asChild variant="secondary" size="sm" className="rounded-full">
              <Link to="/assistente" search={{ trip: trip.id }}><Sparkles /> Pedir ideias</Link>
            </Button>
            <Button variant="ghost" size="icon" aria-label="Excluir viagem" onClick={del} className="text-primary-foreground hover:bg-background/20 hover:text-primary-foreground"><Trash2 /></Button>
          </div>
        </div>
        <dl className="relative mt-4 grid grid-cols-2 gap-2 md:mt-8 md:grid-cols-4 md:gap-4">
          <Stat label={phase === "futura" ? "Faltam" : "Status"} value={phase === "futura" ? `${d} dias` : phase === "em_andamento" ? "Em viagem" : "Realizada"} />
          <Stat label="Gasto previsto" value={brl(spent)} />
          <Stat label="Orçamento" value={Number(trip.budget) > 0 ? brl(trip.budget) : "—"} />
          <Stat label="Checklist" value={checklist.length ? `${ckDone}/${checklist.length}` : "—"} />
        </dl>
      </header>

      <Dialog open={photoOpen} onOpenChange={setPhotoOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display text-2xl">Álbum do Google Fotos</DialogTitle></DialogHeader>
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
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display text-2xl">Foto de capa</DialogTitle></DialogHeader>
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

      <Tabs defaultValue="roteiro">
        <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-2xl bg-secondary p-1 md:flex md:flex-wrap md:justify-start">
          {([["roteiro", "Roteiro"], ["reservas", "Reservas"], ["gastos", "Gastos"], ["checklist", "Checklist e malas"], ["documentos", "Documentos"], ["emergencia", "Emergência"]] as const).map(([v, l]) => (
            <TabsTrigger key={v} value={v} className="min-w-0 whitespace-normal rounded-xl px-1 py-2 text-xs md:px-4 md:text-sm">{l}</TabsTrigger>
          ))}
        </TabsList>
        <div className="mt-6">
          <TabsContent value="roteiro"><ItineraryTab tripId={id} familyId={fid} start={trip.start_date} end={trip.end_date} /></TabsContent>
          <TabsContent value="reservas"><ReservationsTab tripId={id} familyId={fid} /></TabsContent>
          <TabsContent value="gastos"><ExpensesTab tripId={id} familyId={fid} budget={Number(trip.budget)} /></TabsContent>
          <TabsContent value="checklist"><ChecklistTab tripId={id} familyId={fid} /></TabsContent>
          <TabsContent value="documentos"><DocumentsTab tripId={id} familyId={fid} /></TabsContent>
          <TabsContent value="emergencia"><EmergencyTab tripId={id} familyId={fid} /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-2xl bg-background/15 p-3 md:p-4">
      <dt className="text-xs uppercase tracking-wider opacity-80">{label}</dt>
      <dd className="mt-1 break-words font-display text-lg font-semibold md:text-2xl">{value}</dd>
    </div>
  );
}
