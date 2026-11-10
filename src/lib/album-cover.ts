import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Signed URL of the uploaded trip cover photo (private documents bucket). */
export function useTripCover(path: string | null | undefined) {
  return useQuery({
    queryKey: ["trip-cover", path],
    enabled: !!path,
    staleTime: 1000 * 60 * 50,
    queryFn: async () => {
      const { data, error } = await supabase.storage.from("documents").createSignedUrl(path!, 60 * 60);
      if (error) throw error;
      return data.signedUrl;
    },
  }).data ?? null;
}
