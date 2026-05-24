# AI Code Map

Mapa curto das areas mais mexidas por agentes.

## Configuracoes administrativas

- `frontend/src/screens/SettingsScreen.jsx`
  Tela dedicada da area administrativa. Encapsula o modal em modo tela.
- `frontend/src/features/admin/AdminSettingsModal.jsx`
  CRUDs de usuarios, base de socios, catalogos, classificacoes, templates, seguranca e auditoria.
- `frontend/src/features/admin/MessagingSettingsPanel.jsx`
  Composicao do painel administrativo de mensagens, juntando configuracao global, modelos e presets.
- `frontend/src/features/admin/messagingSettingsPanels.jsx`
  Blocos reutilizaveis do painel de mensagens administrativas: configuracao global, modelos e presets.
- `frontend/src/features/admin/adminAccessPanels.jsx`
  Paineis compartilhados da administracao de usuarios e bases externas.
- `frontend/src/features/admin/adminCatalogPanels.jsx`
  Painel compartilhado da aba de catalogos administrativos, com campos base e tarefas base.
- `frontend/src/features/admin/adminOrganizationPanels.jsx`
  Painel compartilhado de classificacoes e templates administrativos.
- `frontend/src/features/admin/adminSecurityPanels.jsx`
  Painel compartilhado da chave mestra e status da seguranca.
- `frontend/src/features/admin/adminShellPanels.jsx`
  Chrome compartilhado da central administrativa, com a barra de abas e o resumo da aba ativa.
- `frontend/src/features/admin/adminSettingsShared.jsx`
  Helpers compartilhados do admin, incluindo listas paginadas, preview de campo, editor de matriz e painel de auditoria.
  Tambem centraliza `ADMIN_INPUT_STYLE` para campos dos paineis administrativos.
- `frontend/src/features/members/MemberListConfigModal.jsx`
  Configuracao da base sincronizada de socios, mapeamento de colunas e preview da base atual.
- `frontend/src/lib/api.js`
  Cliente HTTP usado pelos CRUDs administrativos.

## Refatoracao estrutural

- `docs/CHECKLIST-OPERACIONAL-REFATORACAO.md`
  Checklist operacional com pente fino por arquivo real, usado como guia principal de limpeza estrutural.
- `frontend/src/App.jsx`
  Hub principal do frontend. Ainda concentra sessao, bootstrap, rotas, preferencias visuais e handlers de quase todas as entidades.
- `frontend/src/screens/createFormDomain.js`
  Agregador historico da criacao de formulario. Mantem reexports de compatibilidade; novas alteracoes devem usar os modulos `createForm*.js` especificos.
- `frontend/src/features/admin/adminSettingsShared.jsx`
  Hub auxiliar da central administrativa. Ainda mistura constantes, preview, paginacao, grade e auditoria.
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
  Conecta a navegacao principal, controla a sessao e escolhe quais telas aparecem no mobile. Contas logadas respondem formularios pela tela interna `respond`; links publicos continuam em `#/formularios/<id>`.
  Handlers simples de CRUD que recebem listas do bootstrap passam pelo helper local `applyBootstrapListResult`.
- `frontend/src/lib/appNav.js`
  Montagem pura dos itens de navegacao do shell autenticado conforme permissao do usuario.
- `frontend/src/AppViewport.jsx`
  Gate de alto nivel do frontend: resolve loading, erro, login, rotas publicas e entrega o shell autenticado.
- `frontend/src/AppPublicViewport.jsx`
  Renderizacao das rotas publicas de formulario, escala e resultados, delegada por `AppViewport.jsx`.
- `frontend/src/AppShellContent.jsx`
  Shell autenticado do frontend. Renderiza o header global e as telas internas apos o login.
- `frontend/src/lib/appShellContentSelectors.js`
  Seletores pequenos usados por `AppShellContent.jsx` para mensagens/eventos ativos e detalhes de respostas/escala.
- `frontend/src/lib/appBootstrap.js`
  Helpers puros do bootstrap inicial do frontend, agora focado em normalizacao do payload e selecao do formulario ativo. Mantem reexports de compatibilidade para helpers ja extraidos.
- `frontend/src/lib/appBootstrapLists.js`
  Operacoes puras de listas do bootstrap, incluindo substituicao, upsert, remocao, listas aninhadas, ordenacao de eventos e remocao de formulario dos eventos.
- `frontend/src/lib/appBootstrapMetrics.js`
  Calculo e atualizacao de metricas de formularios e escala no bootstrap.
- `frontend/src/lib/appPinning.js`
  Helpers puros para alternar e remover itens fixados por usuario.
- `frontend/src/lib/appDataLoad.js`
  Helpers do carregamento de dados do app: refresh do bootstrap, status da chave de exclusao e carregamento incremental de respostas/escala por formulario.
- `frontend/src/components/AppHeader.jsx`
  Cabecalho global com navegacao, controles de sessao e botao de voltar na tela de resultados para contas logadas.
  No mobile, permanece como shell central nas telas de resposta logada, sem o topo publico duplicado.
- `frontend/src/components/ui.jsx`
  Reune componentes visuais compartilhados. Inclui `ScreenHeader` para evitar repeticao dos topos internos com voltar, titulo, subtitulo e acoes.
  Tambem fornece `SurfacePanel` e `MetricCard` para reduzir wrappers visuais repetidos em telas grandes.
  `FieldControl` centraliza rotulos, controles e textos auxiliares de campos repetidos.
  `NotePanel` cobre caixas de aviso e explicacao que aparecem em mais de uma tela.
  `SplitSection` organiza telas administrativas em duas colunas para edicao e listagem.
  Este arquivo nao deve concentrar componentes publicos de dominio; `frontend/src/components/publicUi.jsx` e a fonte de verdade para a UI publica.
- `frontend/src/components/publicUi.jsx`
  Componentes compartilhados das telas publicas: barra de leitura, topo publico canonico `PublicTopCompact` e tela de formulario fechado.
- `frontend/src/lib/appShell.js`
  Agregador historico dos helpers do shell principal. Mantem reexports de compatibilidade para modulos especificos.
- `frontend/src/lib/appPublicRoutes.js`
  Fonte de verdade para builders e parser das rotas publicas canonicas `#/formularios/<id>` e `#/eventos/<evento>/<formulario>`.
- `frontend/src/lib/appSession.js`
  Normalizacao da sessao armazenada e sanitizacao dos dados publicos do usuario no frontend.
- `frontend/src/lib/appFormDrafts.js`
  Helpers puros para duplicar formulario e montar payload de salvamento a partir de formulario existente.
- `frontend/src/lib/appNavigation.js`
  Decisao pura de navegacao interna do shell autenticado, incluindo bloqueios por permissao.
- `frontend/src/lib/appShellDerivedState.js`
  Seletores derivados do shell autenticado, incluindo listas mescladas, formulario/evento ativos, pins e rota publica resolvida.
- `frontend/src/lib/appDetailTarget.js`
  Decisao pura de carregamento dos dados de detalhe usados por `AppViewport` e pelos efeitos de `App.jsx`.
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
- `frontend/src/screens/eventsDomain.js`
  Helpers puros da tela de eventos: draft inicial, ordenacao por fixados/data, selecao de formularios visiveis, elegibilidade de mensagens e paginacao.
- `frontend/src/features/events/components/eventsPanels.jsx`
  Componentes compartilhados da area de eventos: card, editor, abas, lista de formularios e mensagens.
- `frontend/src/features/events/components/eventMessagesPanels.jsx`
  Componentes compartilhados das mensagens de evento: destinatarios, agendamento, preview e historico.
- `frontend/src/screens/EventMessageEditorScreen.jsx`
  Editor de mensagens por evento; usa `membersConfig.phoneColumn` para avisar quando lembretes por DM ainda nao podem calcular telefone.
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
  O tipo `person_select` e o elo com a base sincronizada.
  Campos de pessoa agora podem ser `primary` ou `secondary` em `memberBinding.role`.
  So o campo `primary` habilita respondente principal, faltantes, resumo e filtro por grau.
  A origem `members` vs `external_base` agora vem definida no catalogo do campo, e o formulario apenas consome essa configuracao.
  Formularios de presenca agora tem modo estrutural `nucleo` ou `geral`, salvo em `resultsConfig.formMode`.
  No modo `nucleo`, o campo principal da base central de socios entra como base obrigatoria; no modo `geral`, essa base central fica bloqueada.
  Quando o formulario nasce dentro de um evento, o titulo de presenca e escala e padronizado e fica travado no editor.
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
  Helpers para detectar campo principal e campos auxiliares ligados a pessoas e ajustar comportamentos de resultados.
  Tambem centraliza a leitura da origem `members` vs `external_base`.
  Tambem resolve o modo estrutural com `FORM_MODES`, reexportado de `shared/formModes.mjs`, `getFormMode` e `getFormModeLabel`.
- `frontend/src/lib/gridDefaults.js`
  Fonte de verdade para linhas, colunas e presets padrao dos campos de grade usados na criacao de formulario e no admin.
- `shared/formModes.mjs`
  Valores canonicos dos modos estruturais `nucleo` e `geral`, compartilhados por frontend, backend e validadores.
- `shared/formRules.mjs`
  Validacao compartilhada dos valores de resposta dos campos.

## Resultados e planilha

- `frontend/src/screens/ResultsScreen.jsx`
  Roteador fino da tela de resultados. Escolhe entre resultados de presenca e escala.
- `frontend/src/screens/PresenceResultsScreen.jsx`
  Controller da planilha de presenca, incluindo filtros, totalizacao, zoom, exportacao e touch handling.
- `frontend/src/screens/EscalaResultsScreen.jsx`
  Controller da tela de resultados de escala, incluindo feedback, inscricao, edicao de slots e exportacao.
- `frontend/src/screens/publicScreenFrame.jsx`
  Layout compartilhado para os fluxos publicos e internos: container, topo e cards principais.
- `frontend/src/screens/resultsPanels.jsx`
  Painel compartilhado da planilha de presenca com totalizacao, filtros, toolbar e tabela.
  Tambem concentra a renderizacao reutilizavel da escala em `EscalaResultsPanel`.
  A toolbar da planilha de presenca tambem ficou isolada em `PresenceResultsToolbar`.
- `frontend/src/screens/resultsDomain.js`
  Helpers puros da planilha de resultados: ordenacao de grau, filtros ativos, estatisticas, formatacao e geracao de CSV.
  Tambem concentra montagem de linhas/base de respostas, totalizacao, filtros, ordenacao e medidas da planilha de presenca.
  Tambem concentra metricas e mutacoes puras de slots da escala.
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
