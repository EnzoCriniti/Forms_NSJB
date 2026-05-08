# PostgreSQL Docker

Banco oficial da stack Docker do NSJB Forms.

## Papel

- fornece o banco dedicado do backend
- expõe a porta `5432`

## Como entra na stack

- o service fica no `docker/compose.yml`
- ele sobe junto com o backend

## Variaveis

- `NSJB_DB_DRIVER=postgres`
- `NSJB_PGDATABASE`
- `NSJB_PGUSER`
- `NSJB_PGPASSWORD`
- `NSJB_PGPORT`
- `NSJB_PGHOST`
- `NSJB_PGSSLMODE`

## Volume

- `postgres_data` guarda os dados do banco

## Proxima etapa

- manter a paridade de seed e dados com o backend

## Manutencao

Se o service PostgreSQL mudar de porta, nome, volume ou variaveis, atualize este README, o `docker/compose.yml` e o mapa visual em `docs/diagramas/inicializacao.d2` no mesmo ciclo.
