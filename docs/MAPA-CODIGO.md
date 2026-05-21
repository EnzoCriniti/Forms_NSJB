# Mapa de Codigo

Mapa operacional do repositorio para evitar buscas desnecessarias.

## Estrutura geral

- `frontend/` - interface React + Vite.
- `backend/` - API containerizada, regras de negocio, validacao e persistencia.
- `shared/` - regras compartilhadas entre frontend e backend.
- `docker/` - stack containerizada e documentacao de operacao.
- `docs/DIAGRAMAS.md` - diagramas declarativos e imagens geradas a partir de D2.
- `docs/diagramas/*.d2` - fontes declarativas dos diagramas.
- `docs/diagramas/*.svg` - imagens finais embutidas nos Markdown.
- `scripts/windows/` - atalhos locais para Windows.
- `tests/helpers/postgresTestDb.mjs` - helper de isolamento PostgreSQL para testes.

## Interface

- `frontend/index.html` - ponto de entrada do Vite.
- `frontend/vite.config.js` - host, proxy e testes do frontend.
- `frontend/src/App.jsx` - coordena navegacao, sessao e telas.
- `frontend/src/main.jsx` - ponto de entrada do React.
- `frontend/src/screens/` - telas de nivel de pagina.
- `frontend/src/features/` - modais e blocos de dominio.
- `frontend/src/components/ui.jsx` - componentes visuais compartilhados.
- `frontend/src/components/AppHeader.jsx` - cabecalho principal da aplicacao.
- `frontend/src/components/AppStatusScreen.jsx` - estados centrais de carregamento e erro.
- `frontend/src/components/LoginModal.jsx` - modal de login do frontend.
- `frontend/src/components/FormListToolbar.jsx` - barra de busca e filtros da listagem.
- `frontend/src/components/FormListCard.jsx` - card individual da listagem de formularios.
- `frontend/src/components/ResultsPresenceHeader.jsx` - cabecalho e resumo da tela de resultados de presenca.
- `frontend/src/components/CreateFormFieldPreview.jsx` - previa isolada do campo em criacao de formulario.
- `frontend/src/components/CreateFormLivePreview.jsx` - previa do formulario completo durante a criacao.
- `frontend/src/components/CreateFormTemplateBar.jsx` - barra de selecao de template na criacao de formulario.
- `frontend/src/screens/createFormDomain.js` - barramento historico dos helpers puros de criacao de formulario.
- `frontend/src/screens/createFormPayload.js` - montagem do payload final salvo pela criacao de formulario.
- `frontend/src/screens/createFormDerivedState.js` - estado derivado do editor de formulario.
- `frontend/src/components/DashboardPanels.jsx` - blocos reutilizaveis da dashboard.
- `frontend/src/screens/EventsScreen.jsx` - tela de eventos, formularios vinculados e aba de mensagens.
- `frontend/src/screens/EventMessageEditorScreen.jsx` - editor de mensagens vinculadas a eventos.
- `frontend/src/screens/EventMessageDetailScreen.jsx` - preview, disparo log-only, cancelamento e historico de mensagens.
- `frontend/src/features/events/components/eventsPanels.jsx` - blocos visuais compartilhados de eventos.
- `frontend/src/features/events/components/eventMessagesPanels.jsx` - blocos de destinatarios, agendamento, preview e logs de mensagens.
- `frontend/src/features/members/MemberListConfigModal.jsx` - configuracao da base central de socios e origem externa sincronizada.
- `frontend/src/lib/api.js` - cliente HTTP.
- `frontend/src/lib/auth.js` - regras de permissao.
- `frontend/src/lib/forms.js` - funcoes de apoio para formularios.
- `frontend/src/lib/appShell.js` - funcoes puras do shell principal.
- `frontend/src/lib/storage.js` - persistencia local.
- `frontend/src/data/` - dados estaticos da UI.
- `frontend/src/styles.css` - tema e estilos globais.
- `shared/formRules.mjs` - regras compartilhadas de validacao.

## Convencoes de nomes

- Arquivos e pastas publicas usam nomes curtos e consistentes.
- Componentes React usam `PascalCase`.
- Telas usam `PascalCase` e vivem em `frontend/src/screens/`.
- Modulos de apoio usam `camelCase` ou nomes funcionais claros.
- Documentacao tecnica usa nomes em portugues quando e um ponto de entrada oficial.

## Backend

- `backend/index.mjs` - inicia a API.
- `backend/app.mjs` - cria o servidor HTTP.
- `backend/routes/apiRouter.mjs` - roteador principal das rotas.
- `backend/routes/systemRoutes.mjs` - autenticacao, health, bootstrap e auditoria.
- `backend/routes/formRoutes.mjs` - formularios, respostas e escala.
- `backend/routes/adminRoutes.mjs` - usuarios, classificacoes, presets e catalogos.
- `backend/routes/eventRoutes.mjs` - CRUD, publicacao e rotas de mensagens de eventos.
- `backend/routes/requestHelpers.mjs` - funcoes compartilhadas de requisicao, auth e auditoria.
- `backend/services/` - regras de negocio.
- `backend/services/eventMessagesService.mjs` - regras de mensagens por evento, preview, dispatch log-only e agendamento.
- `backend/services/messageRecipientsService.mjs` - calculo de destinatarios de mensagens por respostas, presets e vagas da escala.
- `backend/services/messagingConfigService.mjs` - configuracao global de mensagens.
- `backend/services/membersSyncService.mjs` - sincronizacao da base central de socios com a origem externa.
- `backend/repositories/` - acesso ao banco.
- `backend/repositories/eventMessagesRepository.mjs` - persistencia das mensagens por evento.
- `backend/repositories/messageDispatchLogRepository.mjs` - historico append-only dos disparos log-only.
- `backend/repositories/messageTemplatesRepository.mjs` - modelos reutilizaveis de mensagens.
- `backend/repositories/personPresetsRepository.mjs` - presets de destinatarios.
- `backend/repositories/peopleRepository.mjs` - base central de socios e metadados de sincronizacao.
- `backend/validators/` - validacao estrutural.
- `backend/core/` - utilitarios compartilhados.
- `backend/database/` - camada minima de acesso ao banco.
- `backend/database/drivers/` - driver Postgres oficial.
- `backend/data/seedData.mjs` - seed inicial da aplicacao.
- `backend/seed.mjs` - seed inicial.
- `scripts/load-local.mjs` - runner de carga local contra o stack PostgreSQL.

## Bancos e migracao

- `backend/database/` concentra a camada minima de acesso ao banco.
- `backend/database/drivers/` separa o driver PostgreSQL oficial.

## Pontos de entrada mais comuns

- Fluxo publico por link: `frontend/src/App.jsx` + `frontend/src/screens/PublicFormScreen.jsx` ou `PublicEscalaScreen.jsx`.
- Listagem interna: `frontend/src/screens/FormListScreen.jsx`.
- Criacao e edicao: `frontend/src/screens/CreateFormScreen.jsx` - vinculo de campos a base central ou bases externas.
- Configuracoes: `frontend/src/screens/SettingsScreen.jsx`.
- Eventos e mensagens: `frontend/src/screens/EventsScreen.jsx`, `EventMessageEditorScreen.jsx` e `EventMessageDetailScreen.jsx`.
- Resultados: `frontend/src/screens/ResultsScreen.jsx`.
- Admin: `frontend/src/features/admin/AdminSettingsModal.jsx`.
- API: `backend/routes/apiRouter.mjs`.
- Bootstrap: `backend/services/bootstrapService.mjs`.

## Regra de manutencao

- Se a equipe mover uma responsabilidade, atualize este mapa no mesmo ciclo.
- Se um caminho virar legado, marque isso aqui para evitar novas buscas desnecessarias.

## O que consultar primeiro

- Para navegar a interface: `frontend/src/App.jsx`.
- Para mexer em tela especifica: `frontend/src/screens/`.
- Para ajustar o shell principal do frontend: `frontend/src/lib/appShell.js`.
- Para ajustar regras de negocio: `backend/services/`.
- Para mexer em persistencia: `backend/repositories/`.
- Para requisicao, auth e auditoria do backend: `backend/routes/requestHelpers.mjs`.
- Para ajustar o banco: `backend/database/` e `backend/database/drivers/`.
- Para Docker e operacao: `docker/README.md`.
- Para entender as funcionalidades da aplicacao: `docs/FUNCIONALIDADES.md`.
- Para ver os fluxos visuais da aplicacao: `docs/DIAGRAMAS.md`.
