# Architecture

Visão técnica da arquitetura do NSJB Forms.

## 1. Stack Principal

- Framework frontend: React 19 com Vite 7.
- Linguagem: JavaScript moderno em `type: module`, com JSX.
- Gerenciador de pacotes: `npm`.
- Biblioteca de UI: não há biblioteca externa de componentes. A UI é feita com componentes próprios em `src/components/ui.jsx` e estilos globais em `src/styles.css`.
- ORM/banco: não há ORM. O projeto usa SQLite nativo via `node:sqlite`.
- Autenticação: não existe provedor externo. O login é local, baseado em usuários armazenados no SQLite e sessão persistida no navegador.
- Build/teste/lint:
  - Build: `vite build`.
  - Testes: `node --test` e `vitest`.
  - Lint: não há script `lint` identificado no `package.json`.

## 2. Estrutura de Pastas

- `src/`: frontend React.
  - `src/App.jsx`: orquestração principal da aplicação.
  - `src/screens/`: telas/páginas da aplicação.
  - `src/features/`: modais e fluxos específicos de domínio, como auth e administração.
  - `src/components/`: componentes visuais compartilhados.
  - `src/lib/`: helpers, auth, forms, storage e cliente HTTP.
  - `src/data/`: seed e metadados estáticos usados pela aplicação.
  - `src/styles.css`: estilos globais e tema.
- `server/`: API local e persistência.
  - `server/routes/`: roteamento HTTP.
  - `server/services/`: regras de negócio.
  - `server/repositories/`: acesso ao SQLite.
  - `server/validators/`: validação de payloads.
  - `server/core/`: utilitários de domínio e HTTP.
  - `server/orchestrator/`: automações de ciclo de vida.
  - `server/db.mjs`: criação do banco e schema.
  - `server/seed.mjs`: seed inicial.
- `tests/`: testes de API, validação, orquestração e UI.
- `docs/`: documentação do projeto.
- `storage/`: arquivo SQLite local gerado em runtime.
- `scripts/`: scripts de execução local.
- `tools/`: runtime Node empacotado para o ambiente do projeto.
- `dist/`: saída do build do frontend.

## 3. Fluxo de uma Funcionalidade Típica

Exemplo prático: salvar um formulário.

1. A interação nasce em uma tela em `src/screens/*`, normalmente acionada por `src/App.jsx`.
2. A tela monta o payload e chama uma função de `src/lib/api.js`.
3. O cliente HTTP faz `fetch` para uma rota da API local.
4. `server/routes/apiRouter.mjs` recebe a requisição, valida o payload e encaminha para um service.
5. O service aplica a regra de negócio e usa um repositório para persistir no SQLite.
6. `server/db.mjs` mantém o schema e a conexão com o banco.
7. Depois do salvamento, o frontend normalmente atualiza o bootstrap com `fetchBootstrap()` para sincronizar a interface. Quando precisa de dados pesados de um formulario especifico, ele busca respostas ou escala por endpoint dedicado em vez de carregar tudo no bootstrap.

O mesmo padrão aparece em respostas, escala, administração e listagem de dados.

Nas respostas, o contrato compatível continua em `responses.values_json`, enquanto `response_values` funciona como camada normalizada de apoio para evolução progressiva sem quebrar telas antigas.

A escala pública usa `POST /api/forms/:id/escala/claim` para reservar uma vaga de forma transacional e devolve `409` quando a vaga ou o nome já conflitam com o estado atual.

## 4. Padrões Arquiteturais Observados

- Organização de componentes:
  - `src/screens/*` concentra telas de nível de página.
  - `src/features/*` concentra modais e blocos de domínio.
  - `src/components/ui.jsx` concentra primitives visuais reutilizáveis.
- Estado:
  - O estado global do frontend fica em `src/App.jsx` com `useState`, `useMemo` e `useEffect`.
  - O estado persistido fora do React é pequeno: sessão e tema usam storage local do navegador.
  - Não há Redux, Zustand ou outro gerenciador de estado global.
- Chamadas de API:
  - São centralizadas em `src/lib/api.js`.
  - O frontend não acessa a API local diretamente espalhando `fetch` pela codebase.
- Validação:
  - O backend valida payloads em `server/validators/payloadValidators.mjs` antes de chamar os services.
  - Há validação complementar no frontend em alguns fluxos de formulário.
- Erros:
  - No frontend, `App.jsx` mostra estado de carregamento e mensagem de erro ao falhar no bootstrap ou ao carregar detalhes sob demanda de um formulario.
  - No backend, `server/app.mjs` captura exceções e responde com JSON de erro.
- Estilos:
  - Estilos globais e tokens de tema ficam em `src/styles.css`.
  - Grande parte da UI usa estilos inline no JSX, com alguns estilos globais e classes utilitárias.

## 5. Convenções Importantes

- Nomenclatura:
  - Arquivos de tela usam `PascalCase.jsx` em `src/screens`.
  - Arquivos de função utilitária usam `camelCase.js` ou `camelCase.mjs`.
  - Serviços, repositórios e validadores seguem o nome da entidade que atendem.
- Separação de responsabilidades:
  - Tela renderiza e coleta interação.
  - `src/lib/api.js` só faz transporte HTTP.
  - `server/services/*` concentra regra de negócio.
  - `server/repositories/*` concentra persistência.
  - `server/validators/*` concentra validação estrutural.
- Onde colocar novos arquivos:
  - Nova página ou tela: `src/screens/`.
  - Novo modal/fluxo específico: `src/features/`.
  - Helper compartilhado: `src/lib/`.
  - Novo endpoint: `server/routes/` + `server/services/` + `server/repositories/` se houver persistência.
  - Novo teste: `tests/`.
- O que evitar:
  - Evite adicionar lógica de negócio em `src/App.jsx`.
  - Evite duplicar chamadas HTTP fora de `src/lib/api.js`.
  - Evite criar um segundo padrão de persistência fora do SQLite local.
  - Evite renomear contratos públicos de dados sem revisar frontend, backend e testes.

## 6. Riscos e Cuidados

- Arquivos centrais e sensíveis:
  - `src/App.jsx`: altera navegação, bootstrap, sessão e seleção de tela.
  - `src/lib/api.js`: qualquer mudança afeta todo o frontend.
  - `server/routes/apiRouter.mjs`: concentra todas as rotas da API local.
  - `server/validators/payloadValidators.mjs`: quebra facilmente fluxos se a forma do payload mudar.
  - `server/db.mjs`: define schema e colunas que todo o restante assume.
  - `server/services/bootstrapService.mjs`: alimenta o frontend com os dados principais e metrics resumidas.
- Padrões que não devem ser quebrados:
  - O frontend espera um bootstrap principal com forms, users, labels, presets, people e membersConfig; respostas e escala completas agora podem ser buscadas por formulario quando necessario.
  - `resultsConfig`, `fieldDefinitions` e `scaleSections` são estruturas relevantes tanto no frontend quanto no backend.
  - O fluxo público depende do hash `#/f/<slug>`.
  - O login e o tema dependem de storage local e não de uma sessão remota.
- Partes sensíveis do projeto:
  - Fluxo de resultados, porque atende presença e escala.
  - Administração, porque altera os dados que alimentam o bootstrap.
  - Seed inicial, porque é usada para criar o banco na primeira execução.
  - Repositórios e validações, porque qualquer mudança estrutural exige alinhar tela, API e testes.
