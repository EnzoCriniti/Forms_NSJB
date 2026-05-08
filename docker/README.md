# Docker

Visao geral da stack containerizada do NSJB Forms.

## Componentes

- `docker/frontend/` - imagem do frontend e sua operacao
- `docker/backend/` - imagem da API local e sua operacao
- `docker/db/` - documentacao do estado atual do banco e da migracao para PostgreSQL
- `docker/postgres/` - container PostgreSQL alvo da migracao

## Entradas principais

- `docker/compose.yml` - orquestracao da stack Docker
- `docker/frontend/Dockerfile` - imagem do frontend
- `docker/backend/Dockerfile` - imagem do backend

## Fluxo oficial

- subir a stack: `npm run dev` ou `npm run docker:up`
- parar a stack: `npm run docker:down`
- rebuild: `npm run docker:build`
- logs: `npm run docker:logs`
- o backend persiste os dados no PostgreSQL do Docker, nao em arquivo local

## Documentacao por componente

- [docker/frontend/README.md](frontend/README.md)
- [docker/backend/README.md](backend/README.md)
- [docker/db/README.md](db/README.md)
- [docker/postgres/README.md](postgres/README.md)
- [docker/PLANO-MIGRACAO-DOCKER.md](PLANO-MIGRACAO-DOCKER.md)
- [docker/HANDOFF-INFRA-BANCO.md](HANDOFF-INFRA-BANCO.md)
