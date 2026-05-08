# Frontend Docker

Container do frontend do NSJB Forms.

## Papel

- roda o frontend em modo Vite dentro do container
- resolve chamadas para a API via `NSJB_API_PROXY_TARGET`
- expõe a interface em `5173`

## Arquivos

- `docker/frontend/Dockerfile`
- `frontend/vite.config.js`
- `frontend/index.html`
- `frontend/src/`
- `shared/formRules.mjs`

## Ambiente

- `NSJB_API_PROXY_TARGET=http://backend:8787` no compose local

## Observacoes

- nesta fase o container usa `npm ci` completo porque o Vite roda no proprio container
- a troca para servidor estatico de producao pode ser feita depois que o fluxo estabilizar
- o frontend depende do backend estar saudavel antes de subir

## Manutencao

Se o fluxo do frontend mudar, ajuste este README junto com `frontend/vite.config.js`, `docker/compose.yml` e o diagrama em `docs/diagramas/inicializacao.d2`.
