# AI Code Map

Mapa curto das areas mais mexidas por agentes.

## Configuracoes administrativas

- `frontend/src/screens/SettingsScreen.jsx`
  Tela dedicada da area administrativa. Encapsula o modal em modo tela.
- `frontend/src/features/admin/AdminSettingsModal.jsx`
  CRUDs de usuarios, base de socios, catalogos, classificacoes, templates, seguranca e auditoria.
- `frontend/src/features/members/MemberListConfigModal.jsx`
  Configuracao da base sincronizada de socios, mapeamento de colunas e preview da base atual.
- `frontend/src/lib/api.js`
  Cliente HTTP usado pelos CRUDs administrativos.

## Autenticacao

- `frontend/src/App.jsx`
  Quando nao ha sessao, renderiza a tela de login diretamente com `AuthPanel` em modo `sheet`.
- `frontend/src/features/auth/AuthPanel.jsx`
  Formulario reutilizavel de login/logout. O modo `sheet` e usado na tela de login.

## Vinculo com base personalizada

- `frontend/src/screens/CreateFormScreen.jsx`
  Configura campos do formulario e consome a biblioteca de campos. O tipo `person_select` e o elo com a base sincronizada.
  Campos de pessoa agora podem ser `primary` ou `secondary` em `memberBinding.role`.
  So o campo `primary` habilita respondente principal, faltantes, resumo e filtro por grau.
  A origem `members` vs `external_base` agora vem definida no catalogo do campo, e o formulario apenas consome essa configuracao.
- `frontend/src/features/admin/AdminSettingsModal.jsx`
  CRUD visual de campos base agora permite definir a origem do `person_select` no catalogo, incluindo base central ou base externa sincronizada.
- `frontend/src/lib/forms.js`
  Helpers para detectar campo principal e campos auxiliares ligados a pessoas e ajustar comportamentos de resultados.
  Tambem centraliza a leitura da origem `members` vs `external_base`.
- `shared/formRules.mjs`
  Validacao compartilhada dos valores de resposta dos campos.

## Resultados e planilha

- `frontend/src/screens/ResultsScreen.jsx`
  Renderiza a planilha de respostas, filtros, totalizacao e controles de zoom interno da tabela.
- `frontend/src/styles.css`
  Ajustes responsivos da planilha de resultados, incluindo barra de filtros e controles de zoom no mobile.

## Backend da base sincronizada

- `backend/services/membersSyncService.mjs`
  Salva a configuracao da origem externa e dispara a sincronizacao.
- `backend/services/membersSyncHelpers.mjs`
  Converte CSV e aplica o mapeamento de colunas da planilha para a base local.
- `backend/services/externalBasesService.mjs`
  CRUD e sincronizacao de bases externas reutilizaveis para campos de formulario.
- `backend/services/adminService.mjs`
  Orquestra os CRUDs administrativos e os catalogos globais.

## Testes ligados a essa area

- `tests/ui/adminCatalog.test.jsx`
  Cobertura da tela administrativa, catalogos, seguranca, base de socios, bases externas e auditoria.
- `tests/ui/createFormScreen.test.jsx`
  Cobertura do editor de campos e do vinculo com a base sincronizada ou bases externas.
- `tests/ui/appSaveFlow.test.jsx`
  Fluxo salvo do app com configuracao de resultados ligada a base vinculada.
