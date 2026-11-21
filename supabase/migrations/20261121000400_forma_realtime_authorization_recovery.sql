-- FORMA Phase 05: private Realtime channel authorization and recovery RPC
-- REVIEW DRAFT ONLY. Not applied or tested against Supabase.
-- Depends on 20261121000100_forma_core_schema.sql, 20261121000200_forma_scene_command_rpc.sql,
-- and the Supabase Realtime schema/table/functions being available in the target project.

begin;

-- Channel topic contract: forma:scene:<lowercase-scene-uuid>:v1
-- Clients MUST subscribe with private: true. This policy is not a substitute
-- for RLS on public.scenes / scene_members / command RPCs.

create or replace function public.can_access_forma_scene_topic(p_topic text)
returns boolean
language sql
stable
set search_path = ''
as $fn$
  select case
    when p_topic ~ '^forma:scene:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}:v1$'
      then public.is_scene_member(split_part(p_topic, ':', 3)::uuid)
    else false
  end;
$fn$;

revoke all on function public.can_access_forma_scene_topic(text) from public, anon;
grant execute on function public.can_access_forma_scene_topic(text) to authenticated;

-- Realtime authorization is membership-based for both receiving and sending.
-- Presence/Broadcast payloads are untrusted ephemeral hints, never durable state.
drop policy if exists forma_scene_channel_receive on realtime.messages;
create policy forma_scene_channel_receive
  on realtime.messages
  for select
  to authenticated
  using (public.can_access_forma_scene_topic(realtime.topic()));

drop policy if exists forma_scene_channel_send on realtime.messages;
create policy forma_scene_channel_send
  on realtime.messages
  for insert
  to authenticated
  with check (public.can_access_forma_scene_topic(realtime.topic()));

-- Reconnect recovery: return only the current actor's requested command receipts.
-- Scene documents remain available through the existing membership-protected
-- scenes SELECT policy; receipt rows remain inaccessible through direct table grants.
create or replace function public.get_scene_command_receipts(
  p_scene_id uuid,
  p_command_ids uuid[]
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_actor uuid := auth.uid();
begin
  if v_actor is null then
    raise exception using errcode = '28000', message = 'FORMA_UNAUTHENTICATED';
  end if;
  if p_scene_id is null
     or p_command_ids is null
     or cardinality(p_command_ids) not between 1 and 100 then
    raise exception using errcode = '22023', message = 'FORMA_INVALID_RECEIPT_QUERY';
  end if;
  if not public.is_scene_member(p_scene_id) then
    raise exception using errcode = '42501', message = 'FORMA_FORBIDDEN';
  end if;

  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'command_id', r.command_id,
      'command_type', r.command_type,
      'resulting_revision', r.resulting_revision,
      'created_at', r.created_at
    ) order by r.resulting_revision)
    from public.scene_command_receipts r
    where r.scene_id = p_scene_id
      and r.actor_id = v_actor
      and r.command_id = any(p_command_ids)
  ), '[]'::jsonb);
end;
$fn$;

revoke all on function public.get_scene_command_receipts(uuid, uuid[]) from public, anon;
grant execute on function public.get_scene_command_receipts(uuid, uuid[]) to authenticated;

commit;
