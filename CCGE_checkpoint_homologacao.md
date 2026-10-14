# Retomada — 14/10/2026 — candidata v1.62.7.4

## Estado atual e limites

Branch exclusiva: audit/ccge-v1-62-7-validation em gabrielheinlein/CCGE. Base remota: 0b485514579e5160bd0af85f694fc167cbdcda84.
Workspace: /workspace/scratch/c882b8e90bf3/ccge. Nenhuma mudança de main ou produção; nenhuma escrita de dados do CCGE-TESTES nesta retomada.
A candidata NÃO está homologada pela interface. O navegador abriu o ambiente de testes, mas exibiu login, sem sessão ativa.

## Implementação da Alternativa C

- Importar CRD na aba Medições/Custos Reais da tarefa, com seleção individual e conferência de todos os campos; o importador legado encaminha CRDs para essa revisão.
- Tabela de resumo e campos de correção; PDF original ao lado; página de origem e botão de localização quando a geometria identifica a origem.
- Seleção automática só com correspondência única por descrição/ME; seleção manual restrita à tarefa aberta.
- Confirmação adiciona registros ao rascunho. Gravação definitiva somente em Salvar alterações, junto do registro interno do documento, via CAS.
- Importação parcial, deduplicação global entre tarefas e histórico que permanece após exclusão de medição. Chaves incluem CRD/ME/documento/CNPJ; valores ou posição visual não definem a identidade.
- Reutilização de PDF pelo SHA-256 no registro central de novos documentos; registros históricos anteriores sem hash ainda exigem migração/verificação.
- Auditoria de usuário, datas e campos alterados. Valores, competência e datas de novos registros CRD são validados novamente no salvamento.
- Falha de extração/alinhamento oferece conferência manual sem criar linhas ou preencher dados não extraídos. Competência derivada da emissão aparece como campo a conferir; a identificação automática de competência explícita ainda exige revisão.
- Proteções de troca de tarefa, upload pendente, compartilhamento e cancelamento preservadas.

## Correções adicionais da auditoria

- Exclusão de tarefa respeita referências dos documentos centrais, custos mensais e demais tarefas.
- Cancelamento captura a fila de uploads antes de limpar a fila; inclui os PDFs dos rascunhos centrais.
- Registro central conserva vínculo/status Ativa/Cancelada/Excluída e metadados mesmo ao remover a medição.
- Rótulos de gráficos e inteligência distinguem Contratado atualizado de estimativa.
- Próximo vencimento em Projetos deriva de pagamentos com saldo; Incorrido a pagar usa o motor financeiro canônico.
- Controle CAS de concorrência e escrita exclusiva por RPC confirmados no banco: INSERT/UPDATE diretos não permitidos a authenticated.

## Evidências desta retomada

| Verificação | Resultado | Alcance |
|---|---|---|
| node --test tests/*.test.js | 11 arquivos aprovados, zero falhas | Regressões automatizadas; não homologação da interface |
| node tests/real-task-crd.mjs | Aprovado | PDFs reais em PDF.js; CRD 035: 4/R$ 103.032,95; CRD 055: 5/R$ 44.824,95 |
| Fornecedor/descrição/ME/página de origem | Alinhados em ambos os PDFs | Extração local, sem Storage real novo |
| Seleção parcial e importação posterior | Aprovadas em teste | Planejamento/rascunho e união do registro central |
| Duplicidade entre tarefas e fornecedor distinto com mesmo NF/ME | Aprovadas em teste | Identidade sem dependência da ordem visual |
| Datas impossíveis, competência ausente, fração de centavo | Rejeitadas em teste | Novo fluxo de CRD |
| Metadados de PDF compartilhado e preservação após exclusão | Aprovados em teste | Não exclusão física real |
| Todos os scripts embutidos | Sintaxe aprovada | Não equivale a executar todos os fluxos DOM |
| CCGE-TESTES por SQL somente leitura | Revisão 51; 13 tarefas; 0 documentos centrais | Estado encontrado; não modificado nesta retomada |
| Perfis administrativo/financeiro | Não implementados no estado inspecionado | Há um usuário sem papel em app_metadata; RPC só exige autenticação |

## Pendências obrigatórias — não encerradas

1. Deploy e homologação autenticada da v1.62.7.4; seleção, reabertura, edição, exclusão e indicadores com importações parciais reais em tarefas distintas.
2. Upload por arraste real; exclusão física na tarefa descartável t4m4cebf e pagamentos pela interface.
3. Controle de acesso administrativo/financeiro no servidor e interface; validar contas dos dois perfis. Não atribuir papéis aos usuários por suposição.
4. Correção controlada de vínculo entre tarefas com histórico, preservando identidade e prevenindo duplicação. Não há ação de transferência homologada.
5. Deduplicação/migração dos PDFs legados sem SHA-256; não apresentar como garantida para todo o histórico.
6. Concorrência entre usuários e falhas remotas no novo fluxo; os testes existentes de upload cobrem o pipeline anterior, complementados pelos novos testes puros.
7. Evitar inferência de competência quando não houver período explícito no documento; conferir manualmente.
8. Revisão completa dos módulos gerais: tarefas, contratos/aditivos, custos mensais, KPIs, relatórios, permissões, dimensões e responsividade real. A análise técnica de parte desses módulos não é homologação integral.
9. Reconciliar histórico central após mudanças posteriores, inclusive edição/exclusão/transferência de registros históricos anteriores.

## Recomendação

Não publicar em produção. Candidata de testes, com validação automatizada e dos PDFs, mas sem aceite funcional completo e com pendências de autorização por perfil e transferência controlada.

---

# Retomada adicional — v1.62.7.3 (13/10/2026)

## Estado mais recente, prevalece sobre os registros abaixo

Fonte funcional: commit 06ec7df3610598e0e9ed6f5bf040993600a687a2, branch audit/ccge-v1-62-7-validation em gabrielheinlein/CCGE.
Regressão financeira adicionada: commit 948f480742b4cc781bce1c05f0aad520468b5a54.
Cópia local preservada: /workspace/sites/ccge-homologacao, commit 7c36de2.
Somente CCGE-TESTES (atykpyvhtdtpebnpnewe). Nenhuma alteração ou publicação em produção.

Correções adicionais:
- Custo incorrido zero não recupera valor antigo quando todas as medições estão canceladas.
- Pagamento explícito com valor pago zero não recupera o cache legado.
- Marcadores de controle de medições/pagamentos permitem zerar após remover o último registro, preservando compatibilidade com registros legados sem lançamentos.
- Salvamento formata todos os campos monetários com querySelectorAll; eliminada exceção que mantinha o botão de salvar desabilitado após a gravação.

Testes reais executados:
- Nove medições canceladas: resumo R$ 0,00; gravação real no banco, revisão 34; cancelamentos e zero persistidos após recarga.
- Restauradas todas as situações anteriores: nove medições e R$ 147.857,90 preservados.
- Botão Salvar alterações voltou a ficar habilitado após salvar; leitura DOM confirmou disabled=false.
- Nova tarefa descartável criada para testar exclusão física de anexos: id t4m4cebf, nome HOMOLOGACAO DESCARTE DE ANEXOS — 13-10-2026. Ficou salva vazia; não houve upload nessa tarefa.
- Estado final confirmado via SQL: revisão 39; tarefa original tpv8ycs4 tem 9 medições; tarefa descartável tem 0. Storage tem exatamente 2 PDFs da tarefa original e 0 arquivos temporários.
- Seis arquivos de regressão passaram, incluindo financial-zero.test.js com cancelamentos, pagamento zero, remoção do último registro e preservação de histórico legado.

## Bloqueio atual e continuidade

Após os logins seguros previamente homologados, operações de upload/log voltaram a acionar proteção de dados do navegador. Houve navegação explícita para o domínio alvo, reinicialização documentada do controle e tentativa de abrir uma nova aba; o runtime continuou retornando: native credential state cannot be safely resumed. Não insistir no mesmo contexto nem pedir ao usuário para clicar em controles de um navegador que não pode ser observado.
A homologação adicional não está concluída. Pendem exclusão física do último vínculo de PDF (usar tarefa descartável t4m4cebf), pagamento pela interface com atualização de totais e demais módulos fora do escopo já testado. Arrastar arquivo real continua sem evidência de execução. Não marcar esses casos como aprovados.
Retomar em novo contexto de execução/navegador, preservando a branch e as correções. Os logins por clique e Enter já foram testados na v1.62.7.2; evitar repetir autenticação sem necessidade, pois ela originou a nova restrição do runtime. A nova revisão mexeu no motor financeiro e no pós-salvamento, não no login.

---

# CCGE — checkpoint atualizado da homologação

Atualização: 13/10/2026. Versão testada: v1.62.7.2.
Repositório: gabrielheinlein/CCGE. Branch: audit/ccge-v1-62-7-validation.
Commit funcional: 5f50e79eb21086e7e2b868a19261c99eca257d6e.
Commit com regressões: 9796ab07d49b3e7e500952ee8f03365373795dff.

## Ambiente e preservação

Frontend de testes: https://ccge-git-audit-ccge-v1-62-7-validation-ccge2.vercel.app/
Supabase exclusivo: CCGE-TESTES, atykpyvhtdtpebnpnewe.
A configuração e a CSP permitem conexões Supabase apenas ao projeto de testes.
Não houve alteração do main do repositório gabrielheinlein/CCGE nem publicação em produção.
As quatro correções da candidata anterior foram incorporadas à branch de auditoria: bloqueio de upload simultâneo, bloqueio de salvar durante envio, identificação da sessão do modal e rollback restrito às medições afetadas.
A cópia local em /workspace/sites/ccge-homologacao foi preservada no commit local 02038b4; não foi publicada no Sites nesta retomada.

## Correções nesta retomada

- Parser CRD acessa a função monetária por ponte explícita; corrigido parseMoney is not defined.
- Renderização do importador também usa ponte explícita, evitando renderInvoices fora de escopo.
- Limpeza de uploads e fila de exclusão usam document.querySelector e notificação pública, evitando $ e toast fora de escopo.
- Edição de fornecedor, documento, medição, descrição e valor atualiza o rascunho no evento input; edição manual validada por gravação e releitura.
- Versão exibida e verificador de atualização sincronizados, eliminando recargas repetidas da candidata.

## Homologação real pela interface

| Teste | Resultado | Evidência |
|---|---|---|
| CRD 035 — seleção, leitura, upload real | PASSOU | 4 lançamentos; R$ 103.032,95; fornecedor multilinha correto |
| CRD 055 — seleção, leitura, upload real | PASSOU | 5 lançamentos; R$ 44.824,95 |
| Total e campos essenciais | PASSOU | 9 lançamentos; R$ 147.857,90; fornecedor, NF, medição, competência, datas e descrição |
| Salvar, fechar, recarregar e reabrir | PASSOU | 9 lançamentos e 9 vínculos de anexo preservados |
| Abrir os dois PDFs salvos | PASSOU | PDFs reais renderizados pelo visualizador do navegador |
| Reimportar os dois CRDs na mesma tarefa | PASSOU | Bloqueio informado; os 9 registros originais permaneceram idênticos |
| Criar, editar e excluir medição manual descartável | PASSOU | R$ 1 gravado/reaberto; exclusão confirmada no banco; total original restaurado |
| Remover vínculo compartilhado e cancelar | PASSOU | 8 vínculos no rascunho; nenhuma exclusão física enfileirada; cancelar restaurou os 9 vínculos |
| Upload em tarefa não salva e cancelar | PASSOU | PDF temporário criado e removido; Storage ficou com 0 arquivos em tarefas/nova e 2 PDFs da tarefa salva |
| Abrir, fechar, expandir e restaurar modal | PASSOU | Modal expandido apresentou formulário e resumo; restaurar recuperou área Documento antes encoberta |
| Login pelo botão Entrar | PASSOU | Autenticação segura; painel e dados persistidos visíveis após login |
| Login pela tecla Enter | PASSOU | Autenticação segura com press_enter; painel e 9 medições confirmados |

Tarefa de evidência: HOMOLOGACAO CRD 035 e 055 — 13-10-2026; id tpv8ycs4.
Banco: revisão 29, 9 medições, soma R$ 147.857,90. Dois arquivos reais no Storage da tarefa. Registros descartáveis removidos.

## Testes automatizados preservados

Cinco arquivos de regressão passaram: parser, geometria do fornecedor, pipeline, concorrência/rollback e limpeza temporária. Os dois PDFs reais também passaram pelo pipeline no runtime: nove lançamentos, uma referência de PDF por CRD e duplicação rejeitada. Esses testes complementam os testes de interface acima.

## Limites explícitos

A seleção de arquivos está homologada. Arrastar um arquivo real do sistema operacional para a zona de drop não foi executado: a API disponível oferece seletor de arquivos, mas não uma origem de arraste de arquivos do sistema. Não marcar esse caso como PASSOU.
Concorrência, falha de Storage e troca de tarefa durante envio foram cobertas por regressões automatizadas, não por injeção de falhas no navegador.
Este aceite cobre Nova Medição com os CRDs 035 e 055 e as regressões relacionadas; não equivale a uma auditoria integral de todos os módulos ou liberação de produção.
Nenhuma ação do usuário está pendente para o fluxo de seleção já homologado.

---

## Checkpoint anterior preservado como histórico

# CCGE — checkpoint da homologação

Data: 13/10/2026. Origem: gabrielheinlein/CCGE, branch audit/ccge-v1-62-7-validation, commit 31aaf82b7d7a5f5df387f2e3f2cc56f9f987fd96.

## Ambiente isolado

Candidata privada: https://ccge-homologacao-audit-20261013.genialvine.chatgpt.site
Fonte separada: /workspace/sites/ccge-homologacao. Commit implantado: 43f1980470d3066474cd9fc984d21e8e84043d04.
Supabase exclusivo: CCGE-TESTES, atykpyvhtdtpebnpnewe. Configuração e chave publicável substituídas na cópia; CSP restringe conexões Supabase ao projeto de testes. Produção e main não foram modificados nesta sessão. A branch GitHub original também não recebeu estas novas correções.

## Correções realizadas na candidata

- Bloqueio de importações simultâneas por clique/arrastar, independente da recriação da zona de drop.
- Bloqueio do salvamento enquanto leitura/upload de medição estão pendentes.
- Identificação da sessão do modal: upload concluído após fechamento/troca da tarefa remove seu arquivo temporário e não o vincula à outra tarefa.
- Rollback de falha limitado às medições afetadas; preserva notas e outras edições e não restaura a tarefa antiga sobre outra tarefa.

## Evidências

| Verificação | Resultado | Limite |
|---|---|---|
| Leitura dos PDFs reais com PDF.js | PASSOU | Executada no runtime, não na interface |
| CRD 035: 4 linhas e R$ 103.032,95 | PASSOU | Nome multilinha reconstruído pela geometria |
| CRD 055: 5 linhas e R$ 44.824,95 | PASSOU | Todos os campos essenciais extraídos |
| Pipeline real do código: 9 medições, fornecedor/NF/ME/competência/datas/valor | PASSOU | DOM e Storage simulados |
| 1 referência PDF compartilhada por CRD | PASSOU | Metadados simulados, não upload Storage real |
| Reimportação dos dois CRDs bloqueada | PASSOU | Mesma tarefa; pipeline sem navegador |
| Upload simultâneo | FALHOU antes; PASSOU após correção | Teste reproduzível em tests/upload-race.test.js |
| Falha de upload e preservação de outras edições/troca de tarefa | PASSOU após correção | Testes do pipeline |
| Parser sintético/layout/pipeline legado | PASSOU | Regressões automatizadas existentes |
| Gravação e releitura dos nove lançamentos via CAS no CCGE-TESTES | PASSOU | SQL transacional com role authenticated; não sessão HTTP do usuário |
| Revisão obsoleta rejeitada, dados preservados | PASSOU | Banco real, dentro de transação |
| Rollback do teste | PASSOU | Base continua revisão 0 e 11 tarefas |
| Arrastar real no navegador, upload real, abrir PDF | NÃO TESTÁVEL | Sessão autenticada indisponível |
| Salvar/fechar/reabrir pela interface e novo login | NÃO TESTÁVEL | Não homologado |
| Login clique/Enter, expansão/fechamento, regressões visuais | NÃO TESTÁVEL | Não homologado |

## Bloqueio atual

O deployment Vercel fornecido redireciona ao login da Vercel. O browser programático respondeu, mas o usuário relatou que sua interface de controle manual congelou. Não foram solicitadas novas tentativas manuais após a última instrução.

A alternativa privada foi implantada com sucesso via Sites; seu endereço abre uma tela de login do ChatGPT neste navegador, e não a aplicação. Não foi tornado público nem removida autenticação. GitHub e Supabase permitem ler código e testar banco, mas não fornecem uma sessão autenticada do frontend nem uma ferramenta de interação com seu DOM/upload real. Não há credenciais de aplicação disponíveis nas ferramentas. Portanto a homologação integral permanece pendente; os testes automatizados não são apresentados como equivalentes ao teste na interface.

