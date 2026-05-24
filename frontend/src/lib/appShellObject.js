/**
 * @file frontend/src/lib/appShellObject.js
 * @summary Montagem do objeto entregue ao shell visual.
 * @responsibility Centralizar a composicao das props do AppViewport/AppShellContent.
 */

export const buildShellApp = ({
  state,
  data,
  actions,
  setters,
  permissions,
}) => ({
  ...state,
  ...data,
  ...actions,
  ...setters,
  ...permissions,
});
