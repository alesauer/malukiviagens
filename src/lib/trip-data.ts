import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type T = Database["public"]["Tables"];
export type SubTable = "activities" | "reservations" | "expenses" | "checklist_items" | "emergency_contacts" | "documents";
export type Row<K extends SubTable> = T[K]["Row"];
export type Insert<K extends SubTable> = Omit<T[K]["Insert"], "trip_id" | "family_id">;

// One generic client for all trip sub-tables; the per-table typing comes from the generics above.
const from = (t: SubTable) => supabase.from(t as "activities");

export function useTripRows<K extends SubTable>(table: K, tripId: string) {
  return useQuery({
    queryKey: [table, tripId],
    queryFn: async () => {
      const { data, error } = await from(table).select("*").eq("trip_id", tripId).order("created_at");
      if (error) throw error;
      return data as unknown as Row<K>[];
    },
  });
}

export function useTripMutations<K extends SubTable>(table: K, tripId: string, familyId: string | undefined) {
  const qc = useQueryClient();
  const done = () => qc.invalidateQueries({ queryKey: [table, tripId] });
  const onError = (e: Error) => toast.error(e.message);
  return {
    add: useMutation({
      mutationFn: async (row: Insert<K>) => {
        if (!familyId) throw new Error("Família não carregada");
        const { error } = await from(table).insert({ ...(row as object), trip_id: tripId, family_id: familyId } as never);
        if (error) throw error;
      },
      onSuccess: done,
      onError,
    }),
    update: useMutation({
      mutationFn: async ({ id, ...patch }: { id: string } & Partial<Row<K>>) => {
        const { error } = await from(table).update(patch as never).eq("id", id);
        if (error) throw error;
      },
      onSuccess: done,
      onError,
    }),
    remove: useMutation({
      mutationFn: async (id: string) => {
        const { error } = await from(table).delete().eq("id", id);
        if (error) throw error;
      },
      onSuccess: done,
      onError,
    }),
  };
}
