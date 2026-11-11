import { useRef, useState } from "react";
import {
  Check,
  Download,
  FileText,
  Phone,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  CalendarClock,
  CreditCard,
  Smartphone,
  Luggage,
  HeartPulse,
  Home,
  PlaneTakeoff,
  CheckCircle2,
  Circle,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTripMutations, useTripRows } from "@/lib/trip-data";
import { DOC_KINDS, fmtDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  CHECKLIST_CATEGORIES,
  ChecklistCategoryId,
  createDefaultTripChecklist,
  normalizeChecklistKind,
} from "@/lib/checklist-template";

type Props = { tripId: string; familyId?: string | undefined };

const CATEGORY_ICONS: Record<ChecklistCategoryId, React.ComponentType<{ className?: string }>> = {
  antes_viagem: CalendarClock,
  documentos_dinheiro: CreditCard,
  eletronicos: Smartphone,
  mala_roupas: Luggage,
  higiene: Sparkles,
  saude: HeartPulse,
  casa: Home,
  dia_viagem: PlaneTakeoff,
};

export function ChecklistTab({ tripId, familyId }: Props) {
  const { data = [] } = useTripRows("checklist_items", tripId);
  const m = useTripMutations("checklist_items", tripId, familyId);
  const qc = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "done">("all");

  async function handleAutoChecklist() {
    if (!familyId) return;
    setGenerating(true);
    try {
      const { data: trip } = await supabase
        .from("trips")
        .select("title, main_destination, category")
        .eq("id", tripId)
        .maybeSingle();

      const { count } = await createDefaultTripChecklist(tripId, familyId, {
        title: trip?.title || "",
        destination: trip?.main_destination || "",
        category: trip?.category || "ferias",
      });

      qc.invalidateQueries({ queryKey: ["checklist_items", tripId] });
      toast.success(`${count} itens de checklist e malas organizados com sucesso!`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao gerar";
      toast.error(`Não foi possível gerar: ${msg}`);
    } finally {
      setGenerating(false);
    }
  }

  const totalDone = data.filter((i) => i.done).length;
  const pct = data.length > 0 ? Math.round((totalDone / data.length) * 100) : 0;

  // Filtragem de categorias para visualização
  const categoriesToShow = selectedCat === "all"
    ? CHECKLIST_CATEGORIES
    : CHECKLIST_CATEGORIES.filter((c) => c.id === selectedCat);

  return (
    <div className="space-y-6">
      {/* Barra de Progresso e Ação de Gerar */}
      <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-soft md:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              Checklist & Malas da Viagem
            </h2>
            <p className="text-xs text-muted-foreground md:text-sm mt-0.5">
              Organizado em 8 categorias essenciais com sugestões inteligentes para seu destino.
            </p>
          </div>
          <Button
            type="button"
            variant="default"
            size="sm"
            className="rounded-full text-xs font-semibold px-4 shadow-soft"
            onClick={handleAutoChecklist}
            disabled={generating}
          >
            <Sparkles className="mr-1.5 size-3.5 text-accent" />
            {generating ? "Gerando itens…" : "Gerar checklist completo"}
          </Button>
        </div>

        {/* Barra de Conclusão */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs md:text-sm">
            <span className="font-medium text-foreground">Progresso Geral</span>
            <span className="font-semibold text-primary">
              {totalDone} de {data.length} concluídos ({pct}%)
            </span>
          </div>
          <Progress value={pct} className="h-2.5 rounded-full" />
        </div>

        {/* Filtros por Categoria (Pills horizontais) */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50">
          <button
            type="button"
            onClick={() => setSelectedCat("all")}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              selectedCat === "all"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            Todas ({data.length})
          </button>
          {CHECKLIST_CATEGORIES.map((cat) => {
            const count = data.filter((i) => normalizeChecklistKind(i.kind) === cat.id).length;
            const done = data.filter((i) => normalizeChecklistKind(i.kind) === cat.id && i.done).length;
            const Icon = CATEGORY_ICONS[cat.id];
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCat(cat.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  selectedCat === cat.id
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-secondary/70 text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                <span>{cat.name}</span>
                {count > 0 && (
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full",
                    selectedCat === cat.id ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {done}/{count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid de Categorias do Modelo */}
      <div className="grid gap-5 md:grid-cols-2">
        {categoriesToShow.map((cat) => {
          const Icon = CATEGORY_ICONS[cat.id];
          const rawItems = data.filter((i) => normalizeChecklistKind(i.kind) === cat.id);
          const catDone = rawItems.filter((i) => i.done).length;
          const items = filterStatus === "all"
            ? rawItems
            : filterStatus === "pending"
            ? rawItems.filter((i) => !i.done)
            : rawItems.filter((i) => i.done);

          return (
            <section
              key={cat.id}
              className="flex flex-col justify-between rounded-3xl border border-border/70 bg-card p-5 shadow-soft transition-all hover:border-primary/30"
            >
              <div>
                {/* Header da Categoria */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base text-foreground leading-tight">
                        {cat.name}
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {cat.description}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0 font-medium">
                    {catDone}/{rawItems.length}
                  </Badge>
                </div>

                {/* Lista de Itens */}
                <ul className="mt-4 space-y-1.5">
                  {items.length === 0 && (
                    <li className="py-3 text-center text-xs text-muted-foreground italic">
                      {rawItems.length === 0 ? "Nenhum item nesta categoria ainda." : "Nenhum item com este filtro."}
                    </li>
                  )}
                  {items.map((i) => (
                    <li
                      key={i.id}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-colors",
                        i.done ? "bg-muted/40 text-muted-foreground" : "hover:bg-secondary/60"
                      )}
                    >
                      <button
                        type="button"
                        aria-label={i.done ? "Marcar como pendente" : "Marcar como concluído"}
                        onClick={() => m.update.mutate({ id: i.id, done: !i.done })}
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                          i.done
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-input hover:border-primary"
                        )}
                      >
                        {i.done && <Check className="size-3.5" />}
                      </button>

                      <span className={cn("flex-1 text-xs md:text-sm leading-snug", i.done && "line-through opacity-70")}>
                        {i.title}
                      </span>

                      {i.owner_name && (
                        <span className="shrink-0 rounded-full bg-secondary/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {i.owner_name}
                        </span>
                      )}

                      <button
                        type="button"
                        aria-label="Remover item"
                        className="opacity-0 transition-opacity group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                        onClick={() => m.remove.mutate(i.id)}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Formulário para Adicionar Item nesta Categoria */}
              <div className="pt-3 mt-3 border-t border-border/40">
                <AddItem
                  placeholder={`Adicionar em ${cat.name}…`}
                  onAdd={(title, owner) =>
                    m.add.mutate({
                      kind: cat.id,
                      title,
                      owner_name: owner || null,
                    })
                  }
                />
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function AddItem({
  placeholder = "Novo item…",
  onAdd,
}: {
  placeholder?: string;
  onAdd: (title: string, owner: string) => void;
}) {
  const [t, setT] = useState("");
  const [o, setO] = useState("");
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (t.trim()) {
          onAdd(t.trim(), o.trim());
          setT("");
          setO("");
        }
      }}
    >
      <Input
        placeholder={placeholder}
        value={t}
        onChange={(e) => setT(e.target.value)}
        className="h-8 text-xs rounded-lg"
      />
      <Input
        className="w-24 h-8 text-xs rounded-lg shrink-0"
        placeholder="Resp."
        value={o}
        onChange={(e) => setO(e.target.value)}
        title="Responsável pelo item (opcional)"
      />
      <Button type="submit" size="sm" className="h-8 px-2.5 rounded-lg shrink-0" aria-label="Adicionar">
        <Plus className="size-3.5" />
      </Button>
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
