# Checklist de Refatoracao Pendente

Backlog vivo para continuar a limpeza sem perder o foco.

## Ordem sugerida

- [ ] Ler `docs/AI_CODEMAP.md` antes de abrir novos arquivos.
- [ ] Tratar primeiro os arquivos centrais que ainda concentram estado e renderizacao.
- [ ] Extrair um bloco pequeno por vez.
- [ ] Atualizar `docs/AI_CODEMAP.md` sempre que mover ou criar modulos.
- [ ] Adicionar ou ajustar teste sempre que um bug for encontrado.
- [ ] Validar a mudanca com `npm run test`, `npm run build` e `docker compose -f docker/compose.yml config` quando a area tocar o fluxo principal.
- [ ] Registrar cada corte relevante em commit separado.
- [ ] Remover `dist/` e outros artefatos temporarios antes de fechar a rodada.

## Frontend

- [ ] Reduzir ainda mais `frontend/src/App.jsx` para ficar só como orquestrador.
- [ ] Extrair o restante do fluxo de carregamento e selecao de tela para hooks ou helpers puros.
- [ ] Quebrar `frontend/src/screens/FormListScreen.jsx` em componentes menores de item, filtros e acoes.
- [ ] Quebrar `frontend/src/screens/ResultsScreen.jsx` em blocos menores de resumo, lista e edicao.
- [ ] Revisar `frontend/src/screens/CreateFormScreen.jsx` para separar edicao de formulario, preview e regras de validacao.
- [ ] Revisar `frontend/src/screens/PublicFormScreen.jsx` e `frontend/src/screens/PublicEscalaScreen.jsx` para remover blocos visuais repetidos.
- [ ] Consolidar componentes repetidos em `frontend/src/components/` em vez de manter JSX grande dentro das screens.
- [ ] Criar testes de UI para qualquer componente novo extraido.

## Backend

- [ ] Dividir `backend/routes/formRoutes.mjs` em handlers menores por subdominio.
- [ ] Dividir `backend/routes/adminRoutes.mjs` em partes menores para usuarios, catalogos e configuracoes criticas.
- [ ] Extrair helpers repetidos de auditoria e erro para evitar copy/paste entre rotas.
- [ ] Revisar `backend/services/` para separar regras grandes de negocio quando surgirem novos pontos de complexidade.
- [ ] Continuar a retirada de qualquer caminho ou dependencia indireta de SQLite legado.
- [ ] Manter cada mudança de comportamento coberta por teste de API.

## Testes

- [ ] Reforcar a cobertura dos componentes novos extraidos do frontend.
- [ ] Adicionar regressao para qualquer bug encontrado durante a refatoracao.
- [ ] Preferir teste de contrato quando a mudança tocar rotas, payloads ou auditoria.
- [ ] Evitar alterar comportamento sem atualizar teste correspondente.

## Documentacao

- [ ] Atualizar `README.md` quando o fluxo de uso mudar.
- [ ] Atualizar `docs/AI_CODEMAP.md` depois de cada extração relevante.
- [ ] Manter `docs/IA-LOG.md` apenas como historico.
- [ ] Revisar periodicamente `docs/MANUTENCAO.md` para manter as regras curtas e praticas.

## Limpeza final

- [ ] Remover arquivos obsoletos que sobrarem apos cada extração.
- [ ] Confirmar que `frontend/dist/` nao fica versionado.
- [ ] Confirmar que artefatos de build e caches locais nao entram no repo.
- [ ] Manter a raiz do projeto livre de arquivos temporarios sem necessidade operacional.
