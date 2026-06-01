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
  state,
  data,
  actions,
  setters,
  permissions,
  ...state,
  ...data,
  ...actions,
  ...setters,
  ...permissions,
});

export const getShellState = app => app.state || app;
export const getShellData = app => app.data || app;
export const getShellActions = app => app.actions || app;
export const getShellSetters = app => app.setters || app;
export const getShellPermissions = app => app.permissions || app;
