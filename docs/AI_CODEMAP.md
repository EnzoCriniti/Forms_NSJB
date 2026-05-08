# AI_CODEMAP

Mapa operacional do codebase para agentes de IA.

## Orquestração da aplicação

Descrição:
- Controla navegação, estado global da sessão, tema, bootstrap e troca entre telas públicas e internas.

Começar por:
- `src/App.jsx`

Arquivos principais:
- `src/App.jsx` — orquestra o app, monta o menu superior e decide qual tela renderizar.
- `src/main.jsx` — ponto de entrada do React.

Arquivos relacionados:
- `src/lib/api.js` — chamadas para bootstrap e persistência.
- `src/lib/auth.js` — permissões usadas na navegação.
- `src/lib/storage.js` — sessão e tema armazenados localmente.
- `src/components/ui.jsx` — topo público e componentes visuais compartilhados.

Componentes envolvidos:
- `AuthPanel`
- `AdminSettingsModal`
- `FormListScreen`
- `CreateFormScreen`
- `ResultsScreen`
- `PublicFormScreen`
- `PublicEscalaScreen`
- `DashboardScreen`

Services/hooks/libs envolvidos:
- `fetchBootstrap`
- `loadStored`
- `persist`
- `canCreateForms`
- `canViewForm`
- `visibleFormsFor`

Rotas ou páginas relacionadas:
- `#/f/<slug>` para fluxo público.
- `/f/<slug>` também abre o fluxo público, para suportar links digitados ou colados sem hash em celulares.
- Tela interna de listagem, criação e resultados controladas por `screen` em `src/App.jsx`.

Termos úteis para busca:
- `navigate(`
- `screen === "results"`
- `publicSlug`
- `hashchange`
- `AuthPanel`

Alterações comuns:
- Para mudar navegação: editar `src/App.jsx`.
- Para mudar regras de acesso: editar `src/lib/auth.js`.
- Para mudar o topo visual: editar `src/components/ui.jsx` e, se necessário, `src/styles.css`.
- Visitantes sem sessão são barrados na pagina inicial e veem a tela de acesso restrito; os links públicos continuam acessíveis.

Cuidados:
- Não remover a tela de `ResultsScreen` ao mexer no menu superior.
- Evite alterar o contrato dos nomes de `screen` sem revisar todos os pontos de navegação.

Arquivos que não devem ser alterados sem necessidade:
- `src/App.jsx`
- `src/main.jsx`

## Listagem de formulários

Descrição:
- Mostra os formulários disponíveis, aplica filtros, paginação, ordenação e abre resultados ou link público.

Começar por:
- `src/screens/FormListScreen.jsx`

Arquivos principais:
- `src/screens/FormListScreen.jsx` — lista, filtros e ações rápidas.

Arquivos relacionados:
- `src/App.jsx` — entrega dados e recebe navegação.
- `src/lib/auth.js` — define quem vê quais formulários.
- `src/lib/forms.js` — formatação de data e helpers de formulário.
- `src/components/ui.jsx` — botões, badges e ícones.

Componentes envolvidos:
- `FormListScreen`
- `StatusBadge`
- `TypeBadge`
- `Badge`
- `Btn`

Services/hooks/libs envolvidos:
- `visibleFormsFor`
- `canCreateForms`
- `formatDateTime`

Rotas ou páginas relacionadas:
- Tela interna de `Formulários` no app.
- Abre `results` e `create` via `onNavigate`.

Termos úteis para busca:
- `availableForms`
- `filtered`
- `PAGE_SIZE`
- `onNavigate("results"`
- `window.location.hash = \`/f/`

Alterações comuns:
- Para mudar filtros/ordenação: editar `src/screens/FormListScreen.jsx`.
- Para mudar permissões de visibilidade: editar `src/lib/auth.js`.
- Para mudar cartão visual: editar `src/components/ui.jsx` e `src/styles.css`.

Cuidados:
- A lista de formulários públicos depende de `visibleFormsFor`; não quebre esse filtro por engano.
- O clique no card abre resultados, então mudanças de navegação afetam a leitura do fluxo.
- As ações primárias do card ficam fora do bloco que evita a propagação do clique do card; ao adicionar botões nessa área, garanta `stopPropagation` para não disparar o link público por engano.
- A exclusão de formulários ficou separada em ação destrutiva com chave mestra; revise o modal antes de mexer no card.

Arquivos que não devem ser alterados sem necessidade:
- `src/screens/FormListScreen.jsx`
- `src/lib/auth.js`

## Criação e edição

Descrição:
- Monta e salva formulários de presença e escala, incluindo campos dinâmicos, presets e configuração de resultados.

Começar por:
- `src/screens/CreateFormScreen.jsx`

Arquivos principais:
- `src/screens/CreateFormScreen.jsx` — formulário de criação/edição.

Arquivos relacionados:
- `src/App.jsx` — fornece `form` atual e trata salvamento.
- `src/lib/forms.js` — helpers de campos e configurações de resultados.
- `src/lib/api.js` — persistência do formulário.
- `src/features/admin/AdminSettingsModal.jsx` — presets, catálogos e membros usados na criação.

Componentes envolvidos:
- `CreateFormScreen`
- `Btn`

Services/hooks/libs envolvidos:
- `hasLinkedPeopleField`
- `saveForm`
- `savePreset`
- `getVisibleFields`
- `getResultsConfig`
- `blockDuplicatePersonResponses`
- `getScalePersonLimit`

Rotas ou páginas relacionadas:
- Tela interna de `Novo`.
- Edição aberta pela listagem ou por ações do app.

Termos úteis para busca:
- `fieldDefinitions`
- `resultsConfig`
- `scaleSections`
- `createDefaultResultsConfig`
- `syncResultsConfigWithFields`

Alterações comuns:
- Para mudar layout/fluxo da criação: editar `src/screens/CreateFormScreen.jsx`.
- Para mudar regra de persistência: editar `server/services/formsService.mjs` e `server/validators/payloadValidators.mjs`.
- Para mudar modelo de campo ou totalização: editar `src/lib/forms.js` e a lógica do próprio screen.

Cuidados:
- Há diferenciação entre `presenca` e `escala_organ`; valide os dois fluxos antes de mexer.
- Mudanças em `resultsConfig` afetam resultados, criação e validação.
- `resultsConfig.maxAssignmentsPerPerson` controla o limite por pessoa na escala e precisa ficar alinhado com `server/services/escalaService.mjs`.
- `blockDuplicatePersonResponses` é opt-in e precisa permanecer alinhado com o fluxo público e com `server/services/responsesService.mjs`.
- Reabrir manualmente um formulário com `closing` vencido limpa o fechamento expirado no backend para evitar que o orquestrador volte o status para `fechado` no próximo ciclo.

Arquivos que não devem ser alterados sem necessidade:
- `src/screens/CreateFormScreen.jsx`
- `server/services/formsService.mjs`
- `server/validators/payloadValidators.mjs`

## Resultados de presença

Descrição:
- Exibe respostas de presença com colunas dinâmicas, filtros por coluna, totais e exportação CSV.

Começar por:
- `src/screens/ResultsScreen.jsx`

Arquivos principais:
- `src/screens/ResultsScreen.jsx` — tela principal de resultados.

Arquivos relacionados:
- `src/lib/forms.js` — leitura de campos visíveis, total esperado e configuração de resultados.
- `src/components/ui.jsx` — botões, badges e ícones.
- `src/App.jsx` — decide quando renderizar a tela e com qual formulário.
- `tests/ui/resultsScreen.test.jsx` — cobertura da tela.

Componentes envolvidos:
- `ResultsScreen`
- `PresenceResultsScreen`
- `EscalaResultsScreen`
- `Btn`
- `Badge`
- `StatusBadge`

Services/hooks/libs envolvidos:
- `getVisibleFields`
- `getResultsConfig`
- `getFieldValue`
- `getExpectedResponses`
- `hasLinkedPeopleField`
- `canEditEscala`

Rotas ou páginas relacionadas:
- Tela interna de resultados aberta pela listagem ou pelo fluxo do app.

Termos úteis para busca:
- `totalsLayout`
- `searchEnabled`
- `showLinkedRoster`
- `exportCsv`
- `columnSearches`

Alterações comuns:
- Para mudar layout da tabela ou totais: editar `src/screens/ResultsScreen.jsx`.
- Para mudar regra de totalização/visibilidade: editar `src/lib/forms.js`.
- Para mudar permissão de edição da escala: editar `src/lib/auth.js`.
- O filtro por grau na tabela de presença usa os graus presentes na planilha/base vinculada, fica no topo da tela e também recorta as métricas de resumo e totalização exibidas na tela.
- A planilha de resultados tem uma faixa de filtros própria acima da grade; campos de opção usam valores distintos em `select` e campos abertos usam texto livre.

Cuidados:
- Esta tela atende presença e escala; verifique os dois caminhos ao alterar o componente.
- O CSV depende dos campos e da ordenação atual, então mudanças de coluna podem alterar exportação.

Arquivos que não devem ser alterados sem necessidade:
- `src/screens/ResultsScreen.jsx`
- `src/lib/forms.js`
- `tests/ui/resultsScreen.test.jsx`

## Escala pública

Descrição:
- Permite preencher vagas pendentes da escala da Organ por link público.

Começar por:
- `src/screens/PublicEscalaScreen.jsx`

Arquivos principais:
- `src/screens/PublicEscalaScreen.jsx` — tela pública da escala.

Arquivos relacionados:
- `src/App.jsx` — identifica formulário público e roteia para esta tela.
- `src/components/ui.jsx` — topo público e botão.
- `src/lib/forms.js` — regra de fechamento público.
- `src/lib/api.js` — persistência da escala.

Componentes envolvidos:
- `PublicEscalaScreen`
- `PublicTop`
- `Btn`

Services/hooks/libs envolvidos:
- `saveEscala`
- `claimEscalaSlot`
- `isFormClosedForPublic`
- `getScalePersonLimit`

Rotas ou páginas relacionadas:
- `#/f/<slug>` quando o formulário é do tipo `escala_organ`.

Termos úteis para busca:
- `selSlot`
- `signup`
- `sections`
- `slots`
- `onSaveSections`
- `onClaimSlot`

Alterações comuns:
- Para mudar interação de preenchimento: editar `src/screens/PublicEscalaScreen.jsx`.
- Para mudar persistência da escala: editar `server/services/escalaService.mjs` e `server/repositories/escalaRepository.mjs`.
- Para mudar regra de acesso público: editar `src/lib/forms.js`.

Cuidados:
- O fluxo impede duplicar nome em vagas da mesma escala; preserve essa checagem ao refatorar.
- Alterações no formato de `sections` precisam ser compatíveis com backend e resultados.
- O limite por pessoa vem de `resultsConfig.maxAssignmentsPerPerson` e deve valer tanto no preenchimento publico quanto na edicao manual da escala.

Arquivos que não devem ser alterados sem necessidade:
- `src/screens/PublicEscalaScreen.jsx`
- `server/services/escalaService.mjs`
- `server/repositories/escalaRepository.mjs`

## Fluxo público de presença

Descrição:
- Renderiza o formulário público, permite responder e editar resposta anterior enquanto o formulário estiver aberto. Quando o formulário marca bloqueio de duplicidade, a tela impede a nova resposta antes do envio e mostra o aviso apropriado.

Começar por:
- `src/screens/PublicFormScreen.jsx`

Arquivos principais:
- `src/screens/PublicFormScreen.jsx` — formulário público de presença.

Arquivos relacionados:
- `src/App.jsx` — resolve o slug e entrega `responses` e `people`.
- `src/lib/forms.js` — leitura de campos e regra de fechamento.
- `src/lib/api.js` — salvamento das respostas.
- `tests/ui/publicFormScreen.test.jsx` — cobertura do fluxo.

Componentes envolvidos:
- `PublicFormScreen`
- `PublicTop`
- `Btn`

Services/hooks/libs envolvidos:
- `getVisibleFields`
- `getPersonField`
- `saveResponse`
- `isFormClosedForPublic`

Rotas ou páginas relacionadas:
- `#/f/<slug>` quando o formulário é do tipo presença.

Termos úteis para busca:
- `existingResponse`
- `editModal`
- `respondentName`
- `person_select`
- `submitted`
- `duplicateResponsesBlocked`

Alterações comuns:
- Para mudar campos ou UX do formulário público: editar `src/screens/PublicFormScreen.jsx`.
- Para mudar o modelo de resposta: editar `server/services/responsesService.mjs`, `server/repositories/responsesRepository.mjs` e `server/validators/payloadValidators.mjs`.
- Para mudar a regra de edição da resposta: editar este screen e os helpers em `src/lib/forms.js`.

Cuidados:
- O fluxo de edição depende de `respondentName`; mudanças nessa regra exigem revisar a busca de resposta existente.
- Campos obrigatórios são validados no frontend e no backend.
- Ao alterar persistência de respostas, mantenha `values_json` e `response_values` sincronizados.

Arquivos que não devem ser alterados sem necessidade:
- `src/screens/PublicFormScreen.jsx`
- `server/services/responsesService.mjs`
- `server/validators/payloadValidators.mjs`

## Administração

Descrição:
- Centraliza usuários, socios, classificacoes, presets e catálogos usados na criação de formulários.

Começar por:
- `src/features/admin/AdminSettingsModal.jsx`

Arquivos principais:
- `src/features/admin/AdminSettingsModal.jsx` — modal administrativo principal.
- `src/features/admin/CatalogManagementModal.jsx` — modal legado para classificações/presets.
- `src/features/members/MemberListConfigModal.jsx` — configuração da base de sócios.

Arquivos relacionados:
- `src/App.jsx` — controla a abertura do modal.
- `src/features/auth/AuthPanel.jsx` — botão de acesso às configurações.
- `src/lib/api.js` — persistência de usuários, labels, presets, people e catalogos.
- `server/services/adminService.mjs` — regras administrativas.

Componentes envolvidos:
- `AdminSettingsModal`
- `CatalogManagementModal`
- `MemberListConfigModal`
- `MemberListConfigModalContent`

Services/hooks/libs envolvidos:
- `saveUser`
- `deleteUser`
- `saveLabel`
- `deleteLabel`
- `savePreset`
- `deletePreset`
- `savePeople`
- `saveMembersConfig`
- `saveFieldCatalogItem`
- `deleteFieldCatalogItem`
- `saveScaleTaskCatalogItem`
- `deleteScaleTaskCatalogItem`

Rotas ou páginas relacionadas:
- Modal acessado pelo topo quando o usuário é `admin`.

Termos úteis para busca:
- `users`
- `labels`
- `presets`
- `fieldCatalog`
- `scaleTaskCatalog`
- `membersConfig`

Alterações comuns:
- Para mudar UX da administração: editar `src/features/admin/AdminSettingsModal.jsx`.
- Para mudar importação de sócios: editar `src/features/members/MemberListConfigModal.jsx`.
- Para mudar regras de persistência: editar `server/services/adminService.mjs` e `server/repositories/*`.

Cuidados:
- O cadastro administrativo alimenta o bootstrap inteiro; mudanças aqui afetam várias telas.
- O modal legado `CatalogManagementModal` pode não ser o fluxo principal, então valide antes de remover.

Arquivos que não devem ser alterados sem necessidade:
- `src/features/admin/AdminSettingsModal.jsx`
- `src/features/members/MemberListConfigModal.jsx`
- `server/services/adminService.mjs`

## Seguranca de exclusao de formularios

Descrição:
- Configura a chave mestra para exclusão segura de formulários e valida a operação destrutiva no backend.

Começar por:
- `src/features/admin/AdminSettingsModal.jsx`
- `src/screens/FormListScreen.jsx`

Arquivos principais:
- `src/features/admin/AdminSettingsModal.jsx` - aba de segurança para cadastrar ou trocar a chave.
- `src/screens/FormListScreen.jsx` - modal de exclusão com confirmação e chave mestra.

Arquivos relacionados:
- `src/components/ui.jsx` - `ConfirmModal` com conteúdo extra e bloqueio de confirmação.
- `src/lib/api.js` - status, atualização e exclusão com masterKey.
- `server/services/adminService.mjs` - hash, leitura e gravação da chave.
- `server/services/formsService.mjs` - exclusão segura em transação.
- `server/routes/apiRouter.mjs` - endpoints de segurança e delete com payload.

Componentes envolvidos:
- `ConfirmModal`
- `FeedbackBanner`

Services/hooks/libs envolvidos:
- `fetchFormDeleteKeyStatus`
- `saveFormDeleteKey`
- `deleteForm`

Rotas ou páginas relacionadas:
- `GET /api/security/form-delete-key/status`
- `PUT /api/security/form-delete-key`
- `DELETE /api/forms/:id`

Termos úteis para busca:
- `formDeleteKey`
- `masterKey`
- `MASTER_KEY_NOT_CONFIGURED`
- `MASTER_KEY_INVALID`

Alterações comuns:
- Para mudar regra de exclusão: editar `server/services/formsService.mjs` e `server/routes/apiRouter.mjs`.
- Para mudar o cadastro da chave: editar `src/features/admin/AdminSettingsModal.jsx` e `server/services/adminService.mjs`.
- Para mudar o modal de exclusão: editar `src/screens/FormListScreen.jsx` e `src/components/ui.jsx`.

Cuidados:
- Nunca exponha hash ou salt da chave mestra no bootstrap ou em endpoints públicos.
- A exclusão deve continuar validando a chave no backend, mesmo que o frontend já faça a checagem visual.
- Preserve a limpeza de `responses`, `response_values` e `escala_assignments`.

## Auditoria administrativa

Descrição:
- Registra eventos administrativos e de fluxos públicos com actor resolvido no backend e metadata sanitizada.

Começar por:
- `src/features/admin/AdminSettingsModal.jsx`
- `server/routes/apiRouter.mjs`

Arquivos principais:
- `server/services/auditLogService.mjs` - sanitiza metadata e grava eventos.
- `server/repositories/auditLogRepository.mjs` - persiste e consulta `audit_logs`.
- `server/routes/apiRouter.mjs` - expõe `GET /api/audit-logs` e registra eventos mutaveis.
- `src/features/admin/AdminSettingsModal.jsx` - aba de Auditoria nas Configuracoes.
- `src/lib/api.js` - helper `fetchAuditLogs`.

Arquivos relacionados:
- `server/app.mjs` - injeta `requestId`, IP e `userAgent` no request.
- `server/services/authService.mjs` - fornece o actor autenticado na sessao.
- `server/services/formsService.mjs`
- `server/services/responsesService.mjs`
- `server/services/escalaService.mjs`
- `server/services/adminService.mjs`

Componentes envolvidos:
- `AdminSettingsModal`

Services/hooks/libs envolvidos:
- `recordAuditLog`
- `listAuditLogs`
- `buildAuditActorFromAuth`
- `sanitizeAuditMetadata`
- `fetchAuditLogs`

Rotas ou paginas relacionadas:
- `GET /api/audit-logs`
- eventos de `auth_login`, `auth_logout`, `create_form`, `update_form`, `delete_form`, `save_response`, `update_response`, `claim_escala_slot`, `admin_create_*`, `admin_delete_*` e `security_master_key_update`

Termos uteis para busca:
- `audit_logs`
- `recordAuditLog`
- `GET /api/audit-logs`
- `sanitizeAuditMetadata`
- `AdminSettingsModal`

Alteracoes comuns:
- Para registrar novo evento: chamar `recordAuditLog` no backend depois da mutacao.
- Para ajustar filtros ou retorno: editar `server/repositories/auditLogRepository.mjs` e `server/routes/apiRouter.mjs`.
- Para mudar a aba visual: editar `src/features/admin/AdminSettingsModal.jsx`.

Cuidados:
- Nunca confiar em actor vindo do frontend.
- Sanitizar metadata antes de persistir.
- Nao registrar senha, chave mestra, token, hash, salt ou payload completo de respostas.

Arquivos que nao devem ser alterados sem necessidade:
- `server/services/auditLogService.mjs`
- `server/repositories/auditLogRepository.mjs`
- `server/routes/apiRouter.mjs`

Arquivos que não devem ser alterados sem necessidade:
- `server/services/adminService.mjs`
- `server/services/formsService.mjs`
- `src/features/admin/AdminSettingsModal.jsx`
- `src/screens/FormListScreen.jsx`

## Autenticação e sessão

Descrição:
- Faz login local, logout, alternância de tema e expõe permissões por papel.

Começar por:
- `src/features/auth/AuthPanel.jsx`

Arquivos principais:
- `src/features/auth/AuthPanel.jsx` — painel de login no topo.
- `src/lib/auth.js` — regras de permissão.

Arquivos relacionados:
- `src/App.jsx` — mantém sessão e chama login/logout.
- `src/lib/storage.js` — persiste a sessão e o tema.

Componentes envolvidos:
- `AuthPanel`

Services/hooks/libs envolvidos:
- `canCreateForms`
- `canEditEscala`
- `canViewForm`
- `visibleFormsFor`
- `loadStored`
- `persist`

Rotas ou páginas relacionadas:
- Topbar do app interno.

Termos úteis para busca:
- `role`
- `viewer`
- `admin`
- `session`
- `theme`

Alterações comuns:
- Para mudar mensagens de login ou UI do topo: editar `src/features/auth/AuthPanel.jsx`.
- Para mudar permissões: editar `src/lib/auth.js`.
- Para mudar persistência da sessão: editar `src/lib/storage.js`.
- O backend revoga sessões antigas do mesmo usuário quando uma nova sessão é criada, e o frontend valida a sessão ativa periodicamente.

Cuidados:
- `visibleFormsFor` e `canViewForm` controlam o que visitantes e usuários autenticados conseguem ver.
- Mudanças de papel devem ser consistentes com backend e seed.

Arquivos que não devem ser alterados sem necessidade:
- `src/features/auth/AuthPanel.jsx`
- `src/lib/auth.js`
- `src/lib/storage.js`

## Infraestrutura da API local

Descrição:
- Sobe o servidor HTTP local, roteia requests, valida payloads e agrega o bootstrap para o frontend.

Começar por:
- `server/index.mjs`

Arquivos principais:
- `server/index.mjs` — inicializa servidor e orchestrator.
- `server/app.mjs` — cria o servidor HTTP.
- `server/routes/apiRouter.mjs` — roteamento da API.
- `server/services/bootstrapService.mjs` — monta o payload inicial do frontend.

Arquivos relacionados:
- `server/config.mjs` — porta e intervalos.
- `server/core/http.mjs` — parsing e resposta HTTP.
- `server/core/forms.mjs` — helpers de domínio de formulário.
- `server/orchestrator/formLifecycleOrchestrator.mjs` — automação de ciclo de vida.

Componentes envolvidos:
- Nao se aplica no frontend.

Services/hooks/libs envolvidos:
- `getBootstrap`
- `handleApiRequest`
- `ensureSeedData`
- `startFormLifecycleOrchestrator`

Rotas ou páginas relacionadas:
- `GET /api/bootstrap`
- `GET /api/health`
- `GET /api/forms/:id/responses`
- `GET /api/forms/:id/escala`
- `POST /api/forms/:id/escala/claim`
- `POST /api/forms`
- `POST /api/responses`
- `PUT /api/escala/:formId`
- `POST` e `DELETE` de rotas administrativas

Termos úteis para busca:
- `api/bootstrap`
- `api/forms`
- `api/responses`
- `api/escala`
- `sendJson`

Alterações comuns:
- Para adicionar rota: editar `server/routes/apiRouter.mjs`.
- Para mudar payload inicial: editar `server/services/bootstrapService.mjs`.
- Para mudar porta/intervalo: editar `server/config.mjs`.
- O runner de desenvolvimento sobe frontend e API na rede local; o `start-mvp.bat` imprime o IP do notebook para acesso pelo celular.
- O app principal abre em `http://<ip>:5173/`; links públicos usam hash, por exemplo `http://<ip>:5173/#/f/<slug>`.
- O frontend também aceita `http://<ip>:5173/f/<slug>` como compatibilidade para celulares e links digitados manualmente.

Cuidados:
- Qualquer alteração em bootstrap impacta o frontend inteiro.
- O orchestrator é iniciado junto com o servidor; valide impacto ao mexer em `server/index.mjs`.

Arquivos que não devem ser alterados sem necessidade:
- `server/routes/apiRouter.mjs`
- `server/services/bootstrapService.mjs`
- `server/index.mjs`

## Bootstrap e seed

Descrição:
- Monta o payload inicial da aplicação e popula o SQLite com dados base na primeira execução.

Começar por:
- `server/services/bootstrapService.mjs`

Arquivos principais:
- `server/services/bootstrapService.mjs` — agrega forms, metrics resumidas, users, labels, presets, people e membersConfig.
- `server/seed.mjs` — popula o banco na primeira execução.

Arquivos relacionados:
- `server/db.mjs` — schema SQLite e helpers de JSON.
- `src/data/seedData.js` — dados base usados pelo seed.
- `src/data/appData.json` — metadados da aplicação.
- `server/repositories/*` — leitura dos dados que entram no bootstrap.

Componentes envolvidos:
- Não se aplica no frontend.

Services/hooks/libs envolvidos:
- `getBootstrap`
- `ensureSeedData`
- `listForms`
- `countResponsesByFormId`
- `getEscalaByFormId`

Rotas ou páginas relacionadas:
- `GET /api/bootstrap`

Termos úteis para busca:
- `bootstrap`
- `seed`
- `ensureSeedData`
- `membersConfig`
- `results_config_json`

Alterações comuns:
- Para mudar o payload inicial: editar `server/services/bootstrapService.mjs`.
- Para mudar os dados de primeira execução: editar `server/seed.mjs` e `src/data/seedData.js`.
- Para mudar schema ou colunas: editar `server/db.mjs`.

Cuidados:
- Quase todas as telas dependem desse payload inicial.
- Mudanças no seed afetam testes e comportamento de primeira execução.

Arquivos que não devem ser alterados sem necessidade:
- `server/services/bootstrapService.mjs`
- `server/seed.mjs`
- `server/db.mjs`

## Persistência e validação

Descrição:
- Define como dados são validados, normalizados e gravados no SQLite via repositórios.

Começar por:
- `server/validators/payloadValidators.mjs`

Arquivos principais:
- `server/validators/payloadValidators.mjs` — valida forma e tipos de payload.
- `server/repositories/*` — acesso ao banco por entidade.
- `server/db.mjs` — conexão e caminho do SQLite.

Arquivos relacionados:
- `server/services/formsService.mjs`
- `server/services/responsesService.mjs`
- `server/services/escalaService.mjs`
- `server/services/adminService.mjs`
- `server/seed.mjs`

Componentes envolvidos:
- Nao se aplica no frontend.

Services/hooks/libs envolvidos:
- Repositórios de `forms`, `responses`/`response_values`, `escala`, `users`, `labels`, `presets`, `people`, `settings` e `catalog`.

Rotas ou páginas relacionadas:
- Todas as rotas da API local que passam pelo roteador.

Termos úteis para busca:
- `validateFormPayload`
- `validateResponsePayload`
- `validateEscalaPayload`
- `upsert`
- `list...Repository`
- `response_values`

Alterações comuns:
- Para mudar validação: editar `server/validators/payloadValidators.mjs`.
- Para mudar persistência de uma entidade: editar o repositório correspondente em `server/repositories/*`.
- Para mudar seed inicial: editar `server/seed.mjs` e, se necessário, `src/data/seedData.js`.

Cuidados:
- Nunca ajuste a validação sem conferir os serviços que consomem aquele payload.
- Mudanças em repositórios podem afetar bootstrap, formulários, resultados e administração ao mesmo tempo.
- Mudanças em `responsesRepository` devem manter compatibilidade com `values_json` e com o shadow table `response_values`.

Arquivos que não devem ser alterados sem necessidade:
- `server/validators/payloadValidators.mjs`
- `server/db.mjs`
- Repositórios relacionados à entidade que você estiver mexendo

## Estilos e UI base

Descrição:
- Centraliza tokens de cor, ícones, badges, botões e estilos globais.

Começar por:
- `src/components/ui.jsx`

Arquivos principais:
- `src/components/ui.jsx` — UI compartilhada.
- `src/styles.css` — tema, base visual e responsividade.

Arquivos relacionados:
- `src/App.jsx`
- `src/screens/*`
- `src/features/*`

Componentes envolvidos:
- `Icon`
- `Badge`
- `StatusBadge`
- `Btn`
- `FeedbackBanner` e `ConfirmModal` â€” feedback padrao e confirmacoes reutilizaveis.
- `TypeBadge`
- `PublicTop`
- `ClosedPublicScreen`
- Base visual compartilhada para botões, inputs, cards, tabelas, badges, modais e toasts em `src/styles.css`.

Services/hooks/libs envolvidos:
- `formatDate`
- `formatDateTime`

Rotas ou páginas relacionadas:
- Todas as telas do app.

Termos úteis para busca:
- `COLORS`
- `PublicTop`
- `modal-backdrop`
- `ui-btn`
- `ui-badge`
- `ui-table`
- `ui-feedback`
- `stats-grid`
- `spin`

Alterações comuns:
- Para mudar visual global: editar `src/styles.css`.
- Para mudar botões, badges e feedback: editar `src/components/ui.jsx`.
- Para mudar controles compartilhados, tabelas e layout base: editar `src/styles.css`.

Cuidados:
- Alterações em UI base propagam para múltiplas telas e modais.
- Evite mudar tokens globais sem validar contraste e responsividade.

Arquivos que não devem ser alterados sem necessidade:
- `src/components/ui.jsx`
- `src/styles.css`

## Testes

Descrição:
- Cobrem API, validação e principais fluxos de UI.

Começar por:
- `tests/api.integration.test.mjs`

Arquivos principais:
- `tests/api.integration.test.mjs`
- `tests/orchestrator.test.mjs`
- `tests/validators.test.mjs`
- `tests/ui/*.test.jsx`
- `scripts/load-local.mjs` â€” runner manual de carga local para bootstrap e respostas.
- `tools/visual/screenshot-local.mjs` â€” runner manual para gerar PNG das telas locais com sessão opcional.

Arquivos relacionados:
- `src/screens/*`
- `server/*`

Componentes envolvidos:
- Varia conforme a área testada.

Services/hooks/libs envolvidos:
- `vitest`
- `node --test`
- `npm run test:load:local`
- `npm run screenshot:local`

Rotas ou páginas relacionadas:
- `npm test`
- `npm run test:api`
- `npm run test:ui`
- `npm run test:forms`
- `npm run test:load:local`
- `npm run screenshot:local`

Termos úteis para busca:
- `describe(`
- `it(`
- `render(`
- `expect(`

Alterações comuns:
- Para cobrir mudança de tela: ajustar o teste UI correspondente.
- Para cobrir mudança de backend: ajustar os testes de API ou validação.

Cuidados:
- Valide o fluxo afetado, não apenas o arquivo alterado.
- Se não houver script `lint`, deixe isso explícito ao reportar o trabalho.

Arquivos que não devem ser alterados sem necessidade:
- `tests/setup-ui.js`
- Testes do fluxo que você não está mudando


## Atualizacoes Recentes

### Listagem de formularios

Descricao:
- A listagem principal concentra filtros, ordenacao, paginacao e acoes rapidas por card.
- Formularios fixados ficam persistidos localmente por usuario autenticado e sobem para o topo da lista sem mudar backend.
- A busca da listagem procura por titulo, sessao, descricao, slug, status, tipo e nomes de classificacao.

Arquivos principais:
- `src/screens/FormListScreen.jsx`
- `src/App.jsx`
- `src/lib/appConstants.js`

Componentes envolvidos:
- `Btn`
- `Icon`
- `StatusBadge`
- `TypeBadge`
- `ConfirmModal`

Cuidados:
- As acoes do card usam botoes iconicos com `aria-label`; testes nao devem depender da ordem visual dos botoes.
- O estado de fixado e local ao navegador nesta etapa, entao nao deve ser usado como fonte administrativa global.

### Ciclo de vida dos formularios

Descricao:
- O backend executa um refresh de ciclo de vida em startup e no bootstrap para abrir formularios rascunho cuja data chegou e fechar formularios abertos com fechamento vencido.

Arquivos principais:
- `server/orchestrator/formLifecycleOrchestrator.mjs`
- `server/services/bootstrapService.mjs`
- `server/repositories/formsRepository.mjs`

Componentes envolvidos:
- `CreateFormScreen`

Cuidados:
- A data de abertura usa o campo `date` existente.
- O fechamento automatico continua usando `closing`.
- Nao adicionar nova tabela ou job separado antes de precisar.

### Validacao por campo

Descricao:
- O editor permite configurar regras simples por campo para texto e numero.
- O fluxo publico valida localmente antes do envio e o backend de respostas aplica a mesma regra como garantia final.

Arquivos principais:
- `src/lib/forms.js`
- `src/screens/CreateFormScreen.jsx`
- `src/screens/PublicFormScreen.jsx`
- `server/services/responsesService.mjs`
- `server/validators/payloadValidators.mjs`

Cuidados:
- Regras de texto usam `minLength` e `maxLength`.
- Regras numericas usam `min` e `max`.
- A grade publica continua exigindo preenchimento por linha quando o campo e obrigatorio.

## Dashboard inicial

Descricao:
- Mostra um resumo operacional leve da aplicacao, com contagem de formularios, respostas, vagas de escala e atalhos para as telas principais.

Comecar por:
- `src/screens/DashboardScreen.jsx`

Arquivos principais:
- `src/screens/DashboardScreen.jsx` - painel com estatisticas, atalhos e proximos fechamentos.

Arquivos relacionados:
- `src/App.jsx` - adiciona o item no menu superior e renderiza a tela.
- `src/lib/forms.js` - formatacao de datas e totais usados no painel.
- `src/components/ui.jsx` - botoes, badges e icones compartilhados.

Componentes envolvidos:
- `DashboardScreen`
- `Btn`
- `StatusBadge`
- `TypeBadge`

Services/hooks/libs envolvidos:
- `canCreateForms`
- `formatDateTime`

Rotas ou paginas relacionadas:
- Tela interna `Dashboard` acessada pelo menu superior.

Termos uteis para busca:
- `screen === "dashboard"`
- `Proximos fechamentos`
- `Vagas escala`
- `Resumo operacional`

Alteracoes comuns:
- Para mudar os cards e os atalhos: editar `src/screens/DashboardScreen.jsx`.
- Para mudar o menu ou permissao de acesso: editar `src/App.jsx` e `src/lib/auth.js`.

Cuidados:
- O dashboard deve continuar leve e depender do bootstrap ja existente.
- Nao mover essa visao para `AdminSettingsModal`; ela precisa ficar em tela propria.

Arquivos que nao devem ser alterados sem necessidade:
- `src/screens/DashboardScreen.jsx`
- `src/App.jsx`

## Header e login rapido

Descricao:
- O header interno mostra apenas navegação administrativa quando o usuario tem acesso.
- Para usuarios deslogados, o topo exibe um unico botao `Entrar` que abre um modal dedicado.

Comecar por:
- `src/App.jsx`
- `src/features/auth/AuthPanel.jsx`

Arquivos principais:
- `src/App.jsx` - controla o menu do topo, o botao `Entrar` e a abertura do modal de login.
- `src/features/auth/AuthPanel.jsx` - formulario de autenticacao usado no modal e no estado autenticado.

Alteracoes comuns:
- Para mudar o conteudo do botao ou a abertura do modal: editar `src/App.jsx`.
- Para mudar o layout do formulario de login: editar `src/features/auth/AuthPanel.jsx`.

Cuidados:
- Nao reintroduzir campos de login inline no header deslogado.
- O menu `Formulários` deve continuar restrito ao fluxo administrativo.
## Acessibilidade e listagem inicial

Descricao:
- O topo tem um botao `A+` para aumentar/reduzir a escala de fontes do site.
- Na listagem inicial, visitantes nao veem o resumo de preenchimento dos cards.
- O CTA principal dos cards publicos foi simplificado para `Responder`.

Comecar por:
- `src/App.jsx`
- `src/screens/FormListScreen.jsx`

Arquivos principais:
- `src/App.jsx` - controla o botao de acessibilidade no header e persiste a escala de fonte.
- `src/screens/FormListScreen.jsx` - controla o CTA do card e o resumo de preenchimento visivel por papel.

Alteracoes comuns:
- Para ajustar a escala de fonte: editar `src/App.jsx`, `src/styles.css` e `src/lib/appConstants.js`.
- Para mudar o texto do CTA ou a visibilidade do resumo: editar `src/screens/FormListScreen.jsx`.

Cuidados:
- O aumento de fonte precisa continuar persistido por usuario/navegador.
- Visitantes nao devem voltar a ver o bloco de preenchimento no card.
