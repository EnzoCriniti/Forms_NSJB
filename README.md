# NSJB Forms

Aplicacao para gestao de formularios de presenca e escala do NSJB.

## Visao Rapida

- `frontend/` - interface React + Vite.
- `backend/` - API Node, regras de negocio e persistencia.
- `shared/` - regras compartilhadas entre frontend e backend.
- `docker/` - stack oficial de execucao e documentacao de infraestrutura.
- `scripts/windows/` - atalhos locais para Windows.

## Como subir o ambiente

O fluxo oficial e via Docker Compose. Em uma maquina nova:

1. Instale Docker Desktop.
2. Clonar o repositorio.
3. Subir a stack com:

```powershell
docker compose -f docker/compose.yml up -d --build
```

4. Abrir o sistema em:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8787/api/health`

## Como parar

```powershell
docker compose -f docker/compose.yml down
```

## Build e operacao

- `npm run dev` - sobe a stack oficial via Docker Compose.
- `npm run docker:build` - recompila as imagens.
- `npm run docker:up` - sobe os containers.
- `npm run docker:down` - derruba a stack.
- `npm run docker:logs` - mostra logs.
- `npm run docker:ps` - mostra o estado atual.

## Documentacao

- [frontend/README.md](frontend/README.md) - estrutura da interface.
- [backend/README.md](backend/README.md) - estrutura da API e banco.
- [docker/README.md](docker/README.md) - operacao da stack oficial.
- [docs/AI_CODEMAP.md](docs/AI_CODEMAP.md) - mapa rapido do codigo.
- [docs/APLICACAO.md](docs/APLICACAO.md) - visao funcional do produto.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - arquitetura por camadas.
- [docs/CODING_PATTERNS.md](docs/CODING_PATTERNS.md) - padroes de implementacao.
- [docs/GUIDELINES-TECNICOS.md](docs/GUIDELINES-TECNICOS.md) - decisoes e operacao.
- [docs/MANUTENCAO.md](docs/MANUTENCAO.md) - regras de manutencao.
- [docs/briefing-original.md](docs/briefing-original.md) - briefing inicial.
- [docs/IA-LOG.md](docs/IA-LOG.md) - historico curto das alteracoes assistidas.

## Contas de teste

- `admin` / `admin123`
- `viewer` / `viewer123`

## Observacao

- O backend persiste dados no PostgreSQL do Docker.
- O fluxo local existe como compatibilidade, mas nao e o caminho oficial.
