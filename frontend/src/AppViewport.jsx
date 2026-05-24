/**
 * @file frontend/src/AppViewport.jsx
 * @summary Orquestra os estados de alto nivel do app.
 * @responsibility Renderizar loading, erro, login, rotas publicas e o shell autenticado.
 */

import React from "react";
import { AppShellContent } from "./AppShellContent";
import { AppPublicViewport } from "./AppPublicViewport";
import { AppDetailLoadingGate, AppErrorGate, AppLoadingGate, AppLoginGate } from "./AppViewportGates";
import { resolveAppViewportTargetState } from "./lib/appDetailTarget";
import { resetPublicRouteNavigation } from "./lib/appViewportNavigation";

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
  const {
    currentUser,
    publicForm,
    publicResultsView,
    responsesByForm,
    escalaByForm,
    activeForm,
    screen,
  } = app;

  const backToPanel = () => resetPublicRouteNavigation({ currentUser, setPublicRoute, setScreen });

  if (loading) {
    return <AppLoadingGate />;
  }

  if (error) {
    return <AppErrorGate error={error} onRetry={() => refreshBootstrap({ preserveSelection: false })} />;
  }

  const { waitingForTarget } = resolveAppViewportTargetState({
    publicForm,
    publicResultsView,
    screen,
    activeForm,
    responsesByForm,
    escalaByForm,
  });
  if (waitingForTarget) {
    return <AppDetailLoadingGate />;
  }

  if (publicForm) {
    return <AppPublicViewport app={app} onBack={backToPanel} />;
  }

  if (!currentUser) {
    return (
      <AppLoginGate
        login={login}
        logout={logout}
        theme={theme}
        fontScale={fontScale}
        increaseFontScale={increaseFontScale}
        decreaseFontScale={decreaseFontScale}
        setTheme={setTheme}
        onOpenSettings={() => app.onNavigate("settings")}
      />
    );
  }

  return <AppShellContent app={app} />;
};
