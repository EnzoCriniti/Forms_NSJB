/**
 * @file frontend/src/AppViewport.jsx
 * @summary Orquestra os estados de alto nivel do app.
 * @responsibility Renderizar loading, erro, login, rotas publicas e o shell autenticado.
 */

import React from "react";
import { AppShellContent } from "./AppShellContent";
import { AppPublicViewport } from "./AppPublicViewport";
import { AppDetailLoadingGate, AppErrorGate, AppLoadingGate, AppLoginGate } from "./AppViewportGates";
import { resetPublicRouteNavigation } from "./lib/appViewportNavigation";
import { APP_VIEWPORT_MODES, resolveAppViewportMode } from "./lib/appViewportState";
import { getShellActions, getShellData, getShellState } from "./lib/appShellObject";

export const AppViewport = ({
  app,
  loading,
  error,
  refreshBootstrap,
  login,
  logout,
  theme,
  fontScale,
  increaseFontScale,
  decreaseFontScale,
  setTheme,
  setScreen,
  setPublicRoute,
}) => {
  const state = getShellState(app);
  const data = getShellData(app);
  const actions = getShellActions(app);
  const {
    currentUser,
    publicForm,
    publicResultsView,
    activeForm,
    screen,
  } = state;
  const {
    responsesByForm,
    escalaByForm,
  } = data;

  const backToPanel = () => resetPublicRouteNavigation({ currentUser, setPublicRoute, setScreen });
  const mode = resolveAppViewportMode({
    activeForm,
    currentUser,
    error,
    escalaByForm,
    loading,
    publicForm,
    publicResultsView,
    responsesByForm,
    screen,
  });

  if (mode === APP_VIEWPORT_MODES.loading) {
    return <AppLoadingGate />;
  }

  if (mode === APP_VIEWPORT_MODES.error) {
    return <AppErrorGate error={error} onRetry={() => refreshBootstrap({ preserveSelection: false })} />;
  }

  if (mode === APP_VIEWPORT_MODES.detailLoading) {
    return <AppDetailLoadingGate />;
  }

  if (mode === APP_VIEWPORT_MODES.public) {
    return <AppPublicViewport app={app} onBack={backToPanel} />;
  }

  if (mode === APP_VIEWPORT_MODES.login) {
    return (
      <AppLoginGate
        login={login}
        logout={logout}
        theme={theme}
        fontScale={fontScale}
        increaseFontScale={increaseFontScale}
        decreaseFontScale={decreaseFontScale}
        setTheme={setTheme}
        onOpenSettings={() => actions.onNavigate("settings")}
      />
    );
  }

  return <AppShellContent app={app} />;
};
