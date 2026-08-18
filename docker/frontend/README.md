# Frontend Docker

Container do frontend do NSJB Forms.

## Papel

- constroi o bundle de producao com o Vite e serve os arquivos estaticos com nginx
- encaminha as chamadas `/api` para o backend via `NSJB_API_PROXY_TARGET`
- expoe a interface em `5173`

## Como a imagem e montada

O `Dockerfile` tem duas etapas:

1. **build** (`node:22-bookworm-slim`): instala as dependencias e roda
   `vite build`, gerando `frontend/dist`.
2. **runtime** (`nginx:alpine`): copia apenas o `dist` gerado e o template de
   configuracao do nginx.

O servidor de desenvolvimento do Vite **nao** roda em producao. Ele nao e feito
para isso: serve codigo nao minificado, expoe source maps e recusa requisicoes
cujo `Host` nao esteja em `server.allowedHosts`, o que quebra qualquer acesso
por dominio atras de proxy reverso.

## Arquivos

- `docker/frontend/Dockerfile`
- `docker/frontend/nginx.conf.template`
- `frontend/vite.config.js`
- `frontend/index.html`
- `frontend/src/`
- `shared/formRules.mjs`

## Ambiente

- `NSJB_API_PROXY_TARGET=http://backend:8787` no compose
- `GIT_COMMIT` (argumento de build): carimba a versao exibida na interface.
  Sem ele o valor cai para `dev`, porque nao existe `.git` dentro do build.

## Configuracao do nginx

`nginx.conf.template` e processado por `envsubst` na subida do container. O
`NGINX_ENVSUBST_FILTER=NSJB_` restringe a substituicao as variaveis `NSJB_*`,
para que `$uri`, `$host` e afins nao sejam consumidos por engano.

Pontos que a configuracao resolve:

- **fallback de SPA**: os links publicos gerados hoje usam hash
  (`#/formularios/<id>`), que nem chega ao servidor, mas links antigos ja
  compartilhados usam caminho direto (`/formularios/<id>`,
  `/eventos/<id>/<id>`). O `try_files ... /index.html` mantem esses links vivos.
- **cache**: `assets/` tem hash no nome e vai com cache longo; `index.html`
  nunca e cacheado, senao um deploy novo continuaria servindo o bundle antigo.

## Observacoes

- o frontend depende do backend estar saudavel antes de subir
- o healthcheck usa `wget` porque a imagem nginx nao tem Node

## Manutencao

Se o fluxo do frontend mudar, ajuste este README junto com
`frontend/vite.config.js`, `docker/frontend/nginx.conf.template`,
`docker/compose.yml` e o diagrama em `docs/diagramas/inicializacao.d2`.
