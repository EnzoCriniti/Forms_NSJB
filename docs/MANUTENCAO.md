# Manutencao

Guia unico para manter o projeto consistente, refatorar sem perder o foco e registrar o que mudou.

## Como usar

- Veja `docs/MAPA-CODIGO.md` antes de procurar arquivos no repo inteiro.
- Comece pela area certa: frontend, backend, docker ou docs.
- Considere a documentacao como parte do codigo: se o comportamento mudou, atualize o texto correspondente.
- Atualize os caminhos da documentacao quando mover arquivos.
- Atualize os diagramas em `docs/diagramas/*.d2` e regenere os `*.svg` quando a arquitetura ou o fluxo mudar.
- Registre bug encontrado com teste novo ou ajuste de teste existente.
- Registre toda correcao ou refatoracao relevante em commit separado.
- Rode `npm run test`, `npm run build` e `docker compose -f docker/compose.yml config` quando a mudanca tocar fluxo real.

## Separacao de responsabilidades

- Telas ficam em `frontend/src/screens/`.
- Modulos de dominio ficam em `frontend/src/features/`.
- Helpers do frontend ficam em `frontend/src/lib/`.
- Rotas ficam em `backend/routes/`.
- Regras de negocio ficam em `backend/services/`.
- Persistencia fica em `backend/repositories/`.
- Validacao fica em `backend/validators/`.
- Infraestrutura oficial fica em `docker/`.

## O que evitar

- Colocar `fetch` direto em component ou screen.
- Colocar regra de negocio em `App.jsx`.
- Colocar SQL fora de repository.
- Juntar documentacao historica com documentacao operacional.
- Criar mais arquivos de checklist quando um documento unico resolve.

## Rotina curta

1. ler `docs/MAPA-CODIGO.md`
2. identificar a menor mudanca util
3. atualizar teste se houver bug ou regressao
4. atualizar doc se a estrutura mudar
5. validar a stack quando o fluxo real for afetado
6. registrar commit claro
7. revisar README e docs da area quando o fluxo ficar diferente

## Backlog de refatoracao

- Reduzir ainda mais `frontend/src/App.jsx` para ficar so como orquestrador.
- Extrair o restante do fluxo de carregamento e selecao de tela para helpers puros.
- Quebrar `frontend/src/screens/FormListScreen.jsx` em componentes menores de item, filtros e acoes.
- Quebrar `frontend/src/screens/ResultsScreen.jsx` em blocos menores de resumo, lista e edicao.
- Revisar `frontend/src/screens/CreateFormScreen.jsx` para separar edicao de formulario, preview e regras de validacao.
- Revisar `frontend/src/screens/PublicFormScreen.jsx` e `frontend/src/screens/PublicEscalaScreen.jsx` para remover blocos visuais repetidos.
- Dividir `backend/routes/formRoutes.mjs` em handlers menores por subdominio.
- Dividir `backend/routes/adminRoutes.mjs` em partes menores para usuarios, catalogos e configuracoes criticas.
- Extrair helpers repetidos de auditoria e erro para evitar copy/paste entre rotas.
- Continuar a limpeza de referencias historicas que nao ajudam no fluxo atual.
- Remover documentos obsoletos quando deixarem de agregar contexto.

## Limpeza final

- Remover arquivos obsoletos depois de cada extracao.
- Confirmar que `frontend/dist/` nao fica versionado.
- Confirmar que artefatos de build e caches locais nao entram no repo.
- Manter a raiz do projeto livre de arquivos temporarios sem necessidade operacional.
