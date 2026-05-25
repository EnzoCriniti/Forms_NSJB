/**
 * @file frontend/src/lib/appSessionHandlers.js
 * @summary Montagem dos handlers de sessao, navegacao e preferencia visual do App.
 * @responsibility Agrupar wrappers de sessao/font/navegacao fora de App.jsx.
 */

import { invalidateAppSession, loginAppSession, logoutAppSession, navigateAppScreen, updateAppFontScale } from "./appSessionActions";

export const buildAppSessionHandlers = ({
  activeForm,
  canCreateForms,
  canViewForm,
  clampFontScale,
  currentUser,
  fontScaleStep,
  loginWithCredentials,
  logoutAuth,
  persistSession,
  resolveAppNavigation,
  setActiveFormId,
  setAuthToken,
  setDraftForm,
  setEditingFormId,
  setFontScale,
  setScreen,
  setSession,
}) => {
  const invalidateSession = () => {
    invalidateAppSession({
      persistSession,
      setActiveFormId,
      setAuthToken,
      setDraftForm,
      setEditingFormId,
      setScreen,
      setSession,
    });
  };

  return {
    decreaseFontScale: () => updateAppFontScale({ direction: "decrease", setFontScale, clampFontScale, fontScaleStep }),
    increaseFontScale: () => updateAppFontScale({ direction: "increase", setFontScale, clampFontScale, fontScaleStep }),
    invalidateSession,
    login: async (username, password) => loginAppSession({ username, password, loginWithCredentials, setSession }),
    logout: async () => {
      await logoutAppSession({ logoutAuth, invalidateSession });
    },
    navigate: (nextScreen, form) => {
      navigateAppScreen({
        nextScreen,
        form,
        activeForm,
        currentUser,
        canCreateForms,
        canViewForm,
        resolveAppNavigation,
        setActiveFormId,
        setDraftForm,
        setEditingFormId,
        setScreen,
      });
    },
  };
};
