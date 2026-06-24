# Plano de Implementacao - Menu Equipes

## Objetivo

Criar um menu principal chamado **Equipes** para cadastrar os periodos em que pessoas estao atuando na equipe do Mestre Assistente e na equipe da Organ. Esses periodos serao usados depois para ajustar os calculos de BI/percentuais, evitando cobrar escala da Organ de quem ja esta cumprindo funcao no periodo.

## Status Atual

- Primeira entrega iniciada: CRUD de periodos, menu principal, resumo de eventos/formularios do periodo e atalhos para resultados.
- BI/percentuais integrado ao snapshot de participacao: dispensados por equipe nao entram no denominador e aparecem no detalhe do socio.

## Regras De Negocio

- Um periodo deve ter data de inicio e data de conclusao.
- A data de conclusao nao pode ser anterior a data de inicio.
- Nao pode existir sobreposicao entre periodos de equipes.
- O Mestre Assistente e obrigatorio.
- O Auxiliar Direto e obrigatorio.
- Os membros da equipe do Mestre Assistente sao opcionais.
- Os membros da equipe da Organ sao opcionais.
- Todas as pessoas selecionadas devem existir na base de socios.
- As referencias devem usar o `id` da pessoa, nao apenas o nome, para resistir a alteracoes de cadastro.
- Viewer nao deve gerenciar periodos; o CRUD deve exigir permissao administrativa ou capability propria.

## Modelo De Dados Proposto

Entidade: `team_periods`

- `id`
- `title`
- `start_date`
- `end_date`
- `assistant_master_person_id`
- `direct_assistant_person_id`
- `assistant_member_ids_json`
- `organ_member_ids_json`
- `notes`
- `created_at`
- `updated_at`

## Backend

1. Criar testes primeiro para o service/validator.
2. Adicionar tabela `team_periods` no schema/migracao defensiva do PostgreSQL.
3. Criar `backend/repositories/teamPeriodsRepository.mjs`.
4. Criar `backend/services/teamPeriodsService.mjs`.
5. Criar resumo de contexto do periodo no service, incluindo formularios e eventos dentro do intervalo.
6. Criar validador estrutural para payloads de equipes.
7. Criar `backend/routes/teamPeriodsRoutes.mjs`.
8. Registrar a rota em `backend/routes/apiRouter.mjs`.
9. Incluir auditoria simples de criar/editar/excluir, seguindo o padrao das rotas existentes quando fizer sentido.

## API

Endpoints previstos:

- `GET /api/team-periods`
- `GET /api/team-periods/:id/summary`
- `POST /api/team-periods`
- `DELETE /api/team-periods/:id`

Validacoes da API:

- `GET` exige permissao de visualizacao de equipes.
- `POST` exige permissao de gerenciamento de equipes.
- `DELETE` exige permissao de gerenciamento de equipes.

## Permissoes

Adicionar capabilities em `shared/permissions.mjs`:

- `teams.view`
- `teams.manage`

O preset administrativo deve receber essas permissoes por padrao via `ALL_CAPABILITIES`. O preset viewer nao deve receber gerenciamento.

## Bootstrap E Estado Global

1. Incluir `teamPeriods` em `backend/services/bootstrapService.mjs`.
2. Incluir handlers globais para salvar e excluir periodos.
3. Atualizar o estado do frontend apos salvar/excluir sem recarregar a aplicacao inteira.
4. Expor os dados para a tela `TeamsScreen` pelo shell da aplicacao.

## Frontend

Arquivos previstos:

- `frontend/src/screens/TeamsScreen.jsx`
- `frontend/src/screens/teamsScreenController.js`
- `frontend/src/screens/teamsDomain.js`
- `frontend/src/features/teams/components/TeamPeriodEditorPanel.jsx`
- `frontend/src/features/teams/components/TeamPeriodListPanel.jsx`
- `frontend/src/features/teams/components/TeamPeriodSummaryPanel.jsx`

Comportamento:

- Menu principal chamado **Equipes**.
- Lista de periodos cadastrados, ordenada do mais recente para o mais antigo.
- Ao selecionar um periodo, mostrar formularios criados dentro do intervalo.
- Ao selecionar um periodo, mostrar eventos dentro do intervalo, incluindo eventos que tenham formularios de presenca, escala da Organ ou ambos.
- Incluir formularios sem vinculo com evento quando foram criados dentro do periodo.
- Cada formulario exibido no resumo deve permitir clique para abrir o resultado do formulario.
- Botao para novo periodo.
- Acao para editar periodo existente.
- Acao para excluir periodo com confirmacao.
- Editor com seletores da base de socios para Mestre Assistente, Auxiliar Direto e membros.
- Layout responsivo para mobile, com campos empilhados e acoes acessiveis.

## Integracao Com BI

Implementado na entrega atual:

1. O snapshot de participacao consulta os periodos de equipes aplicaveis pela data do evento.
2. Pessoas nas equipes do periodo sao gravadas como `expected=false` no read model de participacao.
3. O denominador dos percentuais considera apenas `expected=true`.
4. O detalhe do socio exibe a dispensa e o motivo.
5. Testes cobrem a dispensa no calculo puro de participacao.

## Testes

Testes backend:

- cria periodo valido;
- edita periodo valido;
- exclui periodo;
- rejeita periodo sem Mestre Assistente;
- rejeita periodo sem Auxiliar Direto;
- rejeita conclusao anterior ao inicio;
- rejeita pessoas inexistentes;
- rejeita periodos sobrepostos;
- lista periodos ordenados corretamente;
- aplica permissoes nas rotas.

Testes frontend:

- menu **Equipes** aparece para usuario com permissao;
- tela lista periodos;
- formulario cria periodo com seletores da base de socios;
- erro de periodo sobreposto aparece claramente;
- layout mobile nao quebra controles principais.

## Ordem Recomendada

1. Backend: validator, service e repository com testes.
2. API: rotas e permissoes.
3. Bootstrap e handlers globais.
4. Frontend: tela, controller e componentes.
5. Testes UI e build.
6. Atualizar `docs/AI_CODEMAP.md`.
7. Segunda etapa: integrar BI/percentuais usando os periodos cadastrados.
