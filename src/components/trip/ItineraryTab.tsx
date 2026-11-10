import { useState } from "react";
import { Check, Clock, MapPin, Plus, Ticket, Trash2 } from "lucide-react";
import { mapsHref } from "@/components/trip/MoneyTabs";
import { useTripMutations, useTripRows } from "@/lib/trip-data";
import { RESERVATION_KINDS, brl, fmtLongDay, tripDays } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { itineraryReservations } from "@/lib/reservation-fields";

type Props = { tripId: string; familyId?: string | undefined; start: string; end: string };

export function ItineraryTab({ tripId, familyId, start, end }: Props) {
  const { data = [] } = useTripRows("activities", tripId);
  const m = useTripMutations("activities", tripId, familyId);
  const { data: res = [] } = useTripRows("reservations", tripId);
  const days = tripDays(start, end);
  const localDay = (iso: string) => { const d = new Date(iso); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const localTime = (iso: string | null) => iso ? new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";
  const undated = data.filter((a) => !a.date || !days.includes(a.date));

  return (
    <div className="space-y-6">
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
                    <p className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                      {a.time && <span className="flex items-center gap-1"><Clock className="size-3" />{a.time.slice(0, 5)}</span>}
                      {a.location && (
                        <a className="flex items-center gap-1 hover:text-primary" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a.location)}`}>
                          <MapPin className="size-3" />{a.location}
                        </a>
                      )}
                      {Number(a.estimated_cost) > 0 && <span>{brl(a.estimated_cost)}</span>}
                    </p>
                  </div>
                  <button aria-label="Remover" onClick={() => m.remove.mutate(a.id)} className="opacity-0 transition group-hover:opacity-100">
                    <Trash2 className="size-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </li>
              ))}
            </ul>
            <QuickAdd onAdd={(r) => m.add.mutate({ ...r, date: day })} />
          </section>
        );
      })}
      <section className="rounded-2xl border border-dashed p-5">
        <h3 className="text-lg font-semibold">Ideias sem data</h3>
        <p className="text-sm text-muted-foreground">Lugares que vocês querem conhecer, sem dia definido.</p>
        <ul className="mt-3 space-y-1">
          {undated.map((a) => (
            <li key={a.id} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-muted">
              <span>{a.title}{a.location ? <span className="text-muted-foreground"> · {a.location}</span> : null}</span>
              <button aria-label="Remover" onClick={() => m.remove.mutate(a.id)}><Trash2 className="size-4 text-muted-foreground hover:text-destructive" /></button>
            </li>
          ))}
        </ul>
        <QuickAdd onAdd={(r) => m.add.mutate({ ...r, date: null })} />
      </section>
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
