/**
 * @file frontend/src/lib/appShellBuilder.js
 * @summary Montagem do objeto do shell a partir do estado atual do App.
 * @responsibility Manter a composicao detalhada de state/data/actions fora de App.jsx.
 */

import { buildAppNavItems } from "./appNav";
import { buildShellApp } from "./appShellObject";

export const buildAppShellData = ({
  escalaByForm,
  events,
  externalBases,
  fieldCatalog,
  forms,
  labels,
  membersConfig,
  messageTemplates,
  messagingConfig,
  people,
  personPresets,
  presets,
  responsesByForm,
  scaleTaskCatalog,
  users,
}) => ({
  forms,
  labels,
  people,
  presets,
  fieldCatalog,
  scaleTaskCatalog,
  events,
  messageTemplates,
  personPresets,
  messagingConfig,
  membersConfig,
  externalBases,
  users,
  responsesByForm,
  escalaByForm,
});

export const buildAppShellState = ({
  activeEvent,
  activeEventId,
  activeForm,
  activeMessageId,
  draftForm,
  editingForm,
  fontScale,
  pinnedEventIds,
  pinnedFormIds,
  publicForm,
  publicResultsEnabled,
  publicResultsView,
  publicRoute,
  screen,
}) => ({
  screen,
  fontScale,
  publicForm,
  publicRoute,
  publicResultsEnabled,
  publicResultsView,
  pinnedEventIds,
  pinnedFormIds,
  activeEventId,
  activeMessageId,
  activeEvent,
  activeForm,
  editingForm,
  draftForm,
});

export const buildAppShellRuntimeState = ({
  canCreateForms,
  currentUser,
  formDeleteKeyConfigured,
  state,
  theme,
}) => ({
  nav: buildAppNavItems({ currentUser, canCreateForms }),
  ...state,
  currentUser,
  theme,
  formDeleteKeyConfigured,
});

export const buildAppShellActions = ({
  adminHandlers,
  eventHandlers,
  formHandlers,
  navigate,
  sessionHandlers,
  setTheme,
  theme,
}) => ({
  onNavigate: navigate,
  onIncreaseFontScale: sessionHandlers.increaseFontScale,
  onDecreaseFontScale: sessionHandlers.decreaseFontScale,
  onToggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
  onOpenSettings: () => navigate("settings"),
  onLogin: sessionHandlers.login,
  onLogout: sessionHandlers.logout,
  ...eventHandlers,
  ...formHandlers,
  ...adminHandlers,
});

export const buildAppShellSetters = ({
  setActiveEventId,
  setActiveFormId,
  setActiveMessageId,
  setDraftForm,
  setEditingFormId,
  setScreen,
}) => ({
  setActiveMessageId,
  setActiveEventId,
  setScreen,
  setDraftForm,
  setEditingFormId,
  setActiveFormId,
});

export const buildAppShellPermissions = ({ canCreateForms }) => ({
  canCreateForms,
});

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
