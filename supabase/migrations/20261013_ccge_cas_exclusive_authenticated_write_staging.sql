-- STAGING ONLY. Restore direct grants only with a deliberate rollback review.
begin;
create or replace function public.ccge_save_state_cas(p_id uuid,p_expected_revision bigint,p_dados jsonb)
returns table(ok boolean,current_revision bigint)
language plpgsql security definer
set search_path = public, pg_temp
as $$
declare v_revision bigint;
begin
 if auth.uid() is null or auth.role() <> 'authenticated' then
   raise exception 'CCGE: autenticação obrigatória' using errcode='42501';
 end if;
 if p_id is null or p_expected_revision is null or p_expected_revision < 0 or p_dados is null or jsonb_typeof(p_dados) <> 'object' then
   raise exception 'CCGE: argumentos inválidos' using errcode='22023';
 end if;
 update public.ccge_state set dados=p_dados,revisao=revisao+1,atualizado_em=clock_timestamp()
 where id=p_id and revisao=p_expected_revision
 returning revisao into v_revision;
 if found then
   return query select true,v_revision;
 else
   select revisao into v_revision from public.ccge_state where id=p_id;
   return query select false,v_revision;
 end if;
end;
$$;
revoke all on public.ccge_state from anon,authenticated;
grant select on public.ccge_state to authenticated;
revoke all on function public.ccge_save_state_cas(uuid,bigint,jsonb) from public,anon;
grant execute on function public.ccge_save_state_cas(uuid,bigint,jsonb) to authenticated;
commit;