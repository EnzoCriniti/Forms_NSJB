# Reuso da criacao de formulario

Componentes e helpers que devem ser reutilizados antes de recriar UI no fluxo de criacao de formulario:

- `FormTypeSetupPanel`
- `FormBasicsPanel`
- `FormFooterPanel`
- `PresenceFieldsPanel`
- `ScaleEditorPanel`
- `ResultsConfigPanel`

Regras:

- As linhas internas de campos e totais devem continuar encapsuladas dentro dos paineis de dominio; nao exporte subcomponentes que so servem ao proprio arquivo.
- `createFormDomain.js` e apenas o barramento historico dos helpers puros de criacao; prefira importar os modulos `createForm*.js` especificos quando tocar em default, normalizacao, mutacoes reutilizaveis, validacao, estado derivado ou payload.
- `CreateFormScreen.jsx` deve ficar apenas com orquestracao de estado e integracao com esses blocos.
