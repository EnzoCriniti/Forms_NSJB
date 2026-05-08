# AGENTS.md

Guia curto para agentes de IA neste repositorio.

## Regras gerais

- Antes de alterar codigo, consulte `docs/AI_CODEMAP.md` quando ele existir.
- Antes de fazer busca global no repositorio, verifique se a funcionalidade ja esta mapeada no `docs/AI_CODEMAP.md`.
- Se a area ainda nao estiver mapeada, confira a documentacao em `docs/` antes de sair pesquisando o projeto inteiro.
- Faça alteracoes pequenas e localizadas sempre que possivel.
- Nao renomeie arquivos, componentes, rotas, funcoes ou variaveis publicas sem necessidade explicita.
- Nao altere arquitetura, dependencias ou padroes globais sem pedido direto.
- Preserve a compatibilidade com o padrao atual do projeto em React, API local e persistencia em SQLite.

## Como navegar no projeto

- Paginas e rotas:
  - `src/App.jsx` concentra a navegacao principal, o menu superior e o estado de tela.
  - As telas ficam em `src/screens/*`.
  - A navegacao publica por link usa hash em `#/f/<slug>` e tambem e resolvida em `src/App.jsx`.
- Componentes:
  - Componentes visuais compartilhados ficam em `src/components/ui.jsx`.
  - Modais e blocos de funcionalidade ficam em `src/features/*`.
- Services, hooks, libs e utils:
  - Nao ha uma pasta dedicada a hooks.
  - Funcoes de apoio, auth, forms, storage e cliente HTTP ficam em `src/lib/*`.
- Tipos e interfaces:
  - Este projeto usa JavaScript e JSX, nao TypeScript.
  - Nao ha uma pasta central de tipos; contratos de dados ficam distribuidos entre `src/lib/api.js`, `server/validators/*` e os arquivos de servico/repositorio.
- Estilos:
  - Estilos globais e tema ficam em `src/styles.css`.
- Chamadas de API:
  - O cliente HTTP do frontend fica em `src/lib/api.js`.
  - As rotas da API local ficam em `server/routes/apiRouter.mjs`.
  - A logica de negocio do backend fica em `server/services/*` e os acessos ao banco em `server/repositories/*`.
- Configuracoes:
  - Configuracoes do frontend ficam em `src/lib/appConstants.js` e `src/data/appData.json`.
  - Configuracao do backend fica em `server/config.mjs`.
  - Seed e dados iniciais ficam em `server/seed.mjs` e `src/data/seedData.js`.
  - Scripts de execucao ficam em `package.json`.

## Comandos uteis

- Instalar dependencias:
  - `npm install`
- Rodar localmente:
  - `npm run dev`
  - Alternativas: `npm run dev:client` e `npm run dev:server`
- Rodar build:
  - `npm run build`
- Rodar testes:
  - `npm test`
  - Testes especificos:
    - `npm run test:api`
    - `npm run test:ui`
    - `npm run test:forms`
- Lint:
  - Nao existe script `lint` no `package.json` atual.

## Validacao

- Sempre rode `lint`, `build` e/ou testes quando fizer sentido para a mudanca.
- Se nao for possivel validar, explique claramente o motivo no retorno final.
- Em mudancas de frontend, valide pelo menos `npm run build` e, quando a area tocar fluxo, rode os testes relevantes.

## Regra de atualizacao do mapa

- Se durante uma tarefa voce descobrir uma relacao importante entre funcionalidade e arquivos, atualize `docs/AI_CODEMAP.md`.
- Se o arquivo nao existir, crie-o quando isso for util para evitar buscas repetidas nas proximas tarefas.
