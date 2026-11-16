--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP POLICY IF EXISTS "family docs update" ON storage.objects;
DROP POLICY IF EXISTS "family docs read" ON storage.objects;
DROP POLICY IF EXISTS "family docs insert" ON storage.objects;
DROP POLICY IF EXISTS "family docs delete" ON storage.objects;
DROP POLICY IF EXISTS "profile read" ON public.profiles;
DROP POLICY IF EXISTS "own profile update" ON public.profiles;
DROP POLICY IF EXISTS "own profile insert" ON public.profiles;
DROP POLICY IF EXISTS "members update family" ON public.families;
DROP POLICY IF EXISTS "members read notification_history" ON public.notification_history;
DROP POLICY IF EXISTS "members read members" ON public.family_members;
DROP POLICY IF EXISTS "members read family" ON public.families;
DROP POLICY IF EXISTS "members insert notification_history" ON public.notification_history;
DROP POLICY IF EXISTS "leave or admin remove" ON public.family_members;
DROP POLICY IF EXISTS "family all" ON public.trips;
DROP POLICY IF EXISTS "family all" ON public.reservations;
DROP POLICY IF EXISTS "family all" ON public.expenses;
DROP POLICY IF EXISTS "family all" ON public.emergency_contacts;
DROP POLICY IF EXISTS "family all" ON public.documents;
DROP POLICY IF EXISTS "family all" ON public.checklist_items;
DROP POLICY IF EXISTS "family all" ON public.activities;
DROP POLICY IF EXISTS "family admin profile update" ON public.profiles;
DROP POLICY IF EXISTS "admin update members" ON public.family_members;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_upload_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_bucket_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads DROP CONSTRAINT IF EXISTS s3_multipart_uploads_bucket_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.objects DROP CONSTRAINT IF EXISTS "objects_bucketId_fkey";
ALTER TABLE IF EXISTS ONLY public.trips DROP CONSTRAINT IF EXISTS trips_family_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reservations DROP CONSTRAINT IF EXISTS reservations_trip_id_fkey;
ALTER TABLE IF EXISTS ONLY public.reservations DROP CONSTRAINT IF EXISTS reservations_family_id_fkey;
ALTER TABLE IF EXISTS ONLY public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notification_history DROP CONSTRAINT IF EXISTS notification_history_trip_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notification_history DROP CONSTRAINT IF EXISTS notification_history_family_id_fkey;
ALTER TABLE IF EXISTS ONLY public.family_members DROP CONSTRAINT IF EXISTS family_members_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.family_members DROP CONSTRAINT IF EXISTS family_members_family_id_fkey;
ALTER TABLE IF EXISTS ONLY public.expenses DROP CONSTRAINT IF EXISTS expenses_trip_id_fkey;
ALTER TABLE IF EXISTS ONLY public.expenses DROP CONSTRAINT IF EXISTS expenses_family_id_fkey;
ALTER TABLE IF EXISTS ONLY public.emergency_contacts DROP CONSTRAINT IF EXISTS emergency_contacts_trip_id_fkey;
ALTER TABLE IF EXISTS ONLY public.emergency_contacts DROP CONSTRAINT IF EXISTS emergency_contacts_family_id_fkey;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_trip_id_fkey;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_reservation_id_fkey;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_family_id_fkey;
ALTER TABLE IF EXISTS ONLY public.checklist_items DROP CONSTRAINT IF EXISTS checklist_items_trip_id_fkey;
ALTER TABLE IF EXISTS ONLY public.checklist_items DROP CONSTRAINT IF EXISTS checklist_items_family_id_fkey;
ALTER TABLE IF EXISTS ONLY public.activities DROP CONSTRAINT IF EXISTS activities_trip_id_fkey;
ALTER TABLE IF EXISTS ONLY public.activities DROP CONSTRAINT IF EXISTS activities_family_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sso_domains DROP CONSTRAINT IF EXISTS sso_domains_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_flow_state_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_session_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.one_time_tokens DROP CONSTRAINT IF EXISTS one_time_tokens_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_challenges DROP CONSTRAINT IF EXISTS mfa_challenges_auth_factor_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS mfa_amr_claims_session_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_user_id_fkey;
DROP TRIGGER IF EXISTS update_objects_updated_at ON storage.objects;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP INDEX IF EXISTS storage.name_prefix_search;
DROP INDEX IF EXISTS storage.idx_objects_bucket_id_name;
DROP INDEX IF EXISTS storage.idx_multipart_uploads_list;
DROP INDEX IF EXISTS storage.bucketid_objname;
DROP INDEX IF EXISTS storage.bname;
DROP INDEX IF EXISTS public.documents_reservation_id_idx;
DROP INDEX IF EXISTS auth.users_is_anonymous_idx;
DROP INDEX IF EXISTS auth.users_instance_id_idx;
DROP INDEX IF EXISTS auth.users_instance_id_email_idx;
DROP INDEX IF EXISTS auth.users_email_partial_key;
DROP INDEX IF EXISTS auth.user_id_created_at_idx;
DROP INDEX IF EXISTS auth.unique_phone_factor_per_user;
DROP INDEX IF EXISTS auth.sso_providers_resource_id_idx;
DROP INDEX IF EXISTS auth.sso_domains_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.sso_domains_domain_idx;
DROP INDEX IF EXISTS auth.sessions_user_id_idx;
DROP INDEX IF EXISTS auth.sessions_not_after_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_for_email_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_created_at_idx;
DROP INDEX IF EXISTS auth.saml_providers_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_updated_at_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_session_id_revoked_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_parent_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_instance_id_user_id_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_instance_id_idx;
DROP INDEX IF EXISTS auth.recovery_token_idx;
DROP INDEX IF EXISTS auth.reauthentication_token_idx;
DROP INDEX IF EXISTS auth.one_time_tokens_user_id_token_type_key;
DROP INDEX IF EXISTS auth.one_time_tokens_token_hash_hash_idx;
DROP INDEX IF EXISTS auth.one_time_tokens_relates_to_hash_idx;
DROP INDEX IF EXISTS auth.mfa_factors_user_id_idx;
DROP INDEX IF EXISTS auth.mfa_factors_user_friendly_name_unique;
DROP INDEX IF EXISTS auth.mfa_challenge_created_at_idx;
DROP INDEX IF EXISTS auth.idx_user_id_auth_method;
DROP INDEX IF EXISTS auth.idx_auth_code;
DROP INDEX IF EXISTS auth.identities_user_id_idx;
DROP INDEX IF EXISTS auth.identities_email_idx;
DROP INDEX IF EXISTS auth.flow_state_created_at_idx;
DROP INDEX IF EXISTS auth.factor_id_created_at_idx;
DROP INDEX IF EXISTS auth.email_change_token_new_idx;
DROP INDEX IF EXISTS auth.email_change_token_current_idx;
DROP INDEX IF EXISTS auth.confirmation_token_idx;
DROP INDEX IF EXISTS auth.audit_logs_instance_id_idx;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads DROP CONSTRAINT IF EXISTS s3_multipart_uploads_pkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_pkey;
ALTER TABLE IF EXISTS ONLY storage.objects DROP CONSTRAINT IF EXISTS objects_pkey;
ALTER TABLE IF EXISTS ONLY storage.migrations DROP CONSTRAINT IF EXISTS migrations_pkey;
ALTER TABLE IF EXISTS ONLY storage.migrations DROP CONSTRAINT IF EXISTS migrations_name_key;
ALTER TABLE IF EXISTS ONLY storage.buckets DROP CONSTRAINT IF EXISTS buckets_pkey;
ALTER TABLE IF EXISTS ONLY public.trips DROP CONSTRAINT IF EXISTS trips_pkey;
ALTER TABLE IF EXISTS ONLY public.reservations DROP CONSTRAINT IF EXISTS reservations_pkey;
ALTER TABLE IF EXISTS ONLY public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.notification_history DROP CONSTRAINT IF EXISTS notification_history_trip_id_event_target_key_key;
ALTER TABLE IF EXISTS ONLY public.notification_history DROP CONSTRAINT IF EXISTS notification_history_pkey;
ALTER TABLE IF EXISTS ONLY public.family_members DROP CONSTRAINT IF EXISTS family_members_pkey;
ALTER TABLE IF EXISTS ONLY public.families DROP CONSTRAINT IF EXISTS families_pkey;
ALTER TABLE IF EXISTS ONLY public.families DROP CONSTRAINT IF EXISTS families_invite_code_key;
ALTER TABLE IF EXISTS ONLY public.expenses DROP CONSTRAINT IF EXISTS expenses_pkey;
ALTER TABLE IF EXISTS ONLY public.emergency_contacts DROP CONSTRAINT IF EXISTS emergency_contacts_pkey;
ALTER TABLE IF EXISTS ONLY public.documents DROP CONSTRAINT IF EXISTS documents_pkey;
ALTER TABLE IF EXISTS ONLY public.checklist_items DROP CONSTRAINT IF EXISTS checklist_items_pkey;
ALTER TABLE IF EXISTS ONLY public.activities DROP CONSTRAINT IF EXISTS activities_pkey;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_phone_key;
ALTER TABLE IF EXISTS ONLY auth.sso_providers DROP CONSTRAINT IF EXISTS sso_providers_pkey;
ALTER TABLE IF EXISTS ONLY auth.sso_domains DROP CONSTRAINT IF EXISTS sso_domains_pkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY auth.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_entity_id_key;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_token_unique;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_pkey;
ALTER TABLE IF EXISTS ONLY auth.one_time_tokens DROP CONSTRAINT IF EXISTS one_time_tokens_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_last_challenged_at_key;
ALTER TABLE IF EXISTS ONLY auth.mfa_challenges DROP CONSTRAINT IF EXISTS mfa_challenges_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS mfa_amr_claims_session_id_authentication_method_pkey;
ALTER TABLE IF EXISTS ONLY auth.instances DROP CONSTRAINT IF EXISTS instances_pkey;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_provider_id_provider_unique;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_pkey;
ALTER TABLE IF EXISTS ONLY auth.flow_state DROP CONSTRAINT IF EXISTS flow_state_pkey;
ALTER TABLE IF EXISTS ONLY auth.audit_log_entries DROP CONSTRAINT IF EXISTS audit_log_entries_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS amr_id_pk;
ALTER TABLE IF EXISTS auth.refresh_tokens ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS storage.s3_multipart_uploads_parts;
DROP TABLE IF EXISTS storage.s3_multipart_uploads;
DROP TABLE IF EXISTS storage.objects;
DROP TABLE IF EXISTS storage.migrations;
DROP TABLE IF EXISTS storage.buckets;
DROP TABLE IF EXISTS public.trips;
DROP TABLE IF EXISTS public.reservations;
DROP TABLE IF EXISTS public.profiles;
DROP TABLE IF EXISTS public.notification_history;
DROP TABLE IF EXISTS public.family_members;
DROP TABLE IF EXISTS public.families;
DROP TABLE IF EXISTS public.expenses;
DROP TABLE IF EXISTS public.emergency_contacts;
DROP TABLE IF EXISTS public.documents;
DROP TABLE IF EXISTS public.checklist_items;
DROP TABLE IF EXISTS public.activities;
DROP TABLE IF EXISTS auth.users;
DROP TABLE IF EXISTS auth.sso_providers;
DROP TABLE IF EXISTS auth.sso_domains;
DROP TABLE IF EXISTS auth.sessions;
DROP TABLE IF EXISTS auth.schema_migrations;
DROP TABLE IF EXISTS auth.saml_relay_states;
DROP TABLE IF EXISTS auth.saml_providers;
DROP SEQUENCE IF EXISTS auth.refresh_tokens_id_seq;
DROP TABLE IF EXISTS auth.refresh_tokens;
DROP TABLE IF EXISTS auth.one_time_tokens;
DROP TABLE IF EXISTS auth.mfa_factors;
DROP TABLE IF EXISTS auth.mfa_challenges;
DROP TABLE IF EXISTS auth.mfa_amr_claims;
DROP TABLE IF EXISTS auth.instances;
DROP TABLE IF EXISTS auth.identities;
DROP TABLE IF EXISTS auth.flow_state;
DROP TABLE IF EXISTS auth.audit_log_entries;
DROP FUNCTION IF EXISTS storage.update_updated_at_column();
DROP FUNCTION IF EXISTS storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION IF EXISTS storage.operation();
DROP FUNCTION IF EXISTS storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text);
DROP FUNCTION IF EXISTS storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text);
DROP FUNCTION IF EXISTS storage.get_size_by_bucket();
DROP FUNCTION IF EXISTS storage.foldername(name text);
DROP FUNCTION IF EXISTS storage.filename(name text);
DROP FUNCTION IF EXISTS storage.extension(name text);
DROP FUNCTION IF EXISTS storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb);
DROP FUNCTION IF EXISTS public.shares_family(_other uuid);
DROP FUNCTION IF EXISTS public.join_family(_code text);
DROP FUNCTION IF EXISTS public.is_family_member(_family uuid);
DROP FUNCTION IF EXISTS public.is_family_admin(_family uuid);
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.can_access_trip(_trip_id uuid, _family_id uuid);
DROP FUNCTION IF EXISTS auth.uid();
DROP FUNCTION IF EXISTS auth.role();
DROP FUNCTION IF EXISTS auth.jwt();
DROP FUNCTION IF EXISTS auth.email();
DROP TYPE IF EXISTS public.one_time_token_type;
DROP TYPE IF EXISTS public.factor_type;
DROP TYPE IF EXISTS public.factor_status;
DROP TYPE IF EXISTS public.code_challenge_method;
DROP TYPE IF EXISTS public.aal_level;
DROP TYPE IF EXISTS auth.factor_type;
DROP SCHEMA IF EXISTS storage;
DROP SCHEMA IF EXISTS public;
DROP SCHEMA IF EXISTS auth;
--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_admin;

--
-- Name: aal_level; Type: TYPE; Schema: public; Owner: supabase_admin
--

CREATE TYPE public.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE public.aal_level OWNER TO supabase_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: public; Owner: supabase_admin
--

CREATE TYPE public.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE public.code_challenge_method OWNER TO supabase_admin;

--
-- Name: factor_status; Type: TYPE; Schema: public; Owner: supabase_admin
--

CREATE TYPE public.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE public.factor_status OWNER TO supabase_admin;

--
-- Name: factor_type; Type: TYPE; Schema: public; Owner: supabase_admin
--

CREATE TYPE public.factor_type AS ENUM (
    'totp',
    'webauthn'
);


ALTER TYPE public.factor_type OWNER TO supabase_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: public; Owner: supabase_admin
--

CREATE TYPE public.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE public.one_time_token_type OWNER TO supabase_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: can_access_trip(uuid, uuid); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION public.can_access_trip(_trip_id uuid, _family_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
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


ALTER FUNCTION public.can_access_trip(_trip_id uuid, _family_id uuid) OWNER TO supabase_admin;

--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
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
    IF fid IS NULL THEN RAISE EXCEPTION 'CÃ³digo de convite invÃ¡lido'; END IF;
  END IF;

  INSERT INTO public.profiles(id, full_name, email, phone)
  VALUES (new.id, nm, new.email, user_phone)
  ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    full_name = CASE WHEN profiles.full_name = '' THEN EXCLUDED.full_name ELSE profiles.full_name END;

  IF invite IS NULL THEN
    INSERT INTO public.families(name, created_by) 
    VALUES ('FamÃ­lia de ' || split_part(nm,' ',1), new.id) 
    RETURNING id INTO fid;
  END IF;

  INSERT INTO public.family_members(family_id, user_id, role) 
  VALUES (fid, new.id, CASE WHEN invite IS NULL THEN 'admin' ELSE 'member' end)
  ON CONFLICT (family_id, user_id) DO NOTHING;

  RETURN new;
END $$;


ALTER FUNCTION public.handle_new_user() OWNER TO supabase_admin;

--
-- Name: is_family_admin(uuid); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION public.is_family_admin(_family uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists(select 1 from public.family_members where family_id = _family and user_id = auth.uid() and role='admin')
$$;


ALTER FUNCTION public.is_family_admin(_family uuid) OWNER TO supabase_admin;

--
-- Name: is_family_member(uuid); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION public.is_family_member(_family uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists(select 1 from public.family_members where family_id = _family and user_id = auth.uid())
$$;


ALTER FUNCTION public.is_family_member(_family uuid) OWNER TO supabase_admin;

--
-- Name: join_family(text); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION public.join_family(_code text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare fid uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select id into fid from public.families where invite_code = upper(trim(_code));
  if fid is null then raise exception 'Código de convite inválido'; end if;
  insert into public.family_members(family_id,user_id,role) values (fid, auth.uid(), 'member') on conflict do nothing;
  return fid;
end $$;


ALTER FUNCTION public.join_family(_code text) OWNER TO supabase_admin;

--
-- Name: shares_family(uuid); Type: FUNCTION; Schema: public; Owner: supabase_admin
--

CREATE FUNCTION public.shares_family(_other uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  select exists(select 1 from public.family_members a join public.family_members b on a.family_id=b.family_id where a.user_id=auth.uid() and b.user_id=_other)
$$;


ALTER FUNCTION public.shares_family(_other uuid) OWNER TO supabase_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text) OWNER TO supabase_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
  v_order_by text;
  v_sort_order text;
begin
  case
    when sortcolumn = 'name' then
      v_order_by = 'name';
    when sortcolumn = 'updated_at' then
      v_order_by = 'updated_at';
    when sortcolumn = 'created_at' then
      v_order_by = 'created_at';
    when sortcolumn = 'last_accessed_at' then
      v_order_by = 'last_accessed_at';
    else
      v_order_by = 'name';
  end case;

  case
    when sortorder = 'asc' then
      v_sort_order = 'asc';
    when sortorder = 'desc' then
      v_sort_order = 'desc';
    else
      v_sort_order = 'asc';
  end case;

  v_order_by = v_order_by || ' ' || v_sort_order;

  return query execute
    'with folders as (
       select path_tokens[$1] as folder
       from storage.objects
         where objects.name ilike $2 || $3 || ''%''
           and bucket_id = $4
           and array_length(objects.path_tokens, 1) <> $1
       group by folder
       order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method public.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


ALTER TABLE auth.flow_state OWNER TO supabase_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_admin
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type public.factor_type NOT NULL,
    status public.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type public.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal public.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


ALTER TABLE auth.sessions OWNER TO supabase_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: activities; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.activities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trip_id uuid NOT NULL,
    family_id uuid NOT NULL,
    title text NOT NULL,
    date date,
    "time" time without time zone,
    location text,
    estimated_cost numeric(12,2) DEFAULT 0 NOT NULL,
    notes text,
    done boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.activities OWNER TO supabase_admin;

--
-- Name: checklist_items; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.checklist_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trip_id uuid NOT NULL,
    family_id uuid NOT NULL,
    kind text DEFAULT 'preparo'::text NOT NULL,
    title text NOT NULL,
    owner_name text,
    done boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    responsible_type text DEFAULT 'family'::text,
    priority text DEFAULT 'normal'::text,
    source text DEFAULT 'template'::text,
    is_optional boolean DEFAULT false,
    due_date text,
    CONSTRAINT checklist_items_kind_check CHECK ((kind = ANY (ARRAY['antes_viagem'::text, 'documentos_dinheiro'::text, 'eletronicos'::text, 'mala_roupas'::text, 'higiene'::text, 'saude'::text, 'casa'::text, 'dia_viagem'::text, 'preparo'::text, 'bagagem'::text])))
);


ALTER TABLE public.checklist_items OWNER TO supabase_admin;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    family_id uuid NOT NULL,
    trip_id uuid,
    reservation_id uuid,
    title text NOT NULL,
    kind text DEFAULT 'outro'::text NOT NULL,
    file_path text NOT NULL,
    file_name text NOT NULL,
    uploaded_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.documents OWNER TO supabase_admin;

--
-- Name: emergency_contacts; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.emergency_contacts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trip_id uuid NOT NULL,
    family_id uuid NOT NULL,
    name text NOT NULL,
    phone text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.emergency_contacts OWNER TO supabase_admin;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.expenses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trip_id uuid NOT NULL,
    family_id uuid NOT NULL,
    description text NOT NULL,
    category text DEFAULT 'outros'::text NOT NULL,
    amount numeric(12,2) DEFAULT 0 NOT NULL,
    paid boolean DEFAULT true NOT NULL,
    paid_by text,
    spent_on date DEFAULT CURRENT_DATE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.expenses OWNER TO supabase_admin;

--
-- Name: families; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.families (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    invite_code text DEFAULT upper(substr(md5((random())::text), 1, 8)) NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deepseek_api_key text,
    openai_api_key text,
    ai_provider text DEFAULT 'deepseek'::text,
    webhook_url text,
    webhook_enabled boolean DEFAULT false,
    webhook_secret text,
    webhook_events text[] DEFAULT ARRAY['trip_created'::text],
    notification_settings jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.families OWNER TO supabase_admin;

--
-- Name: family_members; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.family_members (
    family_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text DEFAULT 'member'::text NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL,
    all_trips_access boolean DEFAULT true,
    allowed_trip_ids uuid[] DEFAULT ARRAY[]::uuid[],
    CONSTRAINT family_members_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'member'::text])))
);


ALTER TABLE public.family_members OWNER TO supabase_admin;

--
-- Name: notification_history; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.notification_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    family_id uuid NOT NULL,
    trip_id uuid NOT NULL,
    event text NOT NULL,
    target_key text NOT NULL,
    sent_at timestamp with time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'sent'::text NOT NULL,
    details jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE public.notification_history OWNER TO supabase_admin;

--
-- Name: profiles; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    email text,
    phone text
);


ALTER TABLE public.profiles OWNER TO supabase_admin;

--
-- Name: reservations; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.reservations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trip_id uuid NOT NULL,
    family_id uuid NOT NULL,
    kind text DEFAULT 'hospedagem'::text NOT NULL,
    title text NOT NULL,
    provider text,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    confirmation_code text,
    cost numeric(12,2) DEFAULT 0 NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    notes text,
    address text,
    maps_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reservations OWNER TO supabase_admin;

--
-- Name: trips; Type: TABLE; Schema: public; Owner: supabase_admin
--

CREATE TABLE public.trips (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    family_id uuid NOT NULL,
    created_by uuid,
    title text NOT NULL,
    category text DEFAULT 'ferias'::text NOT NULL,
    status text DEFAULT 'planejamento'::text NOT NULL,
    start_date date NOT NULL,
    end_date date NOT NULL,
    main_destination text,
    description text,
    budget numeric(12,2) DEFAULT 0 NOT NULL,
    photos_url text,
    cover_path text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.trips OWNER TO supabase_admin;

--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_admin;

--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	0c2ba5e0-d499-4416-9b5d-b163e65bd487	{"action":"user_signedup","actor_id":"389440a7-4a3a-4fbe-954b-a62b34b3899a","actor_name":"Teste Usuario","actor_username":"teste@malukiviagens.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2026-11-10 13:16:44.665894+00	
00000000-0000-0000-0000-000000000000	bd1242fb-9c11-4b26-87c5-4a86dc478788	{"action":"login","actor_id":"389440a7-4a3a-4fbe-954b-a62b34b3899a","actor_name":"Teste Usuario","actor_username":"teste@malukiviagens.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-10 13:16:44.669584+00	
00000000-0000-0000-0000-000000000000	d1c64d69-ba9e-4579-81ae-b7020636c00c	{"action":"user_signedup","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2026-11-10 13:30:32.810583+00	
00000000-0000-0000-0000-000000000000	09bea4bd-e77e-41a4-8d11-52742b719819	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-10 13:30:32.818442+00	
00000000-0000-0000-0000-000000000000	9fc9a944-05a9-40eb-8dbc-dfd5b1c26df7	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-10 13:30:36.189747+00	
00000000-0000-0000-0000-000000000000	3f22ddda-fad2-486a-8dda-9057a5e96e63	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-10 13:36:29.932796+00	
00000000-0000-0000-0000-000000000000	dccaee02-7b9f-486b-aa1e-f5100f284a92	{"action":"logout","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-11-10 13:58:13.63173+00	
00000000-0000-0000-0000-000000000000	a400d21d-8b73-4641-b658-dd8b44fe5079	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-10 13:58:35.760335+00	
00000000-0000-0000-0000-000000000000	985cf2bc-5c2d-4376-870e-628a7db637f6	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-10 14:00:35.295026+00	
00000000-0000-0000-0000-000000000000	5940cc73-f295-4319-9949-c6bb69df8da2	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-10 14:00:42.213052+00	
00000000-0000-0000-0000-000000000000	b79314fd-09f5-4a94-bd1d-5bbdad2aef24	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-10 14:01:55.168469+00	
00000000-0000-0000-0000-000000000000	6c868694-7687-4e68-a79e-5750d23abbdf	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-10 14:02:19.227472+00	
00000000-0000-0000-0000-000000000000	4763712e-5cf2-4fd1-b36c-681eaaca8a11	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-10 14:02:27.024883+00	
00000000-0000-0000-0000-000000000000	b17b54b2-0ea2-4eb8-9290-37a0a3b7a23d	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-10 14:02:38.628195+00	
00000000-0000-0000-0000-000000000000	dbdca6da-3bd5-4551-83ac-7ce17d69a909	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-10 14:02:44.865056+00	
00000000-0000-0000-0000-000000000000	39d915c6-ce14-4049-a040-b2538a2a7b7d	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-10 14:51:23.95837+00	
00000000-0000-0000-0000-000000000000	532d4484-1b53-4f76-9887-774a1ce9d551	{"action":"logout","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-11-10 14:51:34.750011+00	
00000000-0000-0000-0000-000000000000	f5021804-84a7-4354-b078-e2862e4cc503	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-10 14:51:36.216909+00	
00000000-0000-0000-0000-000000000000	ef880dd8-47c2-4bce-9509-83d4667becd7	{"action":"logout","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-11-10 14:51:48.652522+00	
00000000-0000-0000-0000-000000000000	154ef791-dca8-46a5-95da-a3cb1c0f1901	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-10 14:51:49.845976+00	
00000000-0000-0000-0000-000000000000	df49fd12-3664-4029-85b1-33e238675a88	{"action":"logout","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-11-11 12:04:33.970102+00	
00000000-0000-0000-0000-000000000000	f1add5c8-e3ed-41e4-8ffb-de2028bd38b8	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-11 12:04:35.587154+00	
00000000-0000-0000-0000-000000000000	793a4096-4c7b-4713-868a-d3c1217f5483	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-11 12:28:41.590065+00	
00000000-0000-0000-0000-000000000000	b35966e5-f7ce-4236-8066-47b450680b5f	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-11 12:49:11.29865+00	
00000000-0000-0000-0000-000000000000	4e4d3896-54e9-4f5d-bfef-1da01d71dbb4	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-11 12:57:18.505612+00	
00000000-0000-0000-0000-000000000000	9180ad72-be93-4c32-b561-e285499ec6c5	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-11 13:03:53.269772+00	
00000000-0000-0000-0000-000000000000	bffd6a49-5f05-4b51-ab9d-97e5c0eb53dc	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-11 13:04:05.351688+00	
00000000-0000-0000-0000-000000000000	96428e8e-b6a1-4d56-b504-3822b63f3682	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-11 13:04:16.322333+00	
00000000-0000-0000-0000-000000000000	52927630-dfe0-42e7-8e28-215e122c21cc	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-11 13:14:50.675645+00	
00000000-0000-0000-0000-000000000000	fda88c6d-91d4-49d4-97d5-c94ace71d82d	{"action":"logout","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-11-11 14:05:44.514232+00	
00000000-0000-0000-0000-000000000000	a4d0f5c6-59eb-461d-be73-e53752251c43	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-11 14:05:46.844979+00	
00000000-0000-0000-0000-000000000000	6f2e4b42-7353-4fd7-a292-46aa708f7acd	{"action":"logout","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-11-11 14:05:49.45044+00	
00000000-0000-0000-0000-000000000000	cba02f21-2092-4e79-a6ab-54580c379bb3	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-11 14:05:51.298499+00	
00000000-0000-0000-0000-000000000000	ac68e73a-05a8-4ee6-a9b3-aed3f8d4193e	{"action":"logout","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-11-11 14:18:53.534489+00	
00000000-0000-0000-0000-000000000000	6768a495-1fdf-4f42-915f-d80f5f5add42	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-11 14:19:25.483195+00	
00000000-0000-0000-0000-000000000000	319562e7-6b3b-4349-8336-a86c1ecc4db6	{"action":"logout","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-11-11 14:28:32.313603+00	
00000000-0000-0000-0000-000000000000	c9caef1d-5e33-483a-9159-00e3cc1fa633	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-11 14:28:33.542341+00	
00000000-0000-0000-0000-000000000000	d408cfbb-4566-443b-a269-16079fdde49a	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-11 14:45:18.536935+00	
00000000-0000-0000-0000-000000000000	b4615147-7aa5-4102-b9c8-e58588ed9097	{"action":"logout","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-11-11 16:43:56.515145+00	
00000000-0000-0000-0000-000000000000	73e71dd4-6b8c-4729-9382-0c37e78833d8	{"action":"user_signedup","actor_id":"ff113a12-deec-403c-8a0a-3b5d80484bf1","actor_name":"Cristiane Paes Leme","actor_username":"cristianepaesleme@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2026-11-11 16:44:27.157817+00	
00000000-0000-0000-0000-000000000000	c9f3424d-5ffd-4f56-863f-e5a397a5217b	{"action":"login","actor_id":"ff113a12-deec-403c-8a0a-3b5d80484bf1","actor_name":"Cristiane Paes Leme","actor_username":"cristianepaesleme@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-11 16:44:27.161725+00	
00000000-0000-0000-0000-000000000000	0f206ba2-df1d-4bc9-b389-2595995ae488	{"action":"login","actor_id":"ff113a12-deec-403c-8a0a-3b5d80484bf1","actor_name":"Cristiane Paes Leme","actor_username":"cristianepaesleme@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-11 16:44:30.129799+00	
00000000-0000-0000-0000-000000000000	0e8e6747-6036-4f66-9888-7c2c299d21d9	{"action":"logout","actor_id":"ff113a12-deec-403c-8a0a-3b5d80484bf1","actor_name":"Cristiane Paes Leme","actor_username":"cristianepaesleme@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-11-11 16:44:53.48404+00	
00000000-0000-0000-0000-000000000000	7b75a3ab-eb18-4f97-90bb-129d53d6af0d	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-11 16:45:00.071886+00	
00000000-0000-0000-0000-000000000000	ef1d6dd6-b11e-41a9-910e-4dd07b6a1e3e	{"action":"logout","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-11-11 16:45:08.671431+00	
00000000-0000-0000-0000-000000000000	b7edb568-08d7-479c-8034-69caa5602ebf	{"action":"login","actor_id":"ff113a12-deec-403c-8a0a-3b5d80484bf1","actor_name":"Cristiane Paes Leme","actor_username":"cristianepaesleme@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-11 16:45:28.425084+00	
00000000-0000-0000-0000-000000000000	ee09ce76-5ebd-4d99-b589-9b1399e7efcc	{"action":"logout","actor_id":"ff113a12-deec-403c-8a0a-3b5d80484bf1","actor_name":"Cristiane Paes Leme","actor_username":"cristianepaesleme@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-11-11 16:45:41.748214+00	
00000000-0000-0000-0000-000000000000	972e97f3-9bba-4d39-ae88-91657f380ecd	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-11 16:45:43.25434+00	
00000000-0000-0000-0000-000000000000	9d2c89aa-3d54-43e7-81c2-8ee3d0d54cf5	{"action":"logout","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account"}	2026-11-12 10:52:18.132778+00	
00000000-0000-0000-0000-000000000000	fe74dbbe-f096-49d5-887f-ad01c7b31c72	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-12 10:52:19.354843+00	
00000000-0000-0000-0000-000000000000	a2859b5d-ca6c-4164-a298-c12f5ada68a3	{"action":"login","actor_id":"7e414376-4f64-4d42-b18d-2382980791c4","actor_name":"maluki","actor_username":"alesauer@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2026-11-16 12:19:42.519294+00	
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
389440a7-4a3a-4fbe-954b-a62b34b3899a	389440a7-4a3a-4fbe-954b-a62b34b3899a	{"sub": "389440a7-4a3a-4fbe-954b-a62b34b3899a", "email": "teste@malukiviagens.com", "full_name": "Teste Usuario", "email_verified": false, "phone_verified": false}	email	2026-11-10 13:16:44.663212+00	2026-11-10 13:16:44.66324+00	2026-11-10 13:16:44.66324+00	8cfa8f4b-c584-4a3d-8e45-71e8436892a1
7e414376-4f64-4d42-b18d-2382980791c4	7e414376-4f64-4d42-b18d-2382980791c4	{"sub": "7e414376-4f64-4d42-b18d-2382980791c4", "email": "alesauer@gmail.com", "full_name": "maluki", "email_verified": false, "phone_verified": false}	email	2026-11-10 13:30:32.808864+00	2026-11-10 13:30:32.808894+00	2026-11-10 13:30:32.808894+00	87ca5cf8-7db9-42fb-af9d-54df139080ef
ff113a12-deec-403c-8a0a-3b5d80484bf1	ff113a12-deec-403c-8a0a-3b5d80484bf1	{"sub": "ff113a12-deec-403c-8a0a-3b5d80484bf1", "email": "cristianepaesleme@gmail.com", "full_name": "Cristiane Paes Leme", "email_verified": false, "phone_verified": false}	email	2026-11-11 16:44:27.155404+00	2026-11-11 16:44:27.155455+00	2026-11-11 16:44:27.155455+00	fd8591f8-4f32-4fdc-b84c-8cf4d550a2a8
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
24cc54ea-b81c-49c0-85d5-fb2482fad17a	2026-11-10 13:16:44.67294+00	2026-11-10 13:16:44.67294+00	password	13bf9450-29a9-47f8-a8aa-c3872de2fc91
1c752d5a-3d5d-43fc-8a67-19b5039aad57	2026-11-12 10:52:19.361535+00	2026-11-12 10:52:19.361535+00	password	7cba72ea-e4df-441f-8922-a86b3eef9a3f
59c736b3-a739-43f1-a078-384265243b36	2026-11-16 12:19:42.536959+00	2026-11-16 12:19:42.536959+00	password	66ed12eb-253b-4bd7-807f-4b307def32de
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	1	Bzhl1kCZ06Jn2L_wWxA61g	389440a7-4a3a-4fbe-954b-a62b34b3899a	f	2026-11-10 13:16:44.671319+00	2026-11-10 13:16:44.671319+00	\N	24cc54ea-b81c-49c0-85d5-fb2482fad17a
00000000-0000-0000-0000-000000000000	34	oXuZkl74fbtsQ7OhPO5BMg	7e414376-4f64-4d42-b18d-2382980791c4	f	2026-11-12 10:52:19.358256+00	2026-11-12 10:52:19.358256+00	\N	1c752d5a-3d5d-43fc-8a67-19b5039aad57
00000000-0000-0000-0000-000000000000	35	EzbKeNATBNbToH6GOLNFMw	7e414376-4f64-4d42-b18d-2382980791c4	f	2026-11-16 12:19:42.528482+00	2026-11-16 12:19:42.528482+00	\N	59c736b3-a739-43f1-a078-384265243b36
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag) FROM stdin;
24cc54ea-b81c-49c0-85d5-fb2482fad17a	389440a7-4a3a-4fbe-954b-a62b34b3899a	2026-11-10 13:16:44.670223+00	2026-11-10 13:16:44.670223+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT; Windows NT 10.0; pt-BR) WindowsPowerShell/5.1.19041.6456	192.168.112.1	\N
1c752d5a-3d5d-43fc-8a67-19b5039aad57	7e414376-4f64-4d42-b18d-2382980791c4	2026-11-12 10:52:19.355707+00	2026-11-12 10:52:19.355707+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	192.168.112.7	\N
59c736b3-a739-43f1-a078-384265243b36	7e414376-4f64-4d42-b18d-2382980791c4	2026-11-16 12:19:42.524483+00	2026-11-16 12:19:42.524483+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36	192.168.112.7	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	ff113a12-deec-403c-8a0a-3b5d80484bf1	authenticated	authenticated	cristianepaesleme@gmail.com	$2a$10$M8c6bE29WTLm.NzYyMTy3.nIYvT/Jm5Pw8gYSX8DzdLtZ38pK5Avm	2026-11-11 16:44:27.158355+00	\N		\N		\N			\N	2026-11-11 16:45:28.425954+00	{"provider": "email", "providers": ["email"]}	{"sub": "ff113a12-deec-403c-8a0a-3b5d80484bf1", "email": "cristianepaesleme@gmail.com", "full_name": "Cristiane Paes Leme", "email_verified": false, "phone_verified": false}	\N	2026-11-11 16:44:27.131813+00	2026-11-11 16:45:28.427508+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	7e414376-4f64-4d42-b18d-2382980791c4	authenticated	authenticated	alesauer@gmail.com	$2a$10$h6t5355yvcDi0xurvmZKZuMN.HgmCiQQniYiuvTbZ19g4JayJhKGK	2026-11-10 13:30:32.811142+00	\N		\N		\N			\N	2026-11-16 12:19:42.524431+00	{"provider": "email", "providers": ["email"]}	{"sub": "7e414376-4f64-4d42-b18d-2382980791c4", "email": "alesauer@gmail.com", "full_name": "maluki", "email_verified": false, "phone_verified": false}	\N	2026-11-10 13:30:32.806468+00	2026-11-16 12:19:42.53543+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	389440a7-4a3a-4fbe-954b-a62b34b3899a	authenticated	authenticated	teste@malukiviagens.com	$2a$10$xoX.mLvEuv/LqSnNJuvzyuZ32AYA44FGEXOLy0Zp0IGRMNUgQcH8.	2026-11-10 13:16:44.666758+00	\N		\N		\N			\N	2026-11-10 13:16:44.670166+00	{"provider": "email", "providers": ["email"]}	{"sub": "389440a7-4a3a-4fbe-954b-a62b34b3899a", "email": "teste@malukiviagens.com", "full_name": "Teste Usuario", "email_verified": false, "phone_verified": false}	\N	2026-11-10 13:16:44.641475+00	2026-11-10 13:16:44.672564+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.activities (id, trip_id, family_id, title, date, "time", location, estimated_cost, notes, done, created_at) FROM stdin;
3da77504-4445-4fb4-92a3-28cc087aa68f	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Embarque para Santiago (Voo H2 651)	2026-07-10	19:15:00	Aeroporto	0.00	Saída de Belo Horizonte / SP rumo a Santiago. Chegada prevista às 23:35.	f	2026-11-11 13:18:34.189514+00
fe08b6ab-8aed-4076-808d-7503020c45ef	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Transfer do Aeroporto SCL para o Airbnb Auroras	2026-07-10	23:45:00	Compañía de Jesús 1656, Centro	0.00	Transfer até o Airbnb no centro histórico e acomodação.	f	2026-11-11 13:18:34.189514+00
70cb26bd-c186-4c88-9d81-0c1aa05bc26b	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Palácio de La Moneda e Troca de Guarda	2026-07-11	09:30:00	Palácio de La Moneda	0.00	Sede da presidência do Chile, palco do bombardeio de 1973.\n\n💡 Dica de Ouro: Tente alinhar o horário para assistir à tradicional Troca de Guarda pela manhã.\nArredores: Centro Cultural La Moneda (subsolo), Plaza de la Constitución e Paseo Ahumada.\nRestaurantes: Las Vacas Gordas (Carnes), Café Cité, Wonderland Café (Alice no País das Maravilhas).\nMaps: https://maps.app.goo.gl/61Dbj276QD6Kyssw9	f	2026-11-11 13:18:34.189514+00
56a19dd5-e30a-4f9d-87cf-87c88b2ea7c5	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Plaza de Armas e Catedral Metropolitana	2026-07-11	12:00:00	Plaza de Armas	0.00	Coração histórico e marco zero de Santiago, cercado por prédios coloniais.\n\n💡 Dica de Ouro: Entre na Catedral Metropolitana; arquitetura interna belíssima e gratuita. Atenção com carteira e celular no entorno.\nArredores: Museu Histórico Nacional e Correio Central.	f	2026-11-11 13:18:34.189514+00
8df4c33a-6d1e-4d83-914b-bf5fbc2b2cd3	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Barrio Lastarria e Cerro Santa Lucía	2026-07-11	15:30:00	Barrio Lastarria	0.00	Bairro charmoso com forte pegada cultural, cafés modernos e ruelas de paralelepípedo.\n\n💡 Dica de Ouro: Excelente parada para almoço ou café no meio da tarde. Caminhe sem pressa pela rua José Victorino Lastarria.\nArredores: Mirante do Cerro Santa Lucía, GAM e Parque Forestal.	f	2026-11-11 13:18:34.189514+00
d71db197-e7e1-4e98-90e5-3ec5521b807e	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Cerro San Cristóbal e Funicular	2026-07-12	09:30:00	Cerro San Cristóbal	0.00	Segunda montanha mais alta de Santiago, subida imperdível no histórico bondinho funicular.\n\n💡 Dica de Ouro: No topo, não deixe de provar o Mote con Huesillos (bebida doce típica chilena com pêssego e trigo).\nArredores: Santuário no topo, teleférico e entrada pelo Barrio Bellavista.\nMaps: https://maps.app.goo.gl/MDcj7wMjbm7Zn41j6	f	2026-11-11 13:18:34.189514+00
acbb4c7e-4c5a-40ec-9e20-77f8a336cff8	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Almoço no Patio Bellavista	2026-07-12	12:30:00	Patio Bellavista	0.00	Shopping gastronômico aberto, moderno e seguro, repleto de ótimas opções internacionais.\nRestaurantes: Backstage Life (música ao vivo e grelhados).	f	2026-11-11 13:18:34.189514+00
9340e993-1636-4061-8623-b3f88c994b6b	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Vila Le Ville (General Holley)	2026-07-12	15:00:00	General Holley, Providencia	0.00	Charmosa vila de pedestres com arquitetura em estilo Tudor europeu, cafés aconchegantes e clima tranquilo.\n\n💡 Dica de Ouro: Perfeito para tomar um bom café expresso ou chocolate quente.	f	2026-11-11 13:18:34.189514+00
fc14b9e3-e59b-4069-ba94-a630c587afa5	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Pôr do Sol no Sky Costanera (61º andar)	2026-07-12	16:45:00	Costanera Center	0.00	Mirante do prédio mais alto da América Latina com vista 360° surreal.\n\n💡 Dica de Ouro: Subir cerca de 1 hora antes do pôr do sol. A transição com as luzes da cidade e a Cordilheira ao fundo é cinematográfica.	f	2026-11-11 13:18:34.189514+00
37a5de8d-ef01-49ca-9d7a-f84c9ae54285	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Jantar no Mercado MUT (Mercado Urbano Tobalaba)	2026-07-12	19:30:00	MUT - Tobalaba	0.00	Primeiro mercado urbano sustentável do Chile, complexo moderníssimo com jardins e polo gastronômico.\n\n💡 Dica de Ouro: Pizzarias artesanais estilo italiano, hamburguerias premium e ótimos vinhos.	f	2026-11-11 13:18:34.189514+00
65bb26df-faf5-4c77-8083-10e0358b8022	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Passeio Parque Safari Rancagua (Leões e Herbívoros)	2026-07-13	08:30:00	Ruta H 30, Rancagua	0.00	Uma das experiências mais emocionantes com animais selvagens resgatados em áreas abertas e seguras.\n\nIncluso no Tour: Transporte, seguro passageiro, guia bilíngue, grandes felinos e herbívoros.\n\n💡 Levar: Óculos escuros, roupas confortáveis, protetor solar e água.\nMaps: https://maps.app.goo.gl/GkzttzyCsh3Ejx3j7	f	2026-11-11 13:18:34.189514+00
cb83180c-1e92-4289-8d77-c29fd364c5aa	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Compras no Arauco Premium Outlet Buenaventura & Easton Outlet	2026-07-14	10:00:00	San Ignacio 500, Quilicura	0.00	Maior complexo de outlets do Chile com mais de 150 marcas: Nike, Adidas, The North Face, Columbia, Puma, Under Armour, Levi's, Carolina Herrera, Hugo Boss.\n\n💡 Dicas de Ouro:\n- Visite na terça-feira pela manhã (10h) para encontrar o estoque completo e sem filas.\n- Combine com o Easton Outlet Mall logo ao lado.\n- Foco em casacos de inverno (The North Face, Columbia) e itens esportivos.\n- Pagar com conta global (Nomad/Wise) para evitar IOF alto.\n- Vá de Uber/transporte privado.\nMaps: https://maps.app.goo.gl/ppB5TMt8NgJMsyzG8	f	2026-11-11 13:18:34.189514+00
257c7916-54ca-478a-be44-6344a86eabc6	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Dia na Neve no Parque Farellones (Cordilheira dos Andes)	2026-07-15	07:30:00	Farellones, Andes	0.00	Vila de montanha e parque de neve com tubing, tirolesa canopy, cadeira panorâmica, trenó e aulas de esqui/snowboard.\n\n💡 Dicas Essenciais:\n- Chegue cedo com ingresso antecipado comprado.\n- Roupas e botas impermeáveis para neve, luvas, óculos escuros e protetor solar.\n- Priorize o Tubing no início do dia por ser o mais concorrido.\n- Suba com van/agência especializada (40 curvas na neve).\n- Tome remédio para enjoo antes de subir.\nRestaurantes: El Montañés, El Alemán de Farellones, Posada Farellones.	f	2026-11-11 13:18:34.189514+00
d76e2409-2d14-4c93-b412-01a417a520eb	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Templo Bahá'í e Bairro Itália	2026-07-16	10:00:00	Peñalolén / Providencia	0.00	Arquitetura premiada na pré-cordilheira com vista panorâmica da cidade e polo de galerias e casarões históricos no Bairro Itália.\nRestaurantes sugeridos: Mestizo, La Cabrera ou Las Vacas Gordas.	f	2026-11-11 13:18:34.189514+00
46184795-3579-4a60-8529-14640878139f	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Parque Bicentenário ou Vinícola Cousiño Macul	2026-07-16	15:00:00	Vitacura / Peñalolén	0.00	Passeio pelas lagoas de flamingos no Parque Bicentenário ou tour com degustação nas caves centenárias da Cousiño Macul (acesso pelo metrô Quilín).	f	2026-11-11 13:18:34.189514+00
2717c381-c94c-4b93-b0ca-ba3788e51c59	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Jantar Especial de Despedida (Parrillada Chilena/Argentina)	2026-07-16	20:00:00	La Cabrera ou Las Vacas Gordas	0.00	Jantar de despedida em restaurante tradicional de cortes nobres na brasa.	f	2026-11-11 13:18:34.189514+00
7d19bee5-f763-452a-8f75-8dff22ec9fbf	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Check-out Airbnb e Transfer para Aeroporto SCL	2026-07-17	10:00:00	Airbnb Auroras	0.00	Organização de malas, check-out e deslocamento com antecedência para o Aeroporto Internacional Arturo Merino Benítez (SCL).	f	2026-11-11 13:18:34.189514+00
37a2584d-0e7d-44d2-a839-231e61878271	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Embarque Voo Retorno para o Brasil	2026-07-17	13:20:00	Aeroporto SCL	0.00	Voo de retorno para o Brasil (chegada prevista às 18:35).	f	2026-11-11 13:18:34.189514+00
288212c7-35c0-475a-b162-cb75384decdc	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Subir para Porto Alegre	2026-12-17	23:50:00	Porto Alegre / Gramado	0.00	\N	f	2026-11-13 13:09:55.939658+00
c397d44a-5225-4012-8894-fd22aa3bb383	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Passeio Maria Fumaça	2026-12-20	09:30:00	\N	78.00	pcd\nLigar para: +55 54 3286-4055 (zapzap)	f	2026-11-13 14:42:21.070716+00
ecf279e1-af93-4a0f-a409-2f124221ebea	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Embarque em Belo Horizonte (CNF → GIG)	2026-03-27	20:45:00	Aeroporto de Confins	0.00	Voo AV 4612 rumo ao Rio de Janeiro para início da viagem internacional.	f	2026-11-11 13:18:42.070657+00
25751495-bceb-4107-b3b2-57c82e4e18c5	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Chegada em NYC e Check-in no Airbnb New Jersey	2026-03-28	14:00:00	19 64th Street, West New York, NJ	0.00	Pouso às 13:55, imigração e transfer de Uber até West New York (aprox. $65).\nCheck-in no Airbnb com anfitrião Mehmet.	f	2026-11-11 13:18:42.070657+00
6159b226-0ca6-4728-9dcb-f92fc34bb2be	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Compras no Walmart de NJ e Jantar no Applebee's	2026-03-28	18:00:00	Walmart New Jersey	0.00	Compras de mantimentos, café e lanches no Walmart de NJ. Jantar descontraído no Applebee's do complexo.	f	2026-11-11 13:18:42.070657+00
2cdb5851-159e-4a69-a937-17b4657ae9bc	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Explorando Manhattan (Região Central)	2026-03-29	09:30:00	Manhattan, Nova York	0.00	Passeio a pé e de metrô pelo coração de Manhattan:\n- Times Square e Broadway\n- Caminhada pelo Central Park\n- 5ª Avenida, Rockefeller Center e St. Patrick's Cathedral\n- Opções de almoço/jantar: Los Tacos No. 1, Bleecker Street Pizza, Ellen's Stardust Diner (garçons cantores, super divertido para famílias/adolescentes), Katz's Delicatessen ou Junior's Cheesecake.	f	2026-11-11 13:18:42.070657+00
32d8305a-3687-403c-a0e4-9882234e6a96	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Bronx: Escadaria do Coringa e Compras na Burlington	2026-03-30	08:30:00	Bronx, Nova York	0.00	Ida cedo de metrô para o Bronx:\n- Visita à icônica Escadaria do Coringa (Joker Stairs na 1165 Shakespeare Ave)\n- Compras de roupas e calçados com desconto na Burlington\n- Passagem pelo Franz Sigel Park e exterior do Yankee Stadium.	f	2026-11-11 13:18:42.070657+00
b5d14469-5777-4ea7-b9ec-fa60a30e975b	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Voo para Toronto e Retirada do Carro SIXT	2026-03-31	10:00:00	LGA Terminal B → Toronto YTZ	0.00	Saída de New Jersey para o aeroporto LaGuardia (LGA Terminal B).\nVoo AC 8533 às 10:00, chegando em Toronto (YTZ) às 11:39.\nRetirada do SUV Toyota RAV4 na locadora SIXT em Downtown (200 Wellington St W) às 12h30.	f	2026-11-11 13:18:42.070657+00
e3d91aa8-8d23-4f6c-a890-282a0a2de831	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Check-in no Airbnb Toronto e Harbourfront	2026-03-31	14:00:00	138 Kenwood Ave, Toronto	0.00	Check-in no Airbnb (anfitrião Willian).\nTarde de caminhada no Harbourfront na orla do Lago Ontário.	f	2026-11-11 13:18:42.070657+00
825201b1-7592-4879-a8b7-8c77e61ee4fe	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	CN Tower e Jantar no Distillery District	2026-03-31	17:00:00	CN Tower, Toronto	0.00	Subida na famosa CN Tower para vista espetacular da cidade.\nÀ noite: Jantar no charmoso bairro histórico de paralelepípedos Distillery District (restaurantes artesanais e cafés).	f	2026-11-11 13:18:42.070657+00
35cec3a9-c4ae-46b0-b821-ba4e82bddc03	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Toronto Profunda: Kensington Market, U of T e Yorkville	2026-04-01	09:30:00	Toronto Centro e Bairros	0.00	Passeio completo pelos bairros mais emblemáticos de Toronto:\n- Bairro boêmio Kensington Market e lojas vintage\n- Campus histórico da University of Toronto\n- Elegante bairro de Yorkville\n- Opções culturais: Royal Ontario Museum (ROM) ou balsa para Toronto Islands\n- Dica de restaurante perto: Cafe Landwer (165 University Ave) ou St Lawrence Pizza & Pasta.	f	2026-11-11 13:18:42.070657+00
1026fcca-164f-4ab4-ab20-f4fbff2c1c73	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Walmart Toronto (Dufferin St) e Jantar Jimmy The Greek	2026-04-01	18:30:00	900 Dufferin St, Toronto	0.00	Ida ao Walmart Dufferin Mall para compras e lembrancinhas canadenses (xarope de bordo/Maple).\nJantar no restaurante Jimmy The Greek.	f	2026-11-11 13:18:42.070657+00
963b4ff5-f847-46cd-af26-958196664868	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Cataratas do Niágara (Niagara Falls)	2026-04-02	08:00:00	Niagara Falls, Ontário	0.00	Saída pontual às 08:00 de carro (aprox. 1h30 de viagem).\nContemplação de uma das maravilhas naturais do mundo.\nAlmoço em Niágara: Hi-Lite Restaurant ou Chip N Charlie's.	f	2026-11-11 13:18:42.070657+00
2abb5b2b-ee0e-479b-bd0a-90b82e4ddfb5	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Niagara-on-the-Lake e Retorno para Toronto	2026-04-02	14:30:00	Niagara-on-the-Lake	0.00	Visita à encantadora cidade histórica de Niagara-on-the-Lake com casinhas vitorianas, vinícolas de Icewine e lojas de doces.\nRetorno para Toronto no fim da tarde.	f	2026-11-11 13:18:42.070657+00
a020b9e0-70e8-4e8d-9eba-e557afaf2c83	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Casa Loma (Castelo de Toronto) e Devolução do Carro	2026-04-03	09:00:00	Casa Loma, Toronto	0.00	Café da manhã e passeio nos jardins e exterior do magnífico castelo histórico Casa Loma.\nSaída às 10:15 para devolução do carro na SIXT (chegar no aeroporto YTZ às 11:30).	f	2026-11-11 13:18:42.070657+00
9a8347c8-70f4-4e1c-976d-df56eb8bb56d	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Voo Retorno para Nova York (Toronto → LGA)	2026-04-03	14:20:00	Aeroporto Billy Bishop (YTZ)	0.00	Voo AC 8536 às 14:20 com chegada em Nova York LGA às 15:41.\nTransfer de volta para o Airbnb em West New York e jantar tranquilo na região (Sal's Pizza Bar ou Rotisserie On Park).	f	2026-11-11 13:18:42.070657+00
62303813-7f37-4ef8-a9ef-f4dae94d4545	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Dia Inteiro de Compras no The Mills at Jersey Gardens	2026-04-04	10:00:00	Jersey Gardens Outlet, NJ	0.00	Dia dedicado às compras de grandes marcas no maior outlet fechado de New Jersey.\n💡 Vantagem de ouro: Isenção total de imposto estadual (Tax Free) sobre roupas e calçados em New Jersey!\nLojas: Nike, Tommy, Ralph Lauren, Calvin Klein, Victoria's Secret, Apple, etc.	f	2026-11-11 13:18:42.070657+00
92b97baf-5f75-4626-90d3-6b8a610aaf59	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Manhã em Manhattan e Deslocamento para o Aeroporto	2026-04-05	09:30:00	Manhattan / JFK Airport	0.00	Manhã tranquila para café e últimos passeios.\nSaída com antecedência às 11:30 para o Aeroporto JFK.\nVoo AV 211 às 15:35 para Bogotá.	f	2026-11-11 13:18:42.070657+00
77d33644-6b8a-45e6-bc72-4bc575244969	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Chegada em Belo Horizonte (Volta para Casa)	2026-04-06	10:10:00	Aeroporto de Confins (CNF)	0.00	Chegada no Brasil pelo Rio de Janeiro às 06:15 e pouso final em Belo Horizonte às 10:10 com a família.	f	2026-11-11 13:18:42.070657+00
03776a54-2c90-4b06-9ace-459f2bab88c2	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Dreamland Museu de Cera (Passaporte Dreams)	2026-12-18	11:00:00	Av. das Hortênsias, 5507 - Carniel, Gramado - RS	0.00	Ingressos do Passaporte Dreams já garantidos para todos. Sem necessidade de agendamento.	f	2026-11-13 13:18:13.110307+00
c2f9e9e5-dd8a-44a1-b278-dd02f8d1043a	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Harley Motor Show (Passaporte Dreams)	2026-12-18	12:00:00	Av. das Hortênsias, 5507 (Subsolo) - Carniel, Gramado - RS	0.00	No subsolo do Museu de Cera. Bar temático e motos clássicas.	f	2026-11-13 13:18:13.110307+00
3ded6ae5-4e3e-47d4-aef0-71e90fd86682	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Hollywood Dream Cars (Passaporte Dreams)	2026-12-19	11:00:00	Av. das Hortênsias, 4151 - Carniel, Gramado - RS	0.00	Maior acervo de Cadillacs e carros dos anos 50/60. Sem necessidade de agendamento.	f	2026-11-13 13:18:13.110307+00
2697234f-cf15-43fc-8427-5a54d11e9315	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	[🇧🇷 Embarque] Partida de Belo Horizonte para São Paulo e Madri	2025-10-09	11:00:00	Confins / Guarulhos	0.00	Início da jornada europeia: voo nacional para SP e embarque às 19:15 no voo IB 0272 rumo à Europa.	f	2026-11-11 13:23:37.35591+00
f2267bf9-a190-4ef4-918f-89a53e83a9f7	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	[🇫🇷 França / Paris] Chegada em Paris e Check-in no ibis Place d'Italie	2025-10-10	13:35:00	Aeroporto Paris Orly → 13º arr.	0.00	Desembarque às 13:25 em Paris Orly, transfer até o hotel ibis Paris Place d’Italie 13ème e acomodação.	f	2026-11-11 13:23:37.35591+00
c250d239-ece0-4e64-a7f4-14f6cb3910f4	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	[🇫🇷 França / Paris] Tarde na Torre Eiffel e Trocadéro	2025-10-10	16:30:00	Torre Eiffel & Champ de Mars	0.00	Saída de metrô linha 6 (Place d’Italie → Bir-Hakeim).\n💡 Dica de Ouro: Sente-se do lado esquerdo do metrô para ver a Torre surgir cinematográfica ao cruzar o viaduto sobre o Rio Sena!\nPasseio a pé pelo Champ de Mars, fotos no pôr do sol e apéro/café no Trocadéro.	f	2026-11-11 13:23:37.35591+00
8eb15efd-ff3b-4c95-b218-94c765667abc	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	[🇫🇷 França / Paris] Espetáculo da Torre Eiffel Iluminada e Jantar no Bouillon	2025-10-10	19:00:00	Trocadéro / Rue de Monttessuy	0.00	A Torre acende às 19h e pisca por 5 minutos a cada hora cheia. Vista clássica da esplanada do Trocadéro.\nJantar nos tradicionais Bouillons parisienses: Bouillon Grenelle (pratos a partir de €10) ou Café Constant.	f	2026-11-11 13:23:37.35591+00
d9263010-1034-4cde-b4d7-34f1b559662b	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	[🇫🇷 França / Paris] Manhã: Arco do Triunfo e Avenue des Champs-Élysées	2025-10-11	08:30:00	Champs-Élysées & Arco do Triunfo	0.00	Metrô linha 6 até Trocadéro e caminhada até o Arco do Triunfo.\nPasseio a pé pela célebre Avenue des Champs-Élysées até a Place de la Concorde.\nAlmoço sugerido: Café Madeleine ou Bouillon.	f	2026-11-11 13:23:37.35591+00
5095b173-4a84-40cc-8d46-5b221931e98d	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	[🇫🇷 França / Paris] Tarde: Jardins das Tulherias e Museu do Louvre	2025-10-11	14:00:00	Jardin des Tuileries & Museu do Louvre	0.00	Caminhada pelos jardins das Tulherias e entrada no Museu do Louvre (ingresso antecipado € 17) para ver a Mona Lisa, Vênus de Milo e as galerias imperiais.	f	2026-11-11 13:23:37.35591+00
af6e0b8d-dd3d-484e-9956-785919e8c9fe	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	[🇫🇷 França / Paris] Manhã: Panthéon, Notre-Dame e Sainte-Chapelle	2025-10-12	08:45:00	Île de la Cité & Quartier Latin	0.00	Passeio pelo Panthéon e Jardins de Luxemburgo.\nCaminhada até a Île de la Cité: exterior da Catedral de Notre-Dame e os impressionantes vitrais góticos da Sainte-Chapelle.\nAlmoço na Île Saint-Louis: Café Saint-Régis e o lendário sorvete Berthillon.	f	2026-11-11 13:23:37.35591+00
a5b19d39-30e8-4378-8d9e-cb444ec3c368	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	[🇫🇷 França / Paris] Tarde: Palais Royal e Cruzeiro no Rio Sena	2025-10-12	14:30:00	Palais Royal & Rio Sena	0.00	Visita aos jardins do Palais Royal (Colunas de Buren) e Galerie Vivienne.\nÀs 17:30: Passeio de barco pelo Rio Sena (Bateaux Parisiens / Vedettes du Pont Neuf) assistindo aos monumentos iluminados.	f	2026-11-11 13:23:37.35591+00
b6baa227-c65e-4ffe-905a-c09bfccb2b44	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	[🇫🇷 França / Paris] Noite: Basílica de Sacré-Cœur e Montmartre	2025-10-12	20:00:00	Montmartre	0.00	Subida à Sacré-Cœur com vista noturna espetacular de toda Paris.\nCaminhada pela boêmia Place du Tertre (pintores e artistas de rua) e jantar bistrô.	f	2026-11-11 13:23:37.35591+00
3441ec00-826b-4bde-9e59-107330d45d5e	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	[🇫🇷 França / Disney] Disneyland Paris (2 Parques em 1 Dia)	2025-10-13	07:30:00	Marne-la-Vallée – Chessy	0.00	Saída cedo de metrô + trem RER A até a Disneyland Paris.\n- Manhã: Walt Disney Studios (Ratatouille, Avengers Campus, Crush’s Coaster)\n- Tarde: Disneyland Park clássico (Space Mountain, Piratas do Caribe, It’s a Small World)\n- 21:00: Show de projeções e fogos no Castelo da Bela Adormecida.\nRetorno a Paris de trem RER A por volta das 22h.	f	2026-11-11 13:23:37.35591+00
9a620489-bbc6-4dc0-9e10-735619ed2de0	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	[🇬🇧 Inglaterra / Londres] Trem Eurostar para Londres e Check-in no Zedwell	2025-10-14	09:00:00	Paris Gare du Nord → St. Pancras	0.00	Embarque no trem de alta velocidade Eurostar saindo da Gare du Nord em Paris rumo a Londres St. Pancras.\nCheck-in ou drop de malas no Zedwell Piccadilly Circus.	f	2026-11-11 13:23:37.35591+00
27b9784f-4de5-404f-b430-dbc6ede08f04	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	[🇬🇧 Inglaterra / Londres] London Eye, Piccadilly Circus e Covent Garden	2025-10-14	14:00:00	Westminster & Covent Garden	0.00	Passeio na famosa roda gigante London Eye com vista panorâmica do Big Ben e Tâmisa.\nCaminhada por Piccadilly Circus e Leicester Square.\nFinal de tarde e jantar em Covent Garden (mercado coberto, artistas e restaurantes em Chinatown).	f	2026-11-11 13:23:37.35591+00
2a30385b-be1a-4823-b2f7-18cc90b6655a	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	[🇬🇧 Inglaterra / Londres] Museu de História Natural em South Kensington	2025-10-15	09:30:00	Cromwell Rd, South Kensington	0.00	Visita a um dos mais espetaculares museus do mundo com fósseis de dinossauros e arquitetura vitoriana. Entrada gratuita.\nAlmoço em South Kensington.	f	2026-11-11 13:23:37.35591+00
6d70fbfa-2d85-4d7a-8542-0f33db6bfb5e	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	[🇬🇧 Inglaterra / Londres] Compras na Oxford Street & Regent Street	2025-10-15	14:30:00	Oxford Circus & Regent St	0.00	Tarde de compras na maior rua comercial da Europa:\n- Lojas de departamento e moda: Selfridges, Primark, TK Maxx, Uniqlo\n- Caminhada pela elegante Regent Street (Liberty London e Apple Store)\n- Noite animada em Soho e Leicester Square.	f	2026-11-11 13:23:37.35591+00
0f5ad340-7438-43a8-b892-ca3b0b6f721c	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	[🇬🇧 Inglaterra / Londres] Manhã: Camden Market e Regent's Canal	2025-10-16	09:30:00	Camden Lock & Stables Market	0.00	Exploração das lojas alternativas, arte urbana e comidas de rua do mundo todo às margens do canal.\nVista panorâmica de Londres do alto do Primrose Hill.	f	2026-11-11 13:23:37.35591+00
bb00eaff-3923-472b-824f-8029768e4ee7	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	[🇬🇧 Inglaterra / Londres] Tarde: Charme de Notting Hill & British Museum	2025-10-16	14:00:00	Notting Hill Gate & Bloomsbury	0.00	Passeio pelas famosas casinhas coloridas de Notting Hill e feirinha da Portobello Road.\nVisita ao British Museum (Pedra de Roseta e múmias egípcias) pertinho do hotel.	f	2026-11-11 13:23:37.35591+00
6b013ca1-ee3e-49e5-83ba-011b40be8efd	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	[🇳🇱 Holanda / Amsterdã] Trem Eurostar para Amsterdã e Cruzeiro pelos Canais	2025-10-17	08:30:00	Londres St. Pancras → Amsterdã Centraal	0.00	Viagem de trem Eurostar de Londres para Amsterdã. Check-in no Leonardo Royal Hotel.\nÀ tarde: Passeio de barco pelos canais históricos de Amsterdã.\nJantar no charmoso e vibrante bairro gastronômico De Pijp.	f	2026-11-11 13:23:37.35591+00
b53b16dd-4ca7-4ae6-8b22-222b70589824	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	[🇳🇱 Holanda / Amsterdã] Visita à Casa de Anne Frank e Bairro Jordaan	2025-10-18	09:30:00	Prinsengracht 263-267	0.00	Visita emocionante ao anexo secreto onde Anne Frank escreveu seu diário (ingresso antecipado obrigatório).\nCaminhada sem pressa pelas pontes e ruelas do bairro Jordaan (galerias, cafés e lojas locais).\nJantar e vida noturna na praça Leidseplein.	f	2026-11-11 13:23:37.35591+00
e75b93a4-4349-4b5c-a9da-dac80db3737e	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	[🇳🇱 Holanda / Amsterdã] Vondelpark, Bloemenmarkt e Rembrandtplein	2025-10-19	10:00:00	Vondelpark & Singel	0.00	Passeio pelo Vondelpark (o mais famoso da cidade) e visita ao único mercado de flores flutuante do mundo (Bloemenmarkt).\nJantar de despedida na movimentada praça Rembrandtplein.	f	2026-11-11 13:23:37.35591+00
daa534e6-6308-4d5d-b677-bb5906e01cf5	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	[🚆 Conexão] Trem Amsterdã → Paris e Voo de Volta ao Brasil	2025-10-20	09:15:00	Amsterdã Centraal → Paris Orly → Madri	0.00	Trem Eurostar de volta a Paris Gare du Nord.\nDeslocamento para o Aeroporto Paris Orly.\nVoo IB 0580 às 19:00 para Madri e conexão no voo IB 0267 (23:55) rumo a São Paulo.	f	2026-11-11 13:23:37.35591+00
4908153c-78e3-453b-8d39-34d85be6b5b3	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	[🇧🇷 Chegada] Pouso em São Paulo e Retorno a Belo Horizonte	2025-10-21	06:00:00	Guarulhos (GRU) → Confins (CNF)	0.00	Chegada ao Brasil em São Paulo às 05:55 da manhã e conexão final para Belo Horizonte às 16:55 (Voo QKZXEP).	f	2026-11-11 13:23:37.35591+00
7e24dbc2-70b4-4653-87c5-c178be35261a	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Voo LA 3047 — Confins → Congonhas	2027-03-24	\N	Voo LA 3047 — Confins → Congonhas	0.00	Saída às 20:25 e chegada às 21:40. Tarifa Economy Light, somente bagagem de mão.\n\n💡 Dica: Congonhas e Guarulhos são aeroportos diferentes: planeje o transporte até o hotel.	f	2026-11-11 13:18:24.157475+00
a9c4b36f-6108-40f5-bb6e-80319b1160c5	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Airport Hotel Gru	2027-03-24	\N	Airport Hotel Gru	0.00	Check-in a partir das 13:30 (reserva 6950.868.242, PIN 6109). Noite em Guarulhos antes do voo das 09:00.	f	2026-11-11 13:18:24.157475+00
f29e2a6d-8b74-40c8-87b7-d88a630ef7a6	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Voo G3 7638 — Guarulhos → Viru Viru	2027-03-25	09:00:00	Voo G3 7638 — Guarulhos → Viru Viru	0.00	Saída às 09:00 e chegada às 11:05 (horário local). Voo direto de 3h05.\n\n💡 Dica: Chegue ao aeroporto com antecedência: é voo internacional.	f	2026-11-11 13:18:24.157475+00
d5113b75-c416-4348-86e9-d333dbf3bc73	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Check-in — Hotel By Armonía	2027-03-25	14:00:00	Check-in — Hotel By Armonía	0.00	Deslocamento do aeroporto, check-in e acomodação (reserva 5354.777.647, PIN 0783). Café da manhã incluso.\n\n💡 Dica: O pagamento é feito no hotel, em dólares. Confirme a cama extra para o terceiro hóspede.	f	2026-11-11 13:18:24.157475+00
b63a3586-a790-4061-a557-217b790e6354	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Plaza 24 de Septiembre	2027-03-25	\N	Plaza 24 de Septiembre	0.00	Conhecer a principal praça da cidade, observar a arquitetura, os cafés e o movimento local.\n\nMaps: https://www.google.com/maps/search/?api=1&query=Plaza%2024%20de%20Septiembre%2C%20Centro%2C%20Santa%20Cruz%20de%20la%20Sierra%2C%20Bolivia	f	2026-11-11 13:18:24.157475+00
0a35e9ed-79aa-4684-9313-051d523a6831	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Catedral Metropolitana de San Lorenzo	2027-03-25	\N	Catedral Metropolitana de San Lorenzo	0.00	Visitar a principal catedral de Santa Cruz e conhecer sua arquitetura e importância histórica.\n\nMaps: https://www.google.com/maps/search/?api=1&query=Catedral%20Metropolitana%20de%20San%20Lorenzo%2C%20Plaza%2024%20de%20Septiembre%2C%20Santa%20Cruz%20de%20la%20Sierra%2C%20Bolivia	f	2026-11-11 13:18:24.157475+00
c5caee4f-4896-4b81-8ded-27357c5c5e28	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Centro Histórico	2027-03-25	\N	Centro Histórico	0.00	Caminhada pelas ruas centrais e jantar em restaurante de gastronomia boliviana.\n\n🍽️ Restaurantes: Perto da Catedral: Resto-Bar Punto Mágico (temático) e El Bosque de las Hadas.	f	2026-11-11 13:18:24.157475+00
d900fa0c-1542-4bb9-ae42-1c3a176cba42	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Cristo Redentor	2027-03-26	\N	Cristo Redentor	0.00	Conhecer um dos monumentos mais conhecidos de Santa Cruz e aproveitar para fotografar a região.\n\nMaps: https://www.google.com/maps/search/?api=1&query=Cristo%20Redentor%2C%20Avenida%20Monse%C3%B1or%20Rivero%2C%20Santa%20Cruz%20de%20la%20Sierra%2C%20Bolivia	f	2026-11-11 13:18:24.157475+00
d9fdcad6-d283-43c0-87ad-455f9d246273	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Centro de Santa Cruz	2027-03-26	\N	Centro de Santa Cruz	0.00	Explorar ruas, praças e pontos de interesse cultural da cidade.\n\nArredores: Casa Cultural Melchor Pinto, Manzana Uno e Parque El Arenal.	f	2026-11-11 13:18:24.157475+00
66d193ea-497e-4344-acdb-55f52494ade6	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Restaurante de gastronomia regional	2027-03-26	\N	Restaurante de gastronomia regional	0.00	Experimentar pratos típicos da região de Santa Cruz, como majadito, locro e sonso.\n\n🍽️ Restaurantes: La Casa del Camba — majadito, pacumutu e parrilla.	f	2026-11-11 13:18:24.157475+00
1d2969cd-bf17-465e-bb6f-f314e19abb1a	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Equipetrol	2027-03-26	\N	Equipetrol	0.00	Conhecer a região moderna da cidade, suas avenidas, cafés e estabelecimentos comerciais.	f	2026-11-11 13:18:24.157475+00
952e9133-d958-442f-a12c-87f57cf71e5d	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Jantar em Equipetrol	2027-03-26	\N	Jantar em Equipetrol	0.00	Jantar em restaurante temático ou especializado em carnes.\n\n🍽️ Restaurantes: El Arriero (parrilla, Av. San Martín) ou Aviator Wings & Beer (temático de aviação).	f	2026-11-11 13:18:24.157475+00
4ed8d2d0-06d3-4cb7-8486-f3c0a4649db5	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Saída de Santa Cruz de la Sierra	2027-03-27	07:00:00	Saída de Santa Cruz de la Sierra	0.00	Saída para a excursão em direção a Samaipata.	f	2026-11-11 13:18:24.157475+00
1a7358cd-bccc-4f7e-98a7-dbfac75bce35	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	El Fuerte de Samaipata	2027-03-27	\N	El Fuerte de Samaipata	0.00	Visitar o sítio arqueológico pré-colombiano reconhecido como Patrimônio Mundial da UNESCO. Conhecer as estruturas arqueológicas e as enormes esculturas e gravuras na rocha.\n\nMaps: https://www.google.com/maps/search/?api=1&query=El+Fuerte+de+Samaipata,+Bolivia	f	2026-11-11 13:18:24.157475+00
07eab954-da12-4c60-9e22-285630ff9ffd	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Centro de Samaipata	2027-03-27	\N	Centro de Samaipata	0.00	Experimentar a gastronomia local e conhecer o pequeno povoado.	f	2026-11-11 13:18:24.157475+00
4b804101-0f14-4da7-a998-ff8cf528b9c1	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Centro histórico de Samaipata	2027-03-27	\N	Centro histórico de Samaipata	0.00	Caminhar pelas ruas, conhecer as construções locais, lojas de artesanato e aproveitar as paisagens da região.	f	2026-11-11 13:18:24.157475+00
10e1417d-2739-4518-8f39-830b9163a6f6	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Retorno a Santa Cruz	2027-03-27	\N	Retorno a Santa Cruz	0.00	Deslocamento de volta para a hospedagem.	f	2026-11-11 13:18:24.157475+00
7e6fe8a5-6ee6-41f4-9b42-b4d544ab3fad	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Biocentro Güembé	2027-03-28	09:00:00	Biocentro Güembé	0.00	Visitar um complexo de natureza e lazer com jardins tropicais, borboletário, orquidário, aves e áreas verdes.\n\n💡 Dica: Levar repelente, protetor solar e roupa de banho.\n\nMaps: https://www.google.com/maps/search/?api=1&query=Biocentro%20Guembe%2C%20Camino%20a%20Porongo%20Km%205%2C%20Urubo%2C%20Santa%20Cruz%20de%20la%20Sierra%2C%20Bolivia	f	2026-11-11 13:18:24.157475+00
0f60bcf8-c3e2-4f19-a6be-31a8c8b549a7	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Borboletário e Orquidário	2027-03-28	\N	Borboletário e Orquidário	0.00	Conhecer os ambientes naturais e observar espécies de borboletas, aves e plantas.	f	2026-11-11 13:18:24.157475+00
4634b4bd-2eeb-4998-b514-4db1d61806fc	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Restaurante do complexo	2027-03-28	\N	Restaurante do complexo	0.00	Fazer uma refeição no próprio complexo ou em estabelecimento próximo.	f	2026-11-11 13:18:24.157475+00
972ba941-2c07-489e-a933-16db3b90b91c	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Áreas de lazer do Biocentro Güembé	2027-03-28	\N	Áreas de lazer do Biocentro Güembé	0.00	Aproveitar piscinas, jardins, trilhas e demais atividades disponíveis.	f	2026-11-11 13:18:24.157475+00
8a9ac17a-66cb-4a48-869f-8c6cb86b18cc	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Check-In Hotel	2026-12-17	23:59:00	Gramado	0.00	\N	f	2026-11-13 13:11:08.260337+00
300947c2-5717-4d10-93c5-f96e56a822f6	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Equipetrol	2027-03-28	\N	Equipetrol	0.00	Retorno à hospedagem e jantar tranquilo.	f	2026-11-11 13:18:24.157475+00
6b1cfadb-e6ee-4186-9f00-faba57828cb6	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Mercado Mutualista	2027-03-29	\N	Mercado Mutualista	0.00	Conhecer um mercado popular, observar produtos locais, artesanato e o cotidiano da cidade.\n\nMaps: https://www.google.com/maps/search/?api=1&query=Mercado%20Mutualista%2C%20Santa%20Cruz%2C%20Santa%20Cruz%20de%20la%20Sierra%2C%20Bolivia	f	2026-11-11 13:18:24.157475+00
875f315b-f33d-4278-82d6-15b7e49109cc	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Mercado Los Pozos	2027-03-29	\N	Mercado Los Pozos	0.00	Explorar o comércio popular e conhecer produtos e artigos regionais.\n\nMaps: https://www.google.com/maps/search/?api=1&query=Mercado%20Los%20Pozos%2C%20Santa%20Cruz%2C%20Santa%20Cruz%20de%20la%20Sierra%2C%20Bolivia	f	2026-11-11 13:18:24.157475+00
56390d5b-49ac-42c4-8cd7-3003491d64b0	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Restaurante escolhido pela família	2027-03-29	\N	Restaurante escolhido pela família	0.00	Almoço em restaurante de carnes, pizzaria ou gastronomia internacional.\n\n🍽️ Restaurantes: Vaca Morena, Noi Pizzeria ou Brasargent Churrasquería.	f	2026-11-11 13:18:24.157475+00
19bfdc43-03f9-490a-8bbc-22df907363bc	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Ventura Mall	2027-03-29	\N	Ventura Mall	0.00	Passear pelo shopping, conhecer lojas, comprar lembranças e aproveitar as opções de entretenimento.\n\nMaps: https://www.google.com/maps/search/?api=1&query=Ventura%20Mall%2C%20Avenida%20San%20Mart%C3%ADn%2C%20Equipetrol%20Norte%2C%20Santa%20Cruz%20de%20la%20Sierra%2C%20Bolivia	f	2026-11-11 13:18:24.157475+00
5eb7c5df-c057-40f0-97d1-33caeddaafd6	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Jantar de despedida	2027-03-29	\N	Jantar de despedida	0.00	Jantar especial de despedida em restaurante temático ou italiano em Equipetrol.\n\n🍽️ Restaurantes: Jardín de Asia (Green Tower), In Piazza ou Michelangelo Ristorante.	f	2026-11-11 13:18:24.157475+00
85e7cb47-1ff6-4d7a-a1b3-833c9d071bfd	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Café da manhã e check-out — Hotel By Armonía	2027-03-30	\N	Café da manhã e check-out — Hotel By Armonía	0.00	Café da manhã, organização das malas e check-out. O limite é 12:30, mas o voo sai antes.	f	2026-11-11 13:18:24.157475+00
e713741f-e84e-4a6e-b0fe-6e072158a4d3	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Compras de última hora	2027-03-30	\N	Compras de última hora	0.00	Caso exista tempo disponível, fazer compras de última hora ou tomar um café.\n\n💡 Dica: O tempo é curto: para um voo internacional às 12:05, o ideal é estar em Viru Viru por volta das 09:30.	f	2026-11-11 13:18:24.157475+00
51bc2317-11af-4b3d-9915-06ecc895de0a	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Aeroporto Internacional Viru Viru	2027-03-30	\N	Aeroporto Internacional Viru Viru	0.00	Deslocamento para o aeroporto e embarque de retorno.	f	2026-11-11 13:18:24.157475+00
ee927844-11ce-4ca6-8eb6-8919805fd53a	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Voo G3 7639 — Viru Viru → Guarulhos	2027-03-30	12:05:00	Voo G3 7639 — Viru Viru → Guarulhos	0.00	Saída às 12:05 (horário local) e chegada às 15:55. Voo direto de 2h50.	f	2026-11-11 13:18:24.157475+00
8bd9871e-36fe-4bf7-ac63-5dfdf249bb12	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Airport Hotel Gru	2027-03-30	\N	Airport Hotel Gru	0.00	Check-in a partir das 13:30 (reserva 5123.871.526, PIN 9268). Noite em Guarulhos.	f	2026-11-11 13:18:24.157475+00
dd5099cc-c1cb-4091-8736-a62d6f321e40	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Voo LA 4642 — Congonhas → Confins	2027-03-31	\N	Voo LA 4642 — Congonhas → Confins	0.00	Saída às 14:00 e chegada às 15:05.\n\n💡 Dica: O voo sai de Congonhas (CGH), não de Guarulhos: reserve o deslocamento entre aeroportos com folga.	f	2026-11-11 13:18:24.157475+00
81656a9d-bc10-415a-8c79-2a11597d6c0f	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Dormir Cedo - Sair de madrugada	2026-12-21	20:00:00	Gramado	0.00	\N	f	2026-11-13 13:12:20.380304+00
e778da13-6a3a-404e-8261-610f61b461a7	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Vale dos Dinossauros Canela (Passaporte Dreams)	\N	\N	Estrada do Caracol, 1600 - Canela - RS	0.00	Parque ecológico com réplicas animatrônicas gigantes. Fica na rota do Caracol em Canela.	f	2026-11-13 13:18:13.110307+00
78ec1e21-975a-4e0a-a2a8-1d9696dcac30	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Jardim do Amor (Passaporte Dreams)	\N	\N	Av. das Hortênsias, 765 - Vila Suíça, Gramado - RS	0.00	Espaço instagramável ao lado do Casamento dos Sonhos.	f	2026-11-13 13:18:13.110307+00
6538321c-cb86-4364-a29a-64b7ffc69379	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Super Carros (Passaporte Dreams)	2026-12-19	11:41:00	Av. das Hortênsias, 4635 - Carniel, Gramado - RS	0.00	Supermáquinas, simuladores F1 e loja temática.	f	2026-11-13 13:18:13.110307+00
18033276-42ed-4b5d-b783-46f962b010df	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Passei Mini Mundo	2026-12-21	10:00:00	Rua Horacio Cardoso 291 , Planalto - Gramado	70.00	\N	f	2026-11-16 11:39:32.227344+00
\.


--
-- Data for Name: checklist_items; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.checklist_items (id, trip_id, family_id, kind, title, owner_name, done, created_at, responsible_type, priority, source, is_optional, due_date) FROM stdin;
fda983c0-b9c0-4922-9313-37a46df4eeac	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	antes_viagem	Conferir documentos necessários para a viagem	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
e5f496b0-49d5-4244-92f2-e99919cf621c	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	antes_viagem	Verificar validade dos documentos de identificação	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
1b7220d8-6416-4e8f-911e-99f0902119c1	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	antes_viagem	Conferir passagens aéreas ou rodoviárias	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
8489852c-8d7b-4fcf-96d7-7f6f070faa51	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	antes_viagem	Confirmar reservas de hospedagem	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
a0204c4b-7bf6-408e-8d26-bc302d12d43d	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	antes_viagem	Conferir horários de check-in e check-out	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
87e33960-6ff9-4ffb-ba59-0463bbac57e6	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	antes_viagem	Verificar regras de bagagem	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
619f5f8a-1438-40ce-a06d-f8813179b9d3	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	antes_viagem	Contratar ou conferir seguro-viagem, quando necessário	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
60f955ee-dd32-48cc-a849-836f96a5bd8f	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	antes_viagem	Consultar previsão do tempo no destino	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
cb68ec6e-a1f8-4345-8574-8bdd64c1189c	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	antes_viagem	Pesquisar atrações e passeios	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
4867bf02-930e-4124-a250-b0c29e90bd3f	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	antes_viagem	Baixar comprovantes de reservas e passagens	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
62dbc396-e1cb-4517-a333-0bee9d650e9e	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	antes_viagem	Compartilhar roteiro com familiares	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
01da8071-b3df-4923-974c-c0951e660f04	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	documentos_dinheiro	Separar RG, CNH ou passaporte	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
45adde15-710d-4e4e-83c9-f27a14fe8de9	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	documentos_dinheiro	Conferir vistos e autorizações de entrada	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
84c4afdb-20ed-43c2-a624-3d267f0853d9	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	documentos_dinheiro	Separar cartões de crédito e débito	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
be480efb-498d-42b6-8eba-00ac54512052	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	documentos_dinheiro	Habilitar cartões para uso internacional, se necessário	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
3393968c-5883-4e43-ac68-541902a212e2	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	documentos_dinheiro	Separar dinheiro em espécie	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
48d8929e-dc0e-493d-8ddb-43271214fdf0	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	documentos_dinheiro	Conferir limites dos cartões	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
846f64e7-cb0c-4824-948b-334c478b680e	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	documentos_dinheiro	Salvar cópias digitais dos documentos	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
1e7086ac-0af8-4b39-a613-9307bd9d4179	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	documentos_dinheiro	Anotar contatos de emergência	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
26f9a3aa-9311-4512-a04a-758530e59cd5	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	documentos_dinheiro	Conferir documentos de todos os viajantes	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
aef81eaa-14e1-48e0-b0ba-875e883357af	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	eletronicos	Separar carregadores de celulares	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
795b7289-aac7-42e4-b9fb-0fa003fc2ada	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	eletronicos	Separar carregadores de outros dispositivos	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
c9bff5cd-4f73-4538-916d-7f1d910a8a53	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	eletronicos	Levar power bank carregado	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
4691bc35-d7f3-4b02-992c-b357a84effe2	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	eletronicos	Conferir adaptadores de tomada	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
1beb1912-2b75-4c8a-8e4e-8a763323149c	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	eletronicos	Baixar mapas offline do destino	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
241599cc-5824-4ac4-9b88-843aae9c0481	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Passaporte válido por no mínimo 6 meses (ou RG em perfeito estado)	Família	f	2026-11-11 13:18:34.189514+00	family	normal	template	f	\N
a35b4722-7e8d-4b30-a1d5-27853453927c	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Seguro Viagem internacional ativo (Mastercard Black / AIG)	maluki	f	2026-11-11 13:18:34.189514+00	family	normal	template	f	\N
93810664-b7db-4d49-b540-8c4cab6a625a	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Habilitar cartões para uso internacional e configurar conta global (Nomad/Wise)	maluki	f	2026-11-11 13:18:34.189514+00	family	normal	template	f	\N
23a6fa1c-9559-4dce-bb1b-27d1afaca256	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Levar dinheiro em espécie (pesos chilenos / dólares para emergência)	maluki	f	2026-11-11 13:18:34.189514+00	family	normal	template	f	\N
62e1c006-9821-465a-b673-8299bc4f136f	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Comprar ingressos antecipados para Parque Farellones (Tubing)	maluki	f	2026-11-11 13:18:34.189514+00	family	normal	template	f	\N
c651c3bc-3df6-4ae9-8964-ef2ad470cbb3	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	eletronicos	Baixar passagens e documentos no celular	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
a8fdfa03-2a2a-44dd-bbf2-a2ecf7b5c538	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	eletronicos	Conferir aplicativos de viagem	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
8344eadd-762a-43a6-9ff3-7a3778b6ff92	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	eletronicos	Verificar plano de internet ou roaming	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
7b33318d-c764-4cca-b1c0-9231e0666bb7	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	eletronicos	Separar fones de ouvido	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
6fa8441d-6a4c-4195-af86-7847d434732c	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	mala_roupas	Separar roupas adequadas ao clima	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
79e73c93-14a3-45be-9c85-0671f1856afc	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	mala_roupas	Separar roupas íntimas e meias	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
6abef605-edfe-4694-bc70-387233e0f4fd	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	mala_roupas	Separar pijamas	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
960dcc39-a86a-4305-8c80-ad1adea7a5ad	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	mala_roupas	Separar calçados adequados	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
efe6c4c6-fe54-45d3-8b2a-2bdefc623064	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	mala_roupas	Separar casacos e agasalhos, se necessário	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
608f5a7c-84ae-4ddb-980e-6718523eee11	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Verificar funcionamento dos atrativos na Semana Santa	Família	f	2026-11-11 13:18:24.157475+00	family	normal	template	f	\N
11343468-6973-4f97-9da6-85639ff97c41	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Emitir bilhetes e apólices do seguro MasterAssist / AIG	maluki	t	2026-11-11 13:18:24.157475+00	family	normal	template	f	\N
b439b186-a384-4c97-923f-7c0f0de7e3bc	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Planejar transfer entre Congonhas e Guarulhos na volta	Família	f	2026-11-11 13:18:24.157475+00	family	normal	template	f	\N
63fdb0b4-2af2-41a2-a4b2-0f570ce1c8e8	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Passaportes válidos de todos os viajantes	Família	t	2026-11-11 13:18:24.157475+00	family	normal	template	f	\N
ab20534a-4747-4e91-9fed-caaae0092809	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Repelente e protetor solar (Biocentro Güembé e Samaipata)	Família	f	2026-11-11 13:18:24.157475+00	family	normal	template	f	\N
d3480072-25f7-41ce-983e-107d458f1790	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Roupas de banho para áreas de lazer e piscina	Família	f	2026-11-11 13:18:24.157475+00	family	normal	template	f	\N
fc54c4a5-ee75-420d-8400-2c2477e775d8	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Carregadores de celular e adaptadores de tomada	Família	f	2026-11-11 13:18:24.157475+00	family	normal	template	f	\N
c70a4a2c-47d1-42d6-b072-054819f7c1d3	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Farmacinha básica e receitas médicas	Família	f	2026-11-11 13:18:24.157475+00	family	normal	template	f	\N
17cf7b26-4479-4737-9583-deeac0fa3898	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	mala_roupas	Separar roupas de banho, se necessário	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
17e35237-ef5b-4895-98d3-5b9bbd245daa	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	mala_roupas	Separar acessórios pessoais	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
111a4537-e032-431c-bf12-4c4c82caaccd	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	mala_roupas	Separar óculos de sol	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
6fee1c4c-9f61-4790-ad68-6892aabdf87b	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	mala_roupas	Conferir peso e dimensões da bagagem	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
f745bef3-194e-444f-985a-5666b9047e2f	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	mala_roupas	Identificar malas com etiquetas	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
6e938fc1-de38-458b-ac9f-d4c0ee18253b	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	higiene	Escova e creme dental	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
7bed6171-544a-4151-a037-ceb5ada5f123	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	higiene	Shampoo e condicionador	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
14ba0ece-9129-49ae-b7aa-568d1eed374e	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	higiene	Sabonete	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
fb766051-b6b4-44f4-8a63-ea9d156f7410	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	higiene	Desodorante	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
7003f1f2-6b89-4dab-b655-b5dd294863be	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	higiene	Protetor solar	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
32e30571-0078-4561-b620-9c8812e5422b	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Roupas térmicas / segunda pele (calça e blusa) para o frio dos Andes	Família	f	2026-11-11 13:18:34.189514+00	family	normal	template	f	\N
dcd0320e-53ea-48a0-a88e-7f71fcff33bf	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Casacos e calças impermeáveis próprios para neve	Família	f	2026-11-11 13:18:34.189514+00	family	normal	template	f	\N
b6db8912-ee2b-4c00-83c9-0c2d3f9c4f06	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Botas impermeáveis com solado aderente para neve e gelo	Família	f	2026-11-11 13:18:34.189514+00	family	normal	template	f	\N
fa11d82a-35c3-47e5-ae57-aac3cdba124d	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Luvas impermeáveis, gorros, cachecóis e protetor de orelha	Família	f	2026-11-11 13:18:34.189514+00	family	normal	template	f	\N
d4a7cce6-6bc5-47f3-8023-1acce2c76432	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Óculos escuros (essencial pelo reflexo do sol na neve branca)	Família	f	2026-11-11 13:18:34.189514+00	family	normal	template	f	\N
3acbcc06-c4ec-4681-ab4d-10140d883aa3	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Protetor solar e protetor labial hidratante para o clima seco e neve	Família	f	2026-11-11 13:18:34.189514+00	family	normal	template	f	\N
5c5c96ec-894a-4f55-9ad2-5a64702ebb1d	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Remédio para enjoo (Dramin/Vonau para as curvas da montanha)	Família	f	2026-11-11 13:18:34.189514+00	family	normal	template	f	\N
6bd8f465-b4ef-463c-a6df-c943c555bfa6	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Farmacinha básica (analgésicos, antitérmicos, descongestionante nasal)	Família	f	2026-11-11 13:18:34.189514+00	family	normal	template	f	\N
5e330143-ac58-4ea5-8963-384181a02d20	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Power bank (carregador portátil - frio descarrega bateria rápido)	maluki	f	2026-11-11 13:18:34.189514+00	family	normal	template	f	\N
703ad50b-c8fc-4b94-9a83-6e801bbcf896	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Adaptador de tomada tipo C/L compatível com o Chile	maluki	f	2026-11-11 13:18:34.189514+00	family	normal	template	f	\N
fec6e130-be40-4f79-b9ad-05dd444db6f0	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Mala dentro do limite de peso permitido (<10kg de mão)	Família	f	2026-11-11 13:18:34.189514+00	family	normal	template	f	\N
f9fd5375-7f93-4e3b-8b42-9547b08deb30	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Cadeados TSA e etiquetas de identificação de bagagem	Família	f	2026-11-11 13:18:34.189514+00	family	normal	template	f	\N
7a5d8258-4a7f-453f-b104-597adb589bbe	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Passaportes válidos por no mínimo 6 meses (Alexandre, Matheus, Cristiane)	Família	t	2026-11-11 13:18:42.070657+00	family	normal	template	f	\N
7de5eee5-0059-43a4-b2fe-129c90374301	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Visto Americano B1/B2 válido para entrada nos EUA	Família	t	2026-11-11 13:18:42.070657+00	family	normal	template	f	\N
edc1ca39-2a18-4b50-9360-2e9c61522d68	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Visto Canadense / eTA (Autorização Eletrônica de Viagem)	Família	t	2026-11-11 13:18:42.070657+00	family	normal	template	f	\N
62e9a9d7-e76b-4a25-8e70-ba8d39968c23	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Seguro Viagem Internacional contratado (Pedido nº 5988679)	maluki	t	2026-11-11 13:18:42.070657+00	family	normal	template	f	\N
2d871488-c656-40d1-abdd-ee77e3eed950	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Habilitar cartões internacionais e configurar conta global (Nomad/Wise)	maluki	t	2026-11-11 13:18:42.070657+00	family	normal	template	f	\N
3764ef3e-b878-4634-9727-e9bf922edffd	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Levar dólares em espécie (U$ 300)	maluki	f	2026-11-11 13:18:42.070657+00	family	normal	template	f	\N
f255a1eb-2e94-45fd-a876-e7768f126569	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Configurar relógio e celular com carteiras digitais (Apple Pay / Google Pay)	maluki	t	2026-11-11 13:18:42.070657+00	family	normal	template	f	\N
4e395612-b978-41bb-b17e-a6ad3367246d	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Ativar chips eSIM de internet internacional (esim.io / Roamless)	maluki	f	2026-11-11 13:18:42.070657+00	family	normal	template	f	\N
fc5b6b72-628b-457c-b8d6-5d58db497d90	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Instalar aplicativo SpotAngels (Estacionamento livre e vagas em Toronto)	maluki	t	2026-11-11 13:18:42.070657+00	family	normal	template	f	\N
01e3bfc0-2cdc-432d-90a7-894b31e96530	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Baixar mapas offline de NYC, Toronto e Niagara no Google Maps	maluki	f	2026-11-11 13:18:42.070657+00	family	normal	template	f	\N
d6d6df25-73e4-49de-b374-3cd8c0176d13	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Imprimir ou salvar QR Codes de passeios e ingressos (CN Tower, Casa Loma)	maluki	f	2026-11-11 13:18:42.070657+00	family	normal	template	f	\N
c646140a-e6d0-4426-8780-cd97f77f9742	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Mala de mão dentro do limite permitido (< 10 kg)	Família	f	2026-11-11 13:18:42.070657+00	family	normal	template	f	\N
60c57bcf-51de-450a-ad43-a0452e7133c8	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Cadeados padrão TSA e etiquetas de identificação com telefone e e-mail	Família	f	2026-11-11 13:18:42.070657+00	family	normal	template	f	\N
d7b4083b-8a25-4466-aab8-af24fcc5fd7d	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Adaptador de tomada padrão americano (dois pinos chatos)	Família	f	2026-11-11 13:18:42.070657+00	family	normal	template	f	\N
4c7920bc-6749-47a9-b3d5-ed6a790b213f	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Power bank (carregador portátil >= 10.000 mAh)	maluki	f	2026-11-11 13:18:42.070657+00	family	normal	template	f	\N
aecb31a8-7a45-4067-8472-d90bde6a8ee0	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Medicamentos de uso contínuo com laudos e receitas médicas em inglês	Família	f	2026-11-11 13:18:42.070657+00	family	normal	template	f	\N
37abf3b1-a5bf-48e4-89e2-91920b8f7c87	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Farmacinha básica (analgésicos, antitérmicos, antialérgico, band-aids)	Família	f	2026-11-11 13:18:42.070657+00	family	normal	template	f	\N
5b30122f-9b9d-4194-8b9d-d1505ed21e0f	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Casacos corta-vento e agasalhos para a brisa das Cataratas do Niágara	Família	f	2026-11-11 13:18:42.070657+00	family	normal	template	f	\N
c7aa9f26-e8e7-4660-9490-6537b2beeac9	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Passaporte válido por no mínimo 6 meses após o retorno	Família	t	2026-11-11 13:23:37.35591+00	family	normal	template	f	\N
3068914b-4921-4cf9-9cc5-18519e38eb29	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Verificar requisitos de entrada: ETIAS (União Europeia) e UK ETA (Reino Unido)	Família	t	2026-11-11 13:23:37.35591+00	family	normal	template	f	\N
c5727bde-101e-4b2e-836e-ac5db28e0418	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Seguro Viagem Europa com cobertura médica mínima de € 30.000 (Tratado de Schengen)	maluki	t	2026-11-11 13:23:37.35591+00	family	normal	template	f	\N
9867bad8-2d32-45e1-bb76-7e735c6f1424	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Habilitar cartões internacionais (Nomad/Wise) e levar € 400 em espécie	maluki	t	2026-11-11 13:23:37.35591+00	family	normal	template	f	\N
e0081c35-6380-4c21-9e40-391239e0c0e2	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Configurar celulares e relógios com carteiras digitais (Apple Pay / Google Pay)	maluki	t	2026-11-11 13:23:37.35591+00	family	normal	template	f	\N
6db89f00-aa90-49cc-809c-37020e1f1cac	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Comprar ingressos antecipados com horário marcado para a Disneyland Paris	maluki	t	2026-11-11 13:23:37.35591+00	family	normal	template	f	\N
42e3f26e-1b3c-4238-b181-009604a17cc8	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Comprar ingressos antecipados para o Museu do Louvre e Sainte-Chapelle	maluki	t	2026-11-11 13:23:37.35591+00	family	normal	template	f	\N
bbdcfd73-591f-4d46-b727-44d52ab8ca28	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Comprar ingressos antecipados com data fixa para a Casa de Anne Frank em Amsterdã	maluki	t	2026-11-11 13:23:37.35591+00	family	normal	template	f	\N
ca003a9f-5189-49e5-87a0-adf604db2fd3	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Baixar passagens do Eurostar e cartões de embarque da Iberia offline	maluki	t	2026-11-11 13:23:37.35591+00	family	normal	template	f	\N
935dee84-75dc-42b9-a709-1d2fee570401	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Ativar chips eSIM de internet internacional com cobertura Europa + Reino Unido	maluki	f	2026-11-11 13:23:37.35591+00	family	normal	template	f	\N
3f4a86a9-999f-48e9-a2ae-653277a84537	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Baixar mapas offline de Paris, Londres e Amsterdã no Google Maps	maluki	f	2026-11-11 13:23:37.35591+00	family	normal	template	f	\N
41138fb6-87a9-4c20-a3ef-ed1976c0f2fb	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Mala de mão dentro do limite permitido (< 10 kg)	Família	f	2026-11-11 13:23:37.35591+00	family	normal	template	f	\N
042aeae9-be10-4c18-bfc3-7f4f0e698253	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Adaptador universal de tomadas (Tipo C para Europa e Tipo G para o Reino Unido)	Família	f	2026-11-11 13:23:37.35591+00	family	normal	template	f	\N
d0680c0e-b11c-4f92-8eaa-5c4aea2ad290	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Power bank (carregador portátil >= 10.000 mAh)	maluki	f	2026-11-11 13:23:37.35591+00	family	normal	template	f	\N
de9f253b-e743-46a6-8870-9a7aea0ba0f1	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Cadeados padrão TSA e etiquetas de identificação nas bagagens	Família	f	2026-11-11 13:23:37.35591+00	family	normal	template	f	\N
0feaff20-6aa3-49bf-bd8d-7bf55def475a	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Medicamentos de uso contínuo com receitas médicas em inglês	Família	f	2026-11-11 13:23:37.35591+00	family	normal	template	f	\N
ff5f1d5f-a4ad-4500-8010-e386e4b202c4	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	bagagem	Casacos corta-vento impermeáveis e sapatos confortáveis para muitas caminhadas	Família	f	2026-11-11 13:23:37.35591+00	family	normal	template	f	\N
2b89bbc2-7c55-4225-890b-d02e4752b353	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Reservar transfer/agência para o dia de Farellones (evitar dirigir nas 40 curvas)	Família	f	2026-11-11 13:18:34.189514+00	family	normal	template	f	\N
0ea971d4-8077-45c0-bcc9-c7b2aa01366f	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Reservar ingressos/tour do Parque Safari Rancagua	maluki	f	2026-11-11 13:18:34.189514+00	family	normal	template	f	\N
40140cee-c097-4509-836b-7c4767d64cca	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Baixar mapas offline de Santiago e Farellones no Google Maps	maluki	f	2026-11-11 13:18:34.189514+00	family	normal	template	f	\N
71eab868-c421-40d3-adba-a84873861500	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Configurar chip internacional / eSIM de dados para o Chile	maluki	f	2026-11-11 13:18:34.189514+00	family	normal	template	f	\N
fca1db21-ade5-4416-88d4-c157a839f445	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	preparo	Salvar comprovantes de hospedagem (Airbnb Auroras) e voos offline	maluki	f	2026-11-11 13:18:34.189514+00	family	normal	template	f	\N
9405d843-b63e-46a1-ad6c-11259af9a010	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	higiene	Hidratante	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
2c6d9aa9-90fb-4c2c-a72d-29f87b6e4b21	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	higiene	Perfume	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
e736b875-5680-4e8a-bccb-23288c5040fe	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	higiene	Escova ou pente de cabelo	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
be2ba970-9ef7-4d3e-83fc-b7a92b3e3473	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	higiene	Produtos de higiene pessoal	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
66e33f40-c9eb-49cc-97c1-e8d546ba59cb	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	higiene	Itens de cuidados específicos	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
faba9c4c-50c0-476b-b303-ffe4252e686f	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	saude	Separar medicamentos de uso contínuo	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
c9e30998-f5f0-42a8-be88-9970da8d8aa2	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	saude	Separar receitas médicas, se necessário	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
94a76591-f945-4b1d-8e8d-01f2cefe3249	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	saude	Levar medicamentos básicos	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
0eae65d7-179e-4c82-bc21-3302e4be7142	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	saude	Separar itens de primeiros socorros	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
67eba4c7-088d-453b-9b8c-8696a39a9c13	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	saude	Conferir vacinas exigidas para o destino	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
1d7809a0-4d45-4326-8e0d-ddbe0c4ccf24	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	saude	Separar óculos de grau ou lentes de contato	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
da852695-deba-4dde-9dcd-9104c87d1ceb	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	saude	Levar itens de uso pessoal ou ortopédico	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
7970c2e9-b7f0-46ef-8504-b655a9268ecd	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	casa	Conferir portas e janelas	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
018abcdc-932b-4022-862e-75e39e93266b	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	casa	Desligar aparelhos eletrônicos desnecessários	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
e4b1a42f-e697-48d9-8dfc-7382c3bb2339	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	casa	Retirar lixo	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
a7e1bbc2-8fbc-4040-a7f3-1d3de21cdedd	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	casa	Verificar geladeira e alimentos perecíveis	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
e65e0681-2dda-4698-a7db-e317ddda9bcc	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	casa	Fechar registros de água e gás, quando apropriado	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
500d7d20-04bd-4fa0-b73a-6ca0b642bedd	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	casa	Desligar luzes	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
4f8211f5-e9e5-479f-a5b4-4acaa75c3048	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	casa	Organizar plantas e cuidados com animais	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
0a109be5-d448-4c34-bb9f-15a97728a09f	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	casa	Deixar cópia da chave com alguém de confiança	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
b0264a9a-31ee-4b43-91d8-69e1acb08c54	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	dia_viagem	Conferir documentos e passagens	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
cf2c3371-bb0b-4425-bd5a-67ca7d513455	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	dia_viagem	Conferir carteira, dinheiro e cartões	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
fe6d0011-c0a8-4326-b538-c9b766e9f021	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	dia_viagem	Conferir celulares e carregadores	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
49233342-8941-47fb-8b2e-8c4bbc632ffc	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	dia_viagem	Conferir todas as malas	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
4893692c-6277-446b-8474-e1b64ba23483	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	dia_viagem	Conferir transporte até aeroporto ou rodoviária	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
897e7d5f-573a-4cdd-aedc-38324a812267	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	dia_viagem	Fazer check-in, quando disponível	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
4620ce4e-8b57-4479-a7db-80afcf4d6142	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	dia_viagem	Conferir horário de embarque	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
3775e552-be13-4156-b0b3-16b80adfe545	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	dia_viagem	Chegar com antecedência ao local de embarque	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
849a0560-f4d1-42fa-8277-0bcd762f68b2	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	dia_viagem	Realizar check-in online antecipado	maluki	f	2026-11-11 16:32:39.832227+00	individual	high	template	f	\N
ba1b1961-8026-4c6b-9628-ff46bdc0f525	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	antes_viagem	Conferir franquia e limites de bagagem despachada	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
697d3f92-62f4-45b5-b937-9bba8eb14f5b	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	mala_roupas	Verificar regras de bagagem de mão e líquidos (< 100ml)	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
0aead090-6bb2-4c63-92b6-a5197bea423e	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	dia_viagem	Conferir portão e horário de embarque no aeroporto	Família	f	2026-11-11 16:32:39.832227+00	family	high	template	f	\N
1ff426f5-aecb-430f-87b3-951438b9c192	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	mala_roupas	Separar roupas térmicas e segunda pele (calça e blusa)	Família	f	2026-11-11 16:32:39.832227+00	family	high	template	f	\N
d03f7be7-c613-43a2-9d51-833951c41c11	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	mala_roupas	Separar luvas, gorros e cachecóis	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
e8474953-a24d-434e-bb2f-3e1fff275928	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	mala_roupas	Separar casacos de frio pesados e corta-vento impermeável	Família	f	2026-11-11 16:32:39.832227+00	family	high	template	f	\N
f8be3727-e67d-4f36-a7c1-49317d6ad528	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	mala_roupas	Separar calçados adequados para frio e caminhada	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
29c6c357-ae11-42cd-91bb-b770ae6bad45	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	higiene	Protetor labial hidratante para clima frio e seco	Família	f	2026-11-11 16:32:39.832227+00	family	normal	template	f	\N
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.documents (id, family_id, trip_id, reservation_id, title, kind, file_path, file_name, uploaded_by, created_at) FROM stdin;
be7cc1ed-bfc0-4b63-a983-cb6f7fcd5185	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	871a0c6a-ada1-4bf1-a311-4c52054867a7	a8b9b7b9-47d3-41e3-b30c-0885761fcfa8	Passagens Aéreas LATAM (Loc: WUXWSK) - Alexandre, Matheus e Cristiane	voucher	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/e3b85340-1d65-4575-8633-26990904136f.pdf	Maluki-Latam_Airlines_-_CUV.pdf	7e414376-4f64-4d42-b18d-2382980791c4	2026-11-13 13:06:34.018917+00
b1fa3d0b-268c-4373-9a30-ad373fd5da6e	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	871a0c6a-ada1-4bf1-a311-4c52054867a7	77072d85-c0d7-4fa7-9b71-75f7844ef940	Passagens Aéreas LATAM (Loc: WUDNXE) - Jorge e Heliana	voucher	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/faabd93e-eaa5-4a07-8186-7bd90f84b765.pdf	JojocaLilica-Latam_Airlines_-_CUV.pdf	7e414376-4f64-4d42-b18d-2382980791c4	2026-11-13 13:06:34.018917+00
c4506621-6649-4110-bb9b-d64fb217c3da	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	871a0c6a-ada1-4bf1-a311-4c52054867a7	8b364b74-9295-4fcb-96ea-e627de1aab36	JojocaLilica-Latam Airlines - CUV	voucher	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/8c607ee5-0d75-4c6b-8e40-5e4691b29c94.pdf	JojocaLilica-Latam Airlines - CUV.pdf	7e414376-4f64-4d42-b18d-2382980791c4	2026-11-13 13:07:36.469293+00
e91e0c38-4bc9-4205-a953-e00184314c08	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	871a0c6a-ada1-4bf1-a311-4c52054867a7	85adabe3-92fb-4a04-85ce-c3ddc40cf4c7	Maluki-Latam Airlines - CUV	voucher	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/4daa4608-e76f-4d61-bbee-f1e8cc7f7ed2.pdf	Maluki-Latam Airlines - CUV.pdf	7e414376-4f64-4d42-b18d-2382980791c4	2026-11-13 13:08:04.271426+00
50f7ad3e-ce8c-4f69-ade1-8e4225804ec2	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	871a0c6a-ada1-4bf1-a311-4c52054867a7	3349f1f4-493d-4546-a85f-10efe2d622a6	Passaporte Dreams (Voucher TRL 4778575) - Viajante 1	voucher	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/931031e2-a310-4f5e-8be6-4df802d9a55d.pdf	Passaporte_Dreams_Voucher_TRL4778575.pdf	7e414376-4f64-4d42-b18d-2382980791c4	2026-11-13 13:18:13.080993+00
a12d553f-a49f-47a7-ab8d-0209e1c8375b	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	871a0c6a-ada1-4bf1-a311-4c52054867a7	3349f1f4-493d-4546-a85f-10efe2d622a6	Passaporte Dreams (Voucher TRL 4778576) - Viajante 2	voucher	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/93d92db2-2487-424e-a3aa-a44ebf398529.pdf	Passaporte_Dreams_Voucher_TRL4778576.pdf	7e414376-4f64-4d42-b18d-2382980791c4	2026-11-13 13:18:13.080993+00
7b9a58be-91dc-4333-a4e4-8dfc98c38081	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	871a0c6a-ada1-4bf1-a311-4c52054867a7	3349f1f4-493d-4546-a85f-10efe2d622a6	Passaporte Dreams (Voucher TRL 4778577) - Viajante 3	voucher	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/31aa6104-cf57-47a1-9108-5ab74c629f89.pdf	Passaporte_Dreams_Voucher_TRL4778577.pdf	7e414376-4f64-4d42-b18d-2382980791c4	2026-11-13 13:18:13.080993+00
94c90ac2-0266-49e1-99cc-e54c712e5297	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	871a0c6a-ada1-4bf1-a311-4c52054867a7	3349f1f4-493d-4546-a85f-10efe2d622a6	Passaporte Dreams (Voucher TRL 4778579) - Viajante 4	voucher	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/721dc61e-c62c-45c3-b7bf-da3a8b19f05c.pdf	Passaporte_Dreams_Voucher_TRL4778579.pdf	7e414376-4f64-4d42-b18d-2382980791c4	2026-11-13 13:18:13.080993+00
dbea9751-ad06-4957-8415-9ce19b8695ec	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	871a0c6a-ada1-4bf1-a311-4c52054867a7	3349f1f4-493d-4546-a85f-10efe2d622a6	Passaporte Dreams (Voucher TRL 4778580) - Viajante 5	voucher	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/102612b7-b365-49f6-a197-0d081c648f6d.pdf	Passaporte_Dreams_Voucher_TRL4778580.pdf	7e414376-4f64-4d42-b18d-2382980791c4	2026-11-13 13:18:13.080993+00
\.


--
-- Data for Name: emergency_contacts; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.emergency_contacts (id, trip_id, family_id, name, phone, notes, created_at) FROM stdin;
0d6a3f41-99b6-457e-a60c-60c64b335f07	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	MasterAssist / Seguro Viagem (Brasil)	0800-891-3294	Em emergência médica, acione ANTES de qualquer atendimento. E-mail: bue_operadores_brasil@axa-assistance.com.ar — Site: www.mycardbenefits.com	2026-11-11 13:18:24.157475+00
e067b3b3-3839-488f-bd06-7df59b00ff6e	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	MasterAssist (Internacional a Cobrar)	+1-636-722-8882	Em emergência médica, acione ANTES de qualquer atendimento. E-mail: bue_operadores_brasil@axa-assistance.com.ar — Site: www.mycardbenefits.com	2026-11-11 13:18:24.157475+00
69862b7e-656c-4403-8ed8-cc30e4fe7f32	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	SAC AIG Seguros 24h	0800 726 6130	SAC AIG 24h: 0800 726 6130 | Ouvidoria AIG: 0800 724 0219 | SUSEP: 0800 021 8484	2026-11-11 13:18:24.157475+00
d27491bb-416f-489d-882e-4b83ee50d1f8	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Seguro Viagem Mastercard Black (Assistência)	0800-891-3294	Acionar antes de qualquer consulta ou atendimento médico.	2026-11-11 13:18:34.189514+00
e68438cd-59c9-4bdd-9410-927d772c53cb	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Consulado-Geral do Brasil em Santiago	+56 2 2840 8500	Apoio a cidadãos brasileiros em emergências no Chile.	2026-11-11 13:18:34.189514+00
9385b203-6ec8-4204-b134-fed51c57fdd3	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Carabineros de Chile (Polícia de Emergência)	133	Número nacional de emergência policial no Chile.	2026-11-11 13:18:34.189514+00
6ffdef08-b9a2-4baa-a661-57625a779f01	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Ambulância / SAMU Chile	131	Atendimento móvel de urgência médica.	2026-11-11 13:18:34.189514+00
05023c3d-649d-47e2-93f9-54050f95889a	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Seguro Viagem Internacional (Pedido nº 5988679)	0800-891-3294	Assistência médica e emergências. Confirmado para alesauer@gmail.com.	2026-11-11 13:18:42.070657+00
2083ab91-7deb-47f9-b025-4b0aa416b946	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Locadora SIXT Toronto Downtown	+1 888 749 8227	Suporte à locação do Toyota RAV4 (Reserva: 789661613).	2026-11-11 13:18:42.070657+00
4c868866-c511-46da-8367-8b0f19be154b	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Airbnb West New York (Mehmet)	+1 201 423-8926	Contato do anfitrião do apartamento em NJ (HM9KZY9FZ8).	2026-11-11 13:18:42.070657+00
04b6e8e4-58a7-45f3-b9c1-2f856adbfc43	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Airbnb Toronto (Willian)	+1 416-705-4060	Contato do anfitrião do apartamento em Toronto (HMCN3ENATY).	2026-11-11 13:18:42.070657+00
8ddf46c6-3c00-4578-8449-3433cd6143b3	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Consulado-Geral do Brasil em Nova York	+1 917 777-7777	Plantão consular de emergência para brasileiros nos EUA.	2026-11-11 13:18:42.070657+00
04060b96-23d9-459e-9676-3ed9ddba5da0	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Consulado-Geral do Brasil em Toronto	+1 416 922-2503	Plantão consular de emergência para brasileiros no Canadá.	2026-11-11 13:18:42.070657+00
08802f30-40c7-472b-9230-5e8fcddee946	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Seguro Viagem Internacional (Assistência Médica Europa)	+34 91 593 8690	Central internacional 24h para acionamento de urgência médica.	2026-11-11 13:23:37.35591+00
a59eea2e-43b7-418e-8d5a-df75e89554ea	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Consulado-Geral do Brasil em Paris (França)	+33 1 45 61 63 00	Plantão consular para emergências de brasileiros na França.	2026-11-11 13:23:37.35591+00
064b015b-e2ac-496a-8ccd-37a09b820ec8	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Consulado-Geral do Brasil em Londres (Reino Unido)	+44 20 7747 4500	Plantão consular para emergências de brasileiros no Reino Unido.	2026-11-11 13:23:37.35591+00
64b69877-9d94-4a5d-9236-3e7abebbd72b	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Consulado-Geral do Brasil em Amsterdã (Holanda)	+31 20 305 6310	Plantão consular para emergências de brasileiros na Holanda.	2026-11-11 13:23:37.35591+00
5eb031a1-b012-4777-ad40-b1bc0e7ae22b	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Número Europeu de Emergência Geral	112	Polícia, bombeiros e ambulância válido em toda a União Europeia e Reino Unido (999).	2026-11-11 13:23:37.35591+00
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.expenses (id, trip_id, family_id, description, category, amount, paid, paid_by, spent_on, created_at) FROM stdin;
17139765-9292-4342-84f9-6991435a1a3f	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Hospedagem Airport Hotel Gru (Ida)	hospedagem	489.00	f	maluki	2027-03-24	2026-11-11 13:18:24.157475+00
252368ec-8aa5-493b-8423-e7be03997a57	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Hospedagem Hotel By Armonía (US$ 318,55)	hospedagem	1749.00	f	maluki	2027-03-25	2026-11-11 13:18:24.157475+00
d51eddef-0f4d-46db-ba1b-05af206c5f5d	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Hospedagem Airport Hotel Gru (Volta)	hospedagem	489.00	f	maluki	2027-03-30	2026-11-11 13:18:24.157475+00
7880796a-1e4d-4d5e-9def-4596af008528	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Airbnbs New Jersey e Toronto (Hospedagens)	hospedagem	7364.50	t	maluki	2026-03-01	2026-11-11 13:18:42.070657+00
79d622cd-7526-4b23-b074-58393183d058	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Passagens Aéreas Brasil → NYC (Avianca)	transporte	3368.10	t	maluki	2026-02-15	2026-11-11 13:18:42.070657+00
ec84712c-212f-49e3-944a-7051372d756a	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Passagens Aéreas NYC → Toronto (Air Canada)	transporte	4892.50	t	maluki	2026-02-20	2026-11-11 13:18:42.070657+00
b2083f95-6c54-420a-8ee5-f70a4c193f93	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Aluguel do Carro SUV SIXT Toronto (8 dias)	transporte	2163.00	t	maluki	2026-03-05	2026-11-11 13:18:42.070657+00
61739c77-7182-4173-95d5-3d23a6c90ea7	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Alimentação Família (Estimado U$60/dia x 5.15)	alimentacao	1854.00	f	maluki	2026-03-28	2026-11-11 13:18:42.070657+00
97644c60-3e81-46e1-8ae7-0da30b95e950	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Transporte Metrô e Ônibus (MetroCard / Presto)	transporte	525.30	f	maluki	2026-03-29	2026-11-11 13:18:42.070657+00
659d4cc5-bd6a-4809-b5de-2fd4a87ac47f	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Gasolina e Pedágios no Canadá e NJ	transporte	515.00	f	maluki	2026-04-01	2026-11-11 13:18:42.070657+00
182af24e-9e75-4ec3-a12f-1a2c9b18aa58	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Previsão de Compras (Outlets e Lojas)	outros	2575.00	f	maluki	2026-04-04	2026-11-11 13:18:42.070657+00
2d0ddcc0-fc30-4847-bd75-7e4526804e56	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Chips de Internet Internacional (eSIM)	outros	10.30	t	maluki	2026-03-20	2026-11-11 13:18:42.070657+00
66cfa347-9e38-4c50-be53-fa1d822db860	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Hospedagens Europa (Paris, Londres, Amsterdã)	hospedagem	15000.00	t	maluki	2025-09-10	2026-11-11 13:23:37.35591+00
c36c3ed4-2ce7-4a47-9236-2203dcf47a51	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Passagens Aéreas Internacionais Iberia + Nacionais	transporte	13000.00	t	maluki	2025-08-15	2026-11-11 13:23:37.35591+00
e45ddc66-fa93-42ce-a207-50910da4f9b1	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Trens de Alta Velocidade Eurostar (Paris ⇄ Londres ⇄ Amsterdã)	transporte	6000.00	t	maluki	2025-08-25	2026-11-11 13:23:37.35591+00
29048c3e-4cfe-45ab-8648-5dd04469456d	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Alimentação Família (Restaurantes, Bouillons e Cafés)	alimentacao	10000.00	f	maluki	2025-10-10	2026-11-11 13:23:37.35591+00
87f90985-605d-4be2-bcde-12d4c7fbd94c	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Ingressos Atrações e Parques (Disney, Louvre, Torre, Anne Frank)	passeios	2500.00	t	maluki	2025-09-20	2026-11-11 13:23:37.35591+00
646563d5-0f31-4f04-a23c-df9d3487cde8	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Seguro Viagem Internacional Schengen & UK	outros	600.00	t	maluki	2025-09-05	2026-11-11 13:23:37.35591+00
\.


--
-- Data for Name: families; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.families (id, name, invite_code, created_by, created_at, deepseek_api_key, openai_api_key, ai_provider, webhook_url, webhook_enabled, webhook_secret, webhook_events, notification_settings) FROM stdin;
337d0855-1352-486a-9955-585d5fb02e53	Família de Teste	A8BCECBD	389440a7-4a3a-4fbe-954b-a62b34b3899a	2026-11-10 13:16:44.640968+00	\N	\N	deepseek	\N	f	\N	{trip_created}	{}
6c53c050-a005-4cc9-a8d8-b0faf6cf8d94	Família de Cristiane	72B8A17F	ff113a12-deec-403c-8a0a-3b5d80484bf1	2026-11-11 16:44:27.131405+00	\N	\N	deepseek	\N	f	\N	{trip_created}	{}
9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	Família de maluki	CC7FC1D7	7e414376-4f64-4d42-b18d-2382980791c4	2026-11-10 13:30:32.806214+00	\N	\N	deepseek	https://n8n.sauer.pro.br/webhook-test/c6ea0877-289f-4fec-b724-1822cea5a0d0	t	\N	{trip_created}	{}
\.


--
-- Data for Name: family_members; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.family_members (family_id, user_id, role, joined_at, all_trips_access, allowed_trip_ids) FROM stdin;
337d0855-1352-486a-9955-585d5fb02e53	389440a7-4a3a-4fbe-954b-a62b34b3899a	admin	2026-11-10 13:16:44.640968+00	t	{}
9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	admin	2026-11-10 13:30:32.806214+00	t	{}
6c53c050-a005-4cc9-a8d8-b0faf6cf8d94	ff113a12-deec-403c-8a0a-3b5d80484bf1	admin	2026-11-11 16:44:27.131405+00	t	{}
9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	ff113a12-deec-403c-8a0a-3b5d80484bf1	member	2026-11-11 16:44:47.215854+00	f	{0411de23-a3c5-48b1-946a-5250cee401ce,871a0c6a-ada1-4bf1-a311-4c52054867a7,1e5addaa-28ab-4591-a39b-cebc203739b3,f6666690-f85d-4304-bf33-593787114fb4,76cc0806-7088-4399-9085-35d2b78d0d2f,b98dce87-0d73-4ae2-afb1-1ee74d01ac09,501c48bd-786c-4be8-a48c-03468c7624e8,9eebe207-5a8d-4ec6-b164-c8f1a4738561,09ab65fb-458c-440d-b381-5c5208c5df13,f2b9b41a-e879-4768-8c6d-889dbedca259,009c0669-6552-437d-8c20-c207f9873591,6766db6f-0b40-4517-85f7-e3353a8b72fa,57b885fa-2358-41fd-b3e3-99b30101e9f4,1138548c-c1bb-489f-a500-ec6a016ffa22,6abe2bcd-c943-4dff-a5b2-c512ff712bdb,d613c0df-d8b7-4d82-8aa5-813a517ee438,03b4d5e4-13d2-45fe-80b7-eb7c738e8bcb,ada17cbc-d0f1-4add-8299-97bee19a7222,5d6fc587-00de-4c28-9592-479244cb5253,5a4d3f6f-23c2-4ddc-a0ca-95630b6ee0fd,64d5e410-70ca-4d4f-9661-93bc7af043cf,a8ac0d33-9076-4c38-9faf-23a06f3453af,07b43e35-3f5c-4385-b5bf-84b7623b8404,51781464-065e-4902-b10a-cdca5196b5b4,06ef901b-e6e3-4ca1-a853-b5cdc13b5d8e,df098b63-c23f-46fe-8ad5-f537461cdb91,2edfb9ff-40b9-415e-ad1e-157bae1c240a,cc05d340-5f8e-4e9f-b978-2f577e26daeb,88dc4ff2-1724-4d3d-9ca2-df4917b276bb}
\.


--
-- Data for Name: notification_history; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.notification_history (id, family_id, trip_id, event, target_key, sent_at, status, details) FROM stdin;
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.profiles (id, full_name, created_at, email, phone) FROM stdin;
389440a7-4a3a-4fbe-954b-a62b34b3899a	Teste Usuario	2026-11-10 13:16:44.640968+00	teste@malukiviagens.com	\N
7e414376-4f64-4d42-b18d-2382980791c4	maluki	2026-11-10 13:30:32.806214+00	alesauer@gmail.com	+5531995041815
ff113a12-deec-403c-8a0a-3b5d80484bf1	Cristiane Paes Leme	2026-11-11 16:44:27.131405+00	cristianepaesleme@gmail.com	+5531984197636
\.


--
-- Data for Name: reservations; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.reservations (id, trip_id, family_id, kind, title, provider, starts_at, ends_at, confirmation_code, cost, paid, notes, address, maps_url, created_at) FROM stdin;
51c018ca-528b-4b8e-aaa0-fb896579ce4c	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	voo	Voo AV 261 — Bogotá (BOG) → Rio de Janeiro (GIG)	Avianca	2026-04-05 21:55:00+00	2026-04-06 06:15:00+00	C3ULVL	0.00	t	Voo noturno de retorno para o Brasil.	\N	\N	2026-11-11 13:18:42.070657+00
4d880674-1b40-45f5-8b24-04669b219860	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	voo	Voo AV 4622 — Rio de Janeiro (GIG) → Belo Horizonte (CNF)	Avianca / Gol	2026-04-06 09:00:00+00	2026-04-06 10:10:00+00	C3ULVL	0.00	t	Chegada final em Belo Horizonte às 10:10.	\N	\N	2026-11-11 13:18:42.070657+00
33e12b06-47e2-4fe2-b758-0168a93bdfae	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	hospedagem	Airport Hotel Gru (Guarulhos)	Booking.com	2027-03-24 13:30:00+00	2027-03-25 11:30:00+00	6950.868.242	489.00	f	Quarto: Quarto Família Standard\nRefeição: Café da manhã incluso\nPIN: 6109\nTelefone: +55 11 93280 8454\nJanela de check-in: 13:30 às 14:00. Janela de check-out: 11:30 às 12:00.\nEstadia para dormir antes do voo das 09:00 de GRU para Santa Cruz.\nEstacionamento próximo ao hotel: R$ 35,00 por dia (sob reserva).	Av. Otávio Braga de Mesquita, 3055, Guarulhos, 07191-000, Brasil	https://www.google.com/maps/search/?api=1&query=Airport+Hotel+Gru,+Av.+Ot%C3%A1vio+Braga+de+Mesquita+3055,+Guarulhos	2026-11-11 13:18:24.157475+00
b7055eb0-5a6f-41c0-af5b-c4b204b24bf9	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	hospedagem	Hotel By Armonía (Santa Cruz de la Sierra)	Booking.com	2027-03-25 14:00:00+00	2027-03-30 12:30:00+00	5354.777.647	1749.00	f	Quarto: Quarto com 2 camas de solteiro\nRefeição: Café da manhã incluso\nPIN: 0783\nTelefone: +591 3 3464699\nWi-Fi e estacionamento gratuitos.\nO quarto tem 2 camas de solteiro para 3 hóspedes: confirme com o hotel a cama extra, que não está incluída no valor.\nO voo de volta sai às 12:05, antes do horário limite de check-out: faça o check-out cedo.\nCoordenadas: 17°46,651' S, 63°9,379' O.	Avenida Guapay, Calle Armonía #96, Santa Cruz de la Sierra, Bolívia	https://www.google.com/maps/search/?api=1&query=Hotel+By+Armon%C3%ADa,+Santa+Cruz+de+la+Sierra,+Bolivia	2026-11-11 13:18:24.157475+00
68883c8a-7217-4b8e-a84f-5cb7c63a6a40	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	hospedagem	Airport Hotel Gru (Guarulhos)	Booking.com	2027-03-30 13:30:00+00	2027-03-31 11:30:00+00	5123.871.526	489.00	f	Quarto: Quarto Família Standard\nRefeição: Café da manhã incluso\nPIN: 9268\nTelefone: +55 11 93280 8454\nJanela de check-in: 13:30 às 14:00. Janela de check-out: 11:30 às 12:00.\nO voo de Santa Cruz chega em GRU às 15:55; no dia seguinte o voo para BH sai de Congonhas (CGH) às 14:00.	Av. Otávio Braga de Mesquita, 3055, Guarulhos, 07191-000, Brasil	https://www.google.com/maps/search/?api=1&query=Airport+Hotel+Gru,+Av.+Ot%C3%A1vio+Braga+de+Mesquita+3055,+Guarulhos	2026-11-11 13:18:24.157475+00
aaeaa36e-8b63-464d-878d-705f018a2035	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	voo	Voo LA 3047 (CNF → CGH)	LATAM Airlines	2027-03-24 20:25:00+00	2027-03-24 21:40:00+00	EMBZQH	0.00	t	Belo Horizonte (Confins) → São Paulo (Congonhas)\nTarifa: Economy Light\nBagagem: 1 item pessoal (até 10 kg) e 1 bagagem de mão (até 12 kg). Sem bagagem despachada.\nBilhete: 957 2309538502 / 03 / 04\nPago com milhas LATAM Pass (27.938 por passageiro) e taxas no cartão. Remarcação com multa de R$ 196,90.	\N	\N	2026-11-11 13:18:24.157475+00
de7f7d42-eb9c-4253-8abb-fa88ebe99104	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	voo	Voo G3 7638 (GRU → VVI)	GOL	2027-03-25 09:00:00+00	2027-03-25 11:05:00+00	ATMTZO	0.00	t	São Paulo (Guarulhos) → Santa Cruz (Viru Viru)\nTarifa: Light\nBilhete: 127 2315244407\nO horário de chegada em Santa Cruz é local (1h a menos que Brasília). Voo internacional: chegue com antecedência.	\N	\N	2026-11-11 13:18:24.157475+00
d1eaa607-5467-406d-bc8d-96fc97e16842	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	voo	Voo G3 7639 (VVI → GRU)	GOL	2027-03-30 12:05:00+00	2027-03-30 15:55:00+00	ATMTZO	0.00	t	Santa Cruz (Viru Viru) → São Paulo (Guarulhos)\nTarifa: Light\nBilhete: 127 2315244407\nO horário de saída de Santa Cruz é local (1h a menos que Brasília).	\N	\N	2026-11-11 13:18:24.157475+00
dd4aee9f-8e74-4d37-a898-a5f41782ef1a	0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	voo	Voo LA 4642 (CGH → CNF)	LATAM Airlines	2027-03-31 14:00:00+00	2027-03-31 15:05:00+00	EMBZQH	0.00	t	São Paulo (Congonhas) → Belo Horizonte (Confins)\nTarifa: Economy Light\nBagagem: 1 item pessoal (até 10 kg) e 1 bagagem de mão (até 12 kg). Sem bagagem despachada.\nBilhete: 957 2309538502 / 03 / 04\nO voo anterior chega em Guarulhos (GRU) e este sai de Congonhas (CGH): o transporte entre aeroportos é por conta do passageiro.	\N	\N	2026-11-11 13:18:24.157475+00
01e3107e-1241-4c82-9581-11be4585f8ec	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	hospedagem	Airbnb Auroras - Centro de Santiago	Airbnb	2026-07-10 15:00:00+00	2026-07-17 11:00:00+00	\N	0.00	f	Hospedagem no centro histórico de Santiago. Perto do metrô e principais atrações.	Compañía de Jesús 1656, Centro de Santiago, 8380000 Santiago, Chile	\N	2026-11-11 13:18:34.189514+00
2ad373bb-304d-473c-8084-6705f2692342	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	voo	Voo H2 651 — São Paulo (GRU) → Santiago (SCL)	SKY Airline	2026-07-10 19:15:00+00	2026-07-10 23:35:00+00	GMGDMM	0.00	t	Saída de Belo Horizonte / São Paulo com destino a Santiago. Chegada às 23:35 e transfer para o Airbnb.	\N	\N	2026-11-11 13:18:34.189514+00
ca551e8b-d167-4152-a0bc-33f6f150dce2	1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	voo	Voo Retorno — Santiago (SCL) → São Paulo (GRU)	SKY Airline	2026-07-17 13:20:00+00	2026-07-17 18:35:00+00	GMGDMM	0.00	t	Voo de volta para casa. Saída às 13:20 e chegada às 18:35.	\N	\N	2026-11-11 13:18:34.189514+00
03d16771-cf73-41f1-baa8-240fbbe9ce63	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	hospedagem	Airbnb West New York (Mehmet) - Estadia 1	Airbnb	2026-03-28 14:00:00+00	2026-03-31 10:00:00+00	HM9KZY9FZ8	2600.00	t	Anfitrião: Mehmet (+1 201 423-8926). Check-in 14h / Check-out 10h. Perto de transporte para Manhattan e Walmart NJ.	19 64th Street, 306 West New York, NJ 07093	\N	2026-11-11 13:18:42.070657+00
2b30a8f7-4a29-4adb-8279-d7214fbbb751	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	hospedagem	Airbnb Toronto (Willian)	Airbnb	2026-03-31 14:00:00+00	2026-04-03 12:00:00+00	HMCN3ENATY	2499.37	t	Anfitrião: Willian (+1 416-705-4060). Check-in 14h / Check-out 12h. Cancelamento grátis até 25/03/2026.	138 Kenwood Avenue, Toronto, Ontário M6C 2S3, Canadá	\N	2026-11-11 13:18:42.070657+00
5d81c052-46b4-4422-a02a-88ba59f002d0	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	hospedagem	Airbnb West New York (Mehmet) - Estadia 2	Airbnb	2026-04-03 14:00:00+00	2026-04-05 10:00:00+00	HM9KZY9FZ8	2300.00	t	Retorno do Canadá para NYC antes do voo de volta ao Brasil. Anfitrião: Mehmet (+1 201 423-8926).	19 64th Street, 306 West New York, NJ 07093	\N	2026-11-11 13:18:42.070657+00
3fafdde4-7b4b-4c4c-adb9-af772c6f3512	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	veiculo	Aluguel Toyota RAV4 ou similar (SIXT)	SIXT (Parceria Livelo)	2026-03-31 12:30:00+00	2026-04-03 11:30:00+00	789661613	2163.00	t	SUV Automático, 4 portas, 5 lugares. Retirada em Toronto Downtown (12h30) e devolução no Aeroporto Billy Bishop (YTZ) às 11h30. Contato: +1 888 749 8227. Confirmado para alesauer@gmail.com.	200 Wellington St W, Cru 20, Metrocentre-wellington Tower, Toronto, Canada, M5V 3C7	\N	2026-11-11 13:18:42.070657+00
c35c6e8a-9fad-4992-af5f-216573bda1cc	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	voo	Voo AV 4612 — Belo Horizonte (CNF) → Rio de Janeiro (GIG)	Avianca / Gol	2026-03-27 20:45:00+00	2026-03-27 21:50:00+00	CBJDOS	1122.70	t	Primeiro trecho de ida. Bilhetes: Alexandre (134-2150701154), Matheus (134-2150701153), Cristiane (134-2150701152).	\N	\N	2026-11-11 13:18:42.070657+00
8048dca3-66ba-4715-9b17-298c157befcd	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	voo	Voo AV 198 — Rio de Janeiro (GIG) → Bogotá (BOG)	Avianca	2026-03-28 01:45:00+00	2026-03-28 06:05:00+00	CBJDOS	1122.70	t	Conexão internacional para os Estados Unidos via Bogotá.	\N	\N	2026-11-11 13:18:42.070657+00
19f71c22-b7f6-4afd-b81e-256f32f047e7	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	voo	Voo AV 210 — Bogotá (BOG) → Nova York (JFK)	Avianca	2026-03-28 07:05:00+00	2026-03-28 13:55:00+00	CBJDOS	1122.70	t	Chegada em Nova York às 13:55. Deslocamento para o Airbnb em West New York.	\N	\N	2026-11-11 13:18:42.070657+00
fbce5636-33e9-44b9-b08b-653a24a49f55	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	voo	Voo AC 8533 — New York (LGA Terminal B) → Toronto (YTZ)	Air Canada Express	2026-03-31 10:00:00+00	2026-03-31 11:39:00+00	A3TX2V	2446.25	t	Desembarque no aeroporto central Billy Bishop (YTZ), próximo a Downtown Toronto.	\N	\N	2026-11-11 13:18:42.070657+00
65a4ac91-9a0f-4a14-8e65-ad6200ee3103	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	voo	Voo AC 8536 — Toronto (YTZ) → New York (LGA Terminal B)	Air Canada Express	2026-04-03 14:20:00+00	2026-04-03 15:41:00+00	A3TX2V	2446.25	t	Chegar no aeroporto às 11:30 após devolução do carro. Chegada em Nova York às 15:41.	\N	\N	2026-11-11 13:18:42.070657+00
7b1b56d3-add7-4840-bcad-aa2ffc2cc7c7	f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	voo	Voo AV 211 — Nova York (JFK) → Bogotá (BOG)	Avianca	2026-04-05 15:35:00+00	2026-04-05 20:30:00+00	C3ULVL	0.00	t	Saída para aeroporto entre 11h30 e 12h. Bilhetes: Alexandre (134-2150701151), Matheus (134-2150701150), Cristiane (134-2150701149).	\N	\N	2026-11-11 13:18:42.070657+00
d9c5a739-6ddf-4e3a-bef1-b77636367556	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	hospedagem	🇫🇷 ibis Paris Place d’Italie 13ème (Paris)	Accor / Booking	2025-10-10 14:00:00+00	2025-10-14 11:00:00+00	\N	5577.00	t	4 diárias (€ 858). Café da manhã incluso. Cancelamento grátis até 09/10/2025. Excelente acesso ao metrô linha 6 para Torre Eiffel.	25 Avenue Stephen Pichon, 13º arr., 75013 Paris, França	\N	2026-11-11 13:23:37.35591+00
836bfc0b-ba4b-4f1f-938b-bd16d4762723	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	hospedagem	🇬🇧 Zedwell Piccadilly Circus (Londres)	Booking / Hotel	2025-10-14 14:00:00+00	2025-10-17 11:00:00+00	\N	3637.40	t	3 diárias (€ 559,60). Localização no coração de Londres, pertinho da London Eye, Leicester Square e Chinatown.	Great Windmill Street, Piccadilly Circus, Westminster Borough, Londres, Reino Unido	\N	2026-11-11 13:23:37.35591+00
bfcccf6e-3521-4179-9535-e217f70254ca	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	hospedagem	🇳🇱 Leonardo Royal Hotel Amsterdam (Amsterdã)	Booking / Hotel	2025-10-17 15:00:00+00	2025-10-20 11:00:00+00	\N	5965.90	t	3 diárias (€ 917,83). Café da manhã incluso. Conexão rápida para o centro histórico e canais.	Paul van Vlissingenstraat 24, Oost, 1096 BK Amsterdã, Holanda	\N	2026-11-11 13:23:37.35591+00
d6dbde62-8a54-41bc-bf34-b20b3d46cb3f	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	outro	🚆 Trem Eurostar: Paris (Gare du Nord) → Londres (St. Pancras)	Eurostar	2025-10-14 09:00:00+00	2025-10-14 10:30:00+00	ESTAR-PAR-LON	1170.00	t	Travessia pelo Eurotúnel sob o Canal da Mancha. Estação em Paris: Gare du Nord (18 Rue de Dunkerque). Custo € 180 (família).	\N	\N	2026-11-11 13:23:37.35591+00
6e8d89ed-e22c-4efa-9d24-6464b8b0ab23	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	outro	🚆 Trem Eurostar: Londres (St. Pancras) → Amsterdã (Centraal)	Eurostar	2025-10-17 08:30:00+00	2025-10-17 13:15:00+00	ESTAR-LON-AMS	1170.00	t	Viagem internacional de alta velocidade conectando o Reino Unido à Holanda. Custo € 180 (família).	\N	\N	2026-11-11 13:23:37.35591+00
7987cd0a-075f-4940-ade6-3508683e7c07	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	outro	🚆 Trem Eurostar: Amsterdã (Centraal) → Paris (Gare du Nord)	Eurostar	2025-10-20 09:15:00+00	2025-10-20 12:35:00+00	ESTAR-AMS-PAR	1170.00	t	Retorno para a França para embarque no voo de volta ao Brasil no final da tarde. Custo € 180 (família).	\N	\N	2026-11-11 13:23:37.35591+00
fb75f461-8117-4f73-95f1-b2d40e58967d	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	voo	Voo BH (CNF) → São Paulo (GRU)	Gol / Latam	2025-10-09 11:00:00+00	2025-10-09 12:20:00+00	QKZXEP	650.00	t	Voo de conexão para o voo internacional em Guarulhos.	\N	\N	2026-11-11 13:23:37.35591+00
10d63b66-11e7-4ff2-ba82-7fd578a08716	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	voo	Voo São Paulo (GRU) → BH (CNF)	Gol / Latam	2025-10-21 16:55:00+00	2025-10-21 18:15:00+00	QKZXEP	650.00	t	Chegada final em Belo Horizonte.	\N	\N	2026-11-11 13:23:37.35591+00
e4c6b80a-42c4-4b58-8368-4e0adc9eeb5a	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	voo	Voo IB 0272 — São Paulo (GRU) → Madri (MAD)	Iberia	2025-10-09 19:15:00+00	2025-10-10 10:10:00+00	J1Q6Z	5850.00	t	Voo noturno transatlântico. Poltronas reservadas: 21A, 21B, 21C (Assentos com espaço extra XL). Passageiro: Alexandre Sauer Pais Lemes e família.	\N	\N	2026-11-11 13:23:37.35591+00
d6431a2d-581a-4f27-8314-61704cd1e574	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	voo	Voo IB 0573 — Madri (MAD) → Paris Orly (ORY)	Iberia	2025-10-10 11:25:00+00	2025-10-10 13:25:00+00	J1Q6Z	0.00	t	Chegada em Paris às 13:25 e transfer para o hotel ibis Place d'Italie.	\N	\N	2026-11-11 13:23:37.35591+00
50e6e4fc-143e-441e-8356-9c277560600d	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	voo	Voo IB 0580 — Paris Orly (ORY) → Madri (MAD)	Iberia	2025-10-20 19:00:00+00	2025-10-20 21:05:00+00	J1Q6Z	0.00	t	Início do retorno para o Brasil.	\N	\N	2026-11-11 13:23:37.35591+00
09965cff-fbd7-4815-adb0-3786864da331	76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	voo	Voo IB 0267 — Madri (MAD) → São Paulo (GRU)	Iberia	2025-10-20 23:55:00+00	2025-10-21 05:55:00+00	J1Q6Z	5850.00	t	Pouso em São Paulo às 05:55 da manhã do dia 21/10.	\N	\N	2026-11-11 13:23:37.35591+00
a8b9b7b9-47d3-41e3-b30c-0885761fcfa8	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	voo	Voo Ida: Belo Horizonte (CNF) → Porto Alegre (POA) · LA 3591	LATAM Airlines	2026-12-17 23:45:00+00	2026-12-18 02:00:00+00	WUXWSK	283.00	t	Passageiros: Alexandre Sauer Paes Leme, Matheus Sauer Apaes Leme, Cristiane Maria de A Pais Lemes.\nVoo direto: LA 3591 (LATAM). Partida: CNF 20:45 -> Chegada: POA 23:00 (Duração 2h15).\nTarifa: Economy Light (45.797 milhas LATAM Pass + R$ 283,00 de taxas pagas).\nBagagem inclusa por passageiro: 1 item pessoal (mochila sob o assento dianteiro até 10kg) + 1 mala de mão na cabine (até 12kg). Não inclui bagagem despachada.	\N	\N	2026-11-13 13:06:33.992572+00
85adabe3-92fb-4a04-85ce-c3ddc40cf4c7	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	voo	Voo Volta: Porto Alegre (POA) → Belo Horizonte (CNF) · LA 3455	LATAM Airlines	2026-12-22 08:00:00+00	2026-12-22 10:10:00+00	WUXWSK	0.00	t	Passageiros: Alexandre Sauer Paes Leme, Matheus Sauer Apaes Leme, Cristiane Maria de A Pais Lemes.\nVoo direto: LA 3455 (LATAM). Partida: POA 05:00 -> Chegada: CNF 07:10 (Duração 2h10).\nTarifa: Economy Light (custo das taxas pago no bilhete de ida).\nBagagem inclusa por passageiro: 1 item pessoal (mochila até 10kg) + 1 mala de mão na cabine (até 12kg).	\N	\N	2026-11-13 13:06:33.992572+00
77072d85-c0d7-4fa7-9b71-75f7844ef940	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	voo	Voo Ida: Belo Horizonte (CNF) → Porto Alegre (POA) · LA 3591	LATAM Airlines	2026-12-17 23:45:00+00	2026-12-18 02:00:00+00	WUDNXE	1367.82	t	Passageiros: Jorge Sauer Pais Lemes, Heliana Mara Ferreira Pais Leme.\nVoo direto: LA 3591 (LATAM). Partida: CNF 20:45 -> Chegada: POA 23:00 (Duração 2h15).\nTarifa: Economy Standard (Total R$ 1.367,82 pago).\nBagagem inclusa por passageiro: 1 item pessoal (mochila até 10kg) + 1 mala de mão na cabine (até 12kg) + 1 bagagem despachada no porão (até 23kg).	\N	\N	2026-11-13 13:06:33.992572+00
8b364b74-9295-4fcb-96ea-e627de1aab36	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	voo	Voo Volta (Conexão GRU): Porto Alegre (POA) → SP (GRU) → Belo Horizonte (CNF) · LA 3479 / LA 4650	LATAM Airlines	2026-12-22 08:15:00+00	2026-12-22 13:00:00+00	WUDNXE	0.00	t	Passageiros: Jorge Sauer Pais Lemes, Heliana Mara Ferreira Pais Leme.\nVoo com conexão em São Paulo / Guarulhos (GRU):\n• Trecho 1: Voo LA 3479 - POA (05:15) -> GRU (07:05) Terminal 2.\n• Conexão em GRU: 1h40min de espera.\n• Trecho 2: Voo LA 4650 - GRU (08:45) Terminal 2 -> CNF (10:00).\nDuração total: 4h45. Tarifa: Economy Standard (custo incluído no bilhete).\nBagagem inclusa por passageiro: 1 item pessoal (mochila até 10kg) + 1 mala de mão na cabine (até 12kg) + 1 bagagem despachada no porão (até 23kg).	\N	\N	2026-11-13 13:06:33.992572+00
3349f1f4-493d-4546-a85f-10efe2d622a6	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	ingresso	Passaporte Grupo Dreams: Combo 6 Atrações (5 Pessoas)	Grupo Dreams / Laçador de Ofertas	\N	\N	TRL 4778575, 4778576, 4778577, 4778579, 4778580	0.00	t	Vouchers: TRL 4778575, TRL 4778576, TRL 4778577, TRL 4778579, TRL 4778580.\nItem: COD 20874 - Passaporte Laçador Net Sem Carona (5 unidades, 1 por pessoa).\nData da compra: 09/10/2026. Validade: 1 ano (até 09/10/2027).\nIMPORTANTE: Não necessita de agendamento prévio. Basta apresentar na bilheteria/catraca pelo celular.\n\nAtrações incluídas no combo para os 5 viajantes:\n1. Dreamland Museu de Cera (Gramado)\n2. Harley Motor Show (Gramado)\n3. Hollywood Dream Cars (Gramado)\n4. Vale dos Dinossauros (Canela)\n5. Jardim do Amor (Gramado)\n6. Super Carros (Gramado)	Gramado e Canela - RS	https://maps.google.com/?q=Dreamland+Museu+de+Cera+Gramado	2026-11-13 13:18:13.047991+00
1452ea85-4c69-4fe0-a3eb-a89970dd3b26	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	ingresso	Dreamland Museu de Cera · Passaporte Dreams	Grupo Dreams / Laçador de Ofertas	\N	\N	CERAGRAMADO (Cód: 47953)	0.00	t	Atração: Dreamland Museu de Cera Gramado (Mais de 100 réplicas em cera de personalidades e ícones do cinema).\nQuantidade: 5 Ingressos inclusos no Passaporte.\nValidade: até 09/10/2027. Não necessita agendamento prévio.\n\nCódigos de barras individuais dos 5 ingressos:\n• Ingresso 1 (Voucher TRL 4778575): 19981026625106\n• Ingresso 2 (Voucher TRL 4778576): 19981026625178\n• Ingresso 3 (Voucher TRL 4778577): 19981026625245\n• Ingresso 4 (Voucher TRL 4778579): 19981026625312\n• Ingresso 5 (Voucher TRL 4778580): 19981026625382	Av. das Hortênsias, 5507 - Carniel, Gramado - RS	https://maps.google.com/?q=Dreamland+Museu+de+Cera+Gramado	2026-11-13 13:18:13.047991+00
90c248ae-6e15-4604-81f0-2d000a4f5fca	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	ingresso	Harley Motor Show · Passaporte Dreams	Grupo Dreams / Laçador de Ofertas	\N	\N	HARLEYGRAMADO (Cód: 47955)	0.00	t	Atração: Harley Motor Show (Espaço temático e bar dedicado aos amantes de Harley-Davidson, localizado no subsolo do Museu de Cera).\nQuantidade: 5 Ingressos inclusos no Passaporte.\nValidade: até 09/10/2027. Não necessita agendamento prévio.\n\nCódigos de barras individuais dos 5 ingressos:\n• Ingresso 1 (Voucher TRL 4778575): 19981026625141\n• Ingresso 2 (Voucher TRL 4778576): 19981026625211\n• Ingresso 3 (Voucher TRL 4778577): 19981026625289\n• Ingresso 4 (Voucher TRL 4778579): 19981026625353\n• Ingresso 5 (Voucher TRL 4778580): 19981026625423	Av. das Hortênsias, 5507 (Subsolo) - Carniel, Gramado - RS	https://maps.google.com/?q=Harley+Motor+Show+Gramado	2026-11-13 13:18:13.047991+00
1486f26b-03c7-45d7-bd94-c280cf28c994	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	ingresso	Hollywood Dream Cars · Passaporte Dreams	Grupo Dreams / Laçador de Ofertas	\N	\N	HOLLYGRAMADO (Cód: 47954)	0.00	t	Atração: Hollywood Dream Cars (Exposição com a maior coleção de Cadillacs e carros clássicos dos anos 50 e 60 da América Latina).\nQuantidade: 5 Ingressos inclusos no Passaporte.\nValidade: até 09/10/2027. Não necessita agendamento prévio.\n\nCódigos de barras individuais dos 5 ingressos:\n• Ingresso 1 (Voucher TRL 4778575): 19981026625113\n• Ingresso 2 (Voucher TRL 4778576): 19981026625186\n• Ingresso 3 (Voucher TRL 4778577): 19981026625252\n• Ingresso 4 (Voucher TRL 4778579): 19981026625327\n• Ingresso 5 (Voucher TRL 4778580): 19981026625397	Av. das Hortênsias, 4151 - Carniel, Gramado - RS	https://maps.google.com/?q=Hollywood+Dream+Cars+Gramado	2026-11-13 13:18:13.047991+00
a1999afb-8c63-4258-8c05-62ba3c4e200d	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	ingresso	Vale dos Dinossauros Canela · Passaporte Dreams	Grupo Dreams / Laçador de Ofertas	\N	\N	DINOCANELA (Cód: 47956)	0.00	t	Atração: Vale dos Dinossauros Canela (Parque em meio à natureza com réplicas animatrônicas gigantes que se movem e rugem).\nQuantidade: 5 Ingressos inclusos no Passaporte.\nValidade: até 09/10/2027. Não necessita agendamento prévio.\n\nCódigos de barras individuais dos 5 ingressos:\n• Ingresso 1 (Voucher TRL 4778575): 19981026625123\n• Ingresso 2 (Voucher TRL 4778576): 19981026625190\n• Ingresso 3 (Voucher TRL 4778577): 19981026625267\n• Ingresso 4 (Voucher TRL 4778579): 19981026625339\n• Ingresso 5 (Voucher TRL 4778580): 19981026625409	Rodovia RS-466 (Estrada do Caracol), 1600 - Canela - RS	https://maps.google.com/?q=Vale+dos+Dinossauros+Canela	2026-11-13 13:18:13.047991+00
d75b5e51-b8b2-44f4-8fbb-4acfff3cae09	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	ingresso	Jardim do Amor · Passaporte Dreams	Grupo Dreams / Laçador de Ofertas	\N	\N	JARDIM DO AMOR (Cód: 288971)	0.00	t	Atração: Jardim do Amor Gramado (Cenários fotográficos românticos com flores, fontes e arquitetura inspirada na Toscana).\nQuantidade: 5 Ingressos inclusos no Passaporte.\nValidade: até 09/10/2027. Não necessita agendamento prévio.\n\nCódigos de barras individuais dos 5 ingressos:\n• Ingresso 1 (Voucher TRL 4778575): 19981026625151\n• Ingresso 2 (Voucher TRL 4778576): 19981026625228\n• Ingresso 3 (Voucher TRL 4778577): 19981026625294\n• Ingresso 4 (Voucher TRL 4778579): 19981026625364\n• Ingresso 5 (Voucher TRL 4778580): 19981026625431	Av. das Hortênsias, 765 - Vila Suíça, Gramado - RS	https://maps.google.com/?q=Jardim+do+Amor+Gramado	2026-11-13 13:18:13.047991+00
66a03272-70b7-4b13-8f79-bad906d7653c	871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	ingresso	Super Carros · Passaporte Dreams	Grupo Dreams / Laçador de Ofertas	\N	\N	SUPERGRAMADO (Cód: 288972)	0.00	t	Atração: Super Carros Gramado (Salão de exposição com Ferrari, Lamborghini, Porsche, Mustang, Camaro, simuladores de corrida e loja temática).\nQuantidade: 5 Ingressos inclusos no Passaporte.\nValidade: até 09/10/2027. Não necessita agendamento prévio.\n\nCódigos de barras individuais dos 5 ingressos:\n• Ingresso 1 (Voucher TRL 4778575): 19981026625132\n• Ingresso 2 (Voucher TRL 4778576): 19981026625201\n• Ingresso 3 (Voucher TRL 4778577): 19981026625270\n• Ingresso 4 (Voucher TRL 4778579): 19981026625349\n• Ingresso 5 (Voucher TRL 4778580): 19981026625415	Av. das Hortênsias, 4635 - Carniel, Gramado - RS	https://maps.google.com/?q=Super+Carros+Gramado	2026-11-13 13:18:13.047991+00
\.


--
-- Data for Name: trips; Type: TABLE DATA; Schema: public; Owner: supabase_admin
--

COPY public.trips (id, family_id, created_by, title, category, status, start_date, end_date, main_destination, description, budget, photos_url, cover_path, created_at) FROM stdin;
0411de23-a3c5-48b1-946a-5250cee401ce	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	Santa Cruz de la Sierra	ferias	confirmada	2027-03-24	2027-03-31	Santa Cruz de la Sierra, Bolívia	6 dias e 5 noites em Santa Cruz | Viajantes: 2 adultos e 1 adolescente (15 anos) | Estilo: Turismo, Compras, Gastronomia, Cultura, Natureza	5500.00	\N	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/covers/89de2f99-5b16-46aa-8e1e-5cf9e84c20b1-bolivia.jpg	2026-11-11 13:18:24.157475+00
57b885fa-2358-41fd-b3e3-99b30101e9f4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	Beto Carrero / B. Camboriú	ferias	realizada	2018-07-16	2021-07-24	Camboriú, Blumenau, Penha, Beto Carrero	Com: Maluki | Planejamento: https://bit.ly/3YDQJRk | Período: 16 de julho de 2018 → 24 de julho de 2021	0.00	https://photos.app.goo.gl/2rNm76juMA4a9uVh9	\N	2026-11-11 13:18:24.157475+00
09ab65fb-458c-440d-b381-5c5208c5df13	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	Rio de Janeiro	ferias	realizada	2023-01-10	2023-01-16	Rio de Janeiro / Hospedagem na Barra	Com: Maluki + Jojoca e Lilica | Período: 10 de janeiro de 2023 → 16 de janeiro de 2023	0.00	https://photos.app.goo.gl/TetUSMJuHYiCiW527	\N	2026-11-11 13:18:24.157475+00
009c0669-6552-437d-8c20-c207f9873591	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	Foz do Iguaçu / Londrina	ferias	realizada	2020-01-20	2020-01-26	Foz do Iguaçu, Londrina	Com: Maluki + Jojoca e Lilica | Período: 20 de janeiro de 2020 → 26 de janeiro de 2020	0.00	https://photos.app.goo.gl/fVHipzNiMF4cfsRf9	\N	2026-11-11 13:18:24.157475+00
6766db6f-0b40-4517-85f7-e3353a8b72fa	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	Orlando	ferias	realizada	2019-01-11	2019-01-31	Orlando, Miami	Com: Maluki | Período: 11 de janeiro de 2019 → 31 de janeiro de 2019	0.00	https://photos.app.goo.gl/XTdwd13Asb2B1uez6	\N	2026-11-11 13:18:24.157475+00
1138548c-c1bb-489f-a500-ec6a016ffa22	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	São Paulo / Consulado	ferias	realizada	2018-04-12	2018-04-15	São Paulo	Com: Maluki | Período: 12 de abril de 2018 → 15 de abril de 2018	0.00	https://photos.app.goo.gl/ctPIKQPDZozHAvFo1	\N	2026-11-11 13:18:24.157475+00
2edfb9ff-40b9-415e-ad1e-157bae1c240a	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	Americana	ferias	realizada	2017-11-02	2017-11-05	Americana (West'n Wild)	Com: Maluki + Jojoca e Lilica | Período: 2 de novembro de 2017 → 5 de novembro de 2017	0.00	https://photos.app.goo.gl/T5aDp6mXwRv76MZP2	\N	2026-11-11 13:18:24.157475+00
cc05d340-5f8e-4e9f-b978-2f577e26daeb	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	Chile	ferias	realizada	2017-07-17	2017-07-24	Santiago, Vale Nevado, Valparaíso, Andes	Com: Maluki | Planejamento: https://bit.ly/3s8EG21 | Período: 17 de julho de 2017 → 24 de julho de 2017	0.00	https://photos.app.goo.gl/xw3TGlcS2bipja8R2	\N	2026-11-11 13:18:24.157475+00
88dc4ff2-1724-4d3d-9ca2-df4917b276bb	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	Gramado	ferias	realizada	2016-09-18	2016-09-24	Gramado, Canela	Com: Maluki | Planejamento: https://bit.ly/45nFmyM | Período: 18 de setembro de 2016 → 24 de setembro de 2016	0.00	https://photos.app.goo.gl/ZfxsSUvhMjBttCU27	\N	2026-11-11 13:18:24.157475+00
06ef901b-e6e3-4ca1-a853-b5cdc13b5d8e	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	Porto Alegre	ferias	realizada	2018-01-10	2018-01-15	Porto Alegre	\N	0.00	\N	\N	2026-11-11 13:18:24.157475+00
51781464-065e-4902-b10a-cdca5196b5b4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	Beto Carrero / Curitiba	ferias	realizada	2018-01-10	2018-01-15	Beto Carrero / Curitiba	\N	0.00	\N	\N	2026-11-11 13:18:24.157475+00
07b43e35-3f5c-4385-b5bf-84b7623b8404	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	Orlando / Disney	ferias	realizada	2018-01-10	2018-01-15	Orlando / Disney	\N	0.00	\N	\N	2026-11-11 13:18:24.157475+00
a8ac0d33-9076-4c38-9faf-23a06f3453af	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	Argentina	ferias	realizada	2018-01-10	2018-01-15	Argentina	\N	0.00	https://photos.app.goo.gl/BtN1nZivJv29wqrJ6	\N	2026-11-11 13:18:24.157475+00
f2b9b41a-e879-4768-8c6d-889dbedca259	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	Rio de Janeiro	ferias	realizada	2020-10-30	2020-11-02	Rio de Janeiro / Barra / Hotel Windsor	Com: Maluki | Período: 30 de outubro de 2020 → 2 de novembro de 2020	0.00	https://photos.app.goo.gl/P9DxXwnaGmXuyFDS9	\N	2026-11-11 13:18:24.157475+00
6abe2bcd-c943-4dff-a5b2-c512ff712bdb	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	Maceió / Maragogi	ferias	realizada	2018-01-10	2018-01-15	Maceió / Maragogi	\N	0.00	\N	\N	2026-11-11 13:18:24.157475+00
d613c0df-d8b7-4d82-8aa5-813a517ee438	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	Cabo Frio	ferias	realizada	2018-01-10	2018-01-15	Cabo Frio	\N	0.00	\N	\N	2026-11-11 13:18:24.157475+00
03b4d5e4-13d2-45fe-80b7-eb7c738e8bcb	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	Aparecida / Paraty	ferias	realizada	2018-01-10	2018-01-15	Aparecida / Paraty	\N	0.00	\N	\N	2026-11-11 13:18:24.157475+00
ada17cbc-d0f1-4add-8299-97bee19a7222	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	Campos do Jordão	ferias	realizada	2018-01-10	2018-01-15	Campos do Jordão	\N	0.00	\N	\N	2026-11-11 13:18:24.157475+00
5d6fc587-00de-4c28-9592-479244cb5253	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	Porto Alegre / Fisl	ferias	realizada	2018-01-10	2018-01-15	Porto Alegre / Fisl	\N	0.00	\N	\N	2026-11-11 13:18:24.157475+00
5a4d3f6f-23c2-4ddc-a0ca-95630b6ee0fd	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	Porto Seguro	ferias	realizada	2018-01-10	2018-01-15	Porto Seguro	\N	0.00	\N	\N	2026-11-11 13:18:24.157475+00
64d5e410-70ca-4d4f-9661-93bc7af043cf	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	Tauá	ferias	realizada	2018-01-10	2018-01-15	Tauá	\N	0.00	\N	\N	2026-11-11 13:18:24.157475+00
df098b63-c23f-46fe-8ad5-f537461cdb91	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	Monte Verde	ferias	realizada	2018-01-10	2018-01-15	Monte Verde	\N	0.00	\N	\N	2026-11-11 13:18:24.157475+00
501c48bd-786c-4be8-a48c-03468c7624e8	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	Nova York	ferias	realizada	2023-10-10	2023-10-15	Nova York	Com: Maluki | Período: 10 de outubro de 2023	0.00	https://photos.app.goo.gl/L5v3kD98kxCK3GQ6A	\N	2026-11-11 13:18:24.157475+00
b98dce87-0d73-4ae2-afb1-1ee74d01ac09	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	São Paulo — Fev/24	ferias	realizada	2024-02-11	2024-02-16	São Paulo	Com: Maluki + Jojoca e Lilica | Período: 11 de fevereiro de 2024	0.00	https://photos.app.goo.gl/6pc9x9MhcFHGrvoF6	\N	2026-11-11 13:18:24.157475+00
9eebe207-5a8d-4ec6-b164-c8f1a4738561	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	Espírito Santo	ferias	realizada	2023-10-10	2023-10-15	Guarapari	Com: Maluki e Pais | Período: 10 de outubro de 2023	0.00	https://photos.app.goo.gl/VQ31UZQ7cVnyvhPx5	\N	2026-11-11 13:18:24.157475+00
76cc0806-7088-4399-9085-35d2b78d0d2f	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	Europa: França, Inglaterra e Holanda	ferias	confirmada	2025-10-09	2025-10-21	França (Paris), Inglaterra (Londres) e Holanda (Amsterdã)	Roteiro clássico europeu em família por trem de alta velocidade (Eurostar): Paris (Torre Eiffel, Louvre e Disney), Londres (London Eye, Oxford Street e Camden) e Amsterdã (Canais e Anne Frank).	47100.00	https://photos.app.goo.gl/cWdCnHS6REDcm85m9	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/covers/716f8a83-e10b-4090-9cf2-657aaf70b127-europa.jpg	2026-11-11 13:18:24.157475+00
1e5addaa-28ab-4591-a39b-cebc203739b3	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	Chile 2026	ferias	confirmada	2026-07-10	2026-07-17	Santiago, Chile	Férias de inverno na neve em Santiago, Cordilheira dos Andes (Farellones), Parque Safari Rancagua, outlets Buenaventura e gastronomia chilena.	12000.00	\N	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/covers/5fe7f66b-3f26-406e-9333-1a70c17673e4-chile1.jpg	2026-11-11 13:18:34.189514+00
f6666690-f85d-4304-bf33-593787114fb4	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	Nova York e Toronto	ferias	confirmada	2026-03-27	2026-04-06	Nova York, EUA e Toronto, Canadá	Roteiro em família combinando Nova York (Manhattan, Bronx, Jersey Gardens) e Canadá (Toronto, Cataratas do Niágara e Niagara-on-the-Lake).	23267.71	https://photos.app.goo.gl/L5v3kD98kxCK3GQ6A	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/covers/f4cdabde-89d5-4dae-824d-056fc69966c7-nyc.jpg	2026-11-11 13:18:24.157475+00
871a0c6a-ada1-4bf1-a311-4c52054867a7	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a	7e414376-4f64-4d42-b18d-2382980791c4	🇧🇷 Gramado	ferias	planejamento	2026-12-17	2026-12-22	Gramado, RS	\N	5000.00	\N	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/covers/873495ef-9de2-4aa5-95f1-484aa6af8d36-passagens-aereas-gramado-capa2019-01.jpg	2026-11-11 16:32:39.740042+00
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id) FROM stdin;
documents	documents	\N	2026-11-11 13:02:36.910023+00	2026-11-11 13:02:36.910023+00	f	f	\N	\N	\N
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-11-10 12:53:39.886201
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-11-10 12:53:39.890665
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2026-11-10 12:53:39.893278
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-11-10 12:53:39.902725
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-11-10 12:53:39.926414
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-11-10 12:53:39.930384
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2026-11-10 12:53:39.934005
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-11-10 12:53:39.936975
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-11-10 12:53:39.939491
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2026-11-10 12:53:39.943068
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2026-11-10 12:53:39.947263
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-11-10 12:53:39.950899
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-11-10 12:53:39.954062
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-11-10 12:53:39.956592
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-11-10 12:53:39.958825
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-11-10 12:53:39.979276
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-11-10 12:53:39.982312
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-11-10 12:53:39.984595
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-11-10 12:53:39.987167
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-11-10 12:53:39.990084
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-11-10 12:53:39.992271
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-11-10 12:53:39.999614
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-11-10 12:53:40.024467
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-11-10 12:53:40.049487
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-11-10 12:53:40.052865
25	custom-metadata	67eb93b7e8d401cafcdc97f9ac779e71a79bfe03	2026-11-10 12:53:40.055434
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
931a142a-928a-48fe-a6be-624ab9323459	documents	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/covers/test-cover.txt	7e414376-4f64-4d42-b18d-2382980791c4	2026-11-11 13:03:53.362364+00	2026-11-11 13:03:53.362364+00	2026-11-11 13:03:53.362364+00	{"eTag": "\\"1a0ca5b84a4fcae92c3d7890b9ea4b56\\"", "size": 29, "mimetype": "text/plain", "cacheControl": "no-cache", "lastModified": "2026-11-11T13:03:53.338Z", "contentLength": 29, "httpStatusCode": 200}	ebfb941c-ce1b-43df-adef-844d27118dc2	7e414376-4f64-4d42-b18d-2382980791c4	{}
94a43b3a-0c33-43aa-810d-01d2d9ce2378	documents	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/covers/d0e248b9-cc8d-4cc5-83f7-9900bb2c8ffb-chile1.jpg	7e414376-4f64-4d42-b18d-2382980791c4	2026-11-11 13:05:27.617669+00	2026-11-11 13:05:27.617669+00	2026-11-11 13:05:27.617669+00	{"eTag": "\\"3d1ce7207ef0e6abc8be2b66802b8df7\\"", "size": 286051, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-11-11T13:05:27.610Z", "contentLength": 286051, "httpStatusCode": 200}	42a3d00c-5a61-408e-80e4-6599c19385aa	7e414376-4f64-4d42-b18d-2382980791c4	{}
11eb7c0f-87c5-4184-893d-b764e496775e	documents	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/covers/a847b1be-8ffb-4272-9e1a-19f386f2caa4-bolivia.jpg	7e414376-4f64-4d42-b18d-2382980791c4	2026-11-11 13:06:12.935048+00	2026-11-11 13:06:12.935048+00	2026-11-11 13:06:12.935048+00	{"eTag": "\\"c6567a3a59a262353e587bd7bfbf0916\\"", "size": 12423, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-11-11T13:06:12.928Z", "contentLength": 12423, "httpStatusCode": 200}	b7526388-9df1-4964-b4f1-2d0abf395d19	7e414376-4f64-4d42-b18d-2382980791c4	{}
6bea0bdf-0db9-438f-bd9d-1995fbd46a1e	documents	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/covers/501c733e-608c-4228-b7be-41c8e2fc64cc-nyc.jpg	7e414376-4f64-4d42-b18d-2382980791c4	2026-11-11 13:13:18.199457+00	2026-11-11 13:13:18.199457+00	2026-11-11 13:13:18.199457+00	{"eTag": "\\"2250841bac5d7280bd68770e059aea22\\"", "size": 335565, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-11-11T13:13:18.187Z", "contentLength": 335565, "httpStatusCode": 200}	a4826b94-ee13-49ff-98cb-e7ba6b2f00e0	7e414376-4f64-4d42-b18d-2382980791c4	{}
e44ec03e-3f6c-46a1-83bd-d2c6e93a08a8	documents	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/covers/89de2f99-5b16-46aa-8e1e-5cf9e84c20b1-bolivia.jpg	7e414376-4f64-4d42-b18d-2382980791c4	2026-11-11 13:25:28.220628+00	2026-11-11 13:25:28.220628+00	2026-11-11 13:25:28.220628+00	{"eTag": "\\"c6567a3a59a262353e587bd7bfbf0916\\"", "size": 12423, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-11-11T13:25:28.213Z", "contentLength": 12423, "httpStatusCode": 200}	317d63b3-46ee-4e26-96a8-cb8d7d275c17	7e414376-4f64-4d42-b18d-2382980791c4	{}
5fe2e38f-d4ed-4745-ab78-22ccd7e6ad08	documents	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/covers/5fe7f66b-3f26-406e-9333-1a70c17673e4-chile1.jpg	7e414376-4f64-4d42-b18d-2382980791c4	2026-11-11 13:25:36.986134+00	2026-11-11 13:25:36.986134+00	2026-11-11 13:25:36.986134+00	{"eTag": "\\"3d1ce7207ef0e6abc8be2b66802b8df7\\"", "size": 286051, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-11-11T13:25:36.977Z", "contentLength": 286051, "httpStatusCode": 200}	bdc114e1-c30b-4d43-b926-1fd892272436	7e414376-4f64-4d42-b18d-2382980791c4	{}
8a1185ca-205f-4e5f-b908-daefa31a96ee	documents	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/covers/f4cdabde-89d5-4dae-824d-056fc69966c7-nyc.jpg	7e414376-4f64-4d42-b18d-2382980791c4	2026-11-11 13:25:47.89843+00	2026-11-11 13:25:47.89843+00	2026-11-11 13:25:47.89843+00	{"eTag": "\\"2250841bac5d7280bd68770e059aea22\\"", "size": 335565, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-11-11T13:25:47.890Z", "contentLength": 335565, "httpStatusCode": 200}	49306e2f-f04e-4db4-8df3-ecee68c2ce06	7e414376-4f64-4d42-b18d-2382980791c4	{}
91ec4951-92d5-404e-947b-bea84c4a60bf	documents	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/covers/716f8a83-e10b-4090-9cf2-657aaf70b127-europa.jpg	7e414376-4f64-4d42-b18d-2382980791c4	2026-11-11 13:28:57.173804+00	2026-11-11 13:28:57.173804+00	2026-11-11 13:28:57.173804+00	{"eTag": "\\"fa73e3d791011d4b32a5b108f8cfff74\\"", "size": 232057, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-11-11T13:28:57.167Z", "contentLength": 232057, "httpStatusCode": 200}	2682225e-559c-46ca-b5c5-af60c929025e	7e414376-4f64-4d42-b18d-2382980791c4	{}
388e8638-c5eb-4015-a0ce-ee6208fd8674	documents	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/covers/ff708fa1-164e-4b8d-9b59-41d6e5f43abf-passagens-aereas-gramado-capa2019-01.jpg	7e414376-4f64-4d42-b18d-2382980791c4	2026-11-11 15:30:50.721462+00	2026-11-11 15:30:50.721462+00	2026-11-11 15:30:50.721462+00	{"eTag": "\\"2e1c42642373123137f9be63be0252bb\\"", "size": 263672, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-11-11T15:30:50.708Z", "contentLength": 263672, "httpStatusCode": 200}	2a29c239-a923-44fe-8f89-6809f34353af	7e414376-4f64-4d42-b18d-2382980791c4	{}
412842e9-7dd1-434a-9ccc-3bd9dc083703	documents	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/covers/017218b6-16e0-4469-b26d-86074d0e9dd4-passagens-aereas-gramado-capa2019-01.jpg	7e414376-4f64-4d42-b18d-2382980791c4	2026-11-11 15:39:31.791112+00	2026-11-11 15:39:31.791112+00	2026-11-11 15:39:31.791112+00	{"eTag": "\\"2e1c42642373123137f9be63be0252bb\\"", "size": 263672, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-11-11T15:39:31.777Z", "contentLength": 263672, "httpStatusCode": 200}	b069a689-073e-4a5c-a91c-d4a35d6f9f0d	7e414376-4f64-4d42-b18d-2382980791c4	{}
82da399f-851a-42bd-8fa4-37d7ee8ef9b0	documents	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/covers/28c09492-5b88-45c8-b73a-c8e83ae1d0a6-passagens-aereas-gramado-capa2019-01.jpg	7e414376-4f64-4d42-b18d-2382980791c4	2026-11-11 15:45:23.864963+00	2026-11-11 15:45:23.864963+00	2026-11-11 15:45:23.864963+00	{"eTag": "\\"2e1c42642373123137f9be63be0252bb\\"", "size": 263672, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-11-11T15:45:23.856Z", "contentLength": 263672, "httpStatusCode": 200}	9b7ca104-e060-4380-a741-492c0e197dab	7e414376-4f64-4d42-b18d-2382980791c4	{}
8673ca10-bb95-4f1b-ab9f-dc7605dcfc6b	documents	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/covers/5367e9d9-9bc1-40c6-a06a-aa50bbd1a204-passagens-aereas-gramado-capa2019-01.jpg	7e414376-4f64-4d42-b18d-2382980791c4	2026-11-11 16:20:13.07314+00	2026-11-11 16:20:13.07314+00	2026-11-11 16:20:13.07314+00	{"eTag": "\\"2e1c42642373123137f9be63be0252bb\\"", "size": 263672, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-11-11T16:20:13.062Z", "contentLength": 263672, "httpStatusCode": 200}	ab6f84e1-b17e-41d0-a316-11e6d31e7f1b	7e414376-4f64-4d42-b18d-2382980791c4	{}
916d0024-d9dc-4775-b937-7854901b5a12	documents	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/covers/873495ef-9de2-4aa5-95f1-484aa6af8d36-passagens-aereas-gramado-capa2019-01.jpg	7e414376-4f64-4d42-b18d-2382980791c4	2026-11-11 16:32:39.70647+00	2026-11-11 16:32:39.70647+00	2026-11-11 16:32:39.70647+00	{"eTag": "\\"2e1c42642373123137f9be63be0252bb\\"", "size": 263672, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-11-11T16:32:39.699Z", "contentLength": 263672, "httpStatusCode": 200}	3feecc26-caa8-4698-adec-e036dd199d34	7e414376-4f64-4d42-b18d-2382980791c4	{}
735fe7be-0887-4e82-bbda-a8aa64bd04c6	documents	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/e3b85340-1d65-4575-8633-26990904136f.pdf	\N	2026-11-13 13:06:33.916746+00	2026-11-13 13:06:33.916746+00	2026-11-13 13:06:33.916746+00	{"eTag": "\\"fd4083ef229be50a7268dfbd3a01f120\\"", "size": 60918, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-11-13T13:06:33.900Z", "contentLength": 60918, "httpStatusCode": 200}	0e0ce339-afa6-4909-b795-30ec21c2503d	\N	{}
e6be19e0-795f-4504-ae2c-fd8933170040	documents	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/faabd93e-eaa5-4a07-8186-7bd90f84b765.pdf	\N	2026-11-13 13:06:33.968473+00	2026-11-13 13:06:33.968473+00	2026-11-13 13:06:33.968473+00	{"eTag": "\\"85ebcb73ffdd1ce21650e985acb2e439\\"", "size": 61627, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-11-13T13:06:33.960Z", "contentLength": 61627, "httpStatusCode": 200}	8fd7970d-6bf3-4809-b0dd-9b49eb2c4c3f	\N	{}
7e9d9a48-5434-48a7-9632-98724669fe63	documents	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/8c607ee5-0d75-4c6b-8e40-5e4691b29c94.pdf	7e414376-4f64-4d42-b18d-2382980791c4	2026-11-13 13:07:36.44552+00	2026-11-13 13:07:36.44552+00	2026-11-13 13:07:36.44552+00	{"eTag": "\\"85ebcb73ffdd1ce21650e985acb2e439\\"", "size": 61627, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-11-13T13:07:36.434Z", "contentLength": 61627, "httpStatusCode": 200}	aab2a04c-1134-48e1-9668-13b6a78b850d	7e414376-4f64-4d42-b18d-2382980791c4	{}
cab953fb-8ff4-4e77-b39d-afa138778e72	documents	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/4daa4608-e76f-4d61-bbee-f1e8cc7f7ed2.pdf	7e414376-4f64-4d42-b18d-2382980791c4	2026-11-13 13:08:04.247681+00	2026-11-13 13:08:04.247681+00	2026-11-13 13:08:04.247681+00	{"eTag": "\\"fd4083ef229be50a7268dfbd3a01f120\\"", "size": 60918, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-11-13T13:08:04.242Z", "contentLength": 60918, "httpStatusCode": 200}	767c7bf1-8596-447f-bbd8-b866919d9d48	7e414376-4f64-4d42-b18d-2382980791c4	{}
eb88d771-763c-44c4-9a48-86bfe1f50ef3	documents	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/931031e2-a310-4f5e-8be6-4df802d9a55d.pdf	\N	2026-11-13 13:18:12.888321+00	2026-11-13 13:18:12.888321+00	2026-11-13 13:18:12.888321+00	{"eTag": "\\"bd132582393744fb8d11504c03c90447\\"", "size": 50631, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-11-13T13:18:12.878Z", "contentLength": 50631, "httpStatusCode": 200}	34bc0dfb-532e-49fc-9f09-98f764f4afa4	\N	{}
4c6a93b4-29ac-4a65-879d-d5961fc59f8e	documents	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/93d92db2-2487-424e-a3aa-a44ebf398529.pdf	\N	2026-11-13 13:18:12.922966+00	2026-11-13 13:18:12.922966+00	2026-11-13 13:18:12.922966+00	{"eTag": "\\"86bd502b58edb1d69b72f981091569dc\\"", "size": 50599, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-11-13T13:18:12.914Z", "contentLength": 50599, "httpStatusCode": 200}	e16af344-1c98-4316-a2cc-a780aa20cffd	\N	{}
df1c69c8-c00d-48d6-a087-22b2ea3e729f	documents	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/31aa6104-cf57-47a1-9108-5ab74c629f89.pdf	\N	2026-11-13 13:18:12.950774+00	2026-11-13 13:18:12.950774+00	2026-11-13 13:18:12.950774+00	{"eTag": "\\"0b3eeabaa31cb137fae1b17a60c137fa\\"", "size": 51119, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-11-13T13:18:12.942Z", "contentLength": 51119, "httpStatusCode": 200}	4a5ea5cd-4e0b-42fa-a6e6-f090d587c04c	\N	{}
bd364f52-f49e-4f43-a605-6936075ebf8e	documents	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/721dc61e-c62c-45c3-b7bf-da3a8b19f05c.pdf	\N	2026-11-13 13:18:12.984419+00	2026-11-13 13:18:12.984419+00	2026-11-13 13:18:12.984419+00	{"eTag": "\\"c29d52b7bdd2bd7d8dcbad231a4ac3f7\\"", "size": 51261, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-11-13T13:18:12.974Z", "contentLength": 51261, "httpStatusCode": 200}	7a4887bc-1d2c-40ef-af91-7cb7d4b2c8af	\N	{}
0c7b1381-7b03-48e1-91dc-d823eb24ecbf	documents	9c8e1ce7-7fa5-4a02-8f26-dc64aeeb5f2a/102612b7-b365-49f6-a197-0d081c648f6d.pdf	\N	2026-11-13 13:18:13.014415+00	2026-11-13 13:18:13.014415+00	2026-11-13 13:18:13.014415+00	{"eTag": "\\"86fb075320d09185e60f4be37b1ba9de\\"", "size": 50929, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-11-13T13:18:13.006Z", "contentLength": 50929, "httpStatusCode": 200}	08369830-d694-4441-9424-2738e4737a84	\N	{}
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 35, true);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: checklist_items checklist_items_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.checklist_items
    ADD CONSTRAINT checklist_items_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: emergency_contacts emergency_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.emergency_contacts
    ADD CONSTRAINT emergency_contacts_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: families families_invite_code_key; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.families
    ADD CONSTRAINT families_invite_code_key UNIQUE (invite_code);


--
-- Name: families families_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.families
    ADD CONSTRAINT families_pkey PRIMARY KEY (id);


--
-- Name: family_members family_members_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.family_members
    ADD CONSTRAINT family_members_pkey PRIMARY KEY (family_id, user_id);


--
-- Name: notification_history notification_history_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.notification_history
    ADD CONSTRAINT notification_history_pkey PRIMARY KEY (id);


--
-- Name: notification_history notification_history_trip_id_event_target_key_key; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.notification_history
    ADD CONSTRAINT notification_history_trip_id_event_target_key_key UNIQUE (trip_id, event, target_key);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: reservations reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);


--
-- Name: trips trips_pkey; Type: CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: documents_reservation_id_idx; Type: INDEX; Schema: public; Owner: supabase_admin
--

CREATE INDEX documents_reservation_id_idx ON public.documents USING btree (reservation_id);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: supabase_auth_admin
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: activities activities_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id) ON DELETE CASCADE;


--
-- Name: activities activities_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- Name: checklist_items checklist_items_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.checklist_items
    ADD CONSTRAINT checklist_items_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id) ON DELETE CASCADE;


--
-- Name: checklist_items checklist_items_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.checklist_items
    ADD CONSTRAINT checklist_items_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- Name: documents documents_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id) ON DELETE CASCADE;


--
-- Name: documents documents_reservation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.reservations(id) ON DELETE CASCADE;


--
-- Name: documents documents_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE SET NULL;


--
-- Name: emergency_contacts emergency_contacts_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.emergency_contacts
    ADD CONSTRAINT emergency_contacts_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id) ON DELETE CASCADE;


--
-- Name: emergency_contacts emergency_contacts_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.emergency_contacts
    ADD CONSTRAINT emergency_contacts_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- Name: expenses expenses_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id) ON DELETE CASCADE;


--
-- Name: expenses expenses_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- Name: family_members family_members_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.family_members
    ADD CONSTRAINT family_members_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id) ON DELETE CASCADE;


--
-- Name: family_members family_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.family_members
    ADD CONSTRAINT family_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: notification_history notification_history_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.notification_history
    ADD CONSTRAINT notification_history_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id) ON DELETE CASCADE;


--
-- Name: notification_history notification_history_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.notification_history
    ADD CONSTRAINT notification_history_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: reservations reservations_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id) ON DELETE CASCADE;


--
-- Name: reservations reservations_trip_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.reservations
    ADD CONSTRAINT reservations_trip_id_fkey FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;


--
-- Name: trips trips_family_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: supabase_admin
--

ALTER TABLE ONLY public.trips
    ADD CONSTRAINT trips_family_id_fkey FOREIGN KEY (family_id) REFERENCES public.families(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: activities; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

--
-- Name: family_members admin update members; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "admin update members" ON public.family_members FOR UPDATE TO authenticated USING (public.is_family_admin(family_id)) WITH CHECK (public.is_family_admin(family_id));


--
-- Name: checklist_items; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--

ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;

--
-- Name: documents; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

--
-- Name: emergency_contacts; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--

ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

--
-- Name: expenses; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

--
-- Name: families; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--

ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles family admin profile update; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "family admin profile update" ON public.profiles FOR UPDATE TO authenticated USING (((id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM (public.family_members me
     JOIN public.family_members them ON ((me.family_id = them.family_id)))
  WHERE ((me.user_id = auth.uid()) AND (me.role = 'admin'::text) AND (them.user_id = profiles.id)))))) WITH CHECK (((id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM (public.family_members me
     JOIN public.family_members them ON ((me.family_id = them.family_id)))
  WHERE ((me.user_id = auth.uid()) AND (me.role = 'admin'::text) AND (them.user_id = profiles.id))))));


--
-- Name: activities family all; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "family all" ON public.activities TO authenticated USING (public.is_family_member(family_id)) WITH CHECK (public.is_family_member(family_id));


--
-- Name: checklist_items family all; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "family all" ON public.checklist_items TO authenticated USING (public.is_family_member(family_id)) WITH CHECK (public.is_family_member(family_id));


--
-- Name: documents family all; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "family all" ON public.documents TO authenticated USING (public.is_family_member(family_id)) WITH CHECK (public.is_family_member(family_id));


--
-- Name: emergency_contacts family all; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "family all" ON public.emergency_contacts TO authenticated USING (public.is_family_member(family_id)) WITH CHECK (public.is_family_member(family_id));


--
-- Name: expenses family all; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "family all" ON public.expenses TO authenticated USING (public.is_family_member(family_id)) WITH CHECK (public.is_family_member(family_id));


--
-- Name: reservations family all; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "family all" ON public.reservations TO authenticated USING (public.is_family_member(family_id)) WITH CHECK (public.is_family_member(family_id));


--
-- Name: trips family all; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "family all" ON public.trips TO authenticated USING (public.can_access_trip(id, family_id)) WITH CHECK (public.is_family_member(family_id));


--
-- Name: family_members; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

--
-- Name: family_members leave or admin remove; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "leave or admin remove" ON public.family_members FOR DELETE TO authenticated USING (((user_id = auth.uid()) OR public.is_family_admin(family_id)));


--
-- Name: notification_history members insert notification_history; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "members insert notification_history" ON public.notification_history FOR INSERT TO authenticated WITH CHECK (public.is_family_member(family_id));


--
-- Name: families members read family; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "members read family" ON public.families FOR SELECT TO authenticated USING (public.is_family_member(id));


--
-- Name: family_members members read members; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "members read members" ON public.family_members FOR SELECT TO authenticated USING (public.is_family_member(family_id));


--
-- Name: notification_history members read notification_history; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "members read notification_history" ON public.notification_history FOR SELECT TO authenticated USING (public.is_family_member(family_id));


--
-- Name: families members update family; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "members update family" ON public.families FOR UPDATE TO authenticated USING (public.is_family_member(id));


--
-- Name: notification_history; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--

ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles own profile insert; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((id = auth.uid()));


--
-- Name: profiles own profile update; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING ((id = auth.uid()));


--
-- Name: profiles profile read; Type: POLICY; Schema: public; Owner: supabase_admin
--

CREATE POLICY "profile read" ON public.profiles FOR SELECT TO authenticated USING (((id = auth.uid()) OR public.shares_family(id)));


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: reservations; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

--
-- Name: trips; Type: ROW SECURITY; Schema: public; Owner: supabase_admin
--

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: objects family docs delete; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "family docs delete" ON storage.objects FOR DELETE TO authenticated USING (((bucket_id = 'documents'::text) AND public.is_family_member(((storage.foldername(name))[1])::uuid)));


--
-- Name: objects family docs insert; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "family docs insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'documents'::text) AND public.is_family_member(((storage.foldername(name))[1])::uuid)));


--
-- Name: objects family docs read; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "family docs read" ON storage.objects FOR SELECT TO authenticated USING (((bucket_id = 'documents'::text) AND public.is_family_member(((storage.foldername(name))[1])::uuid)));


--
-- Name: objects family docs update; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "family docs update" ON storage.objects FOR UPDATE TO authenticated USING (((bucket_id = 'documents'::text) AND public.is_family_member(((storage.foldername(name))[1])::uuid)));


--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION can_access_trip(_trip_id uuid, _family_id uuid); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.can_access_trip(_trip_id uuid, _family_id uuid) TO postgres;
GRANT ALL ON FUNCTION public.can_access_trip(_trip_id uuid, _family_id uuid) TO anon;
GRANT ALL ON FUNCTION public.can_access_trip(_trip_id uuid, _family_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.can_access_trip(_trip_id uuid, _family_id uuid) TO service_role;


--
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.handle_new_user() TO postgres;
GRANT ALL ON FUNCTION public.handle_new_user() TO anon;
GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;


--
-- Name: FUNCTION is_family_admin(_family uuid); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.is_family_admin(_family uuid) TO postgres;
GRANT ALL ON FUNCTION public.is_family_admin(_family uuid) TO anon;
GRANT ALL ON FUNCTION public.is_family_admin(_family uuid) TO authenticated;
GRANT ALL ON FUNCTION public.is_family_admin(_family uuid) TO service_role;


--
-- Name: FUNCTION is_family_member(_family uuid); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.is_family_member(_family uuid) TO postgres;
GRANT ALL ON FUNCTION public.is_family_member(_family uuid) TO anon;
GRANT ALL ON FUNCTION public.is_family_member(_family uuid) TO authenticated;
GRANT ALL ON FUNCTION public.is_family_member(_family uuid) TO service_role;


--
-- Name: FUNCTION join_family(_code text); Type: ACL; Schema: public; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION public.join_family(_code text) FROM PUBLIC;
GRANT ALL ON FUNCTION public.join_family(_code text) TO postgres;
GRANT ALL ON FUNCTION public.join_family(_code text) TO authenticated;
GRANT ALL ON FUNCTION public.join_family(_code text) TO service_role;


--
-- Name: FUNCTION shares_family(_other uuid); Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION public.shares_family(_other uuid) TO postgres;
GRANT ALL ON FUNCTION public.shares_family(_other uuid) TO anon;
GRANT ALL ON FUNCTION public.shares_family(_other uuid) TO authenticated;
GRANT ALL ON FUNCTION public.shares_family(_other uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_admin
--

GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_admin
--

GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_admin
--

GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_admin
--

GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_admin
--

GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_admin
--

GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_admin
--

GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_admin
--

GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_admin
--

GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_admin
--

GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_admin
--

GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE activities; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.activities TO postgres;
GRANT ALL ON TABLE public.activities TO anon;
GRANT ALL ON TABLE public.activities TO authenticated;
GRANT ALL ON TABLE public.activities TO service_role;


--
-- Name: TABLE checklist_items; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.checklist_items TO postgres;
GRANT ALL ON TABLE public.checklist_items TO anon;
GRANT ALL ON TABLE public.checklist_items TO authenticated;
GRANT ALL ON TABLE public.checklist_items TO service_role;


--
-- Name: TABLE documents; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.documents TO postgres;
GRANT ALL ON TABLE public.documents TO anon;
GRANT ALL ON TABLE public.documents TO authenticated;
GRANT ALL ON TABLE public.documents TO service_role;


--
-- Name: TABLE emergency_contacts; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.emergency_contacts TO postgres;
GRANT ALL ON TABLE public.emergency_contacts TO anon;
GRANT ALL ON TABLE public.emergency_contacts TO authenticated;
GRANT ALL ON TABLE public.emergency_contacts TO service_role;


--
-- Name: TABLE expenses; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.expenses TO postgres;
GRANT ALL ON TABLE public.expenses TO anon;
GRANT ALL ON TABLE public.expenses TO authenticated;
GRANT ALL ON TABLE public.expenses TO service_role;


--
-- Name: TABLE families; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.families TO postgres;
GRANT ALL ON TABLE public.families TO anon;
GRANT ALL ON TABLE public.families TO authenticated;
GRANT ALL ON TABLE public.families TO service_role;


--
-- Name: TABLE family_members; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.family_members TO postgres;
GRANT ALL ON TABLE public.family_members TO anon;
GRANT ALL ON TABLE public.family_members TO authenticated;
GRANT ALL ON TABLE public.family_members TO service_role;


--
-- Name: TABLE notification_history; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.notification_history TO postgres;
GRANT ALL ON TABLE public.notification_history TO anon;
GRANT ALL ON TABLE public.notification_history TO authenticated;
GRANT ALL ON TABLE public.notification_history TO service_role;


--
-- Name: TABLE profiles; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.profiles TO postgres;
GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;


--
-- Name: TABLE reservations; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.reservations TO postgres;
GRANT ALL ON TABLE public.reservations TO anon;
GRANT ALL ON TABLE public.reservations TO authenticated;
GRANT ALL ON TABLE public.reservations TO service_role;


--
-- Name: TABLE trips; Type: ACL; Schema: public; Owner: supabase_admin
--

GRANT ALL ON TABLE public.trips TO postgres;
GRANT ALL ON TABLE public.trips TO anon;
GRANT ALL ON TABLE public.trips TO authenticated;
GRANT ALL ON TABLE public.trips TO service_role;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO postgres;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO postgres;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES  TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS  TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES  TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES  TO service_role;


--
-- PostgreSQL database dump complete
--

