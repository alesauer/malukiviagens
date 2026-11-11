import { useState } from "react";
import { Bed, Car, Bus, Plane, Ticket, Shield, Utensils, Trash2, Plus, MapPin, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTripMutations, useTripRows } from "@/lib/trip-data";
import { EXPENSE_CATEGORIES, RESERVATION_KINDS, brl, fmtDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { applicableReservationValues, reservationFields } from "@/lib/reservation-fields";

type Props = { tripId: string; familyId?: string | undefined };

const kindIcon: Record<string, typeof Bed> = { hospedagem: Bed, voo: Plane, onibus: Bus, carro: Car, restaurante: Utensils, ingresso: Ticket, seguro: Shield };

export function ReservationsTab({ tripId, familyId }: Props) {
  const { data = [] } = useTripRows("reservations", tripId);
  const m = useTripMutations("reservations", tripId, familyId);
  const { data: docs = [] } = useTripRows("documents", tripId);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [f, setF] = useState({ kind: "hospedagem", title: "", provider: "", starts_at: "", ends_at: "", confirmation_code: "", cost: "", address: "", maps_url: "" });
  const fields = reservationFields(f.kind);

  async function attach(reservationId: string, list: File[]) {
    if (!familyId) return;
    const { data: u } = await supabase.auth.getUser();
    for (const file of list) {
      if (file.size > 25 * 1024 * 1024) { toast.error(`${file.name}: maior que 25 MB`); continue; }
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const path = `${familyId}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("documents").upload(path, file);
      if (up.error) { toast.error(up.error.message); continue; }
      const kind = f.kind === "seguro" ? "seguro" : "voucher";
      const { error } = await supabase.from("documents").insert({ family_id: familyId, trip_id: tripId, reservation_id: reservationId, title: file.name.replace(/\.[^.]+$/, ""), kind, file_path: path, file_name: file.name, uploaded_by: u.user?.id ?? null });
      if (error) toast.error(error.message);
    }
    qc.invalidateQueries({ queryKey: ["documents", tripId] });
  }

  async function openDoc(path: string) {
    const { data: s, error } = await supabase.storage.from("documents").createSignedUrl(path, 60);
    if (error) { toast.error(error.message); return; }
    window.open(s.signedUrl, "_blank");
  }

  async function save() {
    if (!familyId) return;
    setSaving(true);
    const values = applicableReservationValues(f.kind, f);
    const { data: row, error } = await supabase.from("reservations").insert({
      trip_id: tripId, family_id: familyId, kind: values.kind, title: values.title, provider: values.provider || null,
      starts_at: values.starts_at ? new Date(values.starts_at).toISOString() : null, ends_at: values.ends_at ? new Date(values.ends_at).toISOString() : null,
      confirmation_code: values.confirmation_code || null, cost: Number(values.cost || 0), address: values.address || null, maps_url: values.maps_url || null,
    }).select("id").single();
    if (error) { toast.error(error.message); setSaving(false); return; }
    if (files.length) await attach(row.id, files);
    qc.invalidateQueries({ queryKey: ["reservations", tripId] });
    setSaving(false); setOpen(false); setFiles([]);
    setF({ ...f, title: "", provider: "", confirmation_code: "", cost: "", address: "", maps_url: "" });
    toast.success(f.starts_at ? "Reserva salva e adicionada ao roteiro" : "Reserva salva");
  }
  const sorted = [...data].sort((a, b) => (a.starts_at ?? "z").localeCompare(b.starts_at ?? "z"));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="rounded-full"><Plus /> Nova reserva</Button></DialogTrigger>
          <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-lg max-h-[88dvh] overflow-y-auto p-4 sm:p-6">
            <DialogHeader><DialogTitle className="font-display text-xl sm:text-2xl">Nova reserva</DialogTitle></DialogHeader>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              <Select value={f.kind} onValueChange={(v) => setF(applicableReservationValues(v, { ...f, kind: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(RESERVATION_KINDS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
              </Select>
              <div className="space-y-1.5"><Label htmlFor="reservation-title">{fields.title}</Label><Input id="reservation-title" required placeholder={fields.placeholder} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
              {(fields.provider || fields.code) && <div className="grid gap-3 sm:grid-cols-2">
                {fields.provider && <div className="space-y-1.5"><Label htmlFor="reservation-provider">{fields.provider}</Label><Input id="reservation-provider" value={f.provider} onChange={(e) => setF({ ...f, provider: e.target.value })} /></div>}
                {fields.code && <div className="space-y-1.5"><Label htmlFor="reservation-code">{fields.code}</Label><Input id="reservation-code" value={f.confirmation_code} onChange={(e) => setF({ ...f, confirmation_code: e.target.value })} /></div>}
              </div>}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="min-w-0 space-y-1.5"><Label htmlFor="reservation-start">{fields.start}</Label><Input id="reservation-start" type="datetime-local" value={f.starts_at} onChange={(e) => setF({ ...f, starts_at: e.target.value })} /></div>
                {fields.end && <div className="min-w-0 space-y-1.5"><Label htmlFor="reservation-end">{fields.end}</Label><Input id="reservation-end" type="datetime-local" value={f.ends_at} onChange={(e) => setF({ ...f, ends_at: e.target.value })} /></div>}
              </div>
              <div className="space-y-1.5"><Label>Valor (R$)</Label><Input type="number" min="0" step="0.01" value={f.cost} onChange={(e) => setF({ ...f, cost: e.target.value })} /></div>
              {fields.address && <>
                <div className="space-y-1.5"><Label htmlFor="reservation-address">{fields.address}</Label><Input id="reservation-address" placeholder="Rua, número, cidade" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></div>
                <div className="space-y-1.5"><Label htmlFor="reservation-maps">Link do Google Maps (opcional)</Label><Input id="reservation-maps" type="url" placeholder="https://maps.app.goo.gl/..." value={f.maps_url} onChange={(e) => setF({ ...f, maps_url: e.target.value })} /></div>
              </>}
              <div className="space-y-1.5">
                <Label>Anexos (vouchers, comprovantes…)</Label>
                <Input type="file" multiple accept=".pdf,image/*" onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
                {files.length > 0 && <p className="text-xs text-muted-foreground">{files.length} arquivo(s) selecionado(s)</p>}
              </div>
              <Button type="submit" disabled={saving} className="w-full rounded-full">{saving ? "Salvando…" : "Salvar reserva"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {sorted.length === 0 && <p className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">Hotéis, voos, carros e ingressos aparecem aqui em ordem.</p>}
      {sorted.map((r) => {
        const Icon = kindIcon[r.kind] ?? Ticket;
        return (
          <div key={r.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 rounded-2xl border bg-card p-4 shadow-soft">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1 w-full sm:w-auto">
              <div className="flex size-10 sm:size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"><Icon className="size-5" /></div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm sm:text-base leading-snug">{r.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {RESERVATION_KINDS[r.kind]}{r.provider ? ` · ${r.provider}` : ""}
                  {r.starts_at ? ` · ${fmtDate(r.starts_at)}` : ""}{r.ends_at ? ` – ${fmtDate(r.ends_at)}` : ""}
                  {r.confirmation_code ? ` · Cód. ${r.confirmation_code}` : ""}
                </p>
                {(r.address || r.maps_url) && (
                  <a target="_blank" rel="noreferrer" href={mapsHref(r)} className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline">
                    <MapPin className="size-3 shrink-0" /><span className="truncate">{r.address || "Ver no Google Maps"}</span>
                  </a>
                )}
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  {docs.filter((d) => d.reservation_id === r.id).map((d) => (
                    <button key={d.id} onClick={() => openDoc(d.file_path)} className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs hover:bg-muted">
                      <Paperclip className="size-3" />{d.file_name}
                    </button>
                  ))}
                  <label className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                    <Paperclip className="size-3" /> Anexar
                    <input type="file" multiple accept=".pdf,image/*" className="hidden" onChange={async (e) => { const l = Array.from(e.target.files ?? []); e.target.value = ""; if (l.length) { await attach(r.id, l); toast.success("Anexo guardado"); } }} />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40 shrink-0">
              <div className="text-left sm:text-right">
                <p className="font-semibold text-sm sm:text-base">{brl(r.cost)}</p>
                <button onClick={() => m.update.mutate({ id: r.id, paid: !r.paid })}>
                  <Badge variant={r.paid ? "default" : "outline"} className="cursor-pointer text-[10px]">{r.paid ? "Pago" : "A pagar"}</Badge>
                </button>
              </div>
              <button aria-label="Remover" onClick={() => m.remove.mutate(r.id)} className="p-1.5 text-muted-foreground hover:text-destructive shrink-0"><Trash2 className="size-4" /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function mapsHref(r: { address: string | null; maps_url: string | null }) {
  return r.maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.address ?? "")}`;
}

export function ExpensesTab({ tripId, familyId, budget }: Props & { budget: number }) {
  const { data = [] } = useTripRows("expenses", tripId);
  const { data: res = [] } = useTripRows("reservations", tripId);
  const m = useTripMutations("expenses", tripId, familyId);
  const [f, setF] = useState({ description: "", category: "alimentacao", amount: "", paid_by: "" });

  const expenseTotal = data.reduce((s, e) => s + Number(e.amount), 0);
  const resTotal = res.reduce((s, r) => s + Number(r.cost), 0);
  const total = expenseTotal + resTotal;
  const byCat: Record<string, number> = { hospedagem: 0 };
  res.forEach((r) => {
    const c = r.kind === "hospedagem" ? "hospedagem" : r.kind === "seguro" ? "seguro" : r.kind === "restaurante" ? "alimentacao" : r.kind === "ingresso" ? "passeios" : "transporte";
    byCat[c] = (byCat[c] ?? 0) + Number(r.cost);
  });
  data.forEach((e) => (byCat[e.category] = (byCat[e.category] ?? 0) + Number(e.amount)));
  const pct = budget > 0 ? Math.min(100, (total / budget) * 100) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <form
          className="grid gap-2 rounded-2xl border bg-card p-4 shadow-soft sm:grid-cols-[1fr_150px_110px_120px_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            m.add.mutate({ description: f.description, category: f.category, amount: Number(f.amount), paid_by: f.paid_by || null }, { onSuccess: () => setF({ ...f, description: "", amount: "" }) });
          }}
        >
          <Input required placeholder="Gasto (ex.: almoço)" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          <Select value={f.category} onValueChange={(v) => setF({ ...f, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{Object.entries(EXPENSE_CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
          </Select>
          <Input required type="number" min="0" step="0.01" placeholder="R$" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
          <Input placeholder="Quem pagou" value={f.paid_by} onChange={(e) => setF({ ...f, paid_by: e.target.value })} />
          <Button type="submit"><Plus /> Lançar</Button>
        </form>
        <div className="divide-y rounded-2xl border bg-card shadow-soft">
          {data.length === 0 && <p className="p-8 text-center text-muted-foreground">Lance os gastos do dia a dia. Reservas já entram no total automaticamente.</p>}
          {[...data].reverse().map((e) => (
            <div key={e.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1">
                <p className="font-medium">{e.description}</p>
                <p className="text-xs text-muted-foreground">{EXPENSE_CATEGORIES[e.category]} · {fmtDate(e.spent_on)}{e.paid_by ? ` · ${e.paid_by}` : ""}</p>
              </div>
              <span className="font-semibold">{brl(e.amount)}</span>
              <button aria-label="Remover" onClick={() => m.remove.mutate(e.id)}><Trash2 className="size-4 text-muted-foreground hover:text-destructive" /></button>
            </div>
          ))}
        </div>
      </div>
      <aside className="space-y-4 rounded-2xl border bg-card p-5 shadow-soft">
        <div>
          <p className="text-sm text-muted-foreground">Total da viagem</p>
          <p className="font-display text-4xl font-semibold">{brl(total)}</p>
          {budget > 0 && (
            <>
              <Progress value={pct} className="mt-3" />
              <p className="mt-2 text-xs text-muted-foreground">
                {total <= budget ? `Sobram ${brl(budget - total)} do orçamento de ${brl(budget)}` : `${brl(total - budget)} acima do orçamento`}
              </p>
            </>
          )}
        </div>
        <ul className="space-y-2 text-sm">
          {Object.entries(byCat).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
            <li key={k} className="flex justify-between"><span>{EXPENSE_CATEGORIES[k] ?? k}</span><span className="font-medium">{brl(v)}</span></li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
