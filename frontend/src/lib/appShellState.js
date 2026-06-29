import { buildAppNavItems } from "./appNav";

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
  publicEvent,
  publicForm,
  publicResultsEnabled,
  publicResultsView,
  publicRoute,
  screen,
}) => ({
  screen,
  fontScale,
  publicEvent,
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
