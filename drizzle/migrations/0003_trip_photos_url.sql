ALTER TABLE public.trips ADD COLUMN photos_url text;
UPDATE public.trips SET photos_url = substring(description from 'Fotos: (https?://\S+)') WHERE description ~ 'Fotos: https?://';