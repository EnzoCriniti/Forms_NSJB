# Plano de Migracao de SQLite para PostgreSQL

## Objetivo

Definir uma migracao segura, incremental e reversivel do backend atual em `SQLite` para `PostgreSQL`, sem misturar esse movimento com mudancas grandes de produto, auth ou frontend.

## Status

- planejamento ativo
- o service PostgreSQL ja existe no `docker/compose.yml` sob o profile `db`
- a camada de acesso do backend ainda precisa terminar de ficar agnostica ao driver
- o banco atual continua sendo SQLite montado por volume

## Premissas

- A stack Docker local ja esta operacional.
- O sistema continua em ambiente de desenvolvimento.
- A migracao de banco ainda nao sera implementada agora.
- A meta desta etapa e preparar a execucao correta, com ordem, riscos e validacoes.

## Recomendacao Executiva

Ordem recomendada:

1. estabilizar o ambiente atual em Docker
2. concluir a camada minima de abstracao de banco
3. manter o service PostgreSQL no Docker sem trocar o fluxo de negocio
4. criar schema equivalente no Postgres
5. criar script de migracao de dados
6. validar paridade funcional
7. so depois trocar o ambiente principal para Postgres

Essa ordem evita misturar:

- infraestrutura
- modelagem
- migracao de dados
- regressao funcional

## Estado Atual

Hoje o backend esta fortemente acoplado a `SQLite`.

Pontos concretos identificados:

- `backend/db.mjs`
  - usa `DatabaseSync` de `node:sqlite`
  - define schema via `CREATE TABLE`
  - aplica `PRAGMA journal_mode = WAL`
  - aplica `PRAGMA foreign_keys = ON`
  - aplica `PRAGMA busy_timeout = 5000`
  - controla migrations na mesma camada
- `backend/repositories/formsRepository.mjs`
  - depende de `result.lastInsertRowid`
- `backend/repositories/responsesRepository.mjs`
  - usa `BEGIN IMMEDIATE`
  - usa `ON CONFLICT(form_id, respondent_key) DO UPDATE`
  - apaga e reinsere normalizacao em `response_values`
- `backend/services/formsService.mjs`
  - usa transacao explicita com `BEGIN IMMEDIATE`
- `backend/services/escalaService.mjs`
  - usa transacao explicita com `BEGIN IMMEDIATE`
- `backend/seed.mjs`
  - popula o banco via SQL direto
- varias tabelas persistem estruturas em `TEXT` com JSON serializado

## Acoplamentos que Precisam Ser Tratados

### 1. Driver e API de conexao

Hoje:

- `db.prepare(...).get()`
- `db.prepare(...).all()`
- `db.prepare(...).run()`
- `db.exec(...)`

No Postgres isso muda para outro contrato.

Conclusao:

- precisamos de uma camada propria de acesso
- nao e hora de espalhar o cliente de Postgres direto em todos os repositorios

### 2. SQL e sintaxe especifica

Pontos sensiveis:

- `PRAGMA`
- `AUTOINCREMENT`
- `BEGIN IMMEDIATE`
- `lastInsertRowid`
- `CAST(field_id AS INTEGER)` em ordenacao

Observacao:

- `ON CONFLICT ... DO UPDATE` existe em Postgres, mas a sintaxe completa e os retornos precisam ser revisados caso a caso

### 3. JSON salvo como texto

Hoje varias colunas usam `TEXT` com `JSON.stringify`:

- `labels_json`
- `field_definitions_json`
- `results_config_json`
- `scale_sections_json`
- `values_json`
- `value_json`
- `metadata_json`
- `value_json` de `settings`

No Postgres, o recomendado e usar `JSONB` quando o conteudo e realmente JSON de dominio.

Decisao recomendada:

- migrar esses campos para `JSONB`
- manter o contrato retornado ao frontend igual ao atual

### 4. Controle de transacao

Hoje o codigo usa:

- `db.exec("BEGIN IMMEDIATE")`
- `db.exec("COMMIT")`
- `db.exec("ROLLBACK")`

No Postgres:

- transacao passa por conexao dedicada
- precisa de wrapper transacional consistente

### 5. Seed e bootstrap

Hoje o seed escreve direto no schema SQLite.

Na migracao:

- o seed precisa ficar agnostico ao banco
- ou precisa haver uma versao de seed propria para Postgres

Recomendacao:

- extrair os dados e manter a escrita em repositorios/servicos
- evitar dois seeds com logica duplicada

## Topologia Alvo

Quando a migracao acontecer, a topologia recomendada sera:

- `frontend`
- `backend`
- `postgres`

Volumes:

- volume persistente do Postgres

Variaveis novas esperadas:

- `NSJB_DB_DRIVER=postgres`
- `NSJB_PGHOST`
- `NSJB_PGPORT`
- `NSJB_PGDATABASE`
- `NSJB_PGUSER`
- `NSJB_PGPASSWORD`
- opcionalmente `NSJB_PGSSLMODE`

## Estrategia Tecnica Recomendada

### Fase 1 - Criar camada de banco

Objetivo:

- parar de importar `db` diretamente em todos os repositorios como dependencia fixa de SQLite

Entregas:

- modulo de acesso com interface minima
- helpers como:
  - `queryOne`
  - `queryMany`
  - `execute`
  - `withTransaction`

Resultado esperado:

- repositorios deixam de conhecer `DatabaseSync`
- `backend/db.mjs` deixa de ser a unica forma de falar com o banco

### Fase 2 - Isolar schema e migrations

Objetivo:

- separar schema/migration do runtime de conexao

Entregas:

- migrations por versao
- schema de SQLite isolado do futuro schema de Postgres
- estrategia clara de bootstrap de banco vazio

Resultado esperado:

- o backend sobe com o driver escolhido
- a preparacao do schema nao fica misturada ao cliente de banco

### Fase 3 - Introduzir driver Postgres

Objetivo:

- adicionar suporte real ao Postgres sem trocar o ambiente principal ainda

Entregas:

- cliente Postgres
- implementacao da camada de banco para Postgres
- adaptacao de `withTransaction`
- adaptacao de `RETURNING id` no lugar de `lastInsertRowid`

Ponto de decisao:

- manter SQL explicito
- nao introduzir ORM agora

Motivo:

- o projeto e pequeno o suficiente
- SQL explicito reduz custo de migracao e debug

### Fase 4 - Definir schema Postgres

Objetivo:

- criar o modelo alvo com tipos corretos

Diretrizes:

- `id` como `GENERATED BY DEFAULT AS IDENTITY` ou `BIGSERIAL`, conforme preferencia
- JSON de dominio em `JSONB`
- `BOOLEAN` nativo onde hoje existe inteiro booleano
- `TIMESTAMP WITH TIME ZONE` para datas operacionais

Mapeamentos recomendados:

- `forms.labels_json` -> `JSONB`
- `forms.field_definitions_json` -> `JSONB`
- `forms.results_config_json` -> `JSONB`
- `forms.scale_sections_json` -> `JSONB`
- `responses.values_json` -> `JSONB`
- `response_values.value_json` -> `JSONB`
- `settings.value_json` -> `JSONB`
- `audit_logs.metadata_json` -> `JSONB`

### Fase 5 - Script de migracao de dados

Objetivo:

- copiar os dados do SQLite para o Postgres com validacao

Escopo minimo:

- `forms`
- `responses`
- `response_values`
- `escala_assignments`
- `users`
- `labels`
- `presets`
- `people`
- `settings`
- `auth_sessions`
- `field_catalog`
- `scale_task_catalog`
- `audit_logs`
- `schema_migrations` se ainda fizer sentido

Regras:

- a ordem de carga precisa respeitar FKs
- IDs precisam ser preservados
- sequences do Postgres precisam ser ajustadas ao final

### Fase 6 - Validacao de paridade

Objetivo:

- provar que o comportamento com Postgres e equivalente ao atual

Checklist funcional:

- `GET /api/health`
- `GET /api/bootstrap`
- login admin
- login viewer
- sessao unica / bloqueio de admin
- criar formulario
- editar formulario
- excluir formulario
- responder formulario publico
- preencher escala
- abrir resultados
- filtros de resultados
- auditoria

Checklist de dados:

- contagem por tabela
- leitura de formularios
- leitura de respostas
- leitura de escala
- usuarios
- labels
- presets
- socios
- settings
- audit logs

### Fase 7 - Corte controlado

Objetivo:

- trocar o ambiente principal de dev para Postgres

Passos:

1. subir `postgres` na compose
2. apontar `backend` para Postgres
3. rodar migracoes
4. importar os dados
5. validar smoke test
6. manter SQLite antigo apenas como referencia temporaria

## O que Nao Fazer

- nao trocar banco e mexer no dominio do formulario na mesma etapa
- nao reescrever repositorios todos de uma vez sem camada intermediaria
- nao introduzir ORM so porque vai trocar de banco
- nao mudar contratos do frontend durante a migracao
- nao depender de conversao manual tabela por tabela

## Riscos Principais

### Risco 1 - Regressao de transacao

Onde pega:

- `responsesRepository`
- `formsService`
- `escalaService`

Impacto:

- inconsistencias em resposta normalizada
- grava parcial
- conflito em sessao ou escala

Mitigacao:

- criar `withTransaction`
- cobrir com teste de API antes de trocar o driver

### Risco 2 - JSON inconsistente

Onde pega:

- bootstrap
- results
- presets
- settings
- audit logs

Impacto:

- leitura quebrada ou dados parcialmente convertidos

Mitigacao:

- mapear campo por campo
- validar leitura com fixtures reais

### Risco 3 - IDs e sequences

Impacto:

- inserts futuros colidirem com IDs migrados

Mitigacao:

- resetar sequence de cada tabela depois da importacao

### Risco 4 - Diferença silenciosa de ordenacao

Onde pega:

- listagens
- `CAST(field_id AS INTEGER)`
- `lower(name)`

Mitigacao:

- revisar queries que dependem de ordenacao implicita
- criar testes que cubram a ordem esperada

## Critérios de Pronto

O sistema estara pronto para executar a migracao quando:

- a camada de banco estiver abstraida
- houver suporte a transacao agnostica
- o schema Postgres estiver definido
- o script de migracao existir
- a validacao de paridade estiver documentada

## Ordem Recomendada de Execucao

1. criar camada minima de banco
2. isolar migrations/schema
3. adicionar driver Postgres
4. definir schema alvo
5. criar importador SQLite -> Postgres
6. validar dados
7. validar fluxos
8. trocar compose principal

## Proximo Passo Recomendado

O proximo passo correto, sem iniciar a migracao ainda, e:

1. desenhar a camada minima de abstracao do banco
2. listar quais repositorios serao migrados primeiro
3. definir o schema Postgres alvo tabela por tabela

Esse e o menor passo tecnico com maior ganho para preparar a troca futura.

## Documentos de Apoio

- [DESENHO-CAMADA-BANCO.md](C:/Users/enzof/Desktop/projetos/escalas/docker/db/DESENHO-CAMADA-BANCO.md)
- [ESQUEMA-BANCO-DADOS.md](C:/Users/enzof/Desktop/projetos/escalas/docker/db/ESQUEMA-BANCO-DADOS.md)
- [DDL-POSTGRESQL-INICIAL.sql](C:/Users/enzof/Desktop/projetos/escalas/docker/db/DDL-POSTGRESQL-INICIAL.sql)
