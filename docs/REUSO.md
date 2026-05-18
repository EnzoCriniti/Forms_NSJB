# Reuso de Codigo

Guia curto para localizar blocos e funcoes ja existentes antes de criar algo novo.

## Base visual

- `frontend/src/components/ui.jsx`
  Use `ScreenHeader` para topos internos com voltar, titulo, subtitulo e acoes.
  Use `SurfacePanel` para blocos visuais com borda, raio e padding padrao.
  Use `MetricCard` para indicadores simples com numero grande e legenda.
  Use `FieldControl` para campos rotulados com ajuda opcional e acoes laterais.
  Use `NotePanel` para avisos e textos auxiliares em caixa cinza/verde dentro dos formularios.
  Use `SplitSection` para montagens de duas colunas em areas administrativas.
- `frontend/src/components/CreateFormFieldPreview.jsx`
  Previa isolada de campo para o editor de formulario.
- `frontend/src/components/ResultsPresenceHeader.jsx`
  Cabecalho de resultados de presenca com toolbar publica, filtros e cards de resumo.
- `frontend/src/components/FormListCard.jsx`
  Card reutilizavel da listagem de formularios com acoes e badges.
- `frontend/src/AppShellContent.jsx`
  Shell autenticado que renderiza header global e telas internas apos o login.
- `frontend/src/AppViewport.jsx`
  Gate de alto nivel do app para login, publicos, loading e shell autenticado.
- `frontend/src/lib/appBootstrap.js`
  Normalizacao do bootstrap, selecao do formulario ativo, operacoes reutilizaveis de lista e listas aninhadas no estado, ordenacao de eventos, metricas de formularios/escala e alternancia de itens fixados por usuario.
- `frontend/src/features/admin/adminSettingsShared.jsx`
  Blocos do admin para listas paginadas, preview de campo, editor de matriz e auditoria.
- `frontend/src/features/admin/adminAccessPanels.jsx`
  Painel reutilizavel da administracao de usuarios e bases externas.
- `frontend/src/features/admin/adminCatalogPanels.jsx`
  Painel reutilizavel da aba de catalogos administrativos, com os blocos de campos base e tarefas base.
- `frontend/src/features/admin/adminOrganizationPanels.jsx`
  Painel reutilizavel de classificacoes e templates administrativos.
- `frontend/src/features/admin/adminSecurityPanels.jsx`
  Painel reutilizavel da chave mestra administrativa.
- `frontend/src/features/admin/adminShellPanels.jsx`
  Chrome reutilizavel da central administrativa com abas e resumo da aba ativa.
- `frontend/src/screens/createFormPanels.jsx`
  Barramento dos paineis reutilizaveis da criacao de formulario.
  Os paineis iniciais ficaram em `frontend/src/features/forms/createFormPanels/setupPanels.jsx`.
  Os paineis de lista e editor de campos ficaram em `frontend/src/features/forms/createFormPanels/fieldPanels.jsx`.
  Os paineis finais de escala, resultados e rodape ficaram em `frontend/src/features/forms/createFormPanels/finalPanels.jsx`.
  A pre-visualizacao publica tambem ficou em `FormPreviewPanel`, exportado por `frontend/src/features/forms/createFormPanels/finalPanels.jsx`.
  As linhas de campos usam `FormFieldRow` e os totais configurados usam `ResultsTotalRow`.
- `frontend/src/features/forms/createFormPanels/setupPanels.jsx`
  Paineis iniciais da criacao de formulario: topo, contexto, modo estrutural, tipo inicial e dados basicos.
- `frontend/src/features/forms/createFormPanels/fieldPanels.jsx`
  Paineis da lista e do editor de campos da criacao de formulario: origem, definicao, ajustes extras, acoes e linha reutilizavel de campo.
- `frontend/src/features/forms/createFormPanels/finalPanels.jsx`
  Paineis finais da criacao de formulario: pre-visualizacao, escala, configuracao dos resultados, rodape e linha reutilizavel de totalizacao.
- `frontend/src/screens/resultsPanels.jsx`
  Painel compartilhado da planilha de presenca com totalizacao, filtros, toolbar e tabela.
  Tambem inclui o painel reutilizavel da escala em `EscalaResultsPanel`.
  A toolbar da planilha de presenca tambem pode ser reutilizada por `PresenceResultsToolbar`.
- `frontend/src/screens/resultsDomain.js`
  Regras puras de ordenacao, filtros, formatacao e geracao de CSV da planilha de resultados.
- `frontend/src/features/events/components/eventsPanels.jsx`
  Componentes compartilhados da area de eventos: card, editor, abas, lista de formularios e mensagens.
- `frontend/src/features/events/components/eventMessagesPanels.jsx`
  Componentes compartilhados das mensagens de evento: destinatarios, agendamento, preview e historico.
- `frontend/src/features/events/components/`
  Pasta alvo para novos componentes compartilhados do dominio de eventos.
- `docs/REFACTOR_CHECKLIST.md`
  Checklist sequencial com o que ja foi quebrado em componentes e os proximos passos.
- `docs/REFACTOR_STRUCTURE_CHECKLIST.md`
  Checklist novo para organizar pastas, reduzir arquivos grandes e unificar duplicacoes.
- `docs/REFACTOR_EXECUTION_CHECKLIST.md`
  Checklist granular para guiar os proximos lotes de refatoracao com validacao e commits.

## Formularios

- `frontend/src/screens/CreateFormScreen.jsx`
  Editor principal de formulario, com modos `nucleo` e `geral`, campos da biblioteca, presets e configuracoes de resultados.
- `frontend/src/screens/createFormDomain.js`
  Regras puras da criacao de formulario usadas pela tela e pelos testes unitarios. Inclui presets, estado inicial do editor e de duplicacao, estado do editor de campo, mutacoes reutilizaveis de listas, montagem/merge de campos, payload final, normalizacao de base e sincronizacao de resultados.
- `frontend/src/lib/forms.js`
  Helpers de modo estrutural, base central, origem de selecao e validacao ligada ao formulario.
- `shared/formRules.mjs`
  Regras compartilhadas de validacao de respostas.

## Eventos

- `frontend/src/screens/EventsScreen.jsx`
  CRUD visual de eventos e listagem dos formularios vinculados.
- `frontend/src/screens/EventMessageEditorScreen.jsx`
  Editor de mensagens por evento, com agendamento e templates.
- `frontend/src/screens/EventMessageDetailScreen.jsx`
  Detalhe da mensagem, preview renderizado e acoes de disparo, cancelamento e exclusao.
- `backend/services/eventsService.mjs`
  Normalizacao e validacao dos eventos.
- `backend/services/eventMessagesService.mjs`
  Persistencia e regras das mensagens de evento.

## Administracao

- `frontend/src/features/admin/AdminSettingsModal.jsx`
  Central administrativa principal com usuarios, bases, catalogos, templates e seguranca.
- `frontend/src/features/admin/adminAccessPanels.jsx`
  UI compartilhada dos blocos de usuarios e bases externas.
- `frontend/src/features/admin/adminCatalogPanels.jsx`
  UI compartilhada da aba de catalogos dentro do admin.
- `frontend/src/features/admin/adminOrganizationPanels.jsx`
  UI compartilhada das classificacoes e templates dentro do admin.
- `frontend/src/features/admin/adminSecurityPanels.jsx`
  UI compartilhada da seguranca administrativa.
- `frontend/src/features/admin/adminShellPanels.jsx`
  UI compartilhada da barra de abas e do resumo do modulo administrativo.
- `frontend/src/features/members/MemberListConfigModal.jsx`
  Configuracao da base de socios sincronizada.
- `frontend/src/features/admin/MessagingSettingsPanel.jsx`
  Composicao das configuracoes ligadas a mensagens e envio.
- `frontend/src/features/admin/messagingSettingsPanels.jsx`
  Blocos reutilizaveis de configuracao global, modelos e presets de mensagens.
- `backend/services/adminService.mjs`
  Orquestracao dos CRUDs administrativos no backend.

## Resultados e resposta

- `frontend/src/screens/ResultsScreen.jsx`
  Planilha de resultados, totalizacao e filtro de grau.
- `frontend/src/screens/publicScreenFrame.jsx`
  Layout compartilhado para os fluxos publicos e internos: container, topo e cards principais.
- `frontend/src/screens/PublicFormScreen.jsx`
  Resposta publica e modo interno.
- `frontend/src/screens/publicFormDomain.js`
  Helpers puros do fluxo publico de resposta, incluindo opcoes de pessoa e resposta existente.
- `frontend/src/screens/publicFormPanels.jsx`
  CabeÃ§alho, avisos e modal compartilhados do fluxo publico e interno de resposta.
- `frontend/src/screens/PublicEscalaScreen.jsx`
  Escala publica e modo interno.
- `frontend/src/screens/publicScaleDomain.js`
  Helpers puros da escala publica, incluindo limite por pessoa e montagem da proxima versao das secoes.
- `frontend/src/screens/publicScalePanels.jsx`
  Modal reutilizavel de inscricao na escala publica.
- `frontend/src/lib/appShell.js`
  Caminhos publicos canonicos, helpers de navegacao publica e decisao pura de navegacao interna.

## Regra pratica

- Antes de extrair uma nova funcao ou componente, procure este indice e os arquivos listados acima.
- Se a nova ideia reaproveitar UI, tente primeiro `ui.jsx` ou um componente em `frontend/src/components/`.
- Se a nova ideia mexer em formularios, eventos ou resultados, prefira extender os helpers existentes em vez de duplicar a regra na tela.
