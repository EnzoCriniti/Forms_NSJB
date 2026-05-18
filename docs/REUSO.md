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
- `frontend/src/features/admin/adminSettingsShared.jsx`
  Blocos do admin para listas paginadas, preview de campo, editor de matriz e auditoria.
- `frontend/src/screens/createFormPanels.jsx`
  Paineis compartilhados da criacao de formulario: modo, editor de campo, escala, lista de campos e resultados.
- `frontend/src/screens/resultsPanels.jsx`
  Painel compartilhado da planilha de presenca com totalizacao, filtros, toolbar e tabela.
- `frontend/src/features/events/components/eventsPanels.jsx`
  Componentes compartilhados da area de eventos: card, editor, abas, lista de formularios e mensagens.
- `frontend/src/features/events/components/eventMessagesPanels.jsx`
  Componentes compartilhados das mensagens de evento: destinatarios, agendamento, preview e historico.

## Formularios

- `frontend/src/screens/CreateFormScreen.jsx`
  Editor principal de formulario, com modos `nucleo` e `geral`, campos da biblioteca, presets e configuracoes de resultados.
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
- `frontend/src/features/members/MemberListConfigModal.jsx`
  Configuracao da base de socios sincronizada.
- `frontend/src/features/admin/MessagingSettingsPanel.jsx`
  Configuracoes ligadas a mensagens e envio.
- `backend/services/adminService.mjs`
  Orquestracao dos CRUDs administrativos no backend.

## Resultados e resposta

- `frontend/src/screens/ResultsScreen.jsx`
  Planilha de resultados, totalizacao e filtro de grau.
- `frontend/src/screens/PublicFormScreen.jsx`
  Resposta publica e modo interno.
- `frontend/src/screens/PublicEscalaScreen.jsx`
  Escala publica e modo interno.
- `frontend/src/lib/appShell.js`
  Caminhos publicos canonicos e helpers de navegacao publica.

## Regra pratica

- Antes de extrair uma nova funcao ou componente, procure este indice e os arquivos listados acima.
- Se a nova ideia reaproveitar UI, tente primeiro `ui.jsx` ou um componente em `frontend/src/components/`.
- Se a nova ideia mexer em formularios, eventos ou resultados, prefira extender os helpers existentes em vez de duplicar a regra na tela.
