-- FORMA Phase 05: atomic Scene Studio command RPC
-- REVIEW DRAFT ONLY. Not applied or executed against Supabase.
-- Depends on 20261121000100_forma_core_schema.sql.

begin;

create or replace function public.jsonb_key_count(p_value jsonb)
returns integer
language sql
immutable
set search_path = ''
as $
  select case
    when jsonb_typeof(p_value) = 'object'
      then (select count(*)::integer from jsonb_object_keys(p_value))
    else 0
  end;
$;
revoke all on function public.jsonb_key_count(jsonb) from public, anon, authenticated;

create or replace function public.is_valid_scene_vec3(
  p_value jsonb, p_min numeric, p_max numeric, p_positive boolean default false
)
returns boolean language plpgsql immutable set search_path = ''
as $$
declare
  v_item jsonb;
  v_number numeric;
begin
  if jsonb_typeof(p_value) is distinct from 'array' then
    return false;
  end if;
  if jsonb_array_length(p_value) <> 3 then
    return false;
  end if;
  for v_item in select value from jsonb_array_elements(p_value)
  loop
    if jsonb_typeof(v_item) <> 'number' then return false; end if;
    v_number := (v_item #>> '{}')::numeric;
    if v_number < p_min or v_number > p_max then return false; end if;
    if p_positive and v_number <= 0 then return false; end if;
  end loop;
  return true;
end;
$$;
revoke all on function public.is_valid_scene_vec3(jsonb, numeric, numeric, boolean) from public, anon, authenticated;

create or replace function public.is_valid_scene_object(p_object jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $
declare
  v_transform jsonb;
  v_color text;
begin
  if jsonb_typeof(p_object) is distinct from 'object'
     or public.jsonb_key_count(p_object) <> 6
     or not (p_object ?& array['id','type','name','visible','transform','material'])
     or jsonb_typeof(p_object -> 'id') is distinct from 'string'
     or char_length(p_object ->> 'id') not between 1 and 64
     or jsonb_typeof(p_object -> 'type') is distinct from 'string'
     or p_object ->> 'type' not in ('box','sphere','plane')
     or jsonb_typeof(p_object -> 'name') is distinct from 'string'
     or char_length(btrim(p_object ->> 'name')) not between 1 and 80
     or jsonb_typeof(p_object -> 'visible') is distinct from 'boolean'
     or jsonb_typeof(p_object -> 'transform') is distinct from 'object'
     or public.jsonb_key_count(p_object -> 'transform') <> 3
     or not ((p_object -> 'transform') ?& array['position','rotation','scale'])
     or jsonb_typeof(p_object -> 'material') is distinct from 'object'
     or public.jsonb_key_count(p_object -> 'material') <> 1
     or not ((p_object -> 'material') ? 'color')
     or jsonb_typeof(p_object #> '{material,color}') is distinct from 'string' then
    return false;
  end if;
  v_transform := p_object -> 'transform';
  if not public.is_valid_scene_vec3(v_transform -> 'position', -10000, 10000, false)
     or not public.is_valid_scene_vec3(v_transform -> 'rotation', -100000, 100000, false)
     or not public.is_valid_scene_vec3(v_transform -> 'scale', 0.001, 1000, true) then
    return false;
  end if;
  v_color := p_object #>> '{material,color}';
  return v_color ~ '^#[0-9A-Fa-f]{6}
  p_scene_id uuid,
  p_command_id uuid,
  p_expected_revision bigint,
  p_command_type text,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_scene public.scenes%rowtype;
  v_receipt public.scene_command_receipts%rowtype;
  v_document jsonb;
  v_objects jsonb;
  v_object jsonb;
  v_transform jsonb;
  v_material jsonb;
  v_settings jsonb;
  v_target_id text;
  v_index bigint;
  v_object_count integer;
  v_color text;
  v_item jsonb;
  v_request_fingerprint text;
begin
  if v_actor is null then
    raise exception using errcode = '28000', message = 'FORMA_UNAUTHENTICATED';
  end if;
  if p_scene_id is null or p_command_id is null
     or p_expected_revision is null or p_expected_revision < 1
     or p_command_type is null or p_payload is null
     or jsonb_typeof(p_payload) <> 'object'
     or octet_length(p_payload::text) > 16384 then
    raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
  end if;
  if p_command_type not in (
    'object.create', 'object.delete', 'object.rename',
    'object.transform.set', 'object.visibility.set',
    'object.material.set', 'scene.settings.set'
  ) then
    raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
  end if;

  select s.* into v_scene
  from public.scenes s
  where s.id = p_scene_id
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'FORMA_NOT_FOUND';
  end if;

  if v_scene.owner_id <> v_actor and not exists (
    select 1 from public.scene_members sm
    where sm.scene_id = p_scene_id and sm.user_id = v_actor and sm.role = 'editor'
  ) then
    raise exception using errcode = '42501', message = 'FORMA_FORBIDDEN';
  end if;

  v_request_fingerprint := pg_catalog.md5(
    jsonb_build_object(
      'expected_revision', p_expected_revision,
      'command_type', p_command_type,
      'payload', p_payload
    )::text
  );

  select r.* into v_receipt
  from public.scene_command_receipts r
  where r.scene_id = p_scene_id and r.command_id = p_command_id;
  if found then
    if v_receipt.actor_id <> v_actor
       or v_receipt.command_type <> p_command_type
       or v_receipt.request_fingerprint <> v_request_fingerprint then
      raise exception using errcode = '22023', message = 'FORMA_IDEMPOTENCY_MISMATCH';
    end if;
    return jsonb_build_object('command_id', p_command_id,
      'revision', v_receipt.resulting_revision, 'duplicate', true);
  end if;

  if v_scene.revision <> p_expected_revision then
    raise exception using errcode = '40001', message = 'FORMA_REVISION_CONFLICT';
  end if;

  v_document := v_scene.document;
  v_objects := v_document -> 'objects';
  if jsonb_typeof(v_document) <> 'object'
     or v_document ->> 'schemaVersion' <> '1'
     or jsonb_typeof(v_objects) <> 'array' then
    raise exception using errcode = '22023', message = 'FORMA_INVALID_SCENE_DOCUMENT';
  end if;
  v_object_count := jsonb_array_length(v_objects);
  if v_object_count > 100
     or jsonb_typeof(v_document -> 'settings') is distinct from 'object'
     or public.jsonb_key_count(v_document -> 'settings') <> 2
     or not ((v_document -> 'settings') ?& array['background','gridVisible'])
     or jsonb_typeof(v_document #> '{settings,background}') is distinct from 'string'
     or (v_document #>> '{settings,background}') !~ '^#[0-9A-Fa-f]{6}
  if p_command_type = 'object.create' then
    if public.jsonb_key_count(p_payload) <> 1
       or not (p_payload ? 'object')
       or jsonb_typeof(p_payload -> 'object') <> 'object' then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
    end if;
    v_object := p_payload -> 'object';
    if public.jsonb_key_count(v_object) <> 6
       or not (v_object ?& array['id','type','name','visible','transform','material'])
       or jsonb_typeof(v_object -> 'id') <> 'string'
       or char_length(v_object ->> 'id') not between 1 and 64
       or jsonb_typeof(v_object -> 'type') <> 'string'
       or v_object ->> 'type' not in ('box','sphere','plane')
       or jsonb_typeof(v_object -> 'name') <> 'string'
       or char_length(btrim(v_object ->> 'name')) not between 1 and 80
       or jsonb_typeof(v_object -> 'visible') <> 'boolean'
       or jsonb_typeof(v_object -> 'transform') <> 'object'
       or public.jsonb_key_count(v_object -> 'transform') <> 3
       or not ((v_object -> 'transform') ?& array['position','rotation','scale'])
       or jsonb_typeof(v_object -> 'material') <> 'object'
       or public.jsonb_key_count(v_object -> 'material') <> 1
       or not ((v_object -> 'material') ? 'color')
       or jsonb_typeof(v_object #> '{material,color}') <> 'string' then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
    end if;
    v_transform := v_object -> 'transform';
    if not public.is_valid_scene_vec3(v_transform -> 'position', -10000, 10000, false)
       or not public.is_valid_scene_vec3(v_transform -> 'rotation', -100000, 100000, false)
       or not public.is_valid_scene_vec3(v_transform -> 'scale', 0.001, 1000, true) then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_TRANSFORM';
    end if;
    v_color := v_object #>> '{material,color}';
    if v_color !~ '^#[0-9A-Fa-f]{6}$' then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_COLOR';
    end if;
    if v_object_count >= 100 then
      raise exception using errcode = '54000', message = 'FORMA_LIMIT_EXCEEDED';
    end if;
    if exists (select 1 from jsonb_array_elements(v_objects) e(value)
      where e.value ->> 'id' = v_object ->> 'id') then
      raise exception using errcode = '22023', message = 'FORMA_DUPLICATE_OBJECT_ID';
    end if;
    v_objects := v_objects || jsonb_build_array(
      jsonb_set(v_object, '{name}', to_jsonb(btrim(v_object ->> 'name')), false)
    );

  elsif p_command_type = 'scene.settings.set' then
    if public.jsonb_key_count(p_payload) <> 1
       or not (p_payload ? 'settings')
       or jsonb_typeof(p_payload -> 'settings') <> 'object' then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
    end if;
    v_settings := p_payload -> 'settings';
    if public.jsonb_key_count(v_settings) <> 2
       or not (v_settings ?& array['background','gridVisible'])
       or jsonb_typeof(v_settings -> 'background') <> 'string'
       or (v_settings ->> 'background') !~ '^#[0-9A-Fa-f]{6}$'
       or jsonb_typeof(v_settings -> 'gridVisible') <> 'boolean' then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_SETTINGS';
    end if;
    v_document := jsonb_set(v_document, '{settings}', v_settings, false);

  else
    if public.jsonb_key_count(p_payload) < 1
       or jsonb_typeof(p_payload -> 'target_id') <> 'string'
       or char_length(p_payload ->> 'target_id') not between 1 and 64 then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
    end if;
    v_target_id := p_payload ->> 'target_id';
    select ordinality into v_index
    from jsonb_array_elements(v_objects) with ordinality as e(value, ordinality)
    where e.value ->> 'id' = v_target_id
    limit 1;
    if v_index is null then
      raise exception using errcode = '22023', message = 'FORMA_TARGET_NOT_FOUND';
    end if;

    if p_command_type = 'object.delete' then
      if public.jsonb_key_count(p_payload) <> 1 then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
      end if;
      select coalesce(jsonb_agg(value order by ordinality), '[]'::jsonb)
      into v_objects
      from jsonb_array_elements(v_objects) with ordinality
      where ordinality <> v_index;

    elsif p_command_type = 'object.rename' then
      if public.jsonb_key_count(p_payload) <> 2
         or jsonb_typeof(p_payload -> 'name') <> 'string'
         or char_length(btrim(p_payload ->> 'name')) not between 1 and 80 then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
      end if;
      v_objects := jsonb_set(v_objects, array[(v_index - 1)::text, 'name'],
        to_jsonb(btrim(p_payload ->> 'name')), false);

    elsif p_command_type = 'object.transform.set' then
      if public.jsonb_key_count(p_payload) <> 2
         or jsonb_typeof(p_payload -> 'transform') <> 'object'
         or public.jsonb_key_count(p_payload -> 'transform') <> 3
         or not ((p_payload -> 'transform') ?& array['position','rotation','scale']) then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
      end if;
      v_transform := p_payload -> 'transform';
      if not public.is_valid_scene_vec3(v_transform -> 'position', -10000, 10000, false)
         or not public.is_valid_scene_vec3(v_transform -> 'rotation', -100000, 100000, false)
         or not public.is_valid_scene_vec3(v_transform -> 'scale', 0.001, 1000, true) then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_TRANSFORM';
      end if;
      v_objects := jsonb_set(v_objects, array[(v_index - 1)::text, 'transform'], v_transform, false);

    elsif p_command_type = 'object.visibility.set' then
      if public.jsonb_key_count(p_payload) <> 2
         or jsonb_typeof(p_payload -> 'visible') <> 'boolean' then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
      end if;
      v_objects := jsonb_set(v_objects, array[(v_index - 1)::text, 'visible'],
        p_payload -> 'visible', false);

    elsif p_command_type = 'object.material.set' then
      if public.jsonb_key_count(p_payload) <> 2
         or jsonb_typeof(p_payload -> 'material') <> 'object'
         or public.jsonb_key_count(p_payload -> 'material') <> 1
         or jsonb_typeof(p_payload #> '{material,color}') <> 'string' then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
      end if;
      v_material := p_payload -> 'material';
      v_color := v_material ->> 'color';
      if v_color !~ '^#[0-9A-Fa-f]{6}$' then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_COLOR';
      end if;
      v_objects := jsonb_set(v_objects, array[(v_index - 1)::text, 'material'], v_material, false);
    end if;
  end if;

  if p_command_type like 'object.%' then
    v_document := jsonb_set(v_document, '{objects}', v_objects, false);
  end if;
  if octet_length(v_document::text) > 1048576 then
    raise exception using errcode = '54000', message = 'FORMA_LIMIT_EXCEEDED';
  end if;

  update public.scenes set document = v_document, revision = revision + 1
  where id = p_scene_id returning * into v_scene;

  insert into public.scene_command_receipts(
    scene_id, command_id, actor_id, request_fingerprint, command_type, resulting_revision
  ) values (p_scene_id, p_command_id, v_actor, v_request_fingerprint, p_command_type, v_scene.revision);

  return jsonb_build_object('command_id', p_command_id,
    'revision', v_scene.revision, 'duplicate', false);
end;
$$;

revoke all on function public.apply_scene_command(uuid, uuid, bigint, text, jsonb) from public, anon;
grant execute on function public.apply_scene_command(uuid, uuid, bigint, text, jsonb) to authenticated;

commit;
;
end;
$;
revoke all on function public.is_valid_scene_object(jsonb) from public, anon, authenticated;

create or replace function public.apply_scene_command(
  p_scene_id uuid,
  p_command_id uuid,
  p_expected_revision bigint,
  p_command_type text,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_scene public.scenes%rowtype;
  v_receipt public.scene_command_receipts%rowtype;
  v_document jsonb;
  v_objects jsonb;
  v_object jsonb;
  v_transform jsonb;
  v_material jsonb;
  v_settings jsonb;
  v_target_id text;
  v_index bigint;
  v_object_count integer;
  v_color text;
  v_request_fingerprint text;
begin
  if v_actor is null then
    raise exception using errcode = '28000', message = 'FORMA_UNAUTHENTICATED';
  end if;
  if p_scene_id is null or p_command_id is null
     or p_expected_revision is null or p_expected_revision < 1
     or p_command_type is null or p_payload is null
     or jsonb_typeof(p_payload) <> 'object'
     or octet_length(p_payload::text) > 16384 then
    raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
  end if;
  if p_command_type not in (
    'object.create', 'object.delete', 'object.rename',
    'object.transform.set', 'object.visibility.set',
    'object.material.set', 'scene.settings.set'
  ) then
    raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
  end if;

  select s.* into v_scene
  from public.scenes s
  where s.id = p_scene_id
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'FORMA_NOT_FOUND';
  end if;

  if v_scene.owner_id <> v_actor and not exists (
    select 1 from public.scene_members sm
    where sm.scene_id = p_scene_id and sm.user_id = v_actor and sm.role = 'editor'
  ) then
    raise exception using errcode = '42501', message = 'FORMA_FORBIDDEN';
  end if;

  select r.* into v_receipt
  from public.scene_command_receipts r
  where r.scene_id = p_scene_id and r.command_id = p_command_id;
  if found then
    if v_receipt.actor_id <> v_actor
       or v_receipt.command_type <> p_command_type
       or v_receipt.request_fingerprint <> v_request_fingerprint then
      raise exception using errcode = '22023', message = 'FORMA_IDEMPOTENCY_MISMATCH';
    end if;
    return jsonb_build_object('command_id', p_command_id,
      'revision', v_receipt.resulting_revision, 'duplicate', true);
  end if;

  if v_scene.revision <> p_expected_revision then
    raise exception using errcode = '40001', message = 'FORMA_REVISION_CONFLICT';
  end if;

  v_document := v_scene.document;
  v_objects := v_document -> 'objects';
  if jsonb_typeof(v_document) <> 'object'
     or v_document ->> 'schemaVersion' <> '1'
     or jsonb_typeof(v_objects) <> 'array' then
    raise exception using errcode = '22023', message = 'FORMA_INVALID_SCENE_DOCUMENT';
  end if;
  v_object_count := jsonb_array_length(v_objects);

  if p_command_type = 'object.create' then
    if public.jsonb_key_count(p_payload) <> 1
       or not (p_payload ? 'object')
       or jsonb_typeof(p_payload -> 'object') <> 'object' then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
    end if;
    v_object := p_payload -> 'object';
    if public.jsonb_key_count(v_object) <> 6
       or not (v_object ?& array['id','type','name','visible','transform','material'])
       or jsonb_typeof(v_object -> 'id') <> 'string'
       or char_length(v_object ->> 'id') not between 1 and 64
       or jsonb_typeof(v_object -> 'type') <> 'string'
       or v_object ->> 'type' not in ('box','sphere','plane')
       or jsonb_typeof(v_object -> 'name') <> 'string'
       or char_length(btrim(v_object ->> 'name')) not between 1 and 80
       or jsonb_typeof(v_object -> 'visible') <> 'boolean'
       or jsonb_typeof(v_object -> 'transform') <> 'object'
       or public.jsonb_key_count(v_object -> 'transform') <> 3
       or not ((v_object -> 'transform') ?& array['position','rotation','scale'])
       or jsonb_typeof(v_object -> 'material') <> 'object'
       or public.jsonb_key_count(v_object -> 'material') <> 1
       or not ((v_object -> 'material') ? 'color')
       or jsonb_typeof(v_object #> '{material,color}') <> 'string' then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
    end if;
    v_transform := v_object -> 'transform';
    if not public.is_valid_scene_vec3(v_transform -> 'position', -10000, 10000, false)
       or not public.is_valid_scene_vec3(v_transform -> 'rotation', -100000, 100000, false)
       or not public.is_valid_scene_vec3(v_transform -> 'scale', 0.001, 1000, true) then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_TRANSFORM';
    end if;
    v_color := v_object #>> '{material,color}';
    if v_color !~ '^#[0-9A-Fa-f]{6}$' then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_COLOR';
    end if;
    if v_object_count >= 100 then
      raise exception using errcode = '54000', message = 'FORMA_LIMIT_EXCEEDED';
    end if;
    if exists (select 1 from jsonb_array_elements(v_objects) e(value)
      where e.value ->> 'id' = v_object ->> 'id') then
      raise exception using errcode = '22023', message = 'FORMA_DUPLICATE_OBJECT_ID';
    end if;
    v_objects := v_objects || jsonb_build_array(
      jsonb_set(v_object, '{name}', to_jsonb(btrim(v_object ->> 'name')), false)
    );

  elsif p_command_type = 'scene.settings.set' then
    if public.jsonb_key_count(p_payload) <> 1
       or not (p_payload ? 'settings')
       or jsonb_typeof(p_payload -> 'settings') <> 'object' then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
    end if;
    v_settings := p_payload -> 'settings';
    if public.jsonb_key_count(v_settings) <> 2
       or not (v_settings ?& array['background','gridVisible'])
       or jsonb_typeof(v_settings -> 'background') <> 'string'
       or (v_settings ->> 'background') !~ '^#[0-9A-Fa-f]{6}$'
       or jsonb_typeof(v_settings -> 'gridVisible') <> 'boolean' then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_SETTINGS';
    end if;
    v_document := jsonb_set(v_document, '{settings}', v_settings, false);

  else
    if public.jsonb_key_count(p_payload) < 1
       or jsonb_typeof(p_payload -> 'target_id') <> 'string'
       or char_length(p_payload ->> 'target_id') not between 1 and 64 then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
    end if;
    v_target_id := p_payload ->> 'target_id';
    select ordinality into v_index
    from jsonb_array_elements(v_objects) with ordinality as e(value, ordinality)
    where e.value ->> 'id' = v_target_id
    limit 1;
    if v_index is null then
      raise exception using errcode = '22023', message = 'FORMA_TARGET_NOT_FOUND';
    end if;

    if p_command_type = 'object.delete' then
      if public.jsonb_key_count(p_payload) <> 1 then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
      end if;
      select coalesce(jsonb_agg(value order by ordinality), '[]'::jsonb)
      into v_objects
      from jsonb_array_elements(v_objects) with ordinality
      where ordinality <> v_index;

    elsif p_command_type = 'object.rename' then
      if public.jsonb_key_count(p_payload) <> 2
         or jsonb_typeof(p_payload -> 'name') <> 'string'
         or char_length(btrim(p_payload ->> 'name')) not between 1 and 80 then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
      end if;
      v_objects := jsonb_set(v_objects, array[(v_index - 1)::text, 'name'],
        to_jsonb(btrim(p_payload ->> 'name')), false);

    elsif p_command_type = 'object.transform.set' then
      if public.jsonb_key_count(p_payload) <> 2
         or jsonb_typeof(p_payload -> 'transform') <> 'object'
         or public.jsonb_key_count(p_payload -> 'transform') <> 3
         or not ((p_payload -> 'transform') ?& array['position','rotation','scale']) then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
      end if;
      v_transform := p_payload -> 'transform';
      if not public.is_valid_scene_vec3(v_transform -> 'position', -10000, 10000, false)
         or not public.is_valid_scene_vec3(v_transform -> 'rotation', -100000, 100000, false)
         or not public.is_valid_scene_vec3(v_transform -> 'scale', 0.001, 1000, true) then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_TRANSFORM';
      end if;
      v_objects := jsonb_set(v_objects, array[(v_index - 1)::text, 'transform'], v_transform, false);

    elsif p_command_type = 'object.visibility.set' then
      if public.jsonb_key_count(p_payload) <> 2
         or jsonb_typeof(p_payload -> 'visible') <> 'boolean' then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
      end if;
      v_objects := jsonb_set(v_objects, array[(v_index - 1)::text, 'visible'],
        p_payload -> 'visible', false);

    elsif p_command_type = 'object.material.set' then
      if public.jsonb_key_count(p_payload) <> 2
         or jsonb_typeof(p_payload -> 'material') <> 'object'
         or public.jsonb_key_count(p_payload -> 'material') <> 1
         or jsonb_typeof(p_payload #> '{material,color}') <> 'string' then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
      end if;
      v_material := p_payload -> 'material';
      v_color := v_material ->> 'color';
      if v_color !~ '^#[0-9A-Fa-f]{6}$' then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_COLOR';
      end if;
      v_objects := jsonb_set(v_objects, array[(v_index - 1)::text, 'material'], v_material, false);
    end if;
  end if;

  if p_command_type like 'object.%' then
    v_document := jsonb_set(v_document, '{objects}', v_objects, false);
  end if;
  if octet_length(v_document::text) > 1048576 then
    raise exception using errcode = '54000', message = 'FORMA_LIMIT_EXCEEDED';
  end if;

  update public.scenes set document = v_document, revision = revision + 1
  where id = p_scene_id returning * into v_scene;

  insert into public.scene_command_receipts(
    scene_id, command_id, actor_id, request_fingerprint, command_type, resulting_revision
  ) values (p_scene_id, p_command_id, v_actor, v_request_fingerprint, p_command_type, v_scene.revision);

  return jsonb_build_object('command_id', p_command_id,
    'revision', v_scene.revision, 'duplicate', false);
end;
$$;

revoke all on function public.apply_scene_command(uuid, uuid, bigint, text, jsonb) from public, anon;
grant execute on function public.apply_scene_command(uuid, uuid, bigint, text, jsonb) to authenticated;

commit;

     or jsonb_typeof(v_document #> '{settings,gridVisible}') is distinct from 'boolean' then
    raise exception using errcode = '22023', message = 'FORMA_INVALID_SCENE_DOCUMENT';
  end if;
  for v_item in select value from jsonb_array_elements(v_objects)
  loop
    if not public.is_valid_scene_object(v_item) then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_SCENE_DOCUMENT';
    end if;
  end loop;
  if exists (
    select 1 from jsonb_array_elements(v_objects) e(value)
    group by e.value ->> 'id' having count(*) > 1
  ) then
    raise exception using errcode = '22023', message = 'FORMA_INVALID_SCENE_DOCUMENT';
  end if;

  if p_command_type = 'object.create' then
    if public.jsonb_key_count(p_payload) <> 1
       or not (p_payload ? 'object')
       or jsonb_typeof(p_payload -> 'object') <> 'object' then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
    end if;
    v_object := p_payload -> 'object';
    if public.jsonb_key_count(v_object) <> 6
       or not (v_object ?& array['id','type','name','visible','transform','material'])
       or jsonb_typeof(v_object -> 'id') <> 'string'
       or char_length(v_object ->> 'id') not between 1 and 64
       or jsonb_typeof(v_object -> 'type') <> 'string'
       or v_object ->> 'type' not in ('box','sphere','plane')
       or jsonb_typeof(v_object -> 'name') <> 'string'
       or char_length(btrim(v_object ->> 'name')) not between 1 and 80
       or jsonb_typeof(v_object -> 'visible') <> 'boolean'
       or jsonb_typeof(v_object -> 'transform') <> 'object'
       or public.jsonb_key_count(v_object -> 'transform') <> 3
       or not ((v_object -> 'transform') ?& array['position','rotation','scale'])
       or jsonb_typeof(v_object -> 'material') <> 'object'
       or public.jsonb_key_count(v_object -> 'material') <> 1
       or not ((v_object -> 'material') ? 'color')
       or jsonb_typeof(v_object #> '{material,color}') <> 'string' then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
    end if;
    v_transform := v_object -> 'transform';
    if not public.is_valid_scene_vec3(v_transform -> 'position', -10000, 10000, false)
       or not public.is_valid_scene_vec3(v_transform -> 'rotation', -100000, 100000, false)
       or not public.is_valid_scene_vec3(v_transform -> 'scale', 0.001, 1000, true) then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_TRANSFORM';
    end if;
    v_color := v_object #>> '{material,color}';
    if v_color !~ '^#[0-9A-Fa-f]{6}$' then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_COLOR';
    end if;
    if v_object_count >= 100 then
      raise exception using errcode = '54000', message = 'FORMA_LIMIT_EXCEEDED';
    end if;
    if exists (select 1 from jsonb_array_elements(v_objects) e(value)
      where e.value ->> 'id' = v_object ->> 'id') then
      raise exception using errcode = '22023', message = 'FORMA_DUPLICATE_OBJECT_ID';
    end if;
    v_objects := v_objects || jsonb_build_array(
      jsonb_set(v_object, '{name}', to_jsonb(btrim(v_object ->> 'name')), false)
    );

  elsif p_command_type = 'scene.settings.set' then
    if public.jsonb_key_count(p_payload) <> 1
       or not (p_payload ? 'settings')
       or jsonb_typeof(p_payload -> 'settings') <> 'object' then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
    end if;
    v_settings := p_payload -> 'settings';
    if public.jsonb_key_count(v_settings) <> 2
       or not (v_settings ?& array['background','gridVisible'])
       or jsonb_typeof(v_settings -> 'background') <> 'string'
       or (v_settings ->> 'background') !~ '^#[0-9A-Fa-f]{6}$'
       or jsonb_typeof(v_settings -> 'gridVisible') <> 'boolean' then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_SETTINGS';
    end if;
    v_document := jsonb_set(v_document, '{settings}', v_settings, false);

  else
    if public.jsonb_key_count(p_payload) < 1
       or jsonb_typeof(p_payload -> 'target_id') <> 'string'
       or char_length(p_payload ->> 'target_id') not between 1 and 64 then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
    end if;
    v_target_id := p_payload ->> 'target_id';
    select ordinality into v_index
    from jsonb_array_elements(v_objects) with ordinality as e(value, ordinality)
    where e.value ->> 'id' = v_target_id
    limit 1;
    if v_index is null then
      raise exception using errcode = '22023', message = 'FORMA_TARGET_NOT_FOUND';
    end if;

    if p_command_type = 'object.delete' then
      if public.jsonb_key_count(p_payload) <> 1 then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
      end if;
      select coalesce(jsonb_agg(value order by ordinality), '[]'::jsonb)
      into v_objects
      from jsonb_array_elements(v_objects) with ordinality
      where ordinality <> v_index;

    elsif p_command_type = 'object.rename' then
      if public.jsonb_key_count(p_payload) <> 2
         or jsonb_typeof(p_payload -> 'name') <> 'string'
         or char_length(btrim(p_payload ->> 'name')) not between 1 and 80 then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
      end if;
      v_objects := jsonb_set(v_objects, array[(v_index - 1)::text, 'name'],
        to_jsonb(btrim(p_payload ->> 'name')), false);

    elsif p_command_type = 'object.transform.set' then
      if public.jsonb_key_count(p_payload) <> 2
         or jsonb_typeof(p_payload -> 'transform') <> 'object'
         or public.jsonb_key_count(p_payload -> 'transform') <> 3
         or not ((p_payload -> 'transform') ?& array['position','rotation','scale']) then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
      end if;
      v_transform := p_payload -> 'transform';
      if not public.is_valid_scene_vec3(v_transform -> 'position', -10000, 10000, false)
         or not public.is_valid_scene_vec3(v_transform -> 'rotation', -100000, 100000, false)
         or not public.is_valid_scene_vec3(v_transform -> 'scale', 0.001, 1000, true) then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_TRANSFORM';
      end if;
      v_objects := jsonb_set(v_objects, array[(v_index - 1)::text, 'transform'], v_transform, false);

    elsif p_command_type = 'object.visibility.set' then
      if public.jsonb_key_count(p_payload) <> 2
         or jsonb_typeof(p_payload -> 'visible') <> 'boolean' then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
      end if;
      v_objects := jsonb_set(v_objects, array[(v_index - 1)::text, 'visible'],
        p_payload -> 'visible', false);

    elsif p_command_type = 'object.material.set' then
      if public.jsonb_key_count(p_payload) <> 2
         or jsonb_typeof(p_payload -> 'material') <> 'object'
         or public.jsonb_key_count(p_payload -> 'material') <> 1
         or jsonb_typeof(p_payload #> '{material,color}') <> 'string' then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
      end if;
      v_material := p_payload -> 'material';
      v_color := v_material ->> 'color';
      if v_color !~ '^#[0-9A-Fa-f]{6}$' then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_COLOR';
      end if;
      v_objects := jsonb_set(v_objects, array[(v_index - 1)::text, 'material'], v_material, false);
    end if;
  end if;

  if p_command_type like 'object.%' then
    v_document := jsonb_set(v_document, '{objects}', v_objects, false);
  end if;
  if octet_length(v_document::text) > 1048576 then
    raise exception using errcode = '54000', message = 'FORMA_LIMIT_EXCEEDED';
  end if;

  update public.scenes set document = v_document, revision = revision + 1
  where id = p_scene_id returning * into v_scene;

  insert into public.scene_command_receipts(
    scene_id, command_id, actor_id, request_fingerprint, command_type, resulting_revision
  ) values (p_scene_id, p_command_id, v_actor, v_request_fingerprint, p_command_type, v_scene.revision);

  return jsonb_build_object('command_id', p_command_id,
    'revision', v_scene.revision, 'duplicate', false);
end;
$$;

revoke all on function public.apply_scene_command(uuid, uuid, bigint, text, jsonb) from public, anon;
grant execute on function public.apply_scene_command(uuid, uuid, bigint, text, jsonb) to authenticated;

commit;
;
end;
$;
revoke all on function public.is_valid_scene_object(jsonb) from public, anon, authenticated;

create or replace function public.apply_scene_command(
  p_scene_id uuid,
  p_command_id uuid,
  p_expected_revision bigint,
  p_command_type text,
  p_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor uuid := auth.uid();
  v_scene public.scenes%rowtype;
  v_receipt public.scene_command_receipts%rowtype;
  v_document jsonb;
  v_objects jsonb;
  v_object jsonb;
  v_transform jsonb;
  v_material jsonb;
  v_settings jsonb;
  v_target_id text;
  v_index bigint;
  v_object_count integer;
  v_color text;
  v_request_fingerprint text;
begin
  if v_actor is null then
    raise exception using errcode = '28000', message = 'FORMA_UNAUTHENTICATED';
  end if;
  if p_scene_id is null or p_command_id is null
     or p_expected_revision is null or p_expected_revision < 1
     or p_command_type is null or p_payload is null
     or jsonb_typeof(p_payload) <> 'object'
     or octet_length(p_payload::text) > 16384 then
    raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
  end if;
  if p_command_type not in (
    'object.create', 'object.delete', 'object.rename',
    'object.transform.set', 'object.visibility.set',
    'object.material.set', 'scene.settings.set'
  ) then
    raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
  end if;

  select s.* into v_scene
  from public.scenes s
  where s.id = p_scene_id
  for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'FORMA_NOT_FOUND';
  end if;

  if v_scene.owner_id <> v_actor and not exists (
    select 1 from public.scene_members sm
    where sm.scene_id = p_scene_id and sm.user_id = v_actor and sm.role = 'editor'
  ) then
    raise exception using errcode = '42501', message = 'FORMA_FORBIDDEN';
  end if;

  select r.* into v_receipt
  from public.scene_command_receipts r
  where r.scene_id = p_scene_id and r.command_id = p_command_id;
  if found then
    if v_receipt.actor_id <> v_actor
       or v_receipt.command_type <> p_command_type
       or v_receipt.request_fingerprint <> v_request_fingerprint then
      raise exception using errcode = '22023', message = 'FORMA_IDEMPOTENCY_MISMATCH';
    end if;
    return jsonb_build_object('command_id', p_command_id,
      'revision', v_receipt.resulting_revision, 'duplicate', true);
  end if;

  if v_scene.revision <> p_expected_revision then
    raise exception using errcode = '40001', message = 'FORMA_REVISION_CONFLICT';
  end if;

  v_document := v_scene.document;
  v_objects := v_document -> 'objects';
  if jsonb_typeof(v_document) <> 'object'
     or v_document ->> 'schemaVersion' <> '1'
     or jsonb_typeof(v_objects) <> 'array' then
    raise exception using errcode = '22023', message = 'FORMA_INVALID_SCENE_DOCUMENT';
  end if;
  v_object_count := jsonb_array_length(v_objects);

  if p_command_type = 'object.create' then
    if public.jsonb_key_count(p_payload) <> 1
       or not (p_payload ? 'object')
       or jsonb_typeof(p_payload -> 'object') <> 'object' then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
    end if;
    v_object := p_payload -> 'object';
    if public.jsonb_key_count(v_object) <> 6
       or not (v_object ?& array['id','type','name','visible','transform','material'])
       or jsonb_typeof(v_object -> 'id') <> 'string'
       or char_length(v_object ->> 'id') not between 1 and 64
       or jsonb_typeof(v_object -> 'type') <> 'string'
       or v_object ->> 'type' not in ('box','sphere','plane')
       or jsonb_typeof(v_object -> 'name') <> 'string'
       or char_length(btrim(v_object ->> 'name')) not between 1 and 80
       or jsonb_typeof(v_object -> 'visible') <> 'boolean'
       or jsonb_typeof(v_object -> 'transform') <> 'object'
       or public.jsonb_key_count(v_object -> 'transform') <> 3
       or not ((v_object -> 'transform') ?& array['position','rotation','scale'])
       or jsonb_typeof(v_object -> 'material') <> 'object'
       or public.jsonb_key_count(v_object -> 'material') <> 1
       or not ((v_object -> 'material') ? 'color')
       or jsonb_typeof(v_object #> '{material,color}') <> 'string' then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
    end if;
    v_transform := v_object -> 'transform';
    if not public.is_valid_scene_vec3(v_transform -> 'position', -10000, 10000, false)
       or not public.is_valid_scene_vec3(v_transform -> 'rotation', -100000, 100000, false)
       or not public.is_valid_scene_vec3(v_transform -> 'scale', 0.001, 1000, true) then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_TRANSFORM';
    end if;
    v_color := v_object #>> '{material,color}';
    if v_color !~ '^#[0-9A-Fa-f]{6}$' then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_COLOR';
    end if;
    if v_object_count >= 100 then
      raise exception using errcode = '54000', message = 'FORMA_LIMIT_EXCEEDED';
    end if;
    if exists (select 1 from jsonb_array_elements(v_objects) e(value)
      where e.value ->> 'id' = v_object ->> 'id') then
      raise exception using errcode = '22023', message = 'FORMA_DUPLICATE_OBJECT_ID';
    end if;
    v_objects := v_objects || jsonb_build_array(
      jsonb_set(v_object, '{name}', to_jsonb(btrim(v_object ->> 'name')), false)
    );

  elsif p_command_type = 'scene.settings.set' then
    if public.jsonb_key_count(p_payload) <> 1
       or not (p_payload ? 'settings')
       or jsonb_typeof(p_payload -> 'settings') <> 'object' then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
    end if;
    v_settings := p_payload -> 'settings';
    if public.jsonb_key_count(v_settings) <> 2
       or not (v_settings ?& array['background','gridVisible'])
       or jsonb_typeof(v_settings -> 'background') <> 'string'
       or (v_settings ->> 'background') !~ '^#[0-9A-Fa-f]{6}$'
       or jsonb_typeof(v_settings -> 'gridVisible') <> 'boolean' then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_SETTINGS';
    end if;
    v_document := jsonb_set(v_document, '{settings}', v_settings, false);

  else
    if public.jsonb_key_count(p_payload) < 1
       or jsonb_typeof(p_payload -> 'target_id') <> 'string'
       or char_length(p_payload ->> 'target_id') not between 1 and 64 then
      raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
    end if;
    v_target_id := p_payload ->> 'target_id';
    select ordinality into v_index
    from jsonb_array_elements(v_objects) with ordinality as e(value, ordinality)
    where e.value ->> 'id' = v_target_id
    limit 1;
    if v_index is null then
      raise exception using errcode = '22023', message = 'FORMA_TARGET_NOT_FOUND';
    end if;

    if p_command_type = 'object.delete' then
      if public.jsonb_key_count(p_payload) <> 1 then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
      end if;
      select coalesce(jsonb_agg(value order by ordinality), '[]'::jsonb)
      into v_objects
      from jsonb_array_elements(v_objects) with ordinality
      where ordinality <> v_index;

    elsif p_command_type = 'object.rename' then
      if public.jsonb_key_count(p_payload) <> 2
         or jsonb_typeof(p_payload -> 'name') <> 'string'
         or char_length(btrim(p_payload ->> 'name')) not between 1 and 80 then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
      end if;
      v_objects := jsonb_set(v_objects, array[(v_index - 1)::text, 'name'],
        to_jsonb(btrim(p_payload ->> 'name')), false);

    elsif p_command_type = 'object.transform.set' then
      if public.jsonb_key_count(p_payload) <> 2
         or jsonb_typeof(p_payload -> 'transform') <> 'object'
         or public.jsonb_key_count(p_payload -> 'transform') <> 3
         or not ((p_payload -> 'transform') ?& array['position','rotation','scale']) then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
      end if;
      v_transform := p_payload -> 'transform';
      if not public.is_valid_scene_vec3(v_transform -> 'position', -10000, 10000, false)
         or not public.is_valid_scene_vec3(v_transform -> 'rotation', -100000, 100000, false)
         or not public.is_valid_scene_vec3(v_transform -> 'scale', 0.001, 1000, true) then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_TRANSFORM';
      end if;
      v_objects := jsonb_set(v_objects, array[(v_index - 1)::text, 'transform'], v_transform, false);

    elsif p_command_type = 'object.visibility.set' then
      if public.jsonb_key_count(p_payload) <> 2
         or jsonb_typeof(p_payload -> 'visible') <> 'boolean' then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
      end if;
      v_objects := jsonb_set(v_objects, array[(v_index - 1)::text, 'visible'],
        p_payload -> 'visible', false);

    elsif p_command_type = 'object.material.set' then
      if public.jsonb_key_count(p_payload) <> 2
         or jsonb_typeof(p_payload -> 'material') <> 'object'
         or public.jsonb_key_count(p_payload -> 'material') <> 1
         or jsonb_typeof(p_payload #> '{material,color}') <> 'string' then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_COMMAND';
      end if;
      v_material := p_payload -> 'material';
      v_color := v_material ->> 'color';
      if v_color !~ '^#[0-9A-Fa-f]{6}$' then
        raise exception using errcode = '22023', message = 'FORMA_INVALID_COLOR';
      end if;
      v_objects := jsonb_set(v_objects, array[(v_index - 1)::text, 'material'], v_material, false);
    end if;
  end if;

  if p_command_type like 'object.%' then
    v_document := jsonb_set(v_document, '{objects}', v_objects, false);
  end if;
  if octet_length(v_document::text) > 1048576 then
    raise exception using errcode = '54000', message = 'FORMA_LIMIT_EXCEEDED';
  end if;

  update public.scenes set document = v_document, revision = revision + 1
  where id = p_scene_id returning * into v_scene;

  insert into public.scene_command_receipts(
    scene_id, command_id, actor_id, request_fingerprint, command_type, resulting_revision
  ) values (p_scene_id, p_command_id, v_actor, v_request_fingerprint, p_command_type, v_scene.revision);

  return jsonb_build_object('command_id', p_command_id,
    'revision', v_scene.revision, 'duplicate', false);
end;
$$;

revoke all on function public.apply_scene_command(uuid, uuid, bigint, text, jsonb) from public, anon;
grant execute on function public.apply_scene_command(uuid, uuid, bigint, text, jsonb) to authenticated;

commit;
