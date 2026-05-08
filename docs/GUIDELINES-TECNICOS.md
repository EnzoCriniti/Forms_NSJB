# Guidelines Tecnicos

## Execucao

Script principal:

```text
npm run dev
```

Ele sobe em paralelo:

- `server/index.mjs`
- Vite

Build do frontend:

```text
npm run build
```

Testes automatizados:

```text
npm run test
```

Carga local simples:

```text
npm run test:load:local
```

Screenshot local da UI:

```text
npm run screenshot:local -- --out screenshots/listagem.png --auth admin
```

Divisao atual:

- `npm run test:api`: backend, validadores e contratos da API
- `npm run test:ui`: componentes React com Vitest + Testing Library
- `npm run test:forms`: regressao focada nos fluxos mais sensiveis de formularios, resultados, escala e bootstrap leve
- `npm run test:load:local`: runner simples para simular carga local na API com banco temporario, fora da suite principal
- `npm run screenshot:local`: usa `tools/visual/screenshot-local.mjs` para subir API + Vite temporarios e gerar screenshot PNG com Chrome/Edge headless; aceita `--auth admin|viewer`, `--hash`, `--out`, `--width`, `--height`, `--wait`, `--selector` e `--action`

## Banco local

Arquivo:

```text
storage/nsjb-forms.sqlite
```

Caracteristicas:

- uso local
- seed automatica na primeira execucao
- schema inicializado por `server/db.mjs`
- migrations versionadas e idempotentes ficam no proprio `server/db.mjs`, com registro em `schema_migrations`
- o bootstrap deve permanecer leve; respostas e escala completas devem ser buscadas por endpoint especifico quando a tela realmente precisar desses dados
- respostas gravadas devem manter `values_json` e `response_values` em sincronia; `values_json` continua sendo a fonte de compatibilidade enquanto a normalizacao progride

## Convencoes atuais

### Frontend

- `src/screens`: telas principais
- `src/features`: modulos administrativos e autenticacao
- `src/lib`: clientes e helpers

### Backend

- `server/routes`: roteamento HTTP
- `server/services`: regras de negocio
- `server/repositories`: acesso ao SQLite
- `server/core`: utilitarios compartilhados

## Decisoes importantes

- SQLite local foi adotado como solucao intermediaria para sair do `localStorage` como fonte principal
- formularios usam JSON para armazenar a definicao dinamica dos campos
- sessao atual e tema continuam em `localStorage`
- link direto do Google Sheets foi mantido por solicitacao do projeto
- novas migrations devem ser pequenas, numeradas, idempotentes e gravadas no controle `schema_migrations`
- para evitar crescimento do bootstrap, use `GET /api/forms/:id/responses` e `GET /api/forms/:id/escala` para detalhes por formulario
- para validar carga local sem poluir a suite principal, use `npm run test:load:local`; ele sobe a API em banco temporario, cria um formulario e envia lotes de respostas sequenciais e concorrentes

## Diretriz de manutencao

- prefira alteracoes pequenas e localizadas antes de reescrever telas ou modulos inteiros
- quando houver ajuste simples, mude o ponto exato, rode a suite relevante e siga
- reescrita ampla so deve acontecer quando o problema estrutural estiver claro
- sempre que possivel, adicione ou ajuste um teste no mesmo fluxo alterado

## Proximos passos recomendados

1. Adicionar testes de UI para fluxos criticos.
2. Mover autenticacao para backend quando houver multiusuario real.
3. Versionar migrations do SQLite.
4. Revisar a UI para remover textos restantes do MVP antigo.
