# AI Code Map

Mapa curto das areas mais mexidas por agentes.

## Configuracoes administrativas

- `frontend/src/screens/SettingsScreen.jsx`
  Tela dedicada da area administrativa. Encapsula o modal em modo tela.
- `frontend/src/features/admin/AdminSettingsModal.jsx`
  CRUDs de usuarios, base de socios, catalogos, classificacoes, templates, seguranca e auditoria.
- `frontend/src/features/admin/adminSettingsController.js`
  Controller da central administrativa: estado local, tabs, cancelamentos e confirmacao de exclusao.
- `frontend/src/features/admin/adminSettingsSubmitHandlers.js`
  Agregador dos handlers de submit da central administrativa, compondo os blocos de dominio.
- `frontend/src/features/admin/adminSettingsAccessSubmitHandlers.js`
  Handlers de submit administrativos para usuarios e bases externas.
- `frontend/src/features/admin/adminSettingsCatalogSubmitHandlers.js`
  Handlers de submit administrativos para campos base e tarefas base.
- `frontend/src/features/admin/adminSettingsOrganizationSubmitHandlers.js`
  Handler de submit administrativo para classificacoes.
- `frontend/src/features/admin/adminSettingsSecuritySubmitHandlers.js`
  Handler de submit administrativo para chave mestra.
- `frontend/src/features/admin/adminSettingsDeleteSubmitHandlers.js`
  Handler de confirmacao de exclusao da central administrativa.
- `frontend/src/features/admin/AdminSettingsContent.jsx`
  Composicao visual da central administrativa: abas, paineis e modal de exclusao.
- `frontend/src/features/admin/AdminSettingsTabPanel.jsx`
  Resolve qual adapter administrativo renderizar para a aba ativa, separando a selecao de abas do shell visual.
- `frontend/src/features/admin/adminSettingsTabAdapters.jsx`
  Adapters visuais por aba da central administrativa, mapeando blocos de props para cada painel de usuarios, bases, catalogo, organizacao, mensagens, seguranca e auditoria.
- `frontend/src/features/admin/adminSettingsDefaults.js`
  Defaults da central administrativa: drafts vazios de formularios internos e tabs por perfil.
- `frontend/src/features/admin/adminSettingsDraftState.js`
  Hook local dos drafts da central administrativa, incluindo setters e cancelamentos de formularios internos.
- `frontend/src/features/admin/adminSettingsPayloads.js`
  Payloads puros da central administrativa para usuarios, classificacoes, bases externas, catalogos, tarefas e chave mestra.
- `frontend/src/features/admin/adminSettingsActions.js`
  Helper do fluxo assíncrono dos submits e exclusoes confirmadas da central administrativa: busy, feedback, sucesso e erro.
- `frontend/src/features/admin/MessagingSettingsPanel.jsx`
  Composicao do painel administrativo de mensagens, juntando configuracao global, modelos e presets.
- `frontend/src/features/admin/messagingSettingsPanels.jsx`
  Agregador historico dos blocos de mensagens administrativas. Mantem reexports de compatibilidade.
- `frontend/src/features/admin/MessagingConfigBlock.jsx`
  Configuracao global do painel administrativo de mensagens.
- `frontend/src/features/admin/MessagingTemplatesBlock.jsx`
  Editor e lista de modelos de mensagens administrativas.
- `frontend/src/features/admin/MessagingTemplatesList.jsx`
  Lista visual de modelos de mensagens administrativas, incluindo acoes de editar e remover.
- `frontend/src/features/admin/MessagingPresetsBlock.jsx`
  Editor e lista de presets de pessoas para mensagens administrativas.
- `frontend/src/features/admin/MessagingPresetsList.jsx`
  Lista visual de presets de pessoas para mensagens administrativas, incluindo acoes de editar e remover.
- `frontend/src/features/admin/messagingSettingsShared.js`
  Labels, drafts vazios e estilo de input compartilhados pelos blocos de mensagens administrativas.
- `frontend/src/features/admin/messagingSettingsActions.js`
  Executor compartilhado de acoes assíncronas dos blocos de mensagens administrativas: busy, feedback, sucesso e erro.
- `frontend/src/features/admin/adminAccessPanels.jsx`
  Paineis compartilhados da administracao de usuarios e bases externas.
- `frontend/src/features/admin/adminCatalogPanels.jsx`
  Seletor da aba de catalogos administrativos, alternando entre campos base e tarefas base.
- `frontend/src/features/admin/FieldCatalogPanel.jsx`
  Editor e lista de campos base do catalogo administrativo.
- `frontend/src/features/admin/FieldCatalogListPanel.jsx`
  Lista paginada de campos base do catalogo administrativo, incluindo acoes de editar e remover.
- `frontend/src/features/admin/FieldCatalogSelectionSourcePanel.jsx`
  Bloco visual do vinculo de campos `person_select` do catalogo administrativo, alternando entre base central de socios e base externa sincronizada.
- `frontend/src/features/admin/ScaleTaskCatalogPanel.jsx`
  Editor e lista de tarefas base do catalogo administrativo.
- `frontend/src/features/admin/ScaleTaskCatalogListPanel.jsx`
  Lista paginada de tarefas base do catalogo administrativo, incluindo acoes de editar e remover.
- `frontend/src/features/admin/adminOrganizationPanels.jsx`
  Painel compartilhado de classificacoes e templates administrativos.
- `frontend/src/features/admin/adminSecurityPanels.jsx`
  Painel compartilhado da chave mestra e status da seguranca.
- `frontend/src/features/admin/adminShellPanels.jsx`
  Chrome compartilhado da central administrativa, com a barra de abas e o resumo da aba ativa.
- `frontend/src/features/admin/adminSettingsShared.jsx`
  Agregador historico dos helpers compartilhados do admin. Mantem reexports de compatibilidade; os paineis administrativos ja consomem os modulos menores diretamente.
- `frontend/src/features/admin/adminSettingsConstants.js`
  Constantes, labels e normalizadores compartilhados da area administrativa.
- `frontend/src/features/admin/adminPaginatedList.jsx`
  Lista paginada compartilhada dos paineis administrativos.
- `frontend/src/features/admin/adminFieldPreview.jsx`
  Preview visual de campos base do catalogo administrativo.
- `frontend/src/features/admin/adminGridSchemaEditor.jsx`
  Editor de linhas, colunas e presets dos campos de grade do admin.
- `frontend/src/features/admin/adminAuditLogsPanel.jsx`
  Painel de auditoria administrativa com filtros, carregamento e tabela.
- `frontend/src/features/admin/adminAuditLogsState.js`
  Estado, query e paginacao dos logs de auditoria administrativa.
- `frontend/src/features/admin/adminField.jsx`
  Wrapper simples para campos dos paineis administrativos.
- `frontend/src/features/members/MemberListConfigModal.jsx`
  Configuracao da base sincronizada de socios, mapeamento de colunas e preview da base atual.
- `frontend/src/lib/api.js`
  Cliente HTTP usado pelos CRUDs administrativos.

## Refatoracao estrutural

- `docs/CHECKLIST-OPERACIONAL-REFATORACAO.md`
  Checklist operacional com pente fino por arquivo real, usado como guia principal de limpeza estrutural.
- `frontend/src/App.jsx`
  Entrada principal do frontend. Renderiza `AppViewport` com as props montadas por `frontend/src/lib/appController.js`.
- `frontend/src/screens/createFormDomain.js`
  Agregador historico da criacao de formulario. Mantem reexports de compatibilidade; novas alteracoes devem usar os modulos `createForm*.js` especificos.
- `frontend/src/features/admin/adminSettingsShared.jsx`
  Hub auxiliar historico da central administrativa. Hoje fica como camada de compatibilidade para constantes, preview, paginacao, grade, auditoria e wrapper de campo ja extraidos.
- `backend/routes/adminRoutes.mjs`
  Agregador das rotas administrativas ainda nao extraidas por dominio.
- `backend/routes/adminCatalogRoutes.mjs`
  Rotas administrativas de campos e tarefas dos catalogos base, extraidas de `adminRoutes.mjs`.
- `backend/routes/adminExternalBaseRoutes.mjs`
  Rotas administrativas de CRUD e sincronizacao das bases externas, extraidas de `adminRoutes.mjs`.
- `backend/routes/adminMemberRoutes.mjs`
  Rotas administrativas da lista de socios, configuracao de origem e sincronizacao, extraidas de `adminRoutes.mjs`.
- `backend/routes/adminRouteHelpers.mjs`
  Helpers especificos das rotas administrativas para envio de erro e auditoria de mutacoes.
- `backend/routes/formRouteAudit.mjs`
  Helpers de auditoria das rotas de formularios e escala, extraidos de `formRoutes.mjs`.
- `backend/routes/systemRouteAudit.mjs`
  Helpers de auditoria das rotas de autenticacao e chave mestra, extraidos de `systemRoutes.mjs`.
- `backend/routes/eventRouteAudit.mjs`
  Helpers de auditoria das rotas administrativas de eventos, extraidos de `eventRoutes.mjs`.
- `backend/routes/messageRouteHelpers.mjs`
  Helpers das rotas de mensagens administrativas: resposta de erro, parser de rotas por evento e payloads de auditoria de criar/atualizar, disparar e cancelar mensagens.
- `backend/validators/payloadValidators.mjs`
  Agregador historico dos validadores de payload. Mantem reexports para compatibilidade e o helper transversal `validateDeleteId`.
- `backend/validators/formPayloadValidators.mjs`
  Validadores de formularios e presets, incluindo campos, resultados e secoes template de escala.
- `backend/validators/adminPayloadValidators.mjs`
  Validadores administrativos de usuarios, classificacoes, socios, configuracao de socios e bases externas, reexportados pelo agregador historico.
- `backend/validators/catalogPayloadValidators.mjs`
  Validadores de catalogos administrativos, com os helpers compartilhados de tipo de campo, origem de selecao e schema de grade.
- `backend/validators/escalaPayloadValidators.mjs`
  Validadores estruturais de escala e inscricao em slot, reexportados pelo agregador historico.
- `backend/validators/eventPayloadValidators.mjs`
  Validador estrutural de eventos, reexportado pelo agregador historico.
- `backend/validators/responsePayloadValidators.mjs`
  Validador estrutural de respostas de formulario, reexportado pelo agregador historico.
- `backend/validators/messagingPayloadValidators.mjs`
  Validadores de mensagens administrativas: templates, presets de pessoas, configuracao global e mensagens de evento.
- `backend/validators/securityPayloadValidators.mjs`
  Validadores de autenticacao e chave mestra, reexportados pelo agregador historico.
- `backend/validators/payloadValidatorPrimitives.mjs`
  Predicados estruturais compartilhados pelos validadores de payload.
- `backend/services/formsService.mjs`
  Regras de formulario com forte acoplamento ao contrato de presenca, modo estrutural e chave mestra.
- `backend/services/formModeRules.mjs`
  Regras backend de modo estrutural, base central de socios e normalizacao de `resultsConfig` usadas ao salvar formularios.
- `backend/services/formSaveRules.mjs`
  Preparo e validacao do registro persistido pelo save de formularios antes do upsert.
- `backend/services/formScaleInitializer.mjs`
  Inicializa secoes de formularios de escala sem sobrescrever secoes ja persistidas.
- `backend/services/formDeleteKeyService.mjs`
  Hash, persistencia e verificacao da chave mestra usada para excluir formularios.
- `backend/services/adminCatalogService.mjs`
  CRUD administrativo de campos e tarefas base, com normalizacao das chaves e grids do catalogo.

## Autenticacao

- `frontend/src/App.jsx`
  Quando nao ha sessao, renderiza a tela de login diretamente com `AuthPanel` em modo `sheet`.
- `frontend/src/features/auth/AuthPanel.jsx`
  Formulario reutilizavel de login/logout. O modo `sheet` e usado na tela de login.

## App shell

- `frontend/src/App.jsx`
  Entrada principal do frontend. A navegacao, sessao, preferencias, bootstrap, handlers e montagem de viewport ficam em `frontend/src/lib/appController.js`.
- `frontend/src/lib/appController.js`
  Controller de alto nivel do App: estado global, seletores derivados, handlers, efeitos de ciclo de vida, shell app e props do viewport.
- `frontend/src/lib/appControllerInputs.js`
  Montagem pura dos inputs internos do controller do App para derived state, loaders, handlers, lifecycle e view model.
  Usa listas de chaves por contrato para reduzir mapeamento manual repetido de `values` e `setters`.
- `frontend/src/lib/appControllerState.js`
  Hook do estado global do App agrupado em blocos `values` e `setters`.
- `frontend/src/lib/appControllerDerived.js`
  Hook dos dados derivados do controller do App, delegando a `buildAppShellDerivedState`.
- `frontend/src/lib/appControllerViewModel.js`
  Montagem final do `shellApp` e das props entregues ao `AppViewport`, a partir do controller do App.
- `frontend/src/lib/appControllerLoaders.js`
  Montagem dos carregadores de bootstrap, respostas, escala e status da chave usados pelo controller do App.
- `frontend/src/lib/appControllerHandlers.js`
  Montagem dos grupos de handlers de sessao, eventos, formularios/escala e admin usados pelo controller do App.
- `frontend/src/lib/appControllerLifecycle.js`
  Efeitos de ciclo de vida do controller do App, incluindo preferencias, bootstrap, rota publica e detalhes.
- `frontend/src/lib/appControllerBootstrap.js`
  Selecao dos blocos do bootstrap consumidos pelo controller do App, incluindo defaults de mensagens.
- `frontend/src/lib/appNav.js`
  Montagem pura dos itens de navegacao do shell autenticado conforme permissao do usuario.
- `frontend/src/AppViewport.jsx`
  Gate de alto nivel do frontend: resolve loading, erro, login, rotas publicas e entrega o shell autenticado.
- `frontend/src/lib/appViewportState.js`
  Decisao pura do modo visual do `AppViewport`: loading, erro, carregamento de detalhe, publico, login ou shell.
- `frontend/src/AppViewportGates.jsx`
  Gates visuais do viewport principal para loading, erro, espera de detalhe e login.
- `frontend/src/AppPublicViewport.jsx`
  Renderizacao das rotas publicas de formulario, escala e resultados, delegada por `AppViewport.jsx`.
- `frontend/src/AppShellContent.jsx`
  Shell autenticado do frontend. Renderiza o header global e delega o roteamento visual para `AppShellRoutes.jsx`.
- `frontend/src/AppShellRoutes.jsx`
  Roteamento visual do shell autenticado. Resolve a rota ativa via `AppShellRouteRegistry.jsx` e renderiza o adapter correspondente.
- `frontend/src/AppShellRouteRegistry.jsx`
  Registro das rotas visuais do shell autenticado e dos guards mínimos para cada tela.
- `frontend/src/AppShellEventMessageFlows.jsx`
  Adapters dos fluxos internos de editor e detalhe de mensagens de evento.
- `frontend/src/AppShellFormFlows.jsx`
  Adapters dos fluxos internos de resultados e resposta autenticada.
- `frontend/src/AppShellMainFlows.jsx`
  Adapters das telas principais do shell autenticado: dashboard, eventos, lista, criacao e configuracoes.
- `frontend/src/lib/appShellContentSelectors.js`
  Seletores pequenos usados por `AppShellContent.jsx` para mensagens/eventos ativos e detalhes de respostas/escala.
- `frontend/src/lib/appBootstrap.js`
  Agregador historico dos helpers do bootstrap principal. Mantem reexports de compatibilidade para normalizacao, selecao, listas, metricas e pinning.
- `frontend/src/lib/appBootstrapNormalize.js`
  Normalizacao do payload de bootstrap inicial e estrutura vazia padrao do frontend.
- `frontend/src/lib/appBootstrapSelection.js`
  Selecao do formulario ativo apos atualizar o bootstrap.
- `frontend/src/lib/appBootstrapLists.js`
  Operacoes puras de listas do bootstrap, incluindo substituicao, upsert, remocao, listas aninhadas, ordenacao de eventos e remocao de formulario dos eventos.
- `frontend/src/lib/appBootstrapMetrics.js`
  Calculo e atualizacao de metricas de formularios e escala no bootstrap.
- `frontend/src/lib/appPinning.js`
  Helpers puros para alternar e remover itens fixados por usuario.
- `frontend/src/lib/appDataLoad.js`
  Helpers do carregamento de dados do app: refresh do bootstrap, status da chave de exclusao e carregamento incremental de respostas/escala por formulario.
- `frontend/src/lib/appDataHandlers.js`
  Montagem dos handlers de carregamento usados por `App.jsx`: bootstrap, status da chave de exclusao, respostas e escala.
- `frontend/src/components/AppHeader.jsx`
  Cabecalho global com navegacao, controles de sessao e botao de voltar na tela de resultados para contas logadas.
  No mobile, permanece como shell central nas telas de resposta logada, sem o topo publico duplicado.
- `frontend/src/components/ui.jsx`
  Agregador historico dos componentes visuais compartilhados. Mantem reexports de compatibilidade para botao, badges, feedback, header, modal, layout, icones, tema e erros.
  Este arquivo nao deve concentrar componentes publicos de dominio; `frontend/src/components/publicUi.jsx` e a fonte de verdade para a UI publica.
- `frontend/src/components/uiIcons.jsx`
  Mapa e renderizacao dos icones base usados por `Icon` e `ThemeIcon`, reexportados por `ui.jsx` para compatibilidade.
- `frontend/src/components/uiErrors.js`
  Normalizador compartilhado das mensagens de erro exibidas pela UI em acoes assincronas.
- `frontend/src/components/uiTheme.js`
  Tokens compartilhados de cor da UI base, reexportados por `ui.jsx` para compatibilidade.
- `frontend/src/components/uiBadges.jsx`
  Badges compartilhados de label, status e tipo de formulario, reexportados por `ui.jsx` para compatibilidade.
- `frontend/src/components/uiButton.jsx`
  Botao compartilhado `Btn` com variantes, tamanhos, icones e estado de carregamento, reexportado por `ui.jsx` para compatibilidade.
- `frontend/src/components/uiFeedback.jsx`
  Banner compartilhado de feedback para sucesso, erro, carregamento e aviso, reexportado por `ui.jsx` para compatibilidade.
- `frontend/src/components/uiModal.jsx`
  Modal compartilhado de confirmacao com acoes de cancelar/confirmar e tons de perigo ou aviso, reexportado por `ui.jsx` para compatibilidade.
- `frontend/src/components/uiLayout.jsx`
  Wrappers compartilhados de layout (`SurfacePanel`, `MetricCard`, `FieldControl`, `NotePanel`, `SplitSection`), reexportados por `ui.jsx` para compatibilidade.
- `frontend/src/components/uiHeader.jsx`
  Header interno compartilhado `ScreenHeader`, usado por telas autenticadas e reexportado por `ui.jsx` para compatibilidade.
- `frontend/src/components/publicUi.jsx`
  Agregador historico da UI publica. Mantem reexports de compatibilidade para tela fechada, barra de leitura e topo compacto.
- `frontend/src/components/ClosedPublicScreen.jsx`
  Tela publica de formulario fechado, usando `PublicTopCompact` e mensagem/fechamento do formulario.
- `frontend/src/components/PublicReadingToolbar.jsx`
  Barra publica de ajustes de leitura, consumindo o helper de preferencias publicas e reexportada por `publicUi.jsx` para compatibilidade.
- `frontend/src/components/PublicTopCompact.jsx`
  Topo publico canonico com titulo, metadata, acoes e barra de leitura, reexportado por `publicUi.jsx` para compatibilidade.
- `frontend/src/lib/publicReadingPreferences.js`
  Preferencias locais dos controles publicos de leitura, incluindo tema/fonte, storage legado e evento de sincronizacao com o shell.
- `frontend/src/lib/appShell.js`
  Agregador historico dos helpers do shell principal. Mantem reexports de compatibilidade para modulos especificos.
- `frontend/src/lib/appPublicRoutes.js`
  Fonte de verdade para builders e parser das rotas publicas canonicas `#/formularios/<id>` e `#/eventos/<evento>/<formulario>`.
- `frontend/src/lib/appSession.js`
  Normalizacao da sessao armazenada e sanitizacao dos dados publicos do usuario no frontend.
- `frontend/src/lib/appFormDrafts.js`
  Helpers puros para duplicar formulario e montar payload de salvamento a partir de formulario existente.
- `frontend/src/lib/appFormActions.js`
  Acoes do shell principal para criar, duplicar, salvar, arquivar, excluir, responder e atualizar escala de formularios.
- `frontend/src/lib/appFormHandlers.js`
  Montagem dos handlers de formulario, resposta e escala usados por `App.jsx`, mantendo os wrappers fora do componente principal.
- `frontend/src/lib/appAdminActions.js`
  Acoes do shell principal para usuarios, listas administrativas, bases externas, membros, catalogos e mensagens.
- `frontend/src/lib/appAdminHandlers.js`
  Montagem dos handlers administrativos e de mensagens usados por `App.jsx`.
- `frontend/src/lib/appHandlerGroups.js`
  Montagem dos grupos de handlers do App: sessao, eventos, formularios/escala e administracao/mensagens.
- `frontend/src/lib/appEventActions.js`
  Acoes do shell principal para salvar, publicar, excluir e fixar eventos.
- `frontend/src/lib/appEventHandlers.js`
  Montagem dos handlers de eventos usados por `App.jsx`.
- `frontend/src/lib/appShellObject.js`
  Montagem do objeto entregue ao viewport e ao shell autenticado a partir de blocos de estado, dados, acoes e setters.
  Expoe blocos explicitos (`state`, `data`, `actions`, `setters`, `permissions`) e mantem campos planos por compatibilidade.
  Consumidores principais devem usar os acessores `getShellState`, `getShellData`, `getShellActions`, `getShellSetters` e `getShellPermissions`.
- `frontend/src/lib/appShellBuilder.js`
  Composicao detalhada do objeto `shellApp` usado por `AppViewport` e `AppShellContent`, incluindo helpers puros para montar os blocos `data`, `state`, `actions`, `setters` e `permissions` fora de `App.jsx`.
  O runtime state reaproveita o bloco `state` montado antes, evitando remontagem campo a campo.
- `frontend/src/lib/appLifecycleEffects.js`
  Hook dos efeitos de ciclo de vida do shell principal: persistencia, bootstrap inicial, rota publica, detalhes e validacao de sessao.
- `frontend/src/lib/appSessionActions.js`
  Acoes de sessao, logout local, navegacao interna e escala de fonte do shell principal.
- `frontend/src/lib/appSessionHandlers.js`
  Montagem dos handlers de sessao, navegacao e escala de fonte usados por `App.jsx`.
- `frontend/src/lib/appNavigation.js`
  Decisao pura de navegacao interna do shell autenticado, incluindo bloqueios por permissao.
- `frontend/src/lib/appShellDerivedState.js`
  Seletores derivados do shell autenticado, incluindo listas mescladas, formulario/evento ativos, pins e rota publica resolvida.
- `frontend/src/lib/appDetailTarget.js`
  Decisao pura de carregamento dos dados de detalhe usados por `AppViewport` e pelos efeitos de `App.jsx`.
- `frontend/src/lib/appViewportNavigation.js`
  Efeitos de navegacao ao sair de rotas publicas do viewport principal.
- `frontend/src/lib/appViewportProps.js`
  Montagem das props entregues por `App.jsx` ao `AppViewport`, derivadas do shell e dos handlers de sessao.
- `frontend/src/lib/appFontScale.js`
  Limites, passo e normalizacao da escala de fonte do app.
- `frontend/src/lib/appPreferences.js`
  Centraliza leitura e aplicacao local de sessao, tema, escala de fonte e itens fixados por usuario.
- `frontend/src/lib/downloadCsv.js`
  Utilitario compartilhado para gerar download de CSV no navegador.
- `docs/REUSO.md`
  Indice rapido para agentes encontrarem componentes, helpers e telas antes de recriar comportamento ja existente.

## Listagem

- `frontend/src/screens/FormListScreen.jsx`
  Tela de listagem dos formularios com paginacao e filtros.
  Formularios de presenca ficam em lista unica; a separacao entre nucleo e geral deve acontecer pelos filtros.
  O topo da listagem ficou compacto, sem contador textual e sem botao de criar exposto ali.
- `frontend/src/components/FormListCard.jsx`
  Card da listagem com metadados do formulario, incluindo badge do modo estrutural nos formularios de presenca.
- `frontend/src/components/FormListToolbar.jsx`
  Barra de busca, filtros e ordenacao da listagem. No mobile, os filtros ficam em faixa horizontal rolavel.

## Eventos

- `frontend/src/screens/EventsScreen.jsx`
  Tela de eventos para contas logadas. Admin lista, cria, edita, fixa e exclui eventos; viewer acessa os eventos e formularios vinculados sem acoes administrativas.
- `frontend/src/screens/EventsScreenViews.jsx`
  Views de lista, detalhe e edicao da tela de eventos, extraidas de `EventsScreen.jsx`.
- `frontend/src/screens/eventsScreenController.js`
  Controller da tela de eventos: estado de modo, selecao, feedback, paginacao e acoes de salvar, publicar, encerrar e excluir.
- `frontend/src/screens/eventsDomain.js`
  Helpers puros da tela de eventos: draft inicial, ordenacao por fixados/data, selecao de formularios visiveis, elegibilidade de mensagens e paginacao.
- `frontend/src/features/events/components/eventsPanels.jsx`
  Agregador historico dos componentes compartilhados da area de eventos. Mantem reexports de compatibilidade.
- `frontend/src/features/events/components/eventEditorPanel.jsx`
  Shell visual do editor de evento, compondo cabecalho e campos do formulario.
- `frontend/src/features/events/components/eventListPanel.jsx`
  Card e listagem visual de eventos, incluindo botoes administrativos e paginacao.
- `frontend/src/features/events/components/eventDetailFormsPanel.jsx`
  Lista visual de formularios vinculados ao detalhe de evento, adaptando `FormListCard`.
- `frontend/src/features/events/components/eventDetailHeader.jsx`
  Cabecalho visual do detalhe de evento, incluindo status e acoes administrativas.
- `frontend/src/features/events/components/eventDetailTabs.jsx`
  Abas visuais do detalhe de evento para formularios e mensagens.
- `frontend/src/features/events/components/eventDeleteConfirmModal.jsx`
  Modal de confirmacao de exclusao de evento.
- `frontend/src/features/events/components/eventEditorFieldsPanel.jsx`
  Campos visuais do editor de evento, incluindo nome, data, abertura, fechamento, descricao e acoes.
- `frontend/src/features/events/components/eventPaginationControls.jsx`
  Controles visuais de paginacao reutilizados pela lista de eventos e pelos formularios do detalhe.
- `frontend/src/features/events/components/eventMessagesListPanel.jsx`
  Lista visual de mensagens vinculadas a evento, incluindo empty states e linha clicavel com status/agendamento.
- `frontend/src/features/events/components/eventMessagesPanels.jsx`
  Componentes compartilhados do editor de mensagens de evento: painel de destinatarios e reexport do painel de agendamento.
- `frontend/src/features/events/components/eventMessageManualPersonPicker.jsx`
  Picker manual de pessoas para mensagens diretas de evento, usado pelo painel de destinatarios.
- `frontend/src/features/events/components/eventMessageSchedulePanel.jsx`
  Painel de agendamento do editor de mensagens de evento, incluindo janela de lembrete e data/hora manual.
- `frontend/src/features/events/components/eventMessageDetailPanels.jsx`
  Componentes compartilhados do detalhe de mensagens de evento: cabecalho de acoes, resumo, preview renderizado, destinatarios calculados e historico.
- `frontend/src/screens/eventMessageDetailUtils.js`
  Utilitarios do detalhe de mensagens de evento: formatacao de data/hora e copia segura para clipboard.
- `frontend/src/screens/EventMessageEditorScreen.jsx`
  Editor de mensagens por evento; usa `membersConfig.phoneColumn` para avisar quando lembretes por DM ainda nao podem calcular telefone.
- `frontend/src/screens/EventMessageEditorFields.jsx`
  Campos visuais do editor de mensagens de evento: tipo, formulario alvo, modelo, corpo, destinatarios e agendamento.
- `frontend/src/screens/eventMessageDomain.js`
  Helpers puros das mensagens por evento: tipos elegiveis, draft inicial, transicao de tipo, payload de salvamento, regras de status e confirmacao do detalhe.
- `frontend/src/features/events/components/`
  Pasta de componentes compartilhados do dominio de eventos. Use como primeiro destino para novos blocos visuais dessa area.
- `frontend/src/App.jsx`
  Inclui o menu `Eventos` para admin e viewer, guarda `events` no bootstrap e anexa novos formularios ao evento ativo.
- `backend/routes/eventRoutes.mjs`
  Rotas administrativas `POST /api/events`, `DELETE /api/events/:id` e `POST /api/events/:id/publish`.
- `backend/services/eventsService.mjs`
  Normaliza evento, valida formularios vinculados e remove agrupadores sem apagar formularios.
- `backend/repositories/eventsRepository.mjs`
  Persistencia da tabela `events`.

## Vinculo com base personalizada

- `frontend/src/screens/CreateFormScreen.jsx`
  Configura campos do formulario e consome a biblioteca de campos. No mobile, o topo do formulario usa uma caixa de contexto com acento visual.
  A tela ficou como composicao visual; estado, derived state e handlers ficam em `frontend/src/screens/createFormController.js`.
  O tipo `person_select` e o elo com a base sincronizada.
  Campos de pessoa agora podem ser `primary` ou `secondary` em `memberBinding.role`.
  So o campo `primary` habilita respondente principal, faltantes, resumo e filtro por grau.
  A origem `members` vs `external_base` agora vem definida no catalogo do campo, e o formulario apenas consome essa configuracao.
  Formularios de presenca agora tem modo estrutural `nucleo` ou `geral`, salvo em `resultsConfig.formMode`.
  No modo `nucleo`, o campo principal da base central de socios entra como base obrigatoria; no modo `geral`, essa base central fica bloqueada.
  Quando o formulario nasce dentro de um evento, o titulo de presenca e escala e padronizado e fica travado no editor.
- `frontend/src/screens/CreateFormPresenceSection.jsx`
  Adaptador da secao de presenca do editor, montando lista/editor de campos e configuracao de resultados fora de `CreateFormScreen.jsx`.
  Consome blocos nomeados de props (`fieldsPanel`, `fieldEditor`, `resultsConfig`) montados pelo controller.
- `frontend/src/screens/createFormController.js`
  Controller local da criacao de formulario: agrupa estado, derived state, handlers e blocos de props consumidos pela tela visual.
  A fronteira com a secao de presenca e organizada por blocos de props, nao por lista plana.
- `frontend/src/screens/createFormDomain.js`
  Agregador historico da criacao de formulario. Mantem reexports de compatibilidade, mas a tela principal importa os modulos especificos diretamente.
- `frontend/src/screens/createFormDefaults.js`
  Opcoes iniciais, campos padrao e titulo preset da criacao de formulario.
- `frontend/src/screens/createFormMemberBindings.js`
  Normalizacao de `person_select` e `memberBinding` ligados a base central de socios.
- `frontend/src/screens/createFormTemplates.js`
  Payload e estado de aplicacao de templates reutilizaveis da criacao de formulario.
- `frontend/src/screens/createFormState.js`
  Estado inicial, selecao de formato e retorno de salvamento do editor de formulario.
- `frontend/src/screens/createFormModeTransition.js`
  Transicao entre modos estruturais na criacao de formulario.
- `frontend/src/screens/createFormDerivedState.js`
  Estado derivado do editor: catalogos ativos, disponibilidade de tipos, origem de selecao e flags de salvamento.
- `frontend/src/screens/createFormPayload.js`
  Payload final da criacao de formulario enviado para a API, incluindo normalizacao de presenca e configuracao de resultados.
- `frontend/src/screens/createFormScaleDraft.js`
  Helpers puros do rascunho de escala na criacao de formulario: secoes locais e patches de catalogo/modo.
- `frontend/src/screens/createFormListHelpers.js`
  Mutacoes puras de listas usadas pelo editor de criacao de formulario.
- `frontend/src/screens/createFormResultsConfig.js`
  Layout de totais e sincronizacao da configuracao de resultados da criacao de formulario.
- `frontend/src/screens/createFormFieldDraft.js`
  Defaults de grade, presets e transicoes do rascunho de campo da criacao de formulario.
- `frontend/src/screens/createFormFieldSave.js`
  Payload intermediario, validacao e merge do salvamento de campos na criacao de formulario.
- `frontend/src/screens/createFormFieldHandlers.js`
  Handlers do editor de campos da criacao de formulario: modo estrutural, rascunho de campo, grade, catalogo e salvamento local do campo.
- `frontend/src/screens/createFormScaleHandlers.js`
  Handlers do rascunho de escala na criacao de formulario: secoes, catalogo, modo e limite.
- `frontend/src/screens/createFormSetupHandlers.js`
  Handlers simples do setup da criacao de formulario: formato, titulo, labels, preview e modal de preset.
- `frontend/src/screens/createFormTemplateHandlers.js`
  Handlers de aplicacao, limpeza e salvamento de templates da criacao de formulario.
- `frontend/src/screens/createFormSubmitHandlers.js`
  Handlers de submit do formulario, montagem do payload final, erro de acao e modal de sucesso.
- `frontend/src/features/forms/createFormPanels/setupPanels.jsx`
  Paineis iniciais da criacao de formulario: topo, contexto, modo estrutural, tipo inicial e dados basicos.
- `frontend/src/features/forms/createFormPanels/fieldPanels.jsx`
  Paineis da lista e do editor de campos da criacao de formulario: origem, definicao, ajustes extras, acoes e linha reutilizavel de campo.
- `frontend/src/features/forms/createFormPanels/finalPanels.jsx`
  Paineis finais da criacao de formulario: pre-visualizacao, escala, configuracao dos resultados, rodape e linha reutilizavel de totalizacao.
  `CreateFormScreen.jsx` importa os paineis diretamente desses modulos, sem barramento intermediario.
- `frontend/src/features/admin/AdminSettingsModal.jsx`
  CRUD visual de campos base agora permite definir a origem do `person_select` no catalogo, incluindo base central ou base externa sincronizada.
- `frontend/src/features/admin/adminAccessPanels.jsx`
  Componentes compartilhados para usuarios e bases externas fora do modal principal.
- `frontend/src/features/admin/adminCatalogPanels.jsx`
  Componentes compartilhados da aba de catalogos administrativos, com formulÃ¡rios e listas de campos e tarefas.
- `frontend/src/features/admin/adminOrganizationPanels.jsx`
  Componentes compartilhados das classificacoes e templates administrativos.
- `frontend/src/features/admin/adminSecurityPanels.jsx`
  UI compartilhada da seguranca administrativa.
- `frontend/src/features/admin/adminShellPanels.jsx`
  UI compartilhada da navegacao e resumo da central administrativa.
- `frontend/src/lib/forms.js`
  Agregador historico dos helpers de formulario. Mantem reexports de formatacao, leitura de campos/modos e resultados.
- `frontend/src/lib/formFieldAccess.js`
  Helpers de leitura de campos, origem de selecao, campo principal de pessoa e modo estrutural do formulario.
- `frontend/src/lib/formFormatting.js`
  Formatacao de data/hora e busca textual de formularios.
- `frontend/src/lib/formResults.js`
  Helpers de leitura de respostas, configuracao de resultados, formulario publico fechado e reexports das regras compartilhadas.
- `frontend/src/lib/gridDefaults.js`
  Fonte de verdade para linhas, colunas e presets padrao dos campos de grade usados na criacao de formulario e no admin.
- `shared/formModes.mjs`
  Valores canonicos dos modos estruturais `nucleo` e `geral`, compartilhados por frontend, backend e validadores.
- `shared/formFieldRules.mjs`
  Regras estruturais compartilhadas dos campos de formulario: tipos canonicos, origens de selecao, papeis de `memberBinding` e leitura da origem de campos `person_select`.
- `shared/formRules.mjs`
  Validacao compartilhada dos valores de resposta dos campos.

## Resultados e planilha

- `frontend/src/screens/ResultsScreen.jsx`
  Roteador fino da tela de resultados. Escolhe entre resultados de presenca e escala.
- `frontend/src/screens/PresenceResultsScreen.jsx`
  Ponte fina da planilha de presenca: monta `PresenceResultsPanel.jsx` com props vindas de `presenceResultsController.js`.
- `frontend/src/screens/presenceResultsController.js`
  Controller local da planilha de presenca, incluindo filtros, totalizacao, zoom, exportacao e touch handling. Consome diretamente `resultsPresenceDomain.js` e `resultsCsv.js`, mantendo `resultsDomain.js` como agregador historico.
- `frontend/src/screens/presenceTableZoomController.js`
  Hook local do zoom da tabela de presenca, incluindo botoes e pinch por toque.
- `frontend/src/screens/PresenceResultsPanel.jsx`
  Painel visual da planilha de presenca, compondo topo, feedback, totalizacao, toolbar e tabela.
- `frontend/src/screens/EscalaResultsScreen.jsx`
  Ponte fina da tela de escala: monta `EscalaResultsPanel.jsx` com props vindas de `escalaResultsController.js`.
- `frontend/src/screens/escalaResultsController.js`
  Controller local da tela de escala, incluindo feedback, inscricao, edicao de slots e exportacao. Consome diretamente `resultsEscalaDomain.js` e `resultsCsv.js`, mantendo `resultsDomain.js` como agregador historico.
- `frontend/src/screens/escalaPersistController.js`
  Hook local de persistencia da escala de resultados: busy, feedback, sucesso e erro das alteracoes.
- `frontend/src/screens/EscalaResultsPanel.jsx`
  Painel visual da tela de escala, compondo overview, lista de secoes, modal de inscricao e confirmacao de remocao.
- `frontend/src/screens/EscalaSectionsPanel.jsx`
  Lista visual de secoes e vagas da escala de resultados, extraida de `resultsPanels.jsx`.
- `frontend/src/screens/EscalaSignupModal.jsx`
  Modal visual de inscricao em vaga da escala de resultados, extraido de `resultsPanels.jsx`.
- `frontend/src/screens/EscalaResultsOverview.jsx`
  Barra superior, feedback, aviso de permissao e metricas da escala de resultados, extraidos de `resultsPanels.jsx`.
- `frontend/src/screens/publicScreenFrame.jsx`
  Layout compartilhado para os fluxos publicos e internos: container, topo e cards principais.
- `frontend/src/screens/resultsPanels.jsx`
  Agregador historico dos paineis visuais de resultados. Mantem reexports de `PresenceResultsPanel.jsx` e `EscalaResultsPanel.jsx`.
- `frontend/src/screens/PresenceResultsToolbar.jsx`
  Toolbar de filtros, zoom e exportacao da planilha de presenca, extraida de `resultsPanels.jsx`.
- `frontend/src/screens/PresenceTotalsPanel.jsx`
  Painel visual de totalizacao da planilha de presenca, extraido de `resultsPanels.jsx`.
- `frontend/src/screens/PresenceResultsTable.jsx`
  Tabela visual da planilha de presenca, incluindo cabecalho, linhas e area rolavel.
- `frontend/src/screens/resultsDomain.js`
  Agregador historico dos helpers puros da tela de resultados. Mantem reexports de presenca, escala e CSV.
- `frontend/src/screens/resultsPresenceDomain.js`
  Agregador historico dos helpers puros da planilha de presenca. Mantem reexports de UI/interacao, grau, tabela/totais e filtros.
- `frontend/src/screens/resultsPresenceUiDomain.js`
  Helpers puros de zoom, toque, estado de ordenacao, icone de ordenacao e estilo de cabecalho da planilha de presenca.
- `frontend/src/screens/resultsPresenceGrauDomain.js`
  Normalizacao e ordenacao canonica de graus, alem das opcoes de grau da planilha de presenca.
- `frontend/src/screens/resultsPresenceTableDomain.js`
  Linhas, respostas base, stats, totais, layout de totais, resumo e largura minima da planilha de presenca.
- `frontend/src/screens/resultsPresenceFilterDomain.js`
  Botoes de filtro, filtro por coluna/grau, filtro de respostas, ordenacao de linhas e opcoes do filtro ativo.
- `frontend/src/screens/resultsEscalaDomain.js`
  Helpers puros da escala de resultados: metricas, nomes e mutacoes de slots.
- `frontend/src/screens/resultsCsv.js`
  Formatacao de valores e geracao de CSV para presenca e escala.
- `frontend/src/screens/PublicFormScreen.jsx`
  Renderiza o preenchimento publico e tambem o modo interno `variant="internal"` para contas logadas, sem header publico.
  No modo interno, usa apenas um topo leve de contexto e nao expÃµe atalho visual para resultados.
- `frontend/src/screens/publicFormDomain.js`
  Helpers puros do fluxo publico: opcoes de selecao de pessoa e busca de resposta existente.
- `frontend/src/screens/publicFormPanels.jsx`
  Blocos compartilhados do fluxo publico e interno de resposta: cabeÃ§alho, aviso de erro, aviso de ediÃ§Ã£o, sucesso e modal de ediÃ§Ã£o.
- `frontend/src/screens/PublicEscalaScreen.jsx`
  Renderiza a escala publica e tambem o modo interno `variant="internal"` para contas logadas.
- `frontend/src/screens/publicScaleDomain.js`
  Helpers puros da escala publica: limite de vagas, contagem de atribuicoes e montagem da proxima versao das secoes.
- `frontend/src/screens/publicScalePanels.jsx`
  Modal compartilhado de inscricao na escala publica, separado da tela principal.
- `frontend/src/screens/PublicEscalaScreen.jsx`
  Fluxo publico da escala agora usa paineis reutilizaveis para metricas e lista de vagas.
- `frontend/src/components/ui.jsx`
  Primitives visuais compartilhados.
- `frontend/src/components/publicUi.jsx`
  Implementa a toolbar de leitura, topos publicos e tela de formulario fechado.
- `frontend/src/styles.css`
  Ajustes responsivos da planilha de resultados, incluindo barra de filtros e caixa interna da tabela.
  Blocos mortos antigos de totalizacao, badges e topo de resultados foram removidos apos varredura de classes.
- `frontend/src/App.jsx`
  Distingue o acesso interno e publico aos resultados. A rota publica `#/formularios/<id>/resultados` so abre quando o formulario de presenca permite resultados publicos.

## Backend da base sincronizada

- `backend/services/membersSyncService.mjs`
  Salva a configuracao da origem externa e dispara a sincronizacao.
- `backend/services/membersSyncHelpers.mjs`
  Converte CSV e aplica o mapeamento de colunas da planilha para a base local.
- `backend/services/externalBasesService.mjs`
  CRUD e sincronizacao de bases externas reutilizaveis para campos de formulario.
- `backend/services/adminService.mjs`
  Orquestra os CRUDs administrativos e os catalogos globais.
- `backend/services/formsService.mjs`
  Valida o modo estrutural dos formularios de presenca: `geral` nao aceita base central de socios e `nucleo` exige campo principal dessa base.
- `backend/validators/formPayloadValidators.mjs`
  Aceita `resultsConfig.formMode` com os valores de `shared/formModes.mjs`.

## Testes ligados a essa area

- `tests/ui/adminCatalog.test.jsx`
  Cobertura da tela administrativa, catalogos, seguranca, base de socios, bases externas e auditoria.
- `tests/ui/createFormScreen.test.jsx`
  Cobertura do editor de campos e do vinculo com a base sincronizada ou bases externas.
- `tests/ui/createFormModes.test.jsx`
  Suite focada no modo estrutural da criacao de formularios de presenca, incluindo nucleo, geral e filtros de catalogo.
- `tests/ui/appSaveFlow.test.jsx`
  Fluxo salvo do app com configuracao de resultados ligada a base vinculada.
