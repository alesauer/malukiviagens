CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare fid uuid; nm text; invite text;
begin
  nm := coalesce(nullif(new.raw_user_meta_data->>'full_name',''), nullif(new.raw_user_meta_data->>'name',''), split_part(new.email,'@',1));
  invite := nullif(upper(trim(new.raw_user_meta_data->>'family_invite_code')), '');
  if invite is not null then
    select id into fid from public.families where invite_code = invite;
    if fid is null then raise exception 'Código de convite inválido'; end if;
  end if;
  insert into public.profiles(id, full_name) values (new.id, nm);
  if invite is null then
    insert into public.families(name, created_by) values ('Família de ' || split_part(nm,' ',1), new.id) returning id into fid;
  end if;
  insert into public.family_members(family_id,user_id,role) values (fid,new.id,case when invite is null then 'admin' else 'member' end);
  return new;
end $function$;