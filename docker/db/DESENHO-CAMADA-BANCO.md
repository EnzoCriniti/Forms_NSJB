# Desenho da Camada de Banco

## Objetivo

Definir a camada minima de abstracao de banco que permita:

- manter o backend atual funcionando com SQLite
- introduzir PostgreSQL depois
- reduzir acoplamento dos repositorios a `node:sqlite`
- preservar o contrato atual do backend para o frontend

## Escopo

Esta camada cobre apenas persistencia e transacao.

Nao cobre:

- regra de negocio
- validacao de payload
- transformacao de UI

Ou seja:

- `services` continuam com regra de negocio
- `validators` continuam validando payload
- `repositories` continuam modelando leitura e escrita
- a camada nova passa a ser a base tecnica que os repositories usam

## Problema Atual

Hoje os repositorios conhecem detalhes de SQLite:

- `db.prepare(...).get()`
- `db.prepare(...).all()`
- `db.prepare(...).run()`
- `db.exec(...)`
- `BEGIN IMMEDIATE`
- `lastInsertRowid`

Isso impede trocar o driver sem tocar em muitos arquivos ao mesmo tempo.

## Resultado Esperado

Ao final da primeira etapa de abstracao:

- repositorios deixam de importar `DatabaseSync`
- repositorios deixam de depender diretamente de `db.prepare`
- transacoes passam por um wrapper unico
- troca de driver passa a acontecer em uma camada central

## Desenho Recomendado

### Estrutura sugerida

```text
backend/
  database/
    index.mjs
    drivers/
      sqliteDriver.mjs
      postgresDriver.mjs
    schema/
      sqlite/
      postgres/
    migrations/
```

Observacao:

- isso nao precisa ser criado agora exatamente com esses nomes
- mas a separacao conceitual deve ser essa

Estado atual desta etapa:

- `backend/database/index.mjs` centraliza a facade minima usada pelos repositories
- `backend/database/drivers/sqliteDriver.mjs` concentra o driver SQLite atual
- `backend/database/drivers/postgresDriver.mjs` reserva a interface futura do Postgres
- `backend/database/shared.mjs` centraliza `nowIso`, `parseJson` e `stringifyJson`
- `backend/database/sqliteRuntime.mjs` resolve caminho, abre o SQLite e inicializa o schema
- `backend/database/sqliteSchema.mjs` concentra schema e migracoes do SQLite
- `backend/db.mjs` ficou apenas como ponte de compatibilidade para imports legados

### Interface minima

O backend precisa de uma interface pequena:

```js
queryOne(sql, params?)
queryMany(sql, params?)
execute(sql, params?)
withTransaction(callback)
```

Contratos recomendados:

- `queryOne`
  - retorna `object | null`
- `queryMany`
  - retorna `array`
- `execute`
  - retorna metadata padronizada
- `withTransaction`
  - recebe callback async ou sync
  - controla begin/commit/rollback

### Metadata padronizada

`execute` deve retornar algo como:

```js
{
  rowCount: number,
  lastInsertId: number | null
}
```

Regra:

- em SQLite, `lastInsertId` vem de `lastInsertRowid`
- em Postgres, `lastInsertId` so existe quando a query usar `RETURNING id`

## Contrato Transacional

### Objetivo

Remover `BEGIN IMMEDIATE` espalhado em services e repositories.

### Interface

```js
await withTransaction(async tx => {
  await tx.execute(...);
  const row = await tx.queryOne(...);
});
```

### Regras

- `tx` expõe a mesma interface de consulta:
  - `queryOne`
  - `queryMany`
  - `execute`
- o codigo de dominio nao decide `BEGIN`, `COMMIT` ou `ROLLBACK`
- rollback automatico em qualquer excecao

## Estrategia de Migracao dos Repositories

### Ordem recomendada

1. `formsRepository`
2. `responsesRepository`
3. `escalaRepository`
4. `sessionsRepository`
5. `settingsRepository`
6. demais repositórios administrativos

Motivo:

- `forms` e `responses` concentram os contratos mais sensiveis
- `responsesRepository` testa transacao, upsert e normalizacao
- resolvendo esses dois, o restante fica mais previsivel

### Fase 1

Trocar imports:

De:

```js
import { db } from "../db.mjs";
```

Para algo equivalente a:

```js
import { database } from "../db/index.mjs";
```

### Fase 2

Substituir:

- `db.prepare(...).get()`
- `db.prepare(...).all()`
- `db.prepare(...).run()`
- `db.exec(...)`

Por:

- `database.queryOne(...)`
- `database.queryMany(...)`
- `database.execute(...)`
- `database.withTransaction(...)`

## Mapeamentos Sensiveis

### Insert com retorno de ID

Hoje:

- `lastInsertRowid`

Alvo:

- SQLite driver adapta isso para `lastInsertId`
- Postgres usa `INSERT ... RETURNING id`

### Upsert

Hoje:

- uso de `ON CONFLICT`

Alvo:

- manter SQL explicito
- revisar cada `ON CONFLICT` para garantir paridade entre SQLite e Postgres

### Ordenacao de `field_id`

Hoje:

- `CAST(field_id AS INTEGER)`

Risco:

- diferenca de ordenacao ou coerção no Postgres

Tratamento:

- centralizar query sensivel no repository
- cobrir por teste

## Tabelas e Areas Mais Sensiveis

### Muito sensiveis

- `responses`
- `response_values`
- `forms`
- `auth_sessions`
- `audit_logs`

### Sensiveis

- `settings`
- `presets`
- `field_catalog`
- `scale_task_catalog`
- `escala_assignments`

### Menos sensiveis

- `labels`
- `people`

## Decisoes Recomendadas

### Nao usar ORM agora

Motivos:

- o projeto ainda e pequeno
- SQL atual ja existe
- trocar banco ja e mudanca suficiente
- ORM aumentaria a superficie de risco

### Manter repositories

Motivos:

- a separacao atual e boa
- a mudanca precisa ser tecnica, nao arquitetural ampla

### Isolar schema de runtime

Motivo:

- `backend/db.mjs` hoje mistura:
  - conexao
  - schema
  - migrations
  - helpers

Esse acoplamento foi reduzido nesta etapa com a separacao entre facade, runtime, schema e helpers.

O proximo passo passa a ser remover gradualmente a dependencia da ponte `backend/db.mjs`.

## Criterios de Pronto da Camada

Esta etapa estara pronta quando:

- repositorios centrais nao importarem mais `DatabaseSync`
- `BEGIN IMMEDIATE` sair de services e repositories
- existir `withTransaction`
- existir retorno padronizado de `execute`
- a camada aceitar pelo menos dois drivers conceitualmente

## Regra de Manutencao

Este documento e vivo.

Toda mudanca estrutural relacionada a:

- driver de banco
- transacao
- conexao
- migrations
- contrato da camada de persistencia

deve atualizar este arquivo.
