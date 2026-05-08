# Funcionalidades e Arquitetura

Mapa curto da estrutura atual do sistema. O detalhamento funcional vive em [docs/FUNCIONALIDADES.md](FUNCIONALIDADES.md) e os fluxos visuais ficam em [docs/DIAGRAMAS.md](DIAGRAMAS.md).

## Visao geral

- `frontend/src/` entrega a interface e os fluxos do usuario.
- `backend/` entrega a API containerizada, regras e persistencia.
- `docker/` entrega a orquestracao da stack local.
- `storage/` guarda restos legados do runtime SQLite fora do fluxo principal.

## Fluxo de uso

1. O usuario abre uma tela em `frontend/src/screens/*`.
2. A tela chama `frontend/src/lib/api.js`.
3. A API recebe em `backend/routes/apiRouter.mjs`.
4. O service trata a regra.
5. O repository acessa o banco.
6. O frontend atualiza o estado e a visualizacao.

## Fluxo visual curto

![Fluxo funcional resumido](diagramas/funcional.svg)

## Funcionalidades centrais

- Presenca e formularios publicos.
- Escala e resultados.
- Acesso administrativo.
- Bootstrap inicial da aplicacao.
- Persistencia oficial em PostgreSQL no Docker.

## Arquivos principais

- `frontend/src/App.jsx`
- `frontend/src/screens/*`
- `frontend/src/features/*`
- `frontend/src/lib/api.js`
- `backend/index.mjs`
- `backend/seed.mjs`

## Regra de organizacao

- Interface nao conhece SQL.
- Service nao conhece detalhe visual.
- Repository nao decide regra de negocio.
- Docs operacionais ficam em `docker/`.
