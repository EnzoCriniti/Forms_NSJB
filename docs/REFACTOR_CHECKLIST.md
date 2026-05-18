# Refactor Checklist

Checklist incremental para reduzir arquivos grandes, separar responsabilidades e evitar duplicacao.

## Concluido

- [x] `frontend/src/features/admin/AdminSettingsModal.jsx` dividido em paineis menores
- [x] `frontend/src/features/admin/adminAccessPanels.jsx`
- [x] `frontend/src/features/admin/adminCatalogPanels.jsx`
- [x] `frontend/src/features/admin/adminOrganizationPanels.jsx`
- [x] `frontend/src/features/admin/adminSecurityPanels.jsx`
- [x] `frontend/src/features/admin/adminShellPanels.jsx`
- [x] `frontend/src/features/events/components/`
- [x] `frontend/src/screens/createFormPanels.jsx`
- [x] `frontend/src/screens/createFormDomain.js`
- [x] `frontend/src/screens/resultsPanels.jsx`

## Proximos passos

- [ ] `frontend/src/App.jsx`
  - separar shell, rotas e regras de sessao
  - extrair helpers de navegacao e acesso
- [ ] `frontend/src/screens/CreateFormScreen.jsx`
  - revisar edicao de campos, modos e validacoes
  - mover blocos restantes para subcomponentes
- [ ] `frontend/src/features/admin/MessagingSettingsPanel.jsx`
  - dividir configuracao global, modelos e presets
- [ ] `frontend/src/screens/ResultsScreen.jsx`
  - revisar controle de planilha, filtros e exportacao
- [ ] `frontend/src/screens/PublicFormScreen.jsx`
  - separar layout interno/publico e componentes repetidos
- [ ] `frontend/src/screens/PublicEscalaScreen.jsx`
  - alinhar com o mesmo padrao do formulario publico
- [ ] Testes por dominio
  - adicionar/ajustar suites quando cada etapa for concluida

## Regra de trabalho

- Uma etapa por vez.
- Antes de mover arquivos, consultar `docs/AI_CODEMAP.md` e `docs/REUSO.md`.
- Ao terminar uma etapa, validar com `npm.cmd run build` e os testes relevantes.
- Se mudar comportamento, atualizar a documentacao ligada a area.
- Sempre registrar a entrega em commit objetivo.
