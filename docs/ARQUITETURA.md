# Arquitetura

Este documento resume a arquitetura atual do NSJB Forms depois da separacao entre frontend, backend e Docker.

## Leitura rapida

- [docs/DIAGRAMAS.md](DIAGRAMAS.md) mostra a visao visual.
- [docs/FUNCIONALIDADES.md](FUNCIONALIDADES.md) mostra o que a aplicacao entrega.
- esta pagina explica onde cada responsabilidade vive no codigo.

## Camadas principais

- `frontend/src/` - interface React.
- `backend/` - API em Docker, servicos, repositorios, validacao e banco.
- `shared/` - regras compartilhadas entre frontend e backend.
- `docker/` - orquestracao, imagens e docs da stack.
- `storage/` - restos legados do runtime SQLite; nao e fluxo oficial.

## Frontend

- `frontend/src/App.jsx` controla navegacao, menu e estado global de tela.
- `frontend/src/screens/` guarda telas de nivel de pagina.
- `frontend/src/features/` guarda modais e fluxos de dominio.
- `frontend/src/components/ui.jsx` guarda componentes visuais compartilhados.
- `frontend/src/lib/` guarda auth, forms, storage, api e funcoes de apoio.
- `frontend/src/data/` guarda dados estaticos da UI.
- `frontend/src/styles.css` guarda tema e estilos globais.
- `shared/formRules.mjs` guarda regras compartilhadas entre frontend e backend.

## Backend

- `backend/index.mjs` inicia a API.
- `backend/app.mjs` cria o servidor HTTP.
- `backend/routes/apiRouter.mjs` concentra as rotas.
- `backend/services/` guarda regras de negocio.
- `backend/repositories/` guarda acesso ao banco.
- `backend/validators/` valida payloads.
- `backend/core/` guarda utilitarios de dominio.
- `backend/database/` guarda a camada minima de acesso ao banco.
- `backend/database/drivers/` guarda o driver Postgres oficial e o driver SQLite legado.
- `backend/data/seedData.mjs` guarda os dados iniciais da aplicacao.
- `backend/seed.mjs` popula dados iniciais.

## Visao visual

![Arquitetura geral](diagramas/infra.svg)

## Fluxo basico

1. O usuario interage com uma tela em `frontend/src/screens/*`.
2. A tela usa helpers de `frontend/src/lib/api.js`.
3. A API recebe a chamada em `backend/routes/apiRouter.mjs`.
4. O service aplica a regra de negocio.
5. O repository grava ou le do banco.
6. O bootstrap volta para o frontend com o estado consolidado.

## Regras de organizacao

- Nao coloque regra de negocio em `frontend/src/App.jsx`.
- Nao duplique chamadas HTTP fora de `frontend/src/lib/api.js`.
- Nao mova responsabilidade de persistencia para services.
- Nao misture validacao estrutural com regra de negocio.
- Para um desenho mais visual, consulte [docs/DIAGRAMAS.md](DIAGRAMAS.md).
- Para o resumo de uso e operacao, use o `README.md` da raiz.
