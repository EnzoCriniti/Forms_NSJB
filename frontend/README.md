# Frontend

Codigo da interface do NSJB Forms.

## Estrutura

- `index.html` - ponto de entrada do Vite
- `frontend/vite.config.js` - configuracao de build, proxy e testes do frontend
- `frontend/src/App.jsx` - orquestracao da interface
- `frontend/src/main.jsx` - bootstrap do React
- `frontend/src/screens/` - telas de nivel de pagina
- `frontend/src/features/` - modais e blocos de dominio
- `frontend/src/components/` - componentes visuais compartilhados
- `frontend/src/lib/` - helpers, auth, forms, storage e cliente HTTP
- `frontend/src/data/` - dados estaticos da UI
- `frontend/src/styles.css` - tema e estilos globais

## Entrada principal

- `frontend/index.html`

## Leitura rapida

- Interface, telas e componentes ficam em `frontend/src/`.
- Regras compartilhadas de formulários ficam em `shared/formRules.mjs`.
- Diagramas declarativos da arquitetura ficam em [`docs/DIAGRAMAS.md`](../docs/DIAGRAMAS.md).

## Observacao

- o frontend e servido pelo Vite na fase local e pelo container de frontend na fase Docker
