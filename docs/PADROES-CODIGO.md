# Padroes de Codigo

Padroes de implementacao usados neste repositorio.

## Tela nova

- Coloque a tela em `frontend/src/screens/` com nome `PascalCase`.
- Mantenha a tela pequena. O `App.jsx` deve continuar como entrada fina; orquestracao global fica em `frontend/src/lib/appController.js` e nos helpers `appController*`.
- Use `frontend/src/lib/api.js` para chamadas remotas.
- Use `frontend/src/lib/forms.js` para regras de formato e leitura de dados.
- Para telas com estado ou fluxo proprio, crie um controller/hook local ao lado da tela, por exemplo `minhaTelaController.js`.
- Separe regras puras em helpers de dominio, como `minhaTelaDomain.js`, `minhaTelaPayload.js`, `minhaTelaDefaults.js`, `minhaTelaRules.js` ou arquivos mais especificos.
- A tela deve compor paineis e repassar props agrupadas por bloco de dominio, nao listas planas longas de props.

## Modulo novo de dominio

- Use `frontend/src/features/` para blocos com fluxo proprio.
- Use `frontend/src/components/ui.jsx` para elementos visuais compartilhados.
- Evite duplicar componentes que ja existem no kit visual.
- Componentes em `features/<dominio>/` devem ser preferencialmente visuais. Estado, submit e confirmacao ficam em controller/hook local quando crescerem.
- JSX grande deve ser dividido por blocos nomeados: editor, lista, filtros, resumo, tabela, modal ou acoes.
- Arquivos agregadores historicos podem existir por compatibilidade, mas codigo novo deve importar o modulo especifico.

## Padrao frontend atual

Use esta composicao como referencia para novas implementacoes:

- `Screen.jsx`: composicao visual fina e roteamento local minimo.
- `screenController.js`: estado local, derived state, handlers e montagem de props.
- `screenDomain.js` ou helpers especificos: regras puras, filtros, ordenacao, payloads e defaults.
- `features/<dominio>/*`: paineis reutilizaveis ou blocos visuais que cresceram alem da tela.
- `components/*`: componentes compartilhados entre dominios.
- `lib/app*`: somente shell global, bootstrap, sessao, navegacao e composicao do App.

Evite estes atalhos:

- Componente visual chamando API diretamente.
- Modal ou tela montando payload complexo.
- Regra de negocio escondida em JSX.
- Props soltas demais quando existe um agrupamento natural, como `state`, `data`, `actions`, `setters`, `permissions`, `fieldsPanel`, `fieldEditor` ou `resultsConfig`.
- Novo codigo importando agregador historico quando ja existe modulo especifico.

## Shell do App

- `frontend/src/App.jsx` deve continuar como entrada fina.
- `frontend/src/lib/appController.js` coordena estado, derived state, loaders, handlers, lifecycle e view model.
- Estado global deve ficar dividido por dominio em `appController*State.js`.
- Lifecycle deve ficar dividido em `appLifecycle*Effects.js`.
- Handlers globais devem ficar divididos por dominio: session, events, forms, admin, messaging e security.
- O `shellApp` deve ser consumido por blocos explicitos: `state`, `data`, `actions`, `setters` e `permissions`.
- Campos planos do `shellApp` existem apenas por compatibilidade; novas telas devem usar os acessores de bloco de `appShellObject.js`.

## Admin frontend

- Central administrativa deve seguir divisao por dominio: access, members, external bases, catalog, organization, messaging, security e audit.
- Submit handlers ficam em `adminSettings*SubmitHandlers.js`.
- Payloads ficam em `adminSettingsPayloads.js` ou helper especifico do dominio.
- Paineis visuais devem separar editor, lista, filtros, tabela, resumo e modal quando crescerem.
- `AdminSettingsContent.jsx` e `AdminSettingsTabPanel.jsx` devem permanecer como composicao, nao como lugar de regra.

## Regra de negocio

- Coloque regra de negocio em `backend/services/`.
- Deixe persistencia em `backend/repositories/`.
- Deixe validacao estrutural em `backend/validators/`.
- Use `backend/core/` apenas para utilitarios gerais.
- Quando a mesma regra precisar ser identica no frontend e backend, mova para `shared/`.
- Nao mova regra especifica de UI para `shared/`; deixe local se ela existir apenas para montagem visual ou payload de tela.

## API nova

- Adicione o wrapper de transporte em `frontend/src/lib/api.js`.
- Adicione a rota em `backend/routes/apiRouter.mjs`.
- Adicione service e repository se houver persistencia.

## Dados e carga inicial

- Atualize `backend/data/seedData.mjs` quando mudar dados base.
- Atualize `backend/seed.mjs` quando mudar a primeira carga do banco.
- Mantenha `backend/database/*` coerente com o driver PostgreSQL oficial.

## Boas praticas

- Nao espalhe `fetch` em componentes.
- Nao coloque regra de negocio em modal ou screen.
- Nao acople UI com detalhes do banco.
- Nao mude contratos sem atualizar backend, frontend e docs juntos.
