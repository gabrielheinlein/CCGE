# Controle de versão transacional — CCGE (homologação)

Este arquivo prepara uma migração **não aplicada** ao Supabase. O CCGE atualmente grava um JSON consolidado na tabela `ccge_state`, de modo que duas sessões podem sobrescrever uma à outra.

## Operação proposta
A coluna `revisao` inicia em zero para registros existentes. O procedimento `ccge_save_state_cas` aceita `p_id`, `p_expected_revision` e `p_dados`; executa um UPDATE condicionado à revisão esperada e incrementa a revisão em uma transação. Quando a revisão não corresponde, devolve `ok=false` sem modificar os dados. A implementação é `SECURITY INVOKER` e depende das permissões e políticas RLS existentes.

## Pré-condições antes da aplicação
1. Backup e restauração testada de `ccge_state`, com confirmação dos tipos de `id` (UUID), `dados` (JSONB), `atualizado_em` (timestamp).
2. Validar RLS e permissões: SELECT/UPDATE e EXECUTE para usuários autorizados; não confiar apenas no login do frontend.
3. Aplicar somente em projeto Supabase de homologação e testar duas sessões concorrentes.
4. Alterar o frontend para carregar `dados,revisao` e gravar **exclusivamente** por RPC CAS. Retirar qualquer caminho legado de `upsert` que contorne a proteção.
5. Em conflito, bloquear a sobrescrita, preservar a edição local e oferecer recarga/reconciliação explícita; não realizar mesclagem automática de registros financeiros.
6. Confirmar que todas as operações de escrita, incluindo pagamentos, contratos, custos mensais, tarefas e exclusões, passam pela mesma revisão.
7. Testar reconexão, falha de RPC, rejeição por RLS, duas sessões simultâneas e persistência após novo login.

## Limites
Esta migração não foi executada. A implementação atual no `index.html` apenas compara estados antes de gravar, sem atomicidade; **não está pronta para produção**. O SQL não protege contra clientes antigos que ainda escrevam diretamente por `upsert`. Para produção será preciso restringir essas gravações diretas por RLS/permissões ou migrar todos os clientes para RPC e aplicar um mecanismo no banco que impeça bypass.

## Teste de concorrência recomendado
Duas sessões A e B leem revisão N. A envia RPC com N e recebe N+1. B envia RPC com N e recebe conflito, mantendo N+1 e o JSON de A. Em seguida B recarrega e reconcilia manualmente antes de tentar nova gravação.
