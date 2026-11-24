-- FORMA Scene Studio cloud composition library.
-- This migration is self-contained and uses Supabase Auth for ownership.
-- The table is intentionally separate from public.scenes: the current editor
-- document format is versioned independently from the collaboration model.

begin;

create or replace function public.is_valid_scene_studio_vec3(p_value jsonb)
returns boolean
language plpgsql immutable set search_path = ''
as $fn$
declare
  v_item jsonb;
  v_number numeric;
begin
  if jsonb_typeof(p_value) is distinct from 'array' then return false; end if;
  if jsonb_array_length(p_value) <> 3 then return false; end if;
  for v_item in select value from jsonb_array_elements(p_value)
  loop
    if jsonb_typeof(v_item) is distinct from 'number' then return false; end if;
    v_number := (v_item #>> '{}')::numeric;
    if v_number < -10000 or v_number > 10000 then return false; end if;
  end loop;
  return true;
end;
$fn$;

create or replace function public.is_valid_scene_studio_object(p_object jsonb)
returns boolean
language plpgsql immutable set search_path = ''
as $fn$
declare
  v_scale numeric;
  v_roughness numeric;
  v_metalness numeric;
begin
  if jsonb_typeof(p_object) is distinct from 'object'
     or jsonb_typeof(p_object -> 'id') is distinct from 'number'
     or (p_object ->> 'id') !~ '^[0-9]+$'
     or (p_object ->> 'id')::numeric < 1
     or jsonb_typeof(p_object -> 'name') is distinct from 'string'
     or jsonb_typeof(p_object -> 'kind') is distinct from 'string'
     or char_length(btrim(p_object ->> 'name')) not between 1 and 80
     or p_object ->> 'kind' not in ('box','sphere','torus')
     or jsonb_typeof(p_object -> 'color') is distinct from 'string'
     or (p_object ->> 'color') !~ '^#[0-9A-Fa-f]{6}$'
     or jsonb_typeof(p_object -> 'emissive') is distinct from 'string'
     or (p_object ->> 'emissive') !~ '^#[0-9A-Fa-f]{6}$'
     or jsonb_typeof(p_object -> 'roughness') is distinct from 'number'
     or jsonb_typeof(p_object -> 'metalness') is distinct from 'number'
     or jsonb_typeof(p_object -> 'scale') is distinct from 'number'
     or jsonb_typeof(p_object -> 'visible') is distinct from 'boolean'
     or not public.is_valid_scene_studio_vec3(p_object -> 'position')
     or not public.is_valid_scene_studio_vec3(p_object -> 'rotation') then
    return false;
  end if;
  v_scale := (p_object ->> 'scale')::numeric;
  v_roughness := (p_object ->> 'roughness')::numeric;
  v_metalness := (p_object ->> 'metalness')::numeric;
  return v_scale > 0 and v_scale <= 100
    and v_roughness between 0 and 1
    and v_metalness between 0 and 1;
end;
$fn$;

create or replace function public.is_valid_scene_studio_document(p_document jsonb)
returns boolean
language plpgsql immutable set search_path = ''
as $fn$
declare
  v_item jsonb;
  v_count integer;
begin
  if jsonb_typeof(p_document) is distinct from 'object'
     or jsonb_typeof(p_document -> 'camera') is distinct from 'string'
     or p_document ->> 'camera' not in ('perspective','front','top','side')
     or octet_length(p_document::text) > 262144 then
    return false;
  end if;
  if jsonb_typeof(p_document -> 'objects') is distinct from 'array' then return false; end if;
  v_count := jsonb_array_length(p_document -> 'objects');
  if v_count not between 1 and 250 then return false; end if;
  for v_item in select value from jsonb_array_elements(p_document -> 'objects')
  loop
    if not public.is_valid_scene_studio_object(v_item) then return false; end if;
  end loop;
  if exists (
    select 1 from jsonb_array_elements(p_document -> 'objects') e(value)
    group by e.value ->> 'id' having count(*) > 1
  ) then return false; end if;
  return true;
end;
$fn$;

revoke all on function public.is_valid_scene_studio_vec3(jsonb) from public, anon, authenticated;
revoke all on function public.is_valid_scene_studio_object(jsonb) from public, anon, authenticated;
revoke all on function public.is_valid_scene_studio_document(jsonb) from public, anon, authenticated;

create table public.scene_studio_compositions (
  id uuid primary key,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 80),
  document jsonb not null check (public.is_valid_scene_studio_document(document)),
  revision bigint not null default 1 check (revision >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index scene_studio_compositions_owner_updated_idx
  on public.scene_studio_compositions(owner_id, updated_at desc);

alter table public.scene_studio_compositions enable row level security;
revoke all on public.scene_studio_compositions from anon, authenticated;
grant select, delete on public.scene_studio_compositions to authenticated;

create policy scene_studio_compositions_select_owner
  on public.scene_studio_compositions
  for select to authenticated
  using (owner_id = (select auth.uid()));

create policy scene_studio_compositions_delete_owner
  on public.scene_studio_compositions
  for delete to authenticated
  using (owner_id = (select auth.uid()));

create or replace function public.save_scene_studio_composition(
  p_id uuid,
  p_title text,
  p_document jsonb,
  p_expected_revision bigint default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_actor uuid := auth.uid();
  v_row public.scene_studio_compositions%rowtype;
begin
  if v_actor is null then
    raise exception using errcode = '28000', message = 'FORMA_UNAUTHENTICATED';
  end if;

  if p_id is null
     or p_title is null
     or char_length(btrim(p_title)) not between 1 and 80
     or p_document is null
     or not public.is_valid_scene_studio_document(p_document) then
    raise exception using errcode = '22023', message = 'FORMA_INVALID_SCENE_DOCUMENT';
  end if;

  if p_expected_revision is null then
    insert into public.scene_studio_compositions(id, owner_id, title, document)
    values (p_id, v_actor, btrim(p_title), p_document)
    on conflict (id) do nothing
    returning * into v_row;

    if not found then
      raise exception using errcode = '40001', message = 'FORMA_REVISION_CONFLICT';
    end if;
  else
    update public.scene_studio_compositions
    set title = btrim(p_title),
        document = p_document,
        revision = revision + 1,
        updated_at = now()
    where id = p_id
      and owner_id = v_actor
      and revision = p_expected_revision
    returning * into v_row;

    if not found then
      if exists (
        select 1 from public.scene_studio_compositions
        where id = p_id and owner_id = v_actor
      ) then
        raise exception using errcode = '40001', message = 'FORMA_REVISION_CONFLICT';
      end if;
      raise exception using errcode = 'P0002', message = 'FORMA_NOT_FOUND';
    end if;
  end if;

  return jsonb_build_object(
    'id', v_row.id,
    'title', v_row.title,
    'document', v_row.document,
    'revision', v_row.revision,
    'updated_at', v_row.updated_at
  );
end;
$fn$;

revoke all on function public.save_scene_studio_composition(uuid, text, jsonb, bigint) from public, anon;
grant execute on function public.save_scene_studio_composition(uuid, text, jsonb, bigint) to authenticated;

commit;
