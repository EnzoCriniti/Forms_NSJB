# NSJB Forms

Aplicacao para gestao de formularios de presenca e escala do NSJB.

## Estrutura atual

- `frontend/` - interface React + Vite
- `backend/` - API Node containerizada
- `shared/` - regras compartilhadas entre frontend e backend
- `docker/` - stack containerizada e documentacao de operacao
- `scripts/windows/` - atalhos e comandos locais para Windows
- `storage/` - artefatos legados do runtime SQLite, sem uso no fluxo oficial

## Documentacao principal

- [frontend/README.md](frontend/README.md) - estrutura do codigo da interface
- [backend/README.md](backend/README.md) - estrutura do codigo da API local
- [docker/README.md](docker/README.md) - visao geral da stack Docker
- [docs/AI_CODEMAP.md](docs/AI_CODEMAP.md) - mapa para navegacao do codigo
- [docs/APLICACAO.md](docs/APLICACAO.md) - visao funcional e fluxo do produto
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - arquitetura por camadas
- [docs/CODING_PATTERNS.md](docs/CODING_PATTERNS.md) - padroes de implementacao
- [docs/GUIDELINES-TECNICOS.md](docs/GUIDELINES-TECNICOS.md) - operacao e decisoes tecnicas
- [docs/MANUTENCAO.md](docs/MANUTENCAO.md) - regras de manutencao e cuidado
- [docs/briefing-original.md](docs/briefing-original.md) - briefing inicial
- [docs/IA-LOG.md](docs/IA-LOG.md) - historico curto das alteracoes assistidas

## Comandos uteis

- `npm run dev`
- `npm run docker:build`
- `npm run docker:up`
- `npm run docker:down`
- `npm run docker:logs`
- `npm run docker:ps`

## Observacao

- o caminho oficial para rodar o ambiente e via Docker Compose
- comandos locais continuam existindo como compatibilidade, mas nao sao o fluxo principal

## Usuarios de teste

- `admin` / `admin123`
- `viewer` / `viewer123`
