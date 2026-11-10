import { useRef, useState } from "react";
import { Check, Download, FileText, Phone, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTripMutations, useTripRows } from "@/lib/trip-data";
import { DOC_KINDS, fmtDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Props = { tripId: string; familyId?: string | undefined };

const SUGGESTED = ["Documentos com foto", "Seguro-viagem", "Carregadores", "Remédios", "Protetor solar", "Avisar o banco"];

export function ChecklistTab({ tripId, familyId }: Props) {
  const { data = [] } = useTripRows("checklist_items", tripId);
  const m = useTripMutations("checklist_items", tripId, familyId);
  const groups: { kind: "preparo" | "bagagem"; title: string; hint: string }[] = [
    { kind: "preparo", title: "Antes de viajar", hint: "Tarefas e preparativos" },
    { kind: "bagagem", title: "Malas", hint: "Informe de quem é cada item" },
  ];
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {groups.map((g) => {
        const items = data.filter((i) => i.kind === g.kind);
        const done = items.filter((i) => i.done).length;
        return (
          <section key={g.kind} className="rounded-2xl border bg-card p-5 shadow-soft">
            <div className="flex items-baseline justify-between">
              <h3 className="text-xl font-semibold">{g.title}</h3>
              <span className="text-sm text-muted-foreground">{done}/{items.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">{g.hint}</p>
            <ul className="mt-3 space-y-1">
              {items.map((i) => (
                <li key={i.id} className="group flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted">
                  <button
                    aria-label="Alternar"
                    onClick={() => m.update.mutate({ id: i.id, done: !i.done })}
                    className={cn("flex size-5 items-center justify-center rounded-md border-2", i.done ? "border-success bg-success text-primary-foreground" : "border-input")}
                  >
                    {i.done && <Check className="size-3" />}
                  </button>
                  <span className={cn("flex-1", i.done && "text-muted-foreground line-through")}>{i.title}</span>
                  {i.owner_name && <span className="rounded-full bg-secondary px-2 text-xs">{i.owner_name}</span>}
                  <button aria-label="Remover" className="opacity-0 group-hover:opacity-100" onClick={() => m.remove.mutate(i.id)}><Trash2 className="size-4 text-muted-foreground" /></button>
                </li>
              ))}
            </ul>
            <AddItem withOwner={g.kind === "bagagem"} onAdd={(title, owner) => m.add.mutate({ kind: g.kind, title, owner_name: owner || null })} />
            {g.kind === "preparo" && items.length === 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {SUGGESTED.map((s) => (
                  <button key={s} onClick={() => m.add.mutate({ kind: "preparo", title: s })} className="rounded-full border border-dashed px-3 py-1 text-xs hover:border-primary hover:text-primary">+ {s}</button>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function AddItem({ withOwner, onAdd }: { withOwner: boolean; onAdd: (t: string, o: string) => void }) {
  const [t, setT] = useState("");
  const [o, setO] = useState("");
  return (
    <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (t.trim()) { onAdd(t.trim(), o.trim()); setT(""); } }}>
      <Input placeholder="Novo item" value={t} onChange={(e) => setT(e.target.value)} />
      {withOwner && <Input className="w-28" placeholder="De quem" value={o} onChange={(e) => setO(e.target.value)} />}
      <Button type="submit" size="icon" aria-label="Adicionar"><Plus /></Button>
    </form>
  );
}

export function DocumentsTab({ tripId, familyId }: Props) {
  const { data = [] } = useTripRows("documents", tripId);
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [kind, setKind] = useState("voucher");
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    if (!familyId) return;
    if (file.size > 25 * 1024 * 1024) { toast.error("Arquivo maior que 25 MB"); return; }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const path = `${familyId}/${crypto.randomUUID()}.${ext}`;
      const up = await supabase.storage.from("documents").upload(path, file);
      if (up.error) throw up.error;
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("documents").insert({ family_id: familyId, trip_id: tripId, title: file.name.replace(/\.[^.]+$/, ""), kind, file_path: path, file_name: file.name, uploaded_by: u.user?.id ?? null });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["documents", tripId] });
      toast.success("Documento guardado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha no envio");
    } finally {
      setBusy(false);
    }
  }

  async function open(path: string) {
    const { data: s, error } = await supabase.storage.from("documents").createSignedUrl(path, 60);
    if (error) { toast.error(error.message); return; }
    window.open(s.signedUrl, "_blank");
  }

  async function remove(id: string, path: string) {
    await supabase.storage.from("documents").remove([path]);
    await supabase.from("documents").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["documents", tripId] });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed bg-card p-5">
        <Upload className="size-5 text-primary" />
        <p className="flex-1 text-sm text-muted-foreground">PDF ou foto de passaportes, vouchers e bilhetes. Só sua família vê.</p>
        <Select value={kind} onValueChange={setKind}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>{Object.entries(DOC_KINDS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
        </Select>
        <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
        <Button disabled={busy} onClick={() => fileRef.current?.click()}>{busy ? "Enviando…" : "Enviar arquivo"}</Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {data.map((d) => (
          <div key={d.id} className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-soft">
            <FileText className="size-8 text-accent" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{d.title}</p>
              <p className="text-xs text-muted-foreground">{DOC_KINDS[d.kind]} · {fmtDate(d.created_at)}</p>
            </div>
            <Button variant="ghost" size="icon" aria-label="Abrir" onClick={() => open(d.file_path)}><Download /></Button>
            <Button variant="ghost" size="icon" aria-label="Excluir" onClick={() => remove(d.id, d.file_path)}><Trash2 /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmergencyTab({ tripId, familyId }: Props) {
  const { data = [] } = useTripRows("emergency_contacts", tripId);
  const m = useTripMutations("emergency_contacts", tripId, familyId);
  const [f, setF] = useState({ name: "", phone: "", notes: "" });
  return (
    <div className="space-y-4">
      <form className="grid gap-2 rounded-2xl border bg-card p-4 shadow-soft sm:grid-cols-[1fr_180px_1fr_auto]" onSubmit={(e) => { e.preventDefault(); m.add.mutate({ name: f.name, phone: f.phone, notes: f.notes || null }, { onSuccess: () => setF({ name: "", phone: "", notes: "" }) }); }}>
        <Input required placeholder="Nome (ex.: Hotel, SAMU)" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <Input required type="tel" placeholder="Telefone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
        <Input placeholder="Observação" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} />
        <Button type="submit"><Plus /> Adicionar</Button>
      </form>
      <div className="grid gap-3 sm:grid-cols-2">
        {data.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-soft">
            <div className="flex-1">
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm text-muted-foreground">{c.phone}{c.notes ? ` · ${c.notes}` : ""}</p>
            </div>
            <Button asChild size="icon" className="rounded-full" aria-label={`Ligar para ${c.name}`}><a href={`tel:${c.phone}`}><Phone /></a></Button>
            <Button variant="ghost" size="icon" aria-label="Remover" onClick={() => m.remove.mutate(c.id)}><Trash2 /></Button>
          </div>
        ))}
      </div>
    </div>
  );
}
