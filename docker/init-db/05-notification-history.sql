-- 05-notification-history.sql
-- Histórico e controle de idempotência para envios automáticos de alertas

CREATE TABLE IF NOT EXISTS public.notification_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  event text NOT NULL,
  target_key text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'sent',
  details jsonb DEFAULT '{}'::jsonb,
  UNIQUE (trip_id, event, target_key)
);

ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.notification_history TO authenticated, service_role;

DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notification_history' AND policyname = 'members read notification_history'
  ) THEN 
    CREATE POLICY "members read notification_history" ON public.notification_history 
    FOR SELECT TO authenticated USING (is_family_member(family_id)); 
    
    CREATE POLICY "members insert notification_history" ON public.notification_history 
    FOR INSERT TO authenticated WITH CHECK (is_family_member(family_id)); 
  END IF; 
END $$;

NOTIFY pgrst, 'reload schema';
