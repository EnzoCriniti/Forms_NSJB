/**
 * @file frontend/src/lib/appSessionActions.js
 * @summary Acoes de sessao e navegacao do shell principal.
 * @responsibility Concentrar login, logout, invalidacao de sessao e decisao de navegacao fora de App.jsx.
 */

export const invalidateAppSession = ({
  persistSession,
  setActiveFormId,
  setAuthToken,
  setDraftForm,
  setEditingFormId,
  setScreen,
  setSession,
}) => {
  setSession(null);
  setAuthToken(null);
  persistSession(null);
  setActiveFormId(null);
  setEditingFormId(null);
  setDraftForm(null);
  setScreen("list");
};

export const loginAppSession = async ({
  username,
  password,
  loginWithCredentials,
  setSession,
}) => {
  const result = await loginWithCredentials({ username, password });
  setSession({
    user: result.user,
    token: result.token,
    expiresAt: result.expiresAt || null,
  });
  return result.user;
};

export const logoutAppSession = async ({
  logoutAuth,
  invalidateSession,
}) => {
  try {
    await logoutAuth();
  } catch {
    // Logout local continua efetivo mesmo se a revogacao remota falhar.
  }
  invalidateSession();
};

export const navigateAppScreen = ({
  nextScreen,
  form,
  activeForm,
  currentUser,
  canCreateForms,
  canViewForm,
  resolveAppNavigation,
  setActiveEventId,
  setActiveFormId,
  setDraftForm,
  setEditingFormId,
  setScreen,
}) => {
  const decision = resolveAppNavigation({
    nextScreen,
    form,
    activeForm,
    currentUser,
    canCreateForms,
    canViewForm,
  });

  if (decision.clearDraft) {
    setDraftForm(null);
  }
  if (Object.prototype.hasOwnProperty.call(decision, "editingFormId")) {
    setEditingFormId(decision.editingFormId);
  }
  if (decision.activeFormId) {
    setActiveFormId(decision.activeFormId);
  }
  if (Object.prototype.hasOwnProperty.call(decision, "activeEventId")) {
    setActiveEventId(decision.activeEventId);
  }
  setScreen(decision.screen);
};

export const updateAppFontScale = ({
  direction,
  setFontScale,
  clampFontScale,
  fontScaleStep,
}) => {
  const multiplier = direction === "decrease" ? -1 : 1;
  setFontScale(current => clampFontScale(current + (fontScaleStep * multiplier)));
};
