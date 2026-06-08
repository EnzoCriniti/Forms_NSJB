/**
 * @file frontend/src/lib/appControllerLifecycle.js
 * @summary Efeitos de ciclo de vida usados pelo controller do App.
 */

import { applyExternalPreferenceChange, applyFontScalePreference, applyThemePreference, persistPinnedEventsByUser, persistPinnedFormsByUser, persistSession } from "./appPreferences";
import { getPublicRouteFromLocation } from "./appPublicRoutes";
import { resolveAppDetailLoadRequest } from "./appDetailTarget";
import { useAppLifecycleBootstrapEffects } from "./appLifecycleBootstrapEffects";
import { useAppLifecycleDetailEffects } from "./appLifecycleDetailEffects";
import { useAppLifecycleNavigationEffects } from "./appLifecycleNavigationEffects";
import { useAppLifecyclePreferenceEffects } from "./appLifecyclePreferenceEffects";
import { useAppLifecycleSessionValidationEffects } from "./appLifecycleSessionValidationEffects";

export const useAppControllerLifecycle = ({
  activeForm,
  authToken,
  currentUser,
  detailLoading,
  error,
  escalaByForm,
  fontScale,
  invalidateSession,
  loadEscalaForForm,
  loadResponsesForForm,
  pinnedEventsByUser,
  pinnedFormsByUser,
  publicForm,
  publicResultsView,
  refreshBootstrap,
  refreshFormDeleteKeyStatus,
  responsesByForm,
  screen,
  session,
  setFontScale,
  setPublicRoute,
  setScreen,
  setSession,
  setTheme,
  theme,
}) => {
  useAppLifecycleBootstrapEffects({
    authToken,
    persistSession,
    refreshBootstrap,
    refreshFormDeleteKeyStatus,
    session,
    setSession,
  });

  useAppLifecyclePreferenceEffects({
    applyExternalPreferenceChange,
    applyFontScalePreference,
    applyThemePreference,
    fontScale,
    pinnedEventsByUser,
    pinnedFormsByUser,
    persistPinnedEventsByUser,
    persistPinnedFormsByUser,
    setFontScale,
    setTheme,
    theme,
  });

  useAppLifecycleNavigationEffects({
    currentUser,
    screen,
    setPublicRoute,
    setScreen,
    getPublicRouteFromLocation,
  });

  useAppLifecycleDetailEffects({
    activeForm,
    detailLoading,
    error,
    escalaByForm,
    loadEscalaForForm,
    loadResponsesForForm,
    publicForm,
    publicResultsView,
    resolveAppDetailLoadRequest,
    responsesByForm,
    screen,
  });

  useAppLifecycleSessionValidationEffects({
    authToken,
    invalidateSession,
    setSession,
  });
};
