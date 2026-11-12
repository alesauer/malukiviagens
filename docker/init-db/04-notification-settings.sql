-- 04-notification-settings.sql
-- Adiciona notification_settings em public.families para permitir personalização de alertas

ALTER TABLE public.families 
ADD COLUMN IF NOT EXISTS notification_settings jsonb DEFAULT '{}'::jsonb;

-- Recarrega o cache do PostgREST
NOTIFY pgrst, 'reload schema';
