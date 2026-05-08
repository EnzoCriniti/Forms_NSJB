# Handoff Infra e Banco

## Objetivo

Dar continuidade ao trabalho de infraestrutura e migracao de banco sem depender da memoria da IA atual.

## Estado Atual

### Docker local

Concluido:

- `frontend` e `backend` sobem por `docker compose`
- healthcheck configurado
- scripts Windows:
  - `scripts/windows/start-docker.bat`
  - `scripts/windows/stop-docker.bat`
  - `scripts/windows/status-docker.bat`
  - `scripts/windows/logs-docker.bat`
- `storage/` local montado no backend Docker

Arquivos centrais:

- [docker/compose.yml](C:/Users/enzof/Desktop/projetos/escalas/docker/compose.yml)
- [docker/backend/Dockerfile](C:/Users/enzof/Desktop/projetos/escalas/docker/backend/Dockerfile)
- [docker/frontend/Dockerfile](C:/Users/enzof/Desktop/projetos/escalas/docker/frontend/Dockerfile)
- [docker/README.md](C:/Users/enzof/Desktop/projetos/escalas/docker/README.md)
- [README.md](C:/Users/enzof/Desktop/projetos/escalas/README.md)

### Planejamento de banco

Concluido:

- plano macro da migracao SQLite -> PostgreSQL
- desenho da camada minima de banco
- desenho vivo do schema atual/alvo
- DDL inicial de referencia para primeira subida em Postgres
- service PostgreSQL provisionado no `docker/compose.yml` sob o profile `db`
- backend preparado para receber configuracao de driver e parametros de Postgres via ambiente

Arquivos centrais:

- [docker/db/PLANO-MIGRACAO-POSTGRESQL.md](C:/Users/enzof/Desktop/projetos/escalas/docker/db/PLANO-MIGRACAO-POSTGRESQL.md)
- [docker/db/DESENHO-CAMADA-BANCO.md](C:/Users/enzof/Desktop/projetos/escalas/docker/db/DESENHO-CAMADA-BANCO.md)
- [docker/db/ESQUEMA-BANCO-DADOS.md](C:/Users/enzof/Desktop/projetos/escalas/docker/db/ESQUEMA-BANCO-DADOS.md)
- [docker/db/DDL-POSTGRESQL-INICIAL.sql](C:/Users/enzof/Desktop/projetos/escalas/docker/db/DDL-POSTGRESQL-INICIAL.sql)

### Primeira fatia da abstracao de banco

Concluido:

- camada minima criada em [backend/database/index.mjs](C:/Users/enzof/Desktop/projetos/escalas/backend/database/index.mjs)
- wrappers atuais:
  - `queryOne`
  - `queryMany`
  - `execute`
  - `exec`
  - `withTransaction`
- os repositories principais e administrativos ja passaram para essa camada:
  - [backend/repositories/formsRepository.mjs](C:/Users/enzof/Desktop/projetos/escalas/backend/repositories/formsRepository.mjs)
  - [backend/repositories/responsesRepository.mjs](C:/Users/enzof/Desktop/projetos/escalas/backend/repositories/responsesRepository.mjs)
  - [backend/repositories/escalaRepository.mjs](C:/Users/enzof/Desktop/projetos/escalas/backend/repositories/escalaRepository.mjs)
  - [backend/repositories/sessionsRepository.mjs](C:/Users/enzof/Desktop/projetos/escalas/backend/repositories/sessionsRepository.mjs)
  - [backend/repositories/settingsRepository.mjs](C:/Users/enzof/Desktop/projetos/escalas/backend/repositories/settingsRepository.mjs)
  - [backend/repositories/usersRepository.mjs](C:/Users/enzof/Desktop/projetos/escalas/backend/repositories/usersRepository.mjs)
  - [backend/repositories/auditLogRepository.mjs](C:/Users/enzof/Desktop/projetos/escalas/backend/repositories/auditLogRepository.mjs)
  - [backend/repositories/catalogRepository.mjs](C:/Users/enzof/Desktop/projetos/escalas/backend/repositories/catalogRepository.mjs)
  - [backend/repositories/labelsRepository.mjs](C:/Users/enzof/Desktop/projetos/escalas/backend/repositories/labelsRepository.mjs)
  - [backend/repositories/peopleRepository.mjs](C:/Users/enzof/Desktop/projetos/escalas/backend/repositories/peopleRepository.mjs)
  - [backend/repositories/presetsRepository.mjs](C:/Users/enzof/Desktop/projetos/escalas/backend/repositories/presetsRepository.mjs)
- servicos sensiveis de transacao ja usam a facade:
  - [backend/services/formsService.mjs](C:/Users/enzof/Desktop/projetos/escalas/backend/services/formsService.mjs)
  - [backend/services/escalaService.mjs](C:/Users/enzof/Desktop/projetos/escalas/backend/services/escalaService.mjs)
- separacao do SQLite concluida em:
  - [backend/database/shared.mjs](C:/Users/enzof/Desktop/projetos/escalas/backend/database/shared.mjs)
  - [backend/database/sqliteRuntime.mjs](C:/Users/enzof/Desktop/projetos/escalas/backend/database/sqliteRuntime.mjs)
  - [backend/database/sqliteSchema.mjs](C:/Users/enzof/Desktop/projetos/escalas/backend/database/sqliteSchema.mjs)
- [backend/database/index.mjs](C:/Users/enzof/Desktop/projetos/escalas/backend/database/index.mjs) concentra a fachada de banco

## Proximos Passos Recomendados

### Passo 1

Reduzir gradualmente a dependencia de compatibilidade do banco:

- evitar novos imports nela
- migrar referencias residuais de compatibilidade quando surgirem
- manter o arquivo apenas como fallback temporario

### Passo 2

Criar o desenho da interface futura de driver:

- `sqliteDriver`
- `postgresDriver`

Sem ainda implementar Postgres de ponta a ponta.

### Passo 3

Definir o DDL inicial do Postgres tabela por tabela a partir de:

- [docker/db/ESQUEMA-BANCO-DADOS.md](C:/Users/enzof/Desktop/projetos/escalas/docker/db/ESQUEMA-BANCO-DADOS.md)

Observacao:

- o DDL inicial de referencia ja existe em [docker/db/DDL-POSTGRESQL-INICIAL.sql](C:/Users/enzof/Desktop/projetos/escalas/docker/db/DDL-POSTGRESQL-INICIAL.sql)
- o proximo passo aqui e transformar esse desenho em migrations reais

### Passo 4

So depois:

- introduzir dependencia de cliente Postgres
- ligar o backend ao service `postgres` do compose

## Validacoes Esperadas a Cada Etapa

Backend:

- `node --test tests/api.integration.test.mjs tests/validators.test.mjs`

Frontend:

- `npm.cmd run build`

Stack:

- `docker compose config`
- `docker compose ps`

## Cuidados

- nao misturar migracao de banco com mudanca funcional de produto
- nao mexer no contrato do frontend nessa etapa
- nao subir backend local e Docker ao mesmo tempo escrevendo no mesmo `storage/`
- manter [docker/db/ESQUEMA-BANCO-DADOS.md](C:/Users/enzof/Desktop/projetos/escalas/docker/db/ESQUEMA-BANCO-DADOS.md) sempre atualizado quando houver mudanca de schema
