import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Family = {
  id: string;
  name: string;
  invite_code: string;
  role: string;
  userId: string;
  userName: string;
  deepseek_api_key?: string | null;
  openai_api_key?: string | null;
  ai_provider?: string | null;
  webhook_url?: string | null;
  webhook_enabled?: boolean | null;
  webhook_secret?: string | null;
  webhook_events?: string[] | null;
};

/** The signed-in user's current family (first one joined, or the most recent if they joined another). */
export function useFamily() {
  return useQuery({
    queryKey: ["family"],
    queryFn: async (): Promise<Family> => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Sem sessão");
      const { data: rows, error } = await supabase
        .from("family_members")
        .select("role, joined_at, families(id, name, invite_code, deepseek_api_key, openai_api_key, ai_provider, webhook_url, webhook_enabled, webhook_secret, webhook_events)")
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
