-- 03-profile-contact-fields.sql
-- Adiciona email e phone (WhatsApp) na tabela public.profiles

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone text;

-- 1. Popula os emails existentes a partir de auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');

-- 2. Atualiza o trigger on_auth_user_created para salvar email e phone no cadastro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path to 'public'
AS $function$
DECLARE
  fid uuid;
  nm text;
  invite text;
  user_phone text;
BEGIN
  nm := coalesce(nullif(new.raw_user_meta_data->>'full_name',''), nullif(new.raw_user_meta_data->>'name',''), split_part(new.email,'@',1));
  invite := nullif(upper(trim(new.raw_user_meta_data->>'family_invite_code')), '');
  user_phone := coalesce(nullif(new.raw_user_meta_data->>'phone',''), nullif(new.raw_user_meta_data->>'whatsapp',''), nullif(new.phone,''));

  IF invite IS NOT NULL THEN
    SELECT id INTO fid FROM public.families WHERE invite_code = invite;
    IF fid IS NULL THEN RAISE EXCEPTION 'Código de convite inválido'; END IF;
  END IF;

  INSERT INTO public.profiles(id, full_name, email, phone)
  VALUES (new.id, nm, new.email, user_phone)
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    full_name = CASE WHEN profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END;

  IF invite IS NULL THEN
    INSERT INTO public.families(name, created_by) 
    VALUES ('Família de ' || split_part(nm,' ',1), new.id) 
    RETURNING id INTO fid;
  END IF;

  INSERT INTO public.family_members(family_id, user_id, role) 
  VALUES (fid, new.id, CASE WHEN invite IS NULL THEN 'admin' ELSE 'member' end)
  ON CONFLICT (family_id, user_id) DO NOTHING;

  RETURN new;
END $function$;

-- 3. Permite que o admin da família também atualize os contatos de membros da sua família
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'family admin profile update'
  ) THEN
    CREATE POLICY "family admin profile update" ON public.profiles 
    FOR UPDATE TO authenticated 
    USING (
      id = auth.uid() 
      OR EXISTS (
        SELECT 1 
        FROM public.family_members me
        JOIN public.family_members them ON me.family_id = them.family_id
        WHERE me.user_id = auth.uid() 
          AND me.role = 'admin' 
          AND them.user_id = profiles.id
      )
    )
    WITH CHECK (
      id = auth.uid() 
      OR EXISTS (
        SELECT 1 
        FROM public.family_members me
        JOIN public.family_members them ON me.family_id = them.family_id
        WHERE me.user_id = auth.uid() 
          AND me.role = 'admin' 
          AND them.user_id = profiles.id
      )
    );
  END IF;
END
$$;
