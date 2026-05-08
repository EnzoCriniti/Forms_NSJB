# Backend Docker

Container da API do NSJB Forms.

## Papel

- executa a API Node
- aplica bootstrap, regras de negocio e acesso ao PostgreSQL
- expõe a porta `8787`

## Arquivos

- `docker/backend/Dockerfile`
- `backend/index.mjs`
- `backend/app.mjs`
- `backend/config.mjs`
- `backend/data/seedData.mjs`
- `backend/routes/apiRouter.mjs`
- `shared/formRules.mjs`

## Ambiente

- `NSJB_API_PORT=8787`
- `NSJB_ORCHESTRATOR_INTERVAL_MS=60000`

## Observacoes

- o backend usa PostgreSQL como banco oficial
- o fluxo oficial nao depende mais de volume local de SQLite
