import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

let serviceClient: ReturnType<typeof createClient<Database>> | null = null;

/**
 * Cria ou retorna o cliente Supabase com service_role para execuções automáticas em background no servidor
 */
export function getServiceSupabase() {
  if (serviceClient) return serviceClient;

  const url = process.env["SUPABASE_URL"] || "http://kong:8000";
  const key =
    process.env["SUPABASE_SERVICE_ROLE_KEY"] ||
    process.env["SUPABASE_PUBLISHABLE_KEY"] ||
    "";

  serviceClient = createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serviceClient;
}
