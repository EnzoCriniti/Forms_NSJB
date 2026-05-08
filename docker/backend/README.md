# Backend Docker

Container da API do NSJB Forms.

## Papel

- executa a API Node
- aplica bootstrap, regras de negocio e acesso ao PostgreSQL
- expõe a porta `8787`

## Arquivos principais

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
- `NSJB_DB_DRIVER=postgres`
- `NSJB_PGHOST=postgres`
- `NSJB_PGPORT=5432`
- `NSJB_PGDATABASE=nsjb_forms`
- `NSJB_PGUSER=nsjb`
- `NSJB_PGPASSWORD=nsjb`
- `NSJB_PGSSLMODE=disable`

## Observacoes

- o backend usa PostgreSQL como banco oficial no Docker
- o fluxo oficial nao depende mais de volume local de SQLite

## Manutencao

Se o contrato da API, as variaveis de ambiente ou o bootstrap mudarem, atualize este README junto com `backend/config.mjs`, `docker/compose.yml` e `docs/diagramas/inicializacao.d2`.
