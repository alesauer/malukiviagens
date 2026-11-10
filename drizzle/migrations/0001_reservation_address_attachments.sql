ALTER TABLE public.reservations ADD COLUMN address text, ADD COLUMN maps_url text;
ALTER TABLE public.documents ADD COLUMN reservation_id uuid REFERENCES public.reservations(id) ON DELETE CASCADE;
CREATE INDEX documents_reservation_id_idx ON public.documents(reservation_id);