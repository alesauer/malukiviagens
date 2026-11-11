-- Criação do Bucket de documentos e capas de viagens
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documents', 'documents', false, 26214400, null)
ON CONFLICT (id) DO UPDATE SET public = false;

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "family docs read" ON storage.objects;
CREATE POLICY "family docs read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND public.is_family_member(((storage.foldername(name))[1])::uuid));

DROP POLICY IF EXISTS "family docs insert" ON storage.objects;
CREATE POLICY "family docs insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND public.is_family_member(((storage.foldername(name))[1])::uuid));

DROP POLICY IF EXISTS "family docs update" ON storage.objects;
CREATE POLICY "family docs update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'documents' AND public.is_family_member(((storage.foldername(name))[1])::uuid));

DROP POLICY IF EXISTS "family docs delete" ON storage.objects;
CREATE POLICY "family docs delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND public.is_family_member(((storage.foldername(name))[1])::uuid));
