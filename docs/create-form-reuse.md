# Reuso da criacao de formulario

Componentes e helpers que devem ser reutilizados antes de recriar UI no fluxo de criacao de formulario:

- `FormTypeSetupPanel`
- `FormBasicsPanel`
- `FieldEditorSourcePanel`
- `FieldEditorDefinitionPanel`
- `FieldEditorExtrasPanel`
- `FieldEditorActions`
- `FormFooterPanel`
- `PresenceFieldsPanel`
- `FormFieldRow`
- `ScaleEditorPanel`
- `ResultsConfigPanel`
- `ResultsTotalRow`

Regras:

- `FormFieldRow` deve ser usado para qualquer linha da lista de campos.
- `ResultsTotalRow` deve ser usado para qualquer linha do painel de totais.
- `createFormDomain.js` concentra helpers puros de default, normalizacao e validacao.
- `CreateFormScreen.jsx` deve ficar apenas com orquestracao de estado e integracao com esses blocos.
