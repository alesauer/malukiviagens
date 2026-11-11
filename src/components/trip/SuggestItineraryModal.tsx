import { useState } from "react";
import {
  Calendar,
  Check,
  Clock,
  Compass,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { brl, fmtLongDay, tripDays } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  getCuratedItinerarySuggestions,
  ItinerarySuggestion,
  SUGGESTION_CATEGORY_LABELS,
  SuggestionCategory,
} from "@/lib/itinerary-suggestions";

export interface ActivityPayload {
  title: string;
  date: string | null;
  time: string | null;
  location: string | null;
  estimated_cost: number;
  notes?: string | null;
}

interface SuggestItineraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  tripTitle?: string | undefined;
  destination?: string | null | undefined;
  category?: string | null | undefined;
  start: string;
  end: string;
  existingActivities: Array<{ id: string; title: string; date: string | null }>;
  onAddActivity: (activity: ActivityPayload) => Promise<void> | void;
}

export function SuggestItineraryModal({
  open,
  onOpenChange,
  tripId,
  tripTitle = "",
  destination = "",
  category = "ferias",
  start,
  end,
  existingActivities,
  onAddActivity,
}: SuggestItineraryModalProps) {
  const days = tripDays(start, end);
  const destName = destination || tripTitle || "seu destino";

  // Sugestões curadas iniciais
  const initialSuggestions = getCuratedItinerarySuggestions(
    destination || "",
    tripTitle,
    category || "ferias",
    days.length
  );

  const [suggestions, setSuggestions] = useState<ItinerarySuggestion[]>(initialSuggestions);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDay, setBulkDay] = useState<string>(days[0] || "none");
  const [itemDays, setItemDays] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const s of initialSuggestions) {
      initial[s.id] = days[s.suggestedDayOffset] || days[0] || "none";
    }
    return initial;
  });
  const [addingId, setAddingId] = useState<string | null>(null);
  const [bulkAdding, setBulkAdding] = useState(false);

  // Filtragem
  const filtered = suggestions.filter((s) => {
    if (selectedCategory !== "all" && s.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        (s.location && s.location.toLowerCase().includes(q)) ||
        (s.notes && s.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Dias mapeados para o Select
  const dayOptions = [
    ...days.map((d, idx) => ({
      value: d,
      label: `Dia ${idx + 1} (${d.slice(8, 10)}/${d.slice(5, 7)} · ${fmtLongDay(d).split(",")[0]})`,
      shortLabel: `Dia ${idx + 1}`,
    })),
    { value: "none", label: "Sem dia definido (Ideias)", shortLabel: "Sem data" },
  ];

  const isAlreadyAdded = (title: string, date: string | null) => {
    const norm = title.trim().toLowerCase();
    return existingActivities.some(
      (a) => a.title.trim().toLowerCase() === norm && (date === "none" ? !a.date : a.date === date)
    );
  };

  const getAddedDays = (title: string): string[] => {
    const norm = title.trim().toLowerCase();
    const matching = existingActivities.filter((a) => a.title.trim().toLowerCase() === norm);
    return matching.map((a) => {
      if (!a.date) return "Sem data";
      const idx = days.indexOf(a.date);
      return idx >= 0 ? `Dia ${idx + 1}` : a.date;
    });
  };

  async function handleAddSingle(s: ItinerarySuggestion) {
    const chosenDay = itemDays[s.id] || days[s.suggestedDayOffset] || days[0] || "none";
    setAddingId(s.id);
    try {
      await onAddActivity({
        title: s.title,
        date: chosenDay === "none" ? null : chosenDay,
        time: s.time ? `${s.time}:00` : null,
        location: s.location || null,
        estimated_cost: s.estimated_cost || 0,
        notes: s.notes || null,
      });

      const dayLabel = dayOptions.find((d) => d.value === chosenDay)?.shortLabel || chosenDay;
      toast.success(`"${s.title}" adicionado ao ${dayLabel}!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao adicionar";
      toast.error(`Não foi possível adicionar: ${msg}`);
    } finally {
      setAddingId(null);
    }
  }

  async function handleAddBulk() {
    if (selectedIds.size === 0) return;
    setBulkAdding(true);
    try {
      const toAdd = suggestions.filter((s) => selectedIds.has(s.id));
      for (const s of toAdd) {
        await onAddActivity({
          title: s.title,
          date: bulkDay === "none" ? null : bulkDay,
          time: s.time ? `${s.time}:00` : null,
          location: s.location || null,
          estimated_cost: s.estimated_cost || 0,
          notes: s.notes || null,
        });
      }

      const dayLabel = dayOptions.find((d) => d.value === bulkDay)?.shortLabel || bulkDay;
      toast.success(`${toAdd.length} atividades adicionadas ao ${dayLabel}!`);
      setSelectedIds(new Set());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao adicionar";
      toast.error(`Erro ao adicionar em lote: ${msg}`);
    } finally {
      setBulkAdding(false);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllFiltered() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((f) => f.id)));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-3xl overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Compass className="size-4" />
            </div>
            <DialogTitle className="font-display text-xl sm:text-2xl font-bold">
              Sugestões de Roteiro
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Explore atividades recomendadas para <strong>{destName}</strong> e escolha em qual dia da viagem adicionar.
          </DialogDescription>
        </DialogHeader>

        {/* Barra de Pesquisa e Filtros */}
        <div className="space-y-3 pt-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por atração, parque, restaurante, museu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-xl text-xs sm:text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
              )}
            >
              Todas ({suggestions.length})
            </button>
            {(Object.keys(SUGGESTION_CATEGORY_LABELS) as SuggestionCategory[]).map((cat) => {
              const count = suggestions.filter((s) => s.category === cat).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
                  )}
                >
                  {SUGGESTION_CATEGORY_LABELS[cat]} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Barra de Seleção em Lote (Quando itens marcados) */}
        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-3 text-xs shadow-xs animate-in fade-in-50">
            <div className="flex items-center gap-2">
              <Badge variant="default" className="rounded-full px-2.5 py-0.5 text-xs font-semibold">
                {selectedIds.size} selecionada{selectedIds.size > 1 ? "s" : ""}
              </Badge>
              <button
                type="button"
                onClick={selectAllFiltered}
                className="text-primary hover:underline font-medium"
              >
                {selectedIds.size === filtered.length ? "Desmarcar todas" : "Selecionar todas exibidas"}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-muted-foreground font-medium">Adicionar ao:</span>
              <Select value={bulkDay} onValueChange={setBulkDay}>
                <SelectTrigger className="h-8 w-44 rounded-lg text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="text-xs">
                  {dayOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                size="sm"
                className="h-8 rounded-lg text-xs font-semibold gap-1"
                onClick={handleAddBulk}
                disabled={bulkAdding}
              >
                <Plus className="size-3.5" />
                {bulkAdding ? "Adicionando…" : "Adicionar selecionadas"}
              </Button>
            </div>
          </div>
        )}

        {/* Lista de Sugestões de Roteiro */}
        <div className="space-y-3 pt-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground italic">
              Nenhuma atividade encontrada com os filtros atuais.
            </div>
          ) : (
            filtered.map((item) => {
              const currentChosenDay = itemDays[item.id] || days[item.suggestedDayOffset] || days[0] || "none";
              const addedDays = getAddedDays(item.title);
              const isAddedToChosenDay = isAlreadyAdded(item.title, currentChosenDay);
              const isSelected = selectedIds.has(item.id);

              return (
                <div
                  key={item.id}
                  className={cn(
                    "group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 rounded-2xl border p-4 transition-all",
                    isSelected
                      ? "border-primary/50 bg-primary/5 shadow-xs"
                      : "border-border/70 bg-card hover:border-primary/30 hover:shadow-soft"
                  )}
                >
                  {/* Conteúdo da Atividade */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="pt-0.5">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(item.id)}
                        aria-label={`Selecionar ${item.title}`}
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-sm sm:text-base text-foreground leading-snug">
                          {item.title}
                        </span>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-[10px] font-medium px-2 py-0.2 rounded-full",
                            item.category === "imperdivel" && "bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold",
                            item.category === "gastronomia" && "bg-rose-500/15 text-rose-700 dark:text-rose-400",
                            item.category === "natureza" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
                            item.category === "cultura" && "bg-blue-500/15 text-blue-700 dark:text-blue-400",
                            item.category === "criancas" && "bg-purple-500/15 text-purple-700 dark:text-purple-400"
                          )}
                        >
                          {item.categoryLabel}
                        </Badge>
                        {addedDays.length > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.2 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                            <Check className="size-3" />
                            No roteiro ({addedDays.join(", ")})
                          </span>
                        )}
                      </div>

                      {item.notes && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {item.notes}
                        </p>
                      )}

                      {/* Metadados: Local, Horário sugerido, Custo */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-xs text-muted-foreground">
                        {item.location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3 text-primary shrink-0" />
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.location)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:underline hover:text-foreground line-clamp-1"
                            >
                              {item.location}
                            </a>
                          </span>
                        )}
                        {item.time && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3 shrink-0" />
                            {item.time}
                          </span>
                        )}
                        {Number(item.estimated_cost) > 0 && (
                          <span className="inline-flex items-center gap-1 font-medium text-foreground">
                            {brl(item.estimated_cost)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Seletor do Dia e Botão de Adicionar */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                    <div className="flex-1 sm:w-44">
                      <Select
                        value={currentChosenDay}
                        onValueChange={(val) =>
                          setItemDays((prev) => ({ ...prev, [item.id]: val }))
                        }
                      >
                        <SelectTrigger className="h-8 rounded-lg text-xs bg-background">
                          <Calendar className="mr-1 size-3 text-muted-foreground shrink-0" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="text-xs">
                          {dayOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-xs">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant={isAddedToChosenDay ? "secondary" : "default"}
                      className="h-8 rounded-lg text-xs font-semibold px-3 gap-1 shrink-0"
                      onClick={() => handleAddSingle(item)}
                      disabled={addingId === item.id}
                      title={`Adicionar "${item.title}" ao dia selecionado`}
                    >
                      {addingId === item.id ? (
                        "Adicionando…"
                      ) : isAddedToChosenDay ? (
                        <>
                          <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Adicionado</span>
                        </>
                      ) : (
                        <>
                          <Plus className="size-3.5" />
                          <span>Adicionar</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

