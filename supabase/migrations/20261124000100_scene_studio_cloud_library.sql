-- FORMA Scene Studio cloud composition library.
-- Apply after the existing Phase 05 core schema. This table is intentionally
-- separate from public.scenes: the current editor document format is versioned
-- independently from the collaboration command model in public.scenes.

begin;

create table public.scene_studio_compositions (
  id uuid primary key,
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 80),
  document jsonb not null check (
    jsonb_typeof(document) = 'object'
    and document ? 'camera'
    and document ? 'objects'
    and document ->> 'camera' in ('perspective', 'front', 'top', 'side')
    and jsonb_typeof(document -> 'objects') = 'array'
    and jsonb_array_length(document -> 'objects') between 1 and 250
    and octet_length(document::text) <= 262144
  ),
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
     or jsonb_typeof(p_document) is distinct from 'object'
     or p_document ->> 'camera' not in ('perspective', 'front', 'top', 'side')
     or jsonb_typeof(p_document -> 'objects') is distinct from 'array'
     or jsonb_array_length(p_document -> 'objects') not between 1 and 250
     or octet_length(p_document::text) > 262144 then
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
