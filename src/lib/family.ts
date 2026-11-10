import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Family = { id: string; name: string; invite_code: string; role: string; userId: string; userName: string };

/** The signed-in user's current family (first one joined, or the most recent if they joined another). */
export function useFamily() {
  return useQuery({
    queryKey: ["family"],
    queryFn: async (): Promise<Family> => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Sem sessão");
      const { data: rows, error } = await supabase
        .from("family_members")
        .select("role, joined_at, families(id, name, invite_code)")
        .eq("user_id", u.user.id)
        .order("joined_at", { ascending: false });
      if (error) throw error;
      const row = rows?.[0];
      if (!row?.families) throw new Error("Família não encontrada");
      const { data: p } = await supabase.from("profiles").select("full_name").eq("id", u.user.id).maybeSingle();
      return { ...row.families, role: row.role, userId: u.user.id, userName: p?.full_name || u.user.email || "" };
    },
  });
}
