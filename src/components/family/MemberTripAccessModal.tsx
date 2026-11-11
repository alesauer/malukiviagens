import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ShieldCheck,
  Plane,
  CheckCircle2,
  Calendar,
  MapPin,
  Search,
  Check,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

export interface MemberAccessData {
  userId: string;
  name: string;
  role: string;
  allTripsAccess: boolean;
  allowedTripIds: string[];
}

interface MemberTripAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: MemberAccessData | null;
  familyId: string;
  onSuccess?: () => void;
}

export function MemberTripAccessModal({
  open,
  onOpenChange,
  member,
  familyId,
  onSuccess,
}: MemberTripAccessModalProps) {
  const qc = useQueryClient();
  const [allTrips, setAllTrips] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);

  // Busca todas as viagens da família para listagem no modal
  const { data: trips = [], isLoading: tripsLoading } = useQuery({
    queryKey: ["family_trips_for_access", familyId],
    enabled: open && !!familyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("id, title, main_destination, start_date, end_date, category")
        .eq("family_id", familyId)
        .order("start_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Inicializa o formulário com os dados do membro selecionado
  useEffect(() => {
    if (member) {
      setAllTrips(member.allTripsAccess);
      setSelectedIds(new Set(member.allowedTripIds || []));
      setSearchTerm("");
    }
  }, [member, open]);

  function handleToggleTrip(tripId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(tripId)) {
        next.delete(tripId);
      } else {
        next.add(tripId);
      }
      return next;
    });
  }

  function handleSelectAllFiltered() {
    const next = new Set(selectedIds);
    for (const t of filteredTrips) {
      next.add(t.id);
    }
    setSelectedIds(next);
  }

  function handleDeselectAllFiltered() {
    const next = new Set(selectedIds);
    for (const t of filteredTrips) {
      next.delete(t.id);
    }
    setSelectedIds(next);
  }

  async function handleSave() {
    if (!member || !familyId) return;
    setSaving(true);

    try {
      const allowed = allTrips ? [] : Array.from(selectedIds);

      const { error } = await supabase
        .from("family_members")
        .update({
          all_trips_access: allTrips,
          allowed_trip_ids: allowed,
        })
        .eq("family_id", familyId)
        .eq("user_id", member.userId);

      if (error) {
        toast.error(`Erro ao salvar permissões: ${error.message}`);
        return;
      }

      await qc.invalidateQueries({ queryKey: ["members"] });
      await qc.invalidateQueries({ queryKey: ["trips"] });

      toast.success(
        allTrips
          ? `Acesso a todas as viagens concedido para ${member.name}!`
          : `Acesso a ${allowed.length} viagem(ns) atualizado para ${member.name}!`
      );

      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      toast.error(`Falha ao salvar: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  const filteredTrips = trips.filter((t) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.title.toLowerCase().includes(term) ||
      (t.main_destination && t.main_destination.toLowerCase().includes(term))
    );
  });

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.5rem)] sm:max-w-xl max-h-[88dvh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <ShieldCheck className="size-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg sm:text-xl font-display font-bold truncate">
                Permissões — {member.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Escolha se este membro pode acessar todas as viagens ou viagens específicas.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          {/* Opção Destacada: Todas as Viagens */}
          <div
            className={`rounded-2xl border p-4 transition-all ${
              allTrips
                ? "border-emerald-500/40 bg-emerald-50/50 dark:border-emerald-800/60 dark:bg-emerald-950/20"
                : "border-border/70 bg-card/60"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="all-trips-switch" className="text-sm font-semibold cursor-pointer text-foreground">
                    Acesso a todas as viagens da família
                  </Label>
                  {allTrips && (
                    <Badge variant="outline" className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-300">
                      Acesso Total
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Quando ativado, o membro pode ver, participar e planejar todas as viagens cadastradas e futuras da família.
                </p>
              </div>

              <Switch
                id="all-trips-switch"
                checked={allTrips}
                onCheckedChange={setAllTrips}
              />
            </div>
          </div>

          {/* Seleção de Viagens Específicas */}
          {!allTrips && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">
                    Selecione as viagens permitidas
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {selectedIds.size} de {trips.length} {trips.length === 1 ? "viagem selecionada" : "viagens selecionadas"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs rounded-lg"
                    onClick={handleSelectAllFiltered}
                  >
                    <Check className="size-3 mr-1 text-emerald-600" />
                    Marcar todas
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs rounded-lg text-muted-foreground"
                    onClick={handleDeselectAllFiltered}
                  >
                    <X className="size-3 mr-1 text-red-500" />
                    Desmarcar
                  </Button>
                </div>
              </div>

              {/* Busca de Viagens */}
              {trips.length > 4 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Filtrar por nome ou destino..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-9 pl-9 text-xs rounded-xl"
                  />
                </div>
              )}

              {/* Lista de Viagens com Checkboxes */}
              {tripsLoading ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <Loader2 className="size-5 animate-spin mx-auto mb-2 text-primary" />
                  Carregando viagens da família...
                </div>
              ) : filteredTrips.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground border rounded-xl bg-muted/20">
                  {trips.length === 0
                    ? "Nenhuma viagem cadastrada na família ainda."
                    : "Nenhuma viagem encontrada com o termo pesquisado."}
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1 divide-y divide-border/40">
                  {filteredTrips.map((trip) => {
                    const isSelected = selectedIds.has(trip.id);
                    return (
                      <div
                        key={trip.id}
                        onClick={() => handleToggleTrip(trip.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary/40 bg-primary/5 shadow-xs"
                            : "border-border/60 hover:bg-muted/40"
                        }`}
                      >
                        <Checkbox
                          id={`trip-${trip.id}`}
                          checked={isSelected}
                          onCheckedChange={() => handleToggleTrip(trip.id)}
                          onClick={(e) => e.stopPropagation()}
                        />

                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-xs sm:text-sm text-foreground truncate">
                            {trip.title}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5 flex-wrap">
                            {trip.main_destination && (
                              <span className="flex items-center gap-1">
                                <MapPin className="size-3 text-primary shrink-0" />
                                <span className="truncate max-w-[160px]">{trip.main_destination}</span>
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="size-3 shrink-0" />
                              <span>
                                {trip.start_date.split("-").reverse().join("/")} a{" "}
                                {trip.end_date.split("-").reverse().join("/")}
                              </span>
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20 shrink-0">
                            Permitida
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedIds.size === 0 && trips.length > 0 && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300 text-xs">
                  <AlertTriangle className="size-4 shrink-0 text-amber-600" />
                  <span>Nenhuma viagem selecionada: este membro não verá viagens na listagem.</span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="p-3 sm:p-4 border-t border-border/60 bg-muted/20 flex flex-row items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-full px-6 font-semibold"
          >
            {saving ? (
              <>
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
                Salvando...
              </>
            ) : (
              "Salvar permissões"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

