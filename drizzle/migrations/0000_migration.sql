
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create table public.families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique default upper(substr(md5(random()::text),1,8)),
  created_by uuid not null,
  created_at timestamptz not null default now()
);
grant select, update on public.families to authenticated;
grant all on public.families to service_role;
alter table public.families enable row level security;

create table public.family_members (
  family_id uuid not null references public.families(id) on delete cascade,
  user_id uuid not null,
  role text not null default 'member' check (role in ('admin','member')),
  joined_at timestamptz not null default now(),
  primary key (family_id, user_id)
);
grant select, delete on public.family_members to authenticated;
grant all on public.family_members to service_role;
alter table public.family_members enable row level security;

create or replace function public.is_family_member(_family uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.family_members where family_id = _family and user_id = auth.uid())
$$;
create or replace function public.is_family_admin(_family uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.family_members where family_id = _family and user_id = auth.uid() and role='admin')
$$;
create or replace function public.shares_family(_other uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.family_members a join public.family_members b on a.family_id=b.family_id where a.user_id=auth.uid() and b.user_id=_other)
$$;

create policy "profile read" on public.profiles for select to authenticated using (id = auth.uid() or public.shares_family(id));
create policy "own profile update" on public.profiles for update to authenticated using (id = auth.uid());
create policy "own profile insert" on public.profiles for insert to authenticated with check (id = auth.uid());

create policy "members read family" on public.families for select to authenticated using (public.is_family_member(id));
create policy "admins update family" on public.families for update to authenticated using (public.is_family_admin(id));

create policy "members read members" on public.family_members for select to authenticated using (public.is_family_member(family_id));
create policy "leave or admin remove" on public.family_members for delete to authenticated using (user_id = auth.uid() or public.is_family_admin(family_id));

create or replace function public.join_family(_code text)
returns uuid language plpgsql security definer set search_path = public as $$
declare fid uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select id into fid from public.families where invite_code = upper(trim(_code));
  if fid is null then raise exception 'Código de convite inválido'; end if;
  insert into public.family_members(family_id,user_id,role) values (fid, auth.uid(), 'member') on conflict do nothing;
  return fid;
end $$;
revoke execute on function public.join_family(text) from anon, public;
grant execute on function public.join_family(text) to authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare fid uuid; nm text;
begin
  nm := coalesce(nullif(new.raw_user_meta_data->>'full_name',''), nullif(new.raw_user_meta_data->>'name',''), split_part(new.email,'@',1));
  insert into public.profiles(id, full_name) values (new.id, nm);
  insert into public.families(name, created_by) values ('Família de ' || split_part(nm,' ',1), new.id) returning id into fid;
  insert into public.family_members(family_id,user_id,role) values (fid,new.id,'admin');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create table public.trips (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  created_by uuid,
  title text not null,
  category text not null default 'ferias',
  status text not null default 'planejamento',
  start_date date not null,
  end_date date not null,
  main_destination text,
  description text,
  budget numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  title text not null,
  date date,
  time time,
  location text,
  estimated_cost numeric(12,2) not null default 0,
  notes text,
  done boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  kind text not null default 'hospedagem',
  title text not null,
  provider text,
  starts_at timestamptz,
  ends_at timestamptz,
  confirmation_code text,
  cost numeric(12,2) not null default 0,
  paid boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  description text not null,
  category text not null default 'outros',
  amount numeric(12,2) not null default 0,
  paid boolean not null default true,
  paid_by text,
  spent_on date not null default current_date,
  created_at timestamptz not null default now()
);
create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  kind text not null default 'preparo' check (kind in ('preparo','bagagem')),
  title text not null,
  owner_name text,
  done boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  family_id uuid not null references public.families(id) on delete cascade,
  name text not null,
  phone text not null,
  notes text,
  created_at timestamptz not null default now()
);
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete set null,
  title text not null,
  kind text not null default 'outro',
  file_path text not null,
  file_name text not null,
  uploaded_by uuid,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.trips, public.activities, public.reservations, public.expenses, public.checklist_items, public.emergency_contacts, public.documents to authenticated;
grant all on public.trips, public.activities, public.reservations, public.expenses, public.checklist_items, public.emergency_contacts, public.documents to service_role;

alter table public.trips enable row level security;
alter table public.activities enable row level security;
alter table public.reservations enable row level security;
alter table public.expenses enable row level security;
alter table public.checklist_items enable row level security;
alter table public.emergency_contacts enable row level security;
alter table public.documents enable row level security;

create policy "family all" on public.trips for all to authenticated using (public.is_family_member(family_id)) with check (public.is_family_member(family_id));
create policy "family all" on public.activities for all to authenticated using (public.is_family_member(family_id)) with check (public.is_family_member(family_id));
create policy "family all" on public.reservations for all to authenticated using (public.is_family_member(family_id)) with check (public.is_family_member(family_id));
create policy "family all" on public.expenses for all to authenticated using (public.is_family_member(family_id)) with check (public.is_family_member(family_id));
create policy "family all" on public.checklist_items for all to authenticated using (public.is_family_member(family_id)) with check (public.is_family_member(family_id));
create policy "family all" on public.emergency_contacts for all to authenticated using (public.is_family_member(family_id)) with check (public.is_family_member(family_id));
create policy "family all" on public.documents for all to authenticated using (public.is_family_member(family_id)) with check (public.is_family_member(family_id));

create policy "family docs read" on storage.objects for select to authenticated
  using (bucket_id='documents' and public.is_family_member(((storage.foldername(name))[1])::uuid));
create policy "family docs insert" on storage.objects for insert to authenticated
  with check (bucket_id='documents' and public.is_family_member(((storage.foldername(name))[1])::uuid));
create policy "family docs delete" on storage.objects for delete to authenticated
  using (bucket_id='documents' and public.is_family_member(((storage.foldername(name))[1])::uuid));
