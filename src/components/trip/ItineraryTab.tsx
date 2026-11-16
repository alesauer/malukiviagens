import { useState } from "react";
import { Check, Clock, Compass, MapPin, Plus, Sparkles, Ticket, Trash2, CalendarPlus, Calendar, Pencil } from "lucide-react";
import { mapsHref } from "@/components/trip/MoneyTabs";
import { useTripMutations, useTripRows } from "@/lib/trip-data";
import { RESERVATION_KINDS, brl, fmtLongDay, tripDays } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { itineraryReservations } from "@/lib/reservation-fields";
import { SuggestItineraryModal } from "@/components/trip/SuggestItineraryModal";

type Props = {
  tripId: string;
  familyId?: string | undefined;
  start: string;
  end: string;
  tripTitle?: string | undefined;
  destination?: string | null | undefined;
  category?: string | null | undefined;
};

function getMatchingReservation(
  activity: { title: string; notes?: string | null },
  reservations: Array<{ title: string; confirmation_code?: string | null; kind?: string }>
) {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");

  const aTitle = clean(activity.title);
  const aNotes = activity.notes ? clean(activity.notes) : "";

  return reservations.find((r) => {
    const rTitle = clean(r.title);
    if (!rTitle) return false;
    if (aTitle.includes(rTitle) || rTitle.includes(aTitle)) return true;
    if (r.confirmation_code && (aTitle.includes(clean(r.confirmation_code)) || aNotes.includes(clean(r.confirmation_code)))) {
      return true;
    }
    const words = aTitle.split(/\s+/).filter((w) => w.length > 4);
    return words.some((w) => rTitle.includes(w));
  });
}

export function ItineraryTab({
  tripId,
  familyId,
  start,
  end,
  tripTitle = "",
  destination = "",
  category = "ferias",
}: Props) {
  const { data = [] } = useTripRows("activities", tripId);
  const m = useTripMutations("activities", tripId, familyId);
  const { data: res = [] } = useTripRows("reservations", tripId);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<(typeof data)[0] | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    cost: "",
    notes: "",
  });

  function openEditModal(activity: (typeof data)[0], defaultDay?: string) {
    setEditingActivity(activity);
    setEditForm({
      title: activity.title || "",
      date: activity.date || defaultDay || "__undated__",
      time: activity.time ? activity.time.slice(0, 5) : "",
      location: activity.location || "",
      cost: activity.estimated_cost && Number(activity.estimated_cost) > 0 ? String(activity.estimated_cost) : "",
      notes: activity.notes || "",
    });
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingActivity) return;
    if (!editForm.title.trim()) {
      toast.error("O título da atividade é obrigatório.");
      return;
    }

    const targetDate = editForm.date === "__undated__" || !editForm.date ? null : editForm.date;

    await m.update.mutateAsync({
      id: editingActivity.id,
      title: editForm.title.trim(),
      date: targetDate,
      time: editForm.time ? `${editForm.time}:00` : null,
      location: editForm.location.trim() || null,
      estimated_cost: editForm.cost ? Number(editForm.cost) : 0,
      notes: editForm.notes.trim() || null,
    });

    if (targetDate) {
      const dayIdx = days.indexOf(targetDate);
      toast.success(
        dayIdx >= 0
          ? `Atividade salva no Dia ${dayIdx + 1}!`
          : "Atividade atualizada com sucesso!"
      );
    } else {
      toast.success("Atividade salva em Ideias sem data!");
    }

    setEditingActivity(null);
  }

  const days = tripDays(start, end);
  const localDay = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const localTime = (iso: string | null) =>
    iso ? new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";
  const undated = data.filter((a) => !a.date || !days.includes(a.date));

  return (
    <div className="space-y-6">
      {/* Barra Superior do Roteiro com Opção de Sugerir Roteiro */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-soft">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground md:text-xl">
            Roteiro da Viagem
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {days.length} {days.length === 1 ? "dia planejado" : "dias planejados"} · {data.length}{" "}
            {data.length === 1 ? "atividade no total" : "atividades no total"}
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setSuggestOpen(true)}
          className="rounded-full font-semibold text-xs gap-1.5 shadow-soft"
        >
          <Sparkles className="size-3.5 text-accent" />
          Sugerir roteiro
        </Button>
      </div>

      <SuggestItineraryModal
        open={suggestOpen}
        onOpenChange={setSuggestOpen}
        tripId={tripId}
        tripTitle={tripTitle}
        destination={destination}
        category={category}
        start={start}
        end={end}
        existingActivities={data.map((a) => ({ id: a.id, title: a.title, date: a.date }))}
        onAddActivity={async (payload) => {
          await m.add.mutateAsync(payload);
        }}
      />
      {days.map((day, i) => {
        const items = data.filter((a) => a.date === day).sort((a, b) => (a.time ?? "99").localeCompare(b.time ?? "99"));
        return (
          <section key={day} className="rounded-2xl border bg-card p-5 shadow-soft">
            <header className="mb-3 flex items-baseline gap-3">
              <span className="font-display text-2xl font-semibold text-primary">Dia {i + 1}</span>
              <span className="text-sm capitalize text-muted-foreground">{fmtLongDay(day)}</span>
            </header>
            <ul className="space-y-2">
              {itineraryReservations(res).filter((r) => r.starts_at && localDay(r.starts_at) === day).map((r) => (
                <li key={r.id} className="flex items-start gap-3 rounded-xl bg-secondary/60 px-2 py-2">
                  <Ticket className="mt-0.5 size-5 shrink-0 text-accent" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{r.title} <span className="text-xs font-normal text-muted-foreground">· {RESERVATION_KINDS[r.kind] ?? "Reserva"}</span></p>
                    <p className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="size-3" />{localTime(r.starts_at)}</span>
                      {(r.address || r.maps_url) && (
                        <a className="flex items-center gap-1 hover:text-primary" target="_blank" rel="noreferrer" href={mapsHref(r)}><MapPin className="size-3" />{r.address || "Mapa"}</a>
                      )}
                      {r.confirmation_code && <span>Cód. {r.confirmation_code}</span>}
                    </p>
                  </div>
                </li>
              ))}
              {items.map((a) => (
                <li key={a.id} className="group flex items-start gap-3 rounded-xl px-2 py-2 hover:bg-muted">
                  <button
                    aria-label={a.done ? "Desmarcar" : "Marcar como feito"}
                    onClick={() => m.update.mutate({ id: a.id, done: !a.done })}
                    className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2", a.done ? "border-success bg-success text-primary-foreground" : "border-input")}
                  >
                    {a.done && <Check className="size-3" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className={cn("font-medium", a.done && "text-muted-foreground line-through")}>{a.title}</p>
                    {a.notes && (
                      <p className="text-xs text-muted-foreground/85 line-clamp-2 mt-0.5 italic">
                        {a.notes}
                      </p>
                    )}
                    <p className="flex flex-wrap gap-x-3 text-xs text-muted-foreground mt-0.5">
                      {a.time && <span className="flex items-center gap-1"><Clock className="size-3" />{a.time.slice(0, 5)}</span>}
                      {a.location && (
                        <a className="flex items-center gap-1 hover:text-primary" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.location)}`}>
                          <MapPin className="size-3" />{a.location}
                        </a>
                      )}
                      {Number(a.estimated_cost) > 0 && <span>{brl(a.estimated_cost)}</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-70 sm:opacity-0 transition group-hover:opacity-100 sm:group-focus-within:opacity-100 shrink-0">
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label="Editar atividade"
                      title="Editar atividade"
                      onClick={() => openEditModal(a)}
                      className="size-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label="Remover atividade"
                      title="Remover atividade"
                      onClick={() => m.remove.mutate(a.id)}
                      className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <QuickAdd onAdd={(r) => m.add.mutate({ ...r, date: day })} />
          </section>
        );
      })}
      <section className="rounded-2xl border border-dashed border-border/80 bg-card/40 p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Ideias sem data
              {undated.length > 0 && (
                <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs font-normal">
                  {undated.length}
                </Badge>
              )}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Lugares e reservas que vocês querem conhecer, sem dia definido no roteiro.
            </p>
          </div>
        </div>

        {undated.length === 0 ? (
          <p className="text-xs text-muted-foreground italic py-2">
            Nenhuma ideia pendente no momento. Todas as atividades estão distribuídas nos dias da viagem!
          </p>
        ) : (
          <ul className="space-y-2.5">
            {undated.map((a) => {
              const matchingRes = getMatchingReservation(a, res);
              const isFromRes = !!matchingRes || (a.notes && /reserva|passaporte|voucher|ingresso/i.test(a.notes));

              return (
                <li
                  key={a.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-3.5 shadow-soft hover:border-primary/40 hover:bg-muted/30 transition-all"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{a.title}</span>
                      {isFromRes && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] gap-1 px-2 py-0.5 font-medium bg-accent/15 text-accent border border-accent/30 rounded-full"
                        >
                          <Ticket className="size-2.5 shrink-0" />
                          Reserva vinculada
                        </Badge>
                      )}
                    </div>

                    {/* Descrição detalhada da ideia / reserva */}
                    {a.notes && (
                      <p className="text-xs text-muted-foreground/90 leading-relaxed">
                        {a.notes}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground pt-0.5">
                      {a.location && (
                        <a
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                          target="_blank"
                          rel="noreferrer"
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.location)}`}
                        >
                          <MapPin className="size-3 text-primary/70 shrink-0" />
                          <span>{a.location}</span>
                        </a>
                      )}
                      {matchingRes?.confirmation_code && (
                        <span className="text-[11px] text-muted-foreground/80 font-mono">
                          Cód.: {matchingRes.confirmation_code}
                        </span>
                      )}
                      {Number(a.estimated_cost) > 0 && <span>{brl(a.estimated_cost)}</span>}
                    </div>
                  </div>

                  {/* Ações: Adicionar ao roteiro, Editar e Excluir */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40 w-full sm:w-auto justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-8 px-2.5 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 border-primary/30 gap-1.5 rounded-lg shadow-none"
                      title="Adicionar ideia ao roteiro"
                      aria-label="Adicionar ideia ao roteiro"
                      onClick={() => openEditModal(a, days[0] || "")}
                    >
                      <CalendarPlus className="size-3.5 text-primary" />
                      <span>Adicionar ao dia</span>
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-8 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      aria-label="Editar ideia"
                      title="Editar ideia"
                      onClick={() => openEditModal(a)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      aria-label="Remover ideia"
                      title="Remover ideia"
                      onClick={() => m.remove.mutate(a.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div className="mt-3">
          <QuickAdd onAdd={(r) => m.add.mutate({ ...r, date: null })} />
        </div>
      </section>

      {/* Modal para editar atividade ou ideia */}
      <Dialog open={!!editingActivity} onOpenChange={(open) => !open && setEditingActivity(null)}>
        <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-lg max-h-[88dvh] overflow-y-auto p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl font-display">
              <Pencil className="size-5 text-primary" />
              {editingActivity?.date ? "Editar Atividade" : "Editar Ideia / Agendar no Roteiro"}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
              Personalize o título, dia, horário, localização, notas e custos desta atividade.
            </DialogDescription>
          </DialogHeader>

          {editingActivity && (
            <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="edit-title">Título da Atividade *</Label>
                <Input
                  id="edit-title"
                  required
                  placeholder="Ex.: Visita ao Parque, Almoço..."
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-day">Dia da Viagem</Label>
                  <Select
                    value={editForm.date}
                    onValueChange={(v) => setEditForm({ ...editForm, date: v })}
                  >
                    <SelectTrigger id="edit-day">
                      <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__undated__">
                        Sem data definida (Ideias sem data)
                      </SelectItem>
                      {days.map((day, idx) => (
                        <SelectItem key={day} value={day}>
                          Dia {idx + 1} · {fmtLongDay(day)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="edit-time">Horário</Label>
                    {editForm.time && (
                      <button
                        type="button"
                        onClick={() => setEditForm({ ...editForm, time: "" })}
                        className="text-[11px] text-muted-foreground hover:text-destructive underline"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                  <Input
                    id="edit-time"
                    type="time"
                    value={editForm.time}
                    onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[11px] text-muted-foreground mr-1">Sugestões de horário:</span>
                {["09:00", "10:30", "14:00", "16:00", "19:30"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setEditForm({ ...editForm, time: preset })}
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                      editForm.time === preset
                        ? "border-primary bg-primary text-primary-foreground font-medium"
                        : "border-border hover:bg-muted text-muted-foreground"
                    )}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-location">Localização / Onde?</Label>
                  <Input
                    id="edit-location"
                    placeholder="Ex.: Av. das Hortênsias, 5507"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-cost">Custo Estimado (R$)</Label>
                  <Input
                    id="edit-cost"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    value={editForm.cost}
                    onChange={(e) => setEditForm({ ...editForm, cost: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit-notes">Observações / Notas</Label>
                <Textarea
                  id="edit-notes"
                  rows={3}
                  placeholder="Dicas, códigos de ingressos, regras ou lembretes sobre esta atividade..."
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                />
              </div>

              <DialogFooter className="flex sm:justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingActivity(null)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="gap-1.5">
                  <Check className="size-4" />
                  Salvar alterações
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QuickAdd({ onAdd }: { onAdd: (r: { title: string; time: string | null; location: string | null; estimated_cost: number }) => void }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", time: "", location: "", cost: "" });
  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="mt-2 flex items-center gap-1.5 px-2 text-sm font-medium text-primary hover:underline">
        <Plus className="size-4" /> Adicionar atividade
      </button>
    );
  return (
    <form
      className="mt-3 grid gap-2 sm:grid-cols-[1fr_100px_1fr_110px_auto]"
      onSubmit={(e) => {
        e.preventDefault();
        onAdd({ title: f.title, time: f.time || null, location: f.location || null, estimated_cost: Number(f.cost || 0) });
        setF({ title: "", time: "", location: "", cost: "" });
      }}
    >
      <Input autoFocus required placeholder="O que fazer?" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
      <Input type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} />
      <Input placeholder="Onde?" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} />
      <Input type="number" min="0" step="0.01" placeholder="R$" value={f.cost} onChange={(e) => setF({ ...f, cost: e.target.value })} />
      <div className="flex gap-1">
        <Button type="submit" size="sm" className="h-9">Salvar</Button>
        <Button type="button" variant="ghost" size="sm" className="h-9" onClick={() => setOpen(false)}>Fechar</Button>
      </div>
    </form>
  );
}
