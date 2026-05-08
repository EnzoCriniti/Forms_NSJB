# Docker

Documentacao da stack oficial do NSJB Forms.

## O que existe aqui

- `docker/compose.yml` - orquestracao da stack.
- `docker/frontend/` - imagem e README do frontend.
- `docker/backend/` - imagem e README do backend.
- `docker/db/` - esquema, plano e desenho do banco.
- `docker/postgres/` - README do service PostgreSQL.

## Como subir em qualquer maquina

Use a partir da raiz do repositorio:

```powershell
docker compose -f docker/compose.yml up -d --build
```

Isso sobe:

- `frontend` em `http://localhost:5173`
- `backend` em `http://localhost:8787`
- `postgres` em `localhost:5432`

## Como parar

```powershell
docker compose -f docker/compose.yml down
```

## Ajustes comuns

- Porta do frontend: `NSJB_FRONTEND_PORT`
- Porta da API: `NSJB_API_PORT`
- Porta do PostgreSQL: `NSJB_PGPORT`
- Nome do banco: `NSJB_PGDATABASE`
- Usuario do banco: `NSJB_PGUSER`
- Senha do banco: `NSJB_PGPASSWORD`

## Documentacao por componente

- [docker/frontend/README.md](frontend/README.md)
- [docker/backend/README.md](backend/README.md)
- [docker/db/README.md](db/README.md)
- [docker/postgres/README.md](postgres/README.md)
- [docker/PLANO-MIGRACAO-DOCKER.md](PLANO-MIGRACAO-DOCKER.md)
- [docker/HANDOFF-INFRA-BANCO.md](HANDOFF-INFRA-BANCO.md)
