# Refactor Execution Checklist

Checklist operacional para continuar a refatoracao sem depender de decisoes grandes por etapa.

## Regras de execucao

- Trabalhar em lotes pequenos, com commit objetivo por bloco concluido.
- Antes de mudar area mapeada, consultar `docs/AI_CODEMAP.md` e `docs/REUSO.md`.
- Cada correcao de bug deve ter teste novo ou ajuste de teste cobrindo a regressao.
- Depois de cada lote, rodar os testes relevantes e `npm run build`.
- Atualizar este checklist e os mapas quando uma relacao importante entre arquivos ficar clara.

## App shell

- [x] Extrair regras de navegacao de `frontend/src/App.jsx` para helper puro.
- [x] Cobrir helper de navegacao com teste de dominio.
- [x] Extrair seletores derivados do shell quando reduzirem duplicacao.
- [x] Revisar handlers de bootstrap que ainda repetem `replaceBootstrapList`.
- [x] Validar com `test:ui -- appBootstrap appHeader appSaveFlow` e `build`.

## Criacao de formulario

- [x] Reduzir o bloco de estado do editor em `frontend/src/screens/CreateFormScreen.jsx`.
- [x] Mover regras de draft de campo restantes para `frontend/src/screens/createFormDomain.js`.
- [x] Mover regras de escala restantes para helpers puros quando houver repeticao.
- [x] Revisar callbacks inline longos passados aos paineis.
- [x] Validar com `test:ui -- createFormScreen createFormDomain createFormModes` e `build`.

## UI compartilhada

- [ ] Mapear componentes grandes em `frontend/src/components/ui.jsx`.
- [ ] Extrair apenas componentes com fronteira clara e reuso existente.
- [ ] Manter exports publicos compativeis durante a transicao.
- [ ] Validar com testes das telas afetadas e `build`.

## Administracao

- [ ] Revisar wrappers repetidos entre `frontend/src/features/admin/*`.
- [ ] Consolidar somente wrappers com comportamento equivalente.
- [ ] Validar com `test:ui -- adminCatalog messagingSettingsPanel` e `build`.

## Estilos

- [ ] Mapear grupos repetidos em `frontend/src/styles.css`.
- [ ] Remover estilos mortos quando houver evidencia por busca.
- [ ] Evitar divisao de CSS sem ganho claro.
- [ ] Validar com testes de UI relevantes e `build`.
