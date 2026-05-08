# Backend

Codigo da API do NSJB Forms.

## Estrutura

- `index.mjs` - inicializa o servidor HTTP e o orquestrador
- `app.mjs` - cria a aplicacao HTTP
- `config.mjs` - portas, driver e intervalos
- `routes/` - roteamento HTTP
- `services/` - regra de negocio
- `repositories/` - acesso a persistencia
- `validators/` - validacao de payload
- `core/` - utilitarios de dominio e HTTP
- `database/` - facade de banco e driver PostgreSQL
- `orchestrator/` - automacoes de ciclo de vida
- `seed.mjs` - seed inicial

## Entrada principal

- `backend/index.mjs`

## Leitura rapida

- `backend/routes/` separa as rotas por dominio.
- `backend/services/` concentra as regras de negocio.
- `backend/repositories/` concentra persistencia e consultas.
- `backend/database/` concentra facade, drivers e importacao legado.
- Diagramas declarativos da arquitetura ficam em [`docs/DIAGRAMAS.md`](../docs/DIAGRAMAS.md).

## Observacao

- o backend roda com PostgreSQL no Docker
