/**
 * @file frontend/src/lib/appShellBuilder.js
 * @summary Agregador historico da montagem do objeto do shell.
 * @responsibility Manter a composicao do shell em blocos pequenos e reutilizaveis.
 */

import { buildAppShellActions } from "./appShellActions";
import { buildAppShellData } from "./appShellData";
import { buildAppShellPermissions } from "./appShellPermissions";
import { buildAppShellSetters } from "./appShellSetters";
import { buildAppShellRuntimeState } from "./appShellState";
import { buildShellApp } from "./appShellObject";

export { buildAppShellData } from "./appShellData";
export { buildAppShellActions } from "./appShellActions";
export { buildAppShellSetters } from "./appShellSetters";
export { buildAppShellPermissions } from "./appShellPermissions";
export { buildAppShellState, buildAppShellRuntimeState } from "./appShellState";

export const buildAppShell = ({
  adminHandlers,
  canCreateForms,
  currentUser,
  data,
  eventHandlers,
  formHandlers,
  formDeleteKeyConfigured,
  navigate,
  sessionHandlers,
  setActiveEventId,
  setActiveFormId,
  setActiveMessageId,
  setDraftForm,
  setEditingFormId,
  setScreen,
  setTheme,
  state,
  theme,
}) => buildShellApp({
  state: buildAppShellRuntimeState({
    canCreateForms,
    currentUser,
    formDeleteKeyConfigured,
    state,
    theme,
  }),
  data,
  actions: buildAppShellActions({
    adminHandlers,
    eventHandlers,
    formHandlers,
    navigate,
    sessionHandlers,
    setTheme,
    theme,
  }),
  setters: buildAppShellSetters({
    setActiveMessageId,
    setActiveEventId,
    setScreen,
    setDraftForm,
    setEditingFormId,
    setActiveFormId,
  }),
  permissions: buildAppShellPermissions({ canCreateForms }),
});
