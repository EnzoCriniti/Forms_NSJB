# Database Docker

Esta pasta documenta a camada de banco do NSJB Forms.

## Estado atual

- o backend Docker persiste os dados no PostgreSQL do compose
- o SQLite ficou apenas como compatibilidade interna temporaria no codigo

## Onde olhar no codigo

- `backend/database/` - facade e drivers de banco
- `backend/database/drivers/` - driver SQLite legado e driver Postgres oficial
- `backend/seed.mjs` - seed inicial da aplicacao
- `backend/data/seedData.mjs` - dados seed usados pelo backend

## Documentos da migracao

- `docker/db/DESENHO-CAMADA-BANCO.md` - desenho da camada de acesso ao banco
- `docker/db/PLANO-MIGRACAO-POSTGRESQL.md` - fases e riscos da migracao para PostgreSQL
- `docker/db/ESQUEMA-BANCO-DADOS.md` - esquema funcional atual e mapeamento futuro
- `docker/db/DDL-POSTGRESQL-INICIAL.sql` - DDL inicial para o alvo PostgreSQL
- `docker/postgres/README.md` - documentacao do service PostgreSQL no compose

## Ordem recomendada

1. manter o service PostgreSQL como padrao do compose
2. validar paridade de dados e comportamento
3. remover sobras de compatibilidade SQLite quando nao houver mais dependencia

## Regra pratica

- SQLite nao faz mais parte do fluxo oficial do ambiente
