# Manutencao

Guia unico para manter o projeto consistente, refatorar sem perder o foco e registrar o que mudou.

## Como usar

- Veja `docs/MAPA-CODIGO.md` antes de procurar arquivos no repo inteiro.
- Comece pela area certa: frontend, backend, docker ou docs.
- Considere a documentacao como parte do codigo: se o comportamento mudou, atualize o texto correspondente.
- Atualize os caminhos da documentacao quando mover arquivos.
- Atualize os diagramas em `docs/diagramas/*.d2` e regenere os `*.svg` quando a arquitetura ou o fluxo mudar.
- Antes de remover qualquer resto de SQLite, rode `npm run verify:legacy-parity` e guarde o resultado da comparacao.
- Execute essa comparacao em uma janela de congelamento da escrita ou com a stack parada, senao a base viva pode divergir do snapshot.
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
- Continuar a retirada de qualquer caminho ou dependencia indireta de SQLite legado.
- Remover por completo a logica de importacao e compatibilidade com SQLite quando a migracao estiver fechada e validada.
- Remover os testes, snapshots e documentos que ainda existirem apenas para o caminho legado depois que a paridade estiver fechada.

## Checklist de corte final SQLite

- [ ] congelar escrita da aplicacao durante a janela de comparacao
- [ ] rodar `npm run verify:legacy-parity` contra o snapshot antigo e o PostgreSQL atual
- [ ] validar e registrar qualquer divergencia restante antes do corte
- [x] remover `backend/database/sqliteRuntime.mjs`
- [x] remover `backend/database/sqliteSchema.mjs`
- [x] remover `backend/database/drivers/sqliteDriver.mjs`
- [x] remover `backend/database/legacyImport.mjs`
- [x] remover `tests/legacyImport.test.mjs`
- [x] migrar os testes que ainda dependem de SQLite para o fluxo PostgreSQL
- [ ] revisar e cortar referencias de SQLite nos docs e diagramas
- [ ] atualizar `docs/MAPA-CODIGO.md` para refletir somente o caminho oficial
- [ ] validar `npm run test`, `npm run build`, `docker compose -f docker/compose.yml config`
- [ ] remover `storage/nsjb-forms.sqlite` depois da ultima comparacao de paridade

## Limpeza final

- Remover arquivos obsoletos depois de cada extracao.
- Confirmar que `frontend/dist/` nao fica versionado.
- Confirmar que artefatos de build e caches locais nao entram no repo.
- Manter a raiz do projeto livre de arquivos temporarios sem necessidade operacional.
