# Arquitetura

Este documento resume a divisao de responsabilidades do NSJB Forms depois da separacao entre frontend, backend, dados e Docker.

## Pratica de desenvolvimento

O projeto segue uma arquitetura modular monolito com camadas claras. A regra pratica e:

- frontend monta a experiencia e orquestra telas
- backend valida, aplica regra de negocio e persiste
- shared guarda apenas regra realmente comum e pura
- docs registram contratos, decisoes e ordem de evolucao

Isso significa que a forma correta de evoluir o projeto nao e reescrever tudo de uma vez, e sim cortar por responsabilidade, mantendo o contrato atual e validando cada etapa.

### Regras inegociaveis

- Nao misture apresentacao, orquestracao, regra de negocio e persistencia no mesmo arquivo quando for possivel separar.
- Nao mude comportamento visivel sem teste cobrindo a regressao.
- Nao altere contrato publico de API ou de tela sem ajustar frontend, backend, teste e documentacao.
- Nao crie abstracoes genericas antes de existir repeticao real.
- Nao duplicar regra entre frontend e backend se a mesma decisao puder ficar em um helper puro compartilhado.
- Nao aumentar o tamanho de um arquivo grande sem antes reduzir sua responsabilidade.

### Ordem de trabalho segura

1. Identificar o arquivo hub e a responsabilidade que sera retirada.
2. Extrair uma fatia pequena da regra.
3. Atualizar os consumidores diretos.
4. Cobrir com teste.
5. Conferir que o fluxo principal continua igual.
6. Somente entao partir para o proximo corte.

### O que cada camada pode fazer

- `frontend/src/App.jsx` e telas de shell: coordenacao global e composicao.
- `frontend/src/screens/`: fluxos de pagina e controller visual.
- `frontend/src/features/`: blocos de dominio e UI mais especifica.
- `frontend/src/components/`: primitives e componentes realmente compartilhados.
- `frontend/src/lib/`: helpers puros, cliente HTTP e funcoes de apoio.
- `backend/routes/`: entrada HTTP e resposta.
- `backend/services/`: regra de negocio e orquestracao de dominio.
- `backend/repositories/`: consultas e persistencia.
- `backend/validators/`: validacao estrutural de entrada.
- `backend/core/`: utilitarios de dominio reutilizaveis.
- `shared/`: regra pura compartilhada entre frontend e backend.

## Leitura rapida

- [docs/DIAGRAMAS.md](DIAGRAMAS.md) mostra a visao visual.
- [docs/FUNCIONALIDADES.md](FUNCIONALIDADES.md) explica o comportamento da aplicacao.
- esta pagina mostra onde cada responsabilidade vive no codigo.

## Mapa visual

![Arquitetura geral](diagramas/infra.svg)

## Camadas principais

- `frontend/src/` - interface React.
- `backend/` - API containerizada, servicos, repositorios, validacao e banco.
- `shared/` - regras compartilhadas entre frontend e backend.
- `docker/` - orquestracao, imagens e docs da stack.

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
- `backend/database/drivers/` guarda o driver Postgres oficial.
- `backend/data/seedData.mjs` guarda os dados iniciais da aplicacao.
- `backend/seed.mjs` popula dados iniciais.

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
- Nao permita que um arquivo novo comece a acumular mais de uma responsabilidade sem justificativa.
- Quando um corte alterar fluxo, documente a mudanca no mesmo ciclo.
- Quando uma mudanca tocar backend e frontend, trate como duas etapas e valide o contrato entre elas.
- Para um desenho mais visual, consulte [docs/DIAGRAMAS.md](DIAGRAMAS.md).
- Para o resumo de uso e operacao, use o `README.md` da raiz.
