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

## Vinculo com base personalizada

- `frontend/src/screens/CreateFormScreen.jsx`
  Configura campos do formulario e consome a biblioteca de campos. O tipo `person_select` e o elo com a base sincronizada.
- `frontend/src/lib/forms.js`
  Helpers para detectar campo vinculado a pessoas e ajustar comportamentos de resultados.
- `shared/formRules.mjs`
  Validacao compartilhada dos valores de resposta dos campos.

## Backend da base sincronizada

- `backend/services/membersSyncService.mjs`
  Salva a configuracao da origem externa e dispara a sincronizacao.
- `backend/services/membersSyncHelpers.mjs`
  Converte CSV e aplica o mapeamento de colunas da planilha para a base local.
- `backend/services/adminService.mjs`
  Orquestra os CRUDs administrativos e os catalogos globais.

## Testes ligados a essa area

- `tests/ui/adminCatalog.test.jsx`
  Cobertura da tela administrativa, catalogos, seguranca, base de socios e auditoria.
- `tests/ui/createFormScreen.test.jsx`
  Cobertura do editor de campos e do vinculo com a base sincronizada.
- `tests/ui/appSaveFlow.test.jsx`
  Fluxo salvo do app com configuracao de resultados ligada a base vinculada.
