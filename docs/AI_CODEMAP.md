# AI Code Map

Mapa curto das areas mais mexidas por agentes.

## Configuracoes administrativas

- `frontend/src/screens/SettingsScreen.jsx`
  Tela dedicada da area administrativa. Encapsula o modal em modo tela.
- `frontend/src/features/admin/AdminSettingsModal.jsx`
  CRUDs de usuarios, base de socios, catalogos, classificacoes, templates, seguranca e auditoria.
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
- `frontend/src/features/members/MemberListConfigModal.jsx`
  Configuracao da base sincronizada de socios, mapeamento de colunas e preview da base atual.
- `frontend/src/lib/api.js`
  Cliente HTTP usado pelos CRUDs administrativos.

## Autenticacao

- `frontend/src/App.jsx`
  Quando nao ha sessao, renderiza a tela de login diretamente com `AuthPanel` em modo `sheet`.
- `frontend/src/features/auth/AuthPanel.jsx`
  Formulario reutilizavel de login/logout. O modo `sheet` e usado na tela de login.

## App shell

- `frontend/src/App.jsx`
  Conecta a navegacao principal, controla a sessao e escolhe quais telas aparecem no mobile. Contas logadas respondem formularios pela tela interna `respond`; links publicos continuam em `#/formularios/<id>`.
- `frontend/src/AppViewport.jsx`
  Gate de alto nivel do frontend: resolve loading, erro, login, rotas publicas e entrega o shell autenticado.
- `frontend/src/AppShellContent.jsx`
  Shell autenticado do frontend. Renderiza o header global e as telas internas apos o login.
- `frontend/src/components/AppHeader.jsx`
  Cabecalho global com navegacao, controles de sessao e botao de voltar na tela de resultados para contas logadas.
  No mobile, permanece como shell central nas telas de resposta logada, sem o topo publico duplicado.
- `frontend/src/components/ui.jsx`
  Reune componentes visuais compartilhados. Inclui `ScreenHeader` para evitar repeticao dos topos internos com voltar, titulo, subtitulo e acoes.
  Tambem fornece `SurfacePanel` e `MetricCard` para reduzir wrappers visuais repetidos em telas grandes.
  `FieldControl` centraliza rotulos, controles e textos auxiliares de campos repetidos.
  `NotePanel` cobre caixas de aviso e explicacao que aparecem em mais de uma tela.
  `SplitSection` organiza telas administrativas em duas colunas para edicao e listagem.
- `frontend/src/lib/appShell.js`
  Centraliza helpers do shell, inclusive os caminhos publicos canonicos `#/formularios/<id>` e `#/eventos/<evento>/<formulario>`.
- `docs/REUSO.md`
  Indice rapido para agentes encontrarem componentes, helpers e telas antes de recriar comportamento ja existente.
- `docs/REFACTOR_CHECKLIST.md`
  Checklist por etapas com o que ja foi concluido e os proximos passos de refatoracao.

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
- `frontend/src/features/events/components/eventsPanels.jsx`
  Componentes compartilhados da area de eventos: card, editor, abas, lista de formularios e mensagens.
- `frontend/src/features/events/components/eventMessagesPanels.jsx`
  Componentes compartilhados das mensagens de evento: destinatarios, agendamento, preview e historico.
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
  Helpers puros da criacao de formulario: defaults, presets, normalizacao de base e sincronizacao de resultados.
- `frontend/src/screens/createFormPanels.jsx`
  Painéis compartilhados da criacao de formulario: etapa inicial, dados basicos, modo, editor de campo, escala, lista de campos, resultados e rodape.
  O editor de campo foi dividido em blocos menores para origem, definicao, ajustes extras e acoes.
  A lista de campos usa `FormFieldRow` para cada item e `ResultsTotalRow` para cada total configurado.
- `frontend/src/features/admin/AdminSettingsModal.jsx`
  CRUD visual de campos base agora permite definir a origem do `person_select` no catalogo, incluindo base central ou base externa sincronizada.
- `frontend/src/features/admin/adminAccessPanels.jsx`
  Componentes compartilhados para usuarios e bases externas fora do modal principal.
- `frontend/src/features/admin/adminCatalogPanels.jsx`
  Componentes compartilhados da aba de catalogos administrativos, com formulários e listas de campos e tarefas.
- `frontend/src/features/admin/adminOrganizationPanels.jsx`
  Componentes compartilhados das classificacoes e templates administrativos.
- `frontend/src/features/admin/adminSecurityPanels.jsx`
  UI compartilhada da seguranca administrativa.
- `frontend/src/features/admin/adminShellPanels.jsx`
  UI compartilhada da navegacao e resumo da central administrativa.
- `frontend/src/lib/forms.js`
  Helpers para detectar campo principal e campos auxiliares ligados a pessoas e ajustar comportamentos de resultados.
  Tambem centraliza a leitura da origem `members` vs `external_base`.
  Tambem resolve o modo estrutural com `FORM_MODES`, `getFormMode` e `getFormModeLabel`.
- `shared/formRules.mjs`
  Validacao compartilhada dos valores de resposta dos campos.

## Resultados e planilha

- `frontend/src/screens/ResultsScreen.jsx`
  Renderiza a planilha de respostas, filtros, totalizacao, zoom por botoes e pinch no mobile.
- `frontend/src/screens/resultsPanels.jsx`
  Painel compartilhado da planilha de presenca com totalizacao, filtros, toolbar e tabela.
- `frontend/src/screens/PublicFormScreen.jsx`
  Renderiza o preenchimento publico e tambem o modo interno `variant="internal"` para contas logadas, sem header publico.
  No modo interno, usa apenas um topo leve de contexto e nao expõe atalho visual para resultados.
- `frontend/src/screens/publicFormPanels.jsx`
  Blocos compartilhados do fluxo publico e interno de resposta: cabeçalho, aviso de erro, aviso de edição, sucesso e modal de edição.
- `frontend/src/screens/PublicEscalaScreen.jsx`
  Renderiza a escala publica e tambem o modo interno `variant="internal"` para contas logadas.
- `frontend/src/components/ui.jsx`
  Toolbar de leitura das telas publicas, com ajuste de fonte, troca de tema persistidos no navegador e botao de voltar reutilizavel.
- `frontend/src/styles.css`
  Ajustes responsivos da planilha de resultados, incluindo barra de filtros e caixa interna da tabela.
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
- `backend/validators/payloadValidators.mjs`
  Aceita `resultsConfig.formMode` com os valores `nucleo` e `geral`.

## Testes ligados a essa area

- `tests/ui/adminCatalog.test.jsx`
  Cobertura da tela administrativa, catalogos, seguranca, base de socios, bases externas e auditoria.
- `tests/ui/createFormScreen.test.jsx`
  Cobertura do editor de campos e do vinculo com a base sincronizada ou bases externas.
- `tests/ui/createFormModes.test.jsx`
  Suite focada no modo estrutural da criacao de formularios de presenca, incluindo nucleo, geral e filtros de catalogo.
- `tests/ui/appSaveFlow.test.jsx`
  Fluxo salvo do app com configuracao de resultados ligada a base vinculada.
