-- CCGE: migração de homologação para controle de concorrência otimista.
-- NÃO executar diretamente no banco de produção sem backup, revisão das RLS e teste em staging.
-- Mantém ccge_state(id,dados,atualizado_em) e adiciona contador de versão.
begin;
alter table public.ccge_state add column if not exists revisao bigint not null default 0;
-- Bloqueia clientes legados que fazem UPDATE/UPSERT sem incrementar a revisão.
-- Não substitui políticas RLS: um cliente com UPDATE irrestrito ainda poderia
-- incrementar revisao manualmente. Restringir escrita direta antes da produção.
create or replace function public.ccge_enforce_revision_increment()
returns trigger language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.revisao is distinct from old.revisao + 1 then
    raise exception 'CCGE: revisão inválida; use gravação transacional'
      using errcode = '23514';
  end if;
  return new;
end;
$$;
drop trigger if exists ccge_revision_guard on public.ccge_state;
create trigger ccge_revision_guard
before update on public.ccge_state
for each row execute function public.ccge_enforce_revision_increment();

create or replace function public.ccge_save_state_cas(
  p_id uuid,
  p_expected_revision bigint,
  p_dados jsonb
) returns table(ok boolean, current_revision bigint)
language plpgsql security invoker
set search_path = public, pg_temp
as $$
declare v_revision bigint;
begin
  -- UPDATE condicional é atômico sob concorrência: apenas uma sessão vence cada revisão.
  update public.ccge_state
     set dados = p_dados,
         revisao = revisao + 1,
         atualizado_em = clock_timestamp()
   where id = p_id and revisao = p_expected_revision
   returning revisao into v_revision;
  if found then
    return query select true, v_revision;
  else
    select revisao into v_revision from public.ccge_state where id = p_id;
    return query select false, v_revision;
  end if;
end;
$$;
-- A função é SECURITY INVOKER: respeita as políticas RLS da tabela.
-- Restringir EXECUTE conforme a política de acesso aprovada no ambiente de destino.
revoke all on function public.ccge_save_state_cas(uuid,bigint,jsonb) from public;
grant execute on function public.ccge_save_state_cas(uuid,bigint,jsonb) to authenticated;
commit;
