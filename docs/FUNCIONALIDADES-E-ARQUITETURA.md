# Funcionalidades e Arquitetura

## Estrutura

```text
src/       frontend React
server/    API local + SQLite
storage/   banco SQLite local
docs/      documentação consolidada
```

## Fronteira de responsabilidades

### Frontend

Responsável por:

- renderização
- navegação
- estado de tela
- autenticação local em memória usando usuários carregados da API
- chamadas HTTP para a API local

Arquivos centrais:

- `src/App.jsx`
- `src/screens/*`
- `src/features/*`
- `src/lib/api.js`

### Backend

Responsável por:

- inicialização do banco
- seed inicial
- persistência de formulários
- persistência de respostas
- persistência de escala
- persistência de presets, classificações, usuários e sócios
- persistência de auditoria administrativa

Arquivos centrais:

- `server/index.mjs`
- `server/db.mjs`
- `server/seed.mjs`

## Modelo de dados atual

### `forms`

Guarda metadados do formulário:

- `slug`
- `type`
- `status`
- `title`
- `session_name`
- `description`
- `date`
- `closing`
- `closing_text`
- `total_expected`
- `labels_json`
- `field_definitions_json`
- `scale_sections_json`

Os campos dinâmicos e a configuração estrutural do formulário ficam serializados em JSON.

### `responses`

Cada resposta pertence a um formulário:

- `form_id`
- `respondent_name`
- `respondent_grau`
- `respondent_key`
- `values_json`

`values_json` guarda o payload dinâmico indexado pelo `id` do campo.

### `response_values`

Tabela normalizada complementar para respostas:

- `response_id`
- `form_id`
- `field_id`
- `field_type`
- `value_text`
- `value_number`
- `value_boolean`
- `value_json`

Ela existe como camada progressiva de normalização. Por enquanto, `values_json` continua sendo a fonte compatível para leitura geral, e `response_values` deve ser mantida em sincronia ao salvar ou atualizar respostas.

### `escala_assignments`

Persistência do preenchimento real da escala:

- `form_id`
- `sections_json`

`sections_json` guarda seções, cores e slots preenchidos.

### `users`

- `name`
- `username`
- `password`
- `role`

### `labels`

- `name`
- `color`
- `created_by`

### `presets`

- `type`
- `name`
- `description`
- `closing_text`
- `labels_json`
- `field_definitions_json`
- `scale_sections_json`

### `people`

- `name`
- `grau`

### `settings`

Chave-valor em JSON.

### `audit_logs`

Auditoria administrativa no SQLite principal:

- `created_at`
- `level`
- `category`
- `action`
- `status`
- `screen`
- `actor_id`
- `actor_name`
- `actor_role`
- `entity_type`
- `entity_id`
- `entity_label`
- `message`
- `metadata_json`
- `request_id`
- `ip_address`
- `user_agent`

Essa tabela registra eventos de auth, formulários, respostas, escala, segurança e ações administrativas, sempre com metadata sanitizada e actor resolvido pelo backend.

Hoje usada principalmente para:

- `membersConfig`
- `formDeleteKey` - chave mestra hash/salt para exclusao segura de formularios

## API local

### Bootstrap

```text
GET /api/bootstrap
```

Os detalhes completos de respostas e escala foram movidos para:

```text
GET /api/forms/:id/responses
GET /api/forms/:id/escala
```

Retorna:

- formulários
- metrics resumidas por formulário
- usuários
- classificações
- presets
- sócios
- configuração de membros

### Formulários

```text
POST   /api/forms
DELETE /api/forms/:id
```

`DELETE /api/forms/:id` exige payload JSON com `masterKey`. A exclusao roda em transacao e remove respostas, `response_values` e escala associadas. Se a chave mestra nao estiver configurada ou estiver incorreta, a API responde com erro claro sem apagar dados.

### Auditoria administrativa

```text
GET /api/audit-logs
```

`GET /api/audit-logs` exige `admin` autenticado e aceita filtros por `from`, `to`, `level`, `category`, `action`, `status`, `screen`, `actor`, `entityType`, `entityId`, `search`, `limit` e `offset`. O retorno não inclui senhas, tokens, chave mestra, hash, salt nem payload completo de respostas.

### Respostas

```text
POST /api/responses
```

### Escala

```text
POST /api/forms/:id/escala/claim
PUT /api/escala/:formId
```

`POST /api/forms/:id/escala/claim` faz o preenchimento publico de uma vaga com validacao transacional de conflito. Se a vaga ja tiver sido ocupada ou o nome ja estiver em outra vaga, a API responde com `409`.

### Administração

```text
POST   /api/users
DELETE /api/users/:id
POST   /api/labels
DELETE /api/labels/:id
POST   /api/presets
DELETE /api/presets/:id
PUT    /api/people
PUT    /api/members-config
```

### Segurança

```text
GET  /api/security/form-delete-key/status
PUT  /api/security/form-delete-key
```

O status informa apenas se a chave mestra existe. O `PUT` cria a chave quando nao existe e exige `currentMasterKey + newMasterKey` quando ja existe. O valor salvo no SQLite e apenas hash + salt, nunca a chave em texto puro.

## Padrão arquitetural usado

Não foi adotado MVC clássico no frontend.

A separação escolhida é:

- UI e telas no frontend
- API e persistência no backend
- JSON para estrutura dinâmica do formulário
- SQLite como fonte principal de verdade local

Isso reduz acoplamento sem introduzir camadas artificiais demais para o tamanho atual do projeto.



