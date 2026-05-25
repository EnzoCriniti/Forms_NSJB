/**
 * @file frontend/src/lib/appShellBuilder.js
 * @summary Montagem do objeto do shell a partir do estado atual do App.
 * @responsibility Manter a composicao detalhada de state/data/actions fora de App.jsx.
 */

import { buildAppNavItems } from "./appNav";
import { buildShellApp } from "./appShellObject";

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
  state: {
    nav: buildAppNavItems({ currentUser, canCreateForms }),
    screen: state.screen,
    currentUser,
    theme,
    fontScale: state.fontScale,
    publicForm: state.publicForm,
    publicRoute: state.publicRoute,
    publicResultsEnabled: state.publicResultsEnabled,
    publicResultsView: state.publicResultsView,
    pinnedEventIds: state.pinnedEventIds,
    pinnedFormIds: state.pinnedFormIds,
    activeEventId: state.activeEventId,
    activeMessageId: state.activeMessageId,
    activeEvent: state.activeEvent,
    activeForm: state.activeForm,
    editingForm: state.editingForm,
    draftForm: state.draftForm,
    formDeleteKeyConfigured,
  },
  data,
  actions: {
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
  },
  setters: {
    setActiveMessageId,
    setActiveEventId,
    setScreen,
    setDraftForm,
    setEditingFormId,
    setActiveFormId,
  },
  permissions: {
    canCreateForms,
  },
});
