/**
 * @file frontend/src/lib/appLifecycleEffects.js
 * @summary Efeitos de ciclo de vida do shell principal.
 * @responsibility Centralizar persistencia, bootstrap inicial, rota publica, detalhes e validacao de sessao.
 */

import { useEffect } from "react";

export const useAppLifecycleEffects = ({
  activeForm,
  applyExternalPreferenceChange,
  applyFontScalePreference,
  applyThemePreference,
  authToken,
  detailLoading,
  error,
  escalaByForm,
  fetchAuthMe,
  fontScale,
  invalidateSession,
  loadEscalaForForm,
  loadResponsesForForm,
  persistPinnedEventsByUser,
  persistPinnedFormsByUser,
  persistSession,
  pinnedEventsByUser,
  pinnedFormsByUser,
  publicForm,
  publicResultsView,
  refreshBootstrap,
  refreshFormDeleteKeyStatus,
  resolveAppDetailLoadRequest,
  responsesByForm,
  screen,
  session,
  setAuthToken,
  setFontScale,
  setPublicRoute,
  setScreen,
  setSession,
  setTheme,
  theme,
  getPublicRouteFromLocation,
  currentUser,
}) => {
  useEffect(() => {
    setAuthToken(authToken);
    persistSession(session);
  }, [authToken, session]);

  useEffect(() => {
    const restoreSession = async () => {
      if (!session) return;
      try {
        const result = await fetchAuthMe();
        setSession({
          user: result.user || session.user,
          token: session.token,
          expiresAt: result.expiresAt || session.expiresAt || null,
        });
      } catch {
        setSession(null);
        setAuthToken(null);
        persistSession(null);
      }
    };

    refreshBootstrap({ preserveSelection: false });
    refreshFormDeleteKeyStatus();
    restoreSession();
  }, []);

  useEffect(() => {
    applyThemePreference(theme);
  }, [theme]);

  useEffect(() => {
    applyFontScalePreference(fontScale);
  }, [fontScale]);

  useEffect(() => {
    const syncPreferences = event => applyExternalPreferenceChange({ event, setTheme, setFontScale });

    window.addEventListener("nsjb-preferences-change", syncPreferences);
    return () => window.removeEventListener("nsjb-preferences-change", syncPreferences);
  }, []);

  useEffect(() => {
    persistPinnedFormsByUser(pinnedFormsByUser);
  }, [pinnedFormsByUser]);

  useEffect(() => {
    persistPinnedEventsByUser(pinnedEventsByUser);
  }, [pinnedEventsByUser]);

  useEffect(() => {
    if (currentUser && screen === "list") {
      setScreen("events");
    }
  }, [currentUser?.id, currentUser?.role, screen]);

  useEffect(() => {
    const syncPublicRoute = () => setPublicRoute(getPublicRouteFromLocation());
    window.addEventListener("hashchange", syncPublicRoute);
    window.addEventListener("popstate", syncPublicRoute);
    return () => {
      window.removeEventListener("hashchange", syncPublicRoute);
      window.removeEventListener("popstate", syncPublicRoute);
    };
  }, []);

  useEffect(() => {
    if (error) return undefined;
    const loadRequest = resolveAppDetailLoadRequest({
      publicForm,
      publicResultsView,
      screen,
      activeForm,
      responsesByForm,
      escalaByForm,
      detailLoading,
    });
    if (!loadRequest) return undefined;

    if (loadRequest.kind === "escala") {
      loadEscalaForForm(loadRequest.formId);
    } else {
      loadResponsesForForm(loadRequest.formId);
    }

    return undefined;
  }, [
    activeForm?.id,
    activeForm?.type,
    detailLoading?.formId,
    detailLoading?.kind,
    error,
    escalaByForm,
    publicForm?.closing,
    publicForm?.id,
    publicForm?.status,
    publicForm?.type,
    publicResultsView,
    responsesByForm,
    screen,
  ]);

  useEffect(() => {
    if (!authToken) return undefined;

    let mounted = true;
    const validateSession = async () => {
      try {
        const result = await fetchAuthMe();
        if (!mounted) return;
        setSession(prev => prev ? {
          ...prev,
          user: result.user || prev.user,
          expiresAt: result.expiresAt || prev.expiresAt || null,
        } : prev);
      } catch (error) {
        if (!mounted) return;
        if (error?.status === 401 || error?.status === 403) {
          invalidateSession();
        }
      }
    };

    const timer = window.setInterval(validateSession, 30000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [authToken, publicForm]);
};
