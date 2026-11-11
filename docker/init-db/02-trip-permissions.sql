ALTER TABLE family_members 
ADD COLUMN IF NOT EXISTS all_trips_access boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS allowed_trip_ids uuid[] DEFAULT ARRAY[]::uuid[];

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'family_members' AND policyname = 'admin update members'
  ) THEN
    CREATE POLICY "admin update members" ON family_members 
    FOR UPDATE TO authenticated 
    USING (is_family_admin(family_id)) 
    WITH CHECK (is_family_admin(family_id));
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.can_access_trip(_trip_id uuid, _family_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.family_members
    WHERE family_id = _family_id
      AND user_id = auth.uid()
      AND (
        role = 'admin'
        OR all_trips_access IS NOT FALSE
        OR _trip_id = ANY(COALESCE(allowed_trip_ids, ARRAY[]::uuid[]))
      )
  );
$$;

DROP POLICY IF EXISTS "family all" ON trips;
CREATE POLICY "family all" ON trips FOR ALL TO authenticated
  USING (can_access_trip(id, family_id))
  WITH CHECK (is_family_member(family_id));
