# Mapa de Codigo

Mapa operacional curto do codebase para evitar buscas desnecessarias.

## Estrutura atual

- `frontend/` - interface React + Vite.
- `backend/` - API containerizada, regras de negocio, validacao e persistencia.
- `shared/` - regras compartilhadas entre frontend e backend.
- `docker/` - stack containerizada e documentacao de operacao.
- `docs/DIAGRAMAS.md` - diagramas declarativos de arquitetura e fluxo.
- `scripts/windows/` - atalhos locais para Windows.
- `storage/` - restos legados do runtime SQLite; nao e fluxo oficial.

## Frontend

- `frontend/src/App.jsx` - orquestra navegacao, sessao e telas.
- `frontend/src/main.jsx` - ponto de entrada do React.
- `frontend/src/screens/` - telas de nivel de pagina.
- `frontend/src/features/` - modais e blocos de dominio.
- `frontend/src/components/ui.jsx` - componentes visuais compartilhados.
- `frontend/src/components/AppHeader.jsx` - cabecalho principal do app.
- `frontend/src/components/AppStatusScreen.jsx` - estados centrais de carregamento e erro.
- `frontend/src/components/LoginModal.jsx` - modal de login do frontend.
- `frontend/src/components/FormListToolbar.jsx` - barra de busca e filtros da listagem.
- `frontend/src/components/FormListCard.jsx` - card individual da listagem de formularios.
- `frontend/src/components/ResultsPresenceHeader.jsx` - cabecalho e resumo da tela de resultados de presenca.
- `frontend/src/components/CreateFormFieldPreview.jsx` - previa isolada do campo em criacao de formulario.
- `frontend/src/components/CreateFormTemplateBar.jsx` - barra de selecao de template na criacao de formulario.
- `frontend/src/components/DashboardPanels.jsx` - blocos reutilizaveis da dashboard.
- `frontend/src/lib/api.js` - cliente HTTP.
- `frontend/src/lib/auth.js` - regras de permissao.
- `frontend/src/lib/forms.js` - helpers de formularios.
- `frontend/src/lib/appShell.js` - helpers puros do shell principal.
- `frontend/src/lib/storage.js` - persistencia local.
- `frontend/src/data/` - dados estaticos da UI.
- `frontend/src/styles.css` - tema e estilos globais.
- `shared/formRules.mjs` - regras compartilhadas de validacao.

## Backend

- `backend/index.mjs` - inicia a API.
- `backend/app.mjs` - cria o servidor HTTP.
- `backend/routes/apiRouter.mjs` - despachante principal das rotas.
- `backend/routes/systemRoutes.mjs` - auth, health, bootstrap e auditoria.
- `backend/routes/formRoutes.mjs` - formularios, respostas e escala.
- `backend/routes/adminRoutes.mjs` - usuarios, classificacoes, presets e catalogos.
- `backend/routes/requestHelpers.mjs` - helpers compartilhados de requisicao, auth e auditoria.
- `backend/services/` - regras de negocio.
- `backend/repositories/` - acesso ao banco.
- `backend/validators/` - validacao estrutural.
- `backend/core/` - utilitarios compartilhados.
- `backend/database/` - camada minima de acesso ao banco.
- `backend/database/drivers/` - driver SQLite legado e driver Postgres oficial.
- `backend/database/legacyImport.mjs` - importacao unica do snapshot SQLite para o Postgres.
- `backend/data/seedData.mjs` - seed inicial da aplicacao.
- `backend/seed.mjs` - seed inicial.

## Pontos de entrada mais comuns

- Fluxo publico por link: `frontend/src/App.jsx` + `frontend/src/screens/PublicFormScreen.jsx` ou `PublicEscalaScreen.jsx`.
- Listagem interna: `frontend/src/screens/FormListScreen.jsx`.
- Criacao e edicao: `frontend/src/screens/CreateFormScreen.jsx`.
- Resultados: `frontend/src/screens/ResultsScreen.jsx`.
- Admin: `frontend/src/features/admin/AdminSettingsModal.jsx`.
- API: `backend/routes/apiRouter.mjs`.
- Bootstrap: `backend/services/bootstrapService.mjs`.

## O que consultar primeiro

- Para navegar a interface: `frontend/src/App.jsx`.
- Para mexer em tela especifica: `frontend/src/screens/`.
- Para ajustar o shell principal do frontend: `frontend/src/lib/appShell.js`.
- Para ajustar regras de negocio: `backend/services/`.
- Para mexer em persistencia: `backend/repositories/`.
- Para request/auth/auditoria do backend: `backend/routes/requestHelpers.mjs`.
- Para ajustar o banco: `backend/database/` e `backend/database/drivers/`.
- Para Docker e operacao: `docker/README.md`.
- Para entender as funcionalidades da aplicacao: `docs/FUNCIONALIDADES.md`.
- Para ver os fluxos visuais da aplicacao: `docs/DIAGRAMAS.md`.

## Observacao sobre historico

- `docs/IA-LOG.md` e historico legivel de mudancas assistidas e pode conter caminhos antigos.
- Documentacao viva deve preferir os caminhos atuais acima.
