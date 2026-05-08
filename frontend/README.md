# Frontend

Codigo da interface do NSJB Forms.

## Estrutura

- `frontend/index.html` - ponto de entrada do Vite.
- `frontend/vite.config.js` - configuracao de build, proxy e testes do frontend.
- `frontend/src/App.jsx` - orquestra a interface e a navegacao.
- `frontend/src/main.jsx` - bootstrap do React.
- `frontend/src/screens/` - telas de nivel de pagina.
- `frontend/src/features/` - modais e blocos de dominio.
- `frontend/src/components/` - componentes visuais compartilhados.
- `frontend/src/lib/` - helpers, auth, forms, storage e cliente HTTP.
- `frontend/src/data/` - dados estaticos da UI.
- `frontend/src/styles.css` - tema e estilos globais.

## Como o frontend funciona

O frontend monta a experiencia do usuario, conversa com a API e guarda estado local simples.
O fluxo normal e:

1. `frontend/src/App.jsx` decide qual tela renderizar.
2. As telas em `frontend/src/screens/` recebem os fluxos de pagina.
3. Os componentes em `frontend/src/components/` isolam blocos reutilizaveis.
4. `frontend/src/lib/api.js` chama o backend.
5. `frontend/src/lib/storage.js` preserva sessao e preferencias basicas.

## Entrada principal

- `frontend/index.html`
- `frontend/src/main.jsx`

## Leitura rapida

- Interface, telas e componentes ficam em `frontend/src/`.
- Regras compartilhadas de formularios ficam em `shared/formRules.mjs`.
- Diagramas declarativos da arquitetura ficam em [`docs/DIAGRAMAS.md`](../docs/DIAGRAMAS.md).
- O Vite usa `frontend/vite.config.js` para host, proxy da API e testes.

## Onde olhar primeiro

- para navegar a aplicacao, comece em `frontend/src/App.jsx`
- para mexer em uma pagina, comece em `frontend/src/screens/`
- para mexer em blocos reutilizaveis, comece em `frontend/src/components/`
- para ajustar chamadas de API, comece em `frontend/src/lib/api.js`
- para alterar comportamento de boot e proxy, comece em `frontend/vite.config.js`

## Observacao

- o frontend e servido pelo Vite na fase local e pelo container de frontend na fase Docker
