# IA Log

## Objetivo

Registro curto de decisoes e mudancas relevantes feitas por IAs ou em sessoes assistidas.

## Leitura

- Este arquivo e historico.
- Entradas antigas podem citar caminhos legados como `src/` e `server/`.
- Entradas mais novas devem usar a estrutura atual com `frontend/`, `backend/` e `docker/`.

## 2026-05-08
- autor/contexto: refinamento da migracao estrutural para separar de vez frontend, backend e regras compartilhadas
- mudanca: o config do Vite saiu da raiz para `frontend/vite.config.js`, o backend deixou de importar arquivos da interface, o seed foi consolidado em `backend/data/seedData.mjs` e as regras compartilhadas foram isoladas em `shared/formRules.mjs`
- arquivos: `frontend/vite.config.js`, `frontend/src/lib/forms.js`, `backend/services/escalaService.mjs`, `backend/services/responsesService.mjs`, `backend/seed.mjs`, `backend/data/seedData.mjs`, `shared/formRules.mjs`, `docker/frontend/Dockerfile`, `docker/backend/Dockerfile`, `README.md`, `docs/AI_CODEMAP.md`, `docs/ARCHITECTURE.md`, `docs/CODING_PATTERNS.md`, `frontend/README.md`, `docker/frontend/README.md`, `docker/backend/README.md`, `AGENTS.md`
- validacao: `docker compose -f docker/compose.yml config`
- riscos/pendencias: `node_modules` foi removido do workspace; para validar build/testes locais de novo, sera preciso reinstalar dependencias ou rodar tudo dentro do Docker

## 2026-05-08
- autor/contexto: centralizacao final da camada de banco antes da implementacao real do PostgreSQL
- mudanca: `backend/database/index.mjs` passou a expor `databaseInfo`, `backend/index.mjs` e `backend/services/bootstrapService.mjs` pararam de importar `sqliteRuntime` diretamente, `backend/seed.mjs` passou a usar a facade `database`, e o modo `postgres` agora falha de forma explicita sem abrir SQLite por fora da camada publica
- arquivos: `backend/database/index.mjs`, `backend/index.mjs`, `backend/services/bootstrapService.mjs`, `backend/seed.mjs`, `docs/AI_CODEMAP.md`, `docs/ARCHITECTURE.md`, `docker/db/DESENHO-CAMADA-BANCO.md`, `docker/db/README.md`
- validacao: `node --input-type=module -e "import('./backend/seed.mjs')"`; `node --input-type=module -e "import('./backend/services/bootstrapService.mjs')"`; `node --input-type=module -e "import('./backend/database/index.mjs')"`; `NSJB_DB_DRIVER=postgres` falhando de forma esperada com `PostgreSQL driver is not implemented yet.`
- riscos/pendencias: falta implementar o driver Postgres real e migrar o seed para a base alvo quando o pacote de acesso ao Postgres entrar

## Formato

Adicionar novos itens no topo:

```text
## YYYY-MM-DD
- autor/contexto:
- mudanca:
- arquivos:
- validacao:
- riscos/pendencias:
```

## 2026-05-05
- autor/contexto: criacao de utilitario local de screenshot para apoio em ajustes visuais
- mudanca: adicao de `tools/visual/screenshot-local.mjs` e do comando `npm run screenshot:local` para subir API + Vite temporarios, autenticar opcionalmente e capturar PNG das telas com Chrome/Edge headless
- arquivos: `tools/visual/screenshot-local.mjs`, `package.json`, `docs/GUIDELINES-TECNICOS.md`, `docs/AI_CODEMAP.md`, `docs/IA-LOG.md`
- validacao: pendente
- riscos/pendencias: depende de Chrome ou Edge instalados localmente; se a tela exigir fluxo interno adicional, usar `--action`, `--selector` e `--wait`

## 2026-05-05
- autor/contexto: melhoria da experiencia mobile do modal administrativo
- mudanca: o modal de Configuracoes ganhou cabecalho empilhado e abas rolaveis no mobile para facilitar o uso sem mexer em API ou regras de negocio
- arquivos: `src/features/admin/AdminSettingsModal.jsx`, `src/styles.css`, `docs/PLANO-ETAPAS-FUNCIONALIDADES.md`, `docs/IA-LOG.md`
- validacao: pendente
- riscos/pendencias: manter a area administrativa funcional em telas pequenas sem inflar demais o modal

## 2026-05-05
- autor/contexto: ajuste de prioridade da Etapa 5 por decisao do usuario
- mudanca: `Confirmacao pos-envio mais util` ficou parado e a proxima prioridade passou a ser `Modo mobile mais operacional para admin`
- arquivos: `docs/PLANO-ETAPAS-FUNCIONALIDADES.md`, `docs/IA-LOG.md`
- validacao: nao aplicavel
- riscos/pendencias: manter o backlog refletindo a ordem efetiva escolhida para implementacao

## 2026-05-05
- autor/contexto: melhoria do link publico compartilhado do NSJB Forms
- mudanca: `PublicTop` passou a exibir a identidade do link publico com slug visivel e acao de copiar link, sem alterar o fluxo de resposta ou escala
- arquivos: `src/components/ui.jsx`, `tests/ui/publicFormScreen.test.jsx`, `docs/PLANO-ETAPAS-FUNCIONALIDADES.md`, `docs/IA-LOG.md`
- validacao: pendente
- riscos/pendencias: manter o topo leve e revisar a exibicao em telas publicas de presenca e escala

## 2026-05-05
- autor/contexto: ajuste fino do backlog de experiencia
- mudanca: `Alertas internos` voltou ao plano como item pendente/parado, sem alterar a prioridade de `Confirmacao pos-envio mais util`
- arquivos: `docs/PLANO-ETAPAS-FUNCIONALIDADES.md`, `docs/IA-LOG.md`
- validacao: nao aplicavel
- riscos/pendencias: manter o backlog explicito para evitar retrabalho em sessoes futuras

## 2026-05-05
- autor/contexto: ajuste do backlog funcional da Etapa 5 por decisao do usuario
- mudanca: remocao de `Alertas internos` do escopo e reordenacao da proxima sugestao para `Confirmacao pos-envio mais util`
- arquivos: `docs/PLANO-ETAPAS-FUNCIONALIDADES.md`, `docs/IA-LOG.md`
- validacao: nao aplicavel
- riscos/pendencias: manter o plano alinhado com as proximas prioridades de experiencia

## 2026-05-05
- autor/contexto: entrega do painel Dashboard separado das Configuracoes
- mudanca: criacao da tela `Dashboard`, adicao do menu proprio no topo e resumo operacional leve com proximos fechamentos e contagens basicas
- arquivos: `src/App.jsx`, `src/screens/DashboardScreen.jsx`, `tests/ui/dashboardScreen.test.jsx`, `tests/ui/appDashboardFlow.test.jsx`, `docs/AI_CODEMAP.md`, `docs/PLANO-ETAPAS-FUNCIONALIDADES.md`
- validacao: `npm run test:ui`, `npm run test:forms`, `npm run test`, `npm run build`
- riscos/pendencias: manter o painel leve e atualizar os contadores se os metadados de bootstrap mudarem

## 2026-05-05
- autor/contexto: ajuste de backlog funcional da escala por decisao do usuario
- mudanca: remocao de `Regras por funcao` do plano de etapas e reordenacao da proxima sugestao para `Resumo operacional da escala`
- arquivos: `docs/PLANO-ETAPAS-FUNCIONALIDADES.md`, `docs/IA-LOG.md`
- validacao: nao aplicavel
- riscos/pendencias: manter o plano coerente com as proximas decisoes de produto

## 2026-05-04
- autor/contexto: ajuste do painel de auditoria para filtros aplicados e paginação server-side explícita
- mudanca: a aba de Auditoria passou a manter rascunho de filtros separado de filtros aplicados, com botão de aplicar e paginação baseada no endpoint do backend
- arquivos: `src/features/admin/AdminSettingsModal.jsx`, `tests/ui/adminCatalog.test.jsx`
- validacao: pendente
- riscos/pendencias: manter o limite de paginação no backend e revisar a experiência se novos filtros forem adicionados
- autor/contexto: introducao do sistema de auditoria administrativa no NSJB Forms
- mudanca: criacao da tabela `audit_logs`, repository e service de auditoria, endpoint admin `GET /api/audit-logs`, logs de auth/formularios/respostas/escala/seguranca e nova aba de Auditoria nas configuracoes do admin
- arquivos: `server/db.mjs`, `server/repositories/auditLogRepository.mjs`, `server/services/auditLogService.mjs`, `server/routes/apiRouter.mjs`, `server/services/responsesService.mjs`, `server/repositories/responsesRepository.mjs`, `src/lib/api.js`, `src/features/admin/AdminSettingsModal.jsx`, `tests/api.integration.test.mjs`, `tests/ui/adminCatalog.test.jsx`, `docs/AI_CODEMAP.md`, `docs/FUNCIONALIDADES-E-ARQUITETURA.md`, `docs/MANUTENCAO.md`, `docs/CODING_PATTERNS.md`
- validacao: `npm run test:api`, `npm run test:ui -- tests/ui/adminCatalog.test.jsx`, `npm run test`, `npm run build`
- riscos/pendencias: o endpoint de auditoria e os registros atuais cobrem os fluxos principais; futuras alteracoes em services mutaveis devem continuar usando o actor autenticado do backend e metadata sanitizada

## 2026-05-04
- autor/contexto: remoção do ultimo fallback legado de sessao no frontend do NSJB Forms
- mudanca: `src/App.jsx` passou a ignorar sessao antiga sem token, removendo a leitura de `password`/`legacyCredentials` do `localStorage` e mantendo apenas sessao com `user`, `token` e `expiresAt`
- arquivos: `src/App.jsx`
- validacao: `npm run test:ui`, `npm run build`
- riscos/pendencias: usuarios que ainda tiverem sessao antiga salva vao precisar fazer login novamente uma vez para gerar o novo formato
- autor/contexto: migracao incremental da autenticacao e protecao de rotas administrativas do NSJB Forms
- mudanca: bootstrap passou a expor usuarios sem senha, o frontend passou a restaurar sessao com token opaco no backend e o roteador passou a exigir `admin` nas rotas mutaveis de formulario, configuracoes, catalogos e gerenciamento de usuarios
- arquivos: `src/App.jsx`, `src/features/auth/AuthPanel.jsx`, `src/lib/api.js`, `server/routes/apiRouter.mjs`, `server/repositories/usersRepository.mjs`, `tests/api.integration.test.mjs`
- validacao: `npm run test:api`, `npm run test:ui`, `npm run build`
- riscos/pendencias: rotas de leitura publica continuam abertas por compatibilidade; a proxima etapa natural e remover a dependencia do frontend em qualquer dado legado de senha restante no armazenamento local
- autor/contexto: inicio da migracao incremental da autenticacao para o backend do NSJB Forms
- mudanca: adicionada base de auth com hash de senha, coluna de segredo no SQLite, tabela de sessoes opacas, endpoints `/api/auth/login`, `/api/auth/logout` e `/api/auth/me`, alem de cobertura de teste para login e logout
- arquivos: `server/core/auth.mjs`, `server/repositories/sessionsRepository.mjs`, `server/services/authService.mjs`, `server/db.mjs`, `server/repositories/usersRepository.mjs`, `server/seed.mjs`, `server/routes/apiRouter.mjs`, `server/validators/payloadValidators.mjs`, `tests/api.integration.test.mjs`
- validacao: `npm run test:api`
- riscos/pendencias: bootstrap e frontend ainda usam login local com `password` vindo do payload; a proxima etapa precisa migrar a sessao do navegador e parar de expor senha no bootstrap
- autor/contexto: evolucao da suite de testes do NSJB Forms
- mudanca: ampliacao de cobertura para health, bootstrap leve, validadores, erro de inicio do App e bloqueio de envio invalido no formulario publico
- arquivos: `tests/api.integration.test.mjs`, `tests/validators.test.mjs`, `tests/ui/appPublicDataFlow.test.jsx`, `tests/ui/publicFormScreen.test.jsx`, `docs/GUIDELINES-TECNICOS.md`
- validacao: `npm run test:api`, `npm run test:ui`, `npm run test:forms`, `npm run test`, `npm run build`, `npm run test:load:local`
- riscos/pendencias: manter a suite de carga separada e avaliar helpers comuns so se a duplicacao voltar a crescer

## 2026-05-04
- autor/contexto: exclusao segura de formularios com chave mestra configuravel
- mudanca: adicao de `formDeleteKey` em `settings`, endpoints de status/configuracao da chave, delete transacional com limpeza de dependencias e modal de confirmacao com masterKey no frontend
- arquivos: `server/services/adminService.mjs`, `server/services/formsService.mjs`, `server/routes/apiRouter.mjs`, `src/App.jsx`, `src/screens/FormListScreen.jsx`, `src/features/admin/AdminSettingsModal.jsx`, `src/components/ui.jsx`, `tests/api.integration.test.mjs`, `tests/ui/formListScreen.test.jsx`, `tests/ui/adminCatalog.test.jsx`
- validacao: pendente
- riscos/pendencias: revisar mensagens finais e rodar as suites focadas antes do merge

## 2026-05-04
- autor/contexto: feedback padronizado de CRUDs e confirmacoes com apoio de IA
- mudanca: criacao de `FeedbackBanner`, `ConfirmModal` e suporte a `Btn loading` para unificar alertas de sucesso, falha, loading e confirmacoes nos fluxos principais
- arquivos: `src/components/ui.jsx`, `src/styles.css`, `src/features/admin/AdminSettingsModal.jsx`, `src/features/members/MemberListConfigModal.jsx`, `src/screens/CreateFormScreen.jsx`, `src/screens/PublicFormScreen.jsx`, `src/screens/PublicEscalaScreen.jsx`, `src/screens/ResultsScreen.jsx`, `tests/ui/adminCatalog.test.jsx`, `tests/ui/resultsScreen.test.jsx`
- validacao: pendente
- riscos/pendencias: revisar a experiencia visual final e rodar a suite de UI focada apos a ultima passada

## 2026-05-04
- autor/contexto: runner local de carga da API com suporte de IA
- mudanca: criacao de `scripts/load-local.mjs` e do comando `npm run test:load:local` para simular respostas e bootstrap sem deps pesadas
- arquivos: `scripts/load-local.mjs`, `package.json`, `docs/GUIDELINES-TECNICOS.md`, `docs/IA-LOG.md`
- validacao: `npm run test:load:local`, `npm run test:api`, `npm run test`, `npm run build`
- riscos/pendencias: manter o runner fora da suite principal para nao aumentar o tempo do CI

## 2026-05-04
- autor/contexto: endurecimento do SQLite antes da migracao de banco
- mudanca: pragmas, busy timeout, indices adicionais e teste de inicializacao/bootstrapping com banco isolado
- arquivos: `server/db.mjs`, `tests/api.integration.test.mjs`, `docs/IA-LOG.md`
- validacao: `npm run test:api`, `npm run test`, `npm run build`
- riscos/pendencias: manter compatibilidade com o schema atual

## 2026-05-04
- autor/contexto: padronizacao visual do NSJB Forms
- mudanca: reforco da base visual compartilhada com `ui-btn`, `ui-badge`, tabelas, formulrios, modais e toast fixed no canto superior direito; ajuste pontual de AuthPanel, AdminSettingsModal, MemberListConfigModal e App para consumir os padroes
- arquivos: `src/components/ui.jsx`, `src/styles.css`, `src/App.jsx`, `src/features/auth/AuthPanel.jsx`, `src/features/admin/AdminSettingsModal.jsx`, `src/features/members/MemberListConfigModal.jsx`, `docs/AI_CODEMAP.md`, `docs/CODING_PATTERNS.md`, `docs/IA-LOG.md`
- validacao: pendente
- riscos/pendencias: revisar visual em desktop/mobile claro e escuro e confirmar se os controles legados ainda ficam consistentes com os novos tokens

## 2026-05-04
- autor/contexto: organizacao do backlog funcional por etapas
- mudanca: criacao de um documento temporario com escopo aprovado, fases, dependencias e ordem recomendada de implementacao
- arquivos: `docs/PLANO-ETAPAS-FUNCIONALIDADES.md`, `docs/IA-LOG.md`
- validacao: nao aplicavel
- riscos/pendencias: manter o documento sincronizado com as decisoes das proximas etapas

## 2026-05-04
- autor/contexto: etapa 1 do backlog funcional, duplicacao de formulario
- mudanca: adicao da acao `Duplicar` na listagem, abertura do editor com rascunho clonado sem `id`/`slug` e `status = rascunho`, mantendo o fluxo de criacao sem tocar backend
- arquivos: `src/App.jsx`, `src/screens/FormListScreen.jsx`, `src/screens/CreateFormScreen.jsx`, `tests/ui/formListScreen.test.jsx`, `tests/ui/appSaveFlow.test.jsx`, `docs/IA-LOG.md`
- validacao: `npm run test:ui -- tests/ui/formListScreen.test.jsx tests/ui/appSaveFlow.test.jsx tests/ui/createFormScreen.test.jsx`, `npm run test:api`, `npm run test:forms`, `npm run build`
- riscos/pendencias: revisar depois se a copia deve preservar ou limpar datas/fechamento conforme a operacao real do usuario

## 2026-05-05
- autor/contexto: etapa 1 do backlog funcional, arquivamento de formulario
- mudanca: introducao do status `arquivado`, acao rapida `Arquivar/Restaurar` na listagem, ocultacao de arquivados por padrao para usuario autenticado e bloqueio de exibicao publica para formularios arquivados
- arquivos: `src/App.jsx`, `src/screens/FormListScreen.jsx`, `src/screens/CreateFormScreen.jsx`, `src/components/ui.jsx`, `src/lib/forms.js`, `server/validators/payloadValidators.mjs`, `server/services/formsService.mjs`, `tests/ui/formListScreen.test.jsx`, `tests/api.integration.test.mjs`, `docs/IA-LOG.md`
- validacao: `npm run test:ui -- tests/ui/formListScreen.test.jsx`, `npm run test:api`, `npm run test:forms`, `npm run build`
- riscos/pendencias: decidir depois se restaurar deve voltar sempre para `rascunho` ou para o ultimo status operacional anterior

## 2026-05-05
- autor/contexto: etapa 1 do backlog funcional, favoritos/fixados com ajuste visual das acoes na listagem
- mudanca: adicao de formularios fixados por usuario autenticado com persistencia local no navegador, priorizacao dos fixados no topo da listagem e compactacao da barra de acoes para botoes iconicos quadrados com tooltip e `aria-label`
- arquivos: `src/App.jsx`, `src/lib/appConstants.js`, `src/components/ui.jsx`, `src/screens/FormListScreen.jsx`, `tests/ui/formListScreen.test.jsx`, `tests/ui/appSaveFlow.test.jsx`, `docs/AI_CODEMAP.md`, `docs/PLANO-ETAPAS-FUNCIONALIDADES.md`, `docs/IA-LOG.md`
- validacao: `npm run test:ui -- tests/ui/formListScreen.test.jsx tests/ui/appSaveFlow.test.jsx`, `npm run test:ui`, `npm run build`
- riscos/pendencias: revisar em uso real se a densidade de acoes por card continua confortavel no mobile e decidir depois se os fixados devem migrar para persistencia no backend

## 2026-05-05
- autor/contexto: etapa 1 do backlog funcional, busca global melhor na listagem
- mudanca: ampliacao da busca da listagem para indexar titulo, sessao, descricao, slug, status, tipo, classificacoes e datas, com normalizacao sem acentos e ajuste do campo para limpeza rapida
- arquivos: `src/screens/FormListScreen.jsx`, `src/lib/forms.js`, `tests/ui/formListScreen.test.jsx`, `docs/AI_CODEMAP.md`, `docs/IA-LOG.md`
- validacao: pendente
- riscos/pendencias: avaliar depois se a busca deve virar backend quando houver volume maior de formularios

## 2026-05-05
- autor/contexto: etapa 1 do backlog funcional, agendamento de abertura e fechamento
- mudanca: adicao de refresh de ciclo de vida no backend para abrir formularios rascunho na data agendada e fechar formularios abertos com fechamento vencido; bootstrap passou a aplicar o refresh antes de serializar; editor ganhou texto explicativo para abertura e fechamento automaticos
- arquivos: `server/repositories/formsRepository.mjs`, `server/orchestrator/formLifecycleOrchestrator.mjs`, `server/services/bootstrapService.mjs`, `src/screens/CreateFormScreen.jsx`, `tests/orchestrator.test.mjs`, `tests/api.integration.test.mjs`, `docs/PLANO-ETAPAS-FUNCIONALIDADES.md`, `docs/IA-LOG.md`
- validacao: `npm run test:api`, `npm run test:ui`, `npm run build`
- riscos/pendencias: se o frontend ficar aberto por muito tempo sem recarregar, pode ser interessante avaliar refresh periodico mais tarde

## 2026-05-05
- autor/contexto: etapa 2 do backlog funcional, regras de validacao por campo
- mudanca: adicao de regras configuraveis por campo para limites de texto, faixa numerica e exigencia de linhas da grade; validacao aplicada no editor, no fluxo publico e no backend de respostas
- arquivos: `src/lib/forms.js`, `src/screens/CreateFormScreen.jsx`, `src/screens/PublicFormScreen.jsx`, `server/services/responsesService.mjs`, `server/validators/payloadValidators.mjs`, `tests/ui/createFormScreen.test.jsx`, `tests/ui/publicFormScreen.test.jsx`, `tests/api.integration.test.mjs`, `docs/AI_CODEMAP.md`, `docs/PLANO-ETAPAS-FUNCIONALIDADES.md`, `docs/IA-LOG.md`
- validacao: `npm run test:api`, `npm run test:ui`
- riscos/pendencias: avaliar depois se a validacao de grade deve ganhar regras adicionais de obrigatoriedade por linha/coluna no editor

## 2026-05-05
- autor/contexto: etapa 2 do backlog funcional, bloqueio opcional por pessoa ja respondida
- mudanca: adicao de opcao por formulario para bloquear nova resposta quando o mesmo respondente ja existe; o editor passou a expor a configuracao, o fluxo publico bloqueia a abertura do modo de edicao e o backend devolve conflito antes do upsert
- arquivos: `src/lib/forms.js`, `src/screens/CreateFormScreen.jsx`, `src/screens/PublicFormScreen.jsx`, `server/services/responsesService.mjs`, `server/validators/payloadValidators.mjs`, `tests/ui/createFormScreen.test.jsx`, `tests/ui/publicFormScreen.test.jsx`, `tests/api.integration.test.mjs`, `docs/AI_CODEMAP.md`, `docs/PLANO-ETAPAS-FUNCIONALIDADES.md`, `docs/IA-LOG.md`
- validacao: `npm run test:api`, `npm run test:ui`, `npm run build`
- riscos/pendencias: decidir depois se a mensagem de bloqueio precisa ficar mais explicita para o usuario final ou se o aviso atual e suficiente
## 2026-05-07

- autor/contexto: organizacao de pendencias antes de possivel migracao de infraestrutura
- mudanca: registro no backlog dos itens de endurecimento de autenticacao ainda nao executados (`HttpOnly cookie`, metadados de sessao, lista de sessoes ativas e auditoria especifica de login/logout/timeout)
- arquivos: `docs/PLANO-ETAPAS-FUNCIONALIDADES.md`, `docs/IA-LOG.md`
- validacao: nao aplicavel
- riscos/pendencias: ideal alinhar esses itens depois da decisao de Docker/banco para evitar retrabalho no desenho da sessao
## 2026-05-05

- Entrega: `Limite por pessoa na escala`.
- Escala organ agora aceita limite configuravel por formulario via `resultsConfig.maxAssignmentsPerPerson`.
- O backend valida o limite tanto no salvamento manual da escala quanto no claim publico de vagas.
- O frontend exibe o limite na configuracao da escala e bloqueia selecao acima do teto antes do envio.

## 2026-05-07

- autor/contexto: limpeza estrutural do repo durante a migracao de infraestrutura
- mudanca: realocacao dos atalhos do Docker para `scripts/windows/`, criacao da documentacao por componente em `docker/frontend`, `docker/backend` e `docker/db`, ajuste dos caminhos internos dos `.bat` para continuar chamando `docker compose` na raiz e atualizacao da documentacao operacional
- arquivos: `scripts/windows/start-docker.bat`, `scripts/windows/stop-docker.bat`, `scripts/windows/status-docker.bat`, `scripts/windows/logs-docker.bat`, `docker/README.md`, `docker/frontend/README.md`, `docker/backend/README.md`, `docker/db/README.md`, `docker/frontend/Dockerfile`, `docker/backend/Dockerfile`, `README.md`, `docs/AI_CODEMAP.md`, `docker/HANDOFF-INFRA-BANCO.md`, `docs/IA-LOG.md`
- validacao: `npm run build`
- riscos/pendencias: o compose ainda fica na raiz por compatibilidade; se quiser, o proximo passo e mover a orquestracao para `docker/compose.yml`
