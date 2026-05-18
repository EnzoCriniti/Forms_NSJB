# Refactor Structure Checklist

Checklist novo para organizar pastas, reduzir arquivos grandes e unificar duplicacoes de UI e regra.

## Objetivo

- Separar melhor `screens`, `features`, `components`, `lib` e `shared`.
- Tirar regra pura de dentro de telas sempre que houver reuso claro.
- Unificar blocos visuais repetidos antes de criar novos.
- Manter nomes publicos estaveis e alterar a estrutura so quando houver ganho real.

## Duplicacoes ja visiveis

- Topos internos e publicos com mesma intencao visual, mas implementados em arquivos diferentes.
- Editor de formulario com muitos blocos repetidos entre estado, montagem de payload e renderizacao.
- Paines de admin com wrappers e separadores parecidos em varias abas.
- Fluxo de leitura publica e interna com estruturas muito proximas.
- Estado de `App.jsx` ainda com handlers repetidos de listas, favoritos e eventos.

## Proximos passos

- [x] `frontend/src/screens/createFormPanels.jsx`
  - top, modo, tipo inicial e dados basicos movidos para `frontend/src/features/forms/createFormPanels/setupPanels.jsx`
  - lista de campos e editor movidos para `frontend/src/features/forms/createFormPanels/fieldPanels.jsx`
  - escala, resultados e rodape movidos para `frontend/src/features/forms/createFormPanels/finalPanels.jsx`
- [ ] `frontend/src/screens/createFormPanels.jsx` - restante
  - revisar duplicacao entre preview, escala, resultados e rodape
- [ ] `frontend/src/screens/CreateFormScreen.jsx`
  - reduzir orquestracao remanescente
  - remover qualquer regra que ainda possa viver no dominio
  - transicoes de modo e template ja foram movidas para `frontend/src/screens/createFormDomain.js`
- [ ] `frontend/src/App.jsx`
  - separar handlers restantes por dominio
  - revisar o que ainda merece helper em `lib/appBootstrap.js`
- [ ] `frontend/src/components/ui.jsx`
  - identificar componentes genericos que podem sair para arquivos menores
  - unificar wrappers visuais repetidos
- [ ] `frontend/src/screens/PublicFormScreen.jsx` e `frontend/src/screens/PublicEscalaScreen.jsx`
  - alinhar estrutura interna/publica
  - unificar seletores, modais e cabecalhos compartilhados
- [ ] `frontend/src/screens/ResultsScreen.jsx` e `frontend/src/screens/resultsPanels.jsx`
  - revisar se ainda existe duplicacao entre planilha, filtros e totalizacao
- [ ] `frontend/src/features/admin/*`
  - revisar wrappers e blocos repetidos entre abas do admin
- [ ] `frontend/src/styles.css`
  - mapear blocos de estilo repetidos
  - avaliar divisao por arquivos menores se houver ganho claro

## Regra de trabalho

- Uma etapa por vez.
- Antes de mover arquivos, consultar `docs/AI_CODEMAP.md` e `docs/REUSO.md`.
- Se uma estrutura nova puder absorver blocos duplicados, criar o compartilhado antes de mover tela.
- Ao terminar uma etapa, validar com `npm.cmd run build` e os testes relevantes.
- Registrar cada entrega em commit objetivo.
