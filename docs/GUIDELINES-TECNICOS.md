# Guidelines Tecnicos

Guia pratico para operar e manter o projeto sem perder a separacao entre frontend, backend e banco.

## Antes de mexer

- Consulte `docs/AI_CODEMAP.md` para achar o ponto certo de edicao.
- Se a area nao estiver mapeada, leia a doc especifica antes de buscar o repo inteiro.
- Prefira mudancas pequenas e localizadas.

## Onde cada coisa mora

- Interface em `frontend/src/`.
- API e negocio em `backend/`.
- Docker em `docker/`.
- Atalhos Windows em `scripts/windows/`.
- `storage/` nao e caminho oficial do fluxo atual.

## Validacao

- Rode `npm run build` depois de mudancas no frontend ou no fluxo de navega.
- Rode `npm run test:api` quando tocar backend, rotas ou persistencia.
- Rode `npm run test:ui` quando tocar telas, componentes ou fluxo do usuario.
- Se um teste falhar por ambiente, registre isso no retorno final.

## Regras de manutencao

- Nao mova caminho publico sem necessidade.
- Nao renomeie arquivo publico sem atualizar docs e imports.
- Nao misture documento historico com referencia atual.
- Nao deixe instrucoes de deploy e arquitetura espalhadas em varios lugares.

## Decisoes tecnicas

- `frontend/src/lib/api.js` e o cliente HTTP oficial do frontend.
- `backend/routes/apiRouter.mjs` e o ponto de entrada da API.
- `backend/services/` concentra regra de negocio.
- `backend/repositories/` concentra acesso ao banco.
- `backend/database/` concentra a camada minima de acesso ao banco.
