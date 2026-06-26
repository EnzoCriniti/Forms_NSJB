# Backend

Codigo da API do NSJB Forms.

## Estrutura

- `index.mjs` - inicializa o servidor HTTP e o bootstrap.
- `app.mjs` - cria a aplicacao HTTP.
- `config.mjs` - portas, driver e intervalos.
- `routes/` - roteamento HTTP por dominio (com `requireCapability` para o RBAC).
- `services/` - regra de negocio.
- `repositories/` - acesso a persistencia.
- `validators/` - validacao de payload.
- `core/` - utilitarios de dominio e HTTP.
- `bi/` - agregacoes e endpoints do dashboard de relatorios.
- `dispatchers/` - envio de mensagens (log-only e Twilio).
- `database/` - facade de banco e drivers oficiais.
- `orchestrator/` - automacoes de ciclo de vida (inclui mensagens agendadas).
- `seed.mjs` - seed inicial.

## Como o backend funciona

O backend recebe requisicoes, valida entradas, aplica regra de negocio e persiste dados.
O caminho normal e:

1. a rota entra em `backend/routes/`
2. o service executa a regra
3. o repository acessa o banco
4. o layer de `database/` escolhe o driver oficial

O driver oficial atual e PostgreSQL no Docker.

## Entrada principal

- `backend/index.mjs`

## Leitura rapida

- `backend/routes/` separa as rotas por dominio.
- `backend/services/` concentra as regras de negocio.
- `backend/repositories/` concentra persistencia e consultas.
- `backend/database/` concentra facade e drivers oficiais.
- `backend/orchestrator/` cuida do ciclo de vida do bootstrap.
- Diagramas declarativos da arquitetura ficam em [`docs/DIAGRAMAS.md`](../docs/DIAGRAMAS.md).

## Onde olhar primeiro

- para mudar um fluxo de API, comece em `backend/routes/apiRouter.mjs`
- para mudar comportamento de negocio, comece em `backend/services/`
- para mudar consultas, comece em `backend/repositories/`
- para mudar banco ou driver, comece em `backend/database/`
- para alterar boot e ciclo de vida, comece em `backend/orchestrator/`

## Observacao

- o backend roda com PostgreSQL no Docker
