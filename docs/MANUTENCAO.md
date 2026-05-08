# ManutenÃ§Ã£o

## Objetivo

Este arquivo define o padrÃ£o mÃ­nimo para manutenÃ§Ã£o futura por humanos e IAs.

## Regra de arquitetura

### Frontend

- telas em `src/screens`
- mÃ³dulos em `src/features`
- cliente HTTP e helpers em `src/lib`
- componentes base em `src/components`

### Backend

- rotas em `server/routes`
- regras de negÃ³cio em `server/services`
- persistÃªncia em `server/repositories`
- utilidades compartilhadas em `server/core`

## Regra de dados

O projeto usa modelo hÃ­brido:

- **relacional** para entidades estÃ¡veis
  - usuÃ¡rios
  - classificaÃ§Ãµes
  - presets
  - sÃ³cios
  - metadados principais de formulÃ¡rios
- **JSON** para estruturas variÃ¡veis
  - `field_definitions_json`
  - `scale_sections_json`
  - `values_json`
  - `sections_json`

`response_values` Ã© uma tabela relacional sombra para normalizaÃ§Ã£o progressiva das respostas.

Esse modelo foi escolhido porque:

- cada formulÃ¡rio pode ter estrutura diferente
- facilita futura integraÃ§Ã£o com ferramentas no-code
- mantÃ©m SQLite Ãºtil para filtros, integridade e administraÃ§Ã£o

## PadrÃ£o de cabeÃ§alho

Todo arquivo de cÃ³digo novo deve comeÃ§ar com um cabeÃ§alho curto:

```js
/**
 * @file caminho/do/arquivo
 * @summary o que o arquivo Ã©
 * @responsibility qual responsabilidade exclusiva ou principal ele tem
 */
```

Regras:

- manter entre 3 e 4 linhas Ãºteis
- nÃ£o explicar detalhe de implementaÃ§Ã£o no cabeÃ§alho
- atualizar o cabeÃ§alho quando a responsabilidade do arquivo mudar

## Fluxo para manutenÃ§Ã£o

Ao alterar comportamento:

1. localizar a camada correta
2. mudar a menor superfÃ­cie possÃ­vel
3. evitar lÃ³gica de negÃ³cio em componentes visuais
4. evitar SQL espalhado fora de `repositories`
5. registrar a mudanÃ§a no `docs/IA-LOG.md`
6. validar `npm run build`
7. validar `npm run test` quando houver mudanÃ§a de comportamento
8. validar /api/health ou /api/bootstrap se o backend foi tocado
9. usar `npm run test:load:local` quando precisar verificar carga local sem inflar a suite principal

Regra adicional para respostas:

- ao salvar ou atualizar resposta, manter `values_json` e `response_values` sincronizados
- nÃ£o remover `values_json` enquanto o frontend e os relatÃ³rios ainda dependerem dele

Regra adicional para exclusões destrutivas:

- toda exclusão que remove registros relacionados deve validar a chave mestra no backend antes de executar a mutação
- a validação visual no frontend é complementar; nunca deve ser a única barreira

Regra adicional para auditoria:

- toda mutação administrativa deve registrar evento no backend com actor autenticado da sessao ou actor publico sistemico/visitante
- nunca confiar em actor enviado pelo frontend
- sanitizar metadata antes de persistir
- nao registrar `password`, `masterKey`, `currentMasterKey`, `newMasterKey`, `token`, `sessionToken`, `secret`, `hash` ou `salt`
- para respostas publicas, registrar apenas `formId`, `responseId`, quantidade de campos e modo create/update; nunca salvar `values_json` completo
- consultas e listagens de logs devem usar a tabela `audit_logs` no SQLite principal, sem banco separado
## Fluxo para novas funcionalidades

1. definir a entidade principal
2. decidir o que Ã© relacional e o que Ã© JSON
3. criar ou ajustar repository
4. expor regra no service
5. conectar pela route
6. sÃ³ entÃ£o adaptar frontend
7. registrar decisÃ£o e tradeoff no log

## O que evitar

- colocar fetch direto dentro de componentes sem passar por `src/lib/api.js`
- colocar SQL direto em `routes`
- colocar regra de negÃ³cio complexa em `App.jsx`
- duplicar formataÃ§Ã£o de datas e leitura de respostas fora dos helpers
- criar documentaÃ§Ã£o paralela contraditÃ³ria

## Carga Local

- use `npm run test:load:local` para verificar throughput local sem mover essa rotina para a suite principal


## Feedback e CRUD

- confirmações de exclusão e outras ações destrutivas devem reutilizar `ConfirmModal`
- ações assíncronas devem bloquear duplo clique com `Btn loading`
- mensagens curtas de sucesso/erro devem reutilizar `FeedbackBanner`



