/**
 * @file frontend/src/AppViewport.jsx
 * @summary Orquestra os estados de alto nivel do app.
 * @responsibility Renderizar loading, erro, login, rotas publicas e o shell autenticado.
 */

import React from "react";
import { COLORS } from "./components/ui";
import { AppStatusScreen } from "./components/AppStatusScreen";
import { AuthPanel } from "./features/auth/AuthPanel";
import { AppShellContent } from "./AppShellContent";
import { AppPublicViewport } from "./AppPublicViewport";
import { resolveAppViewportTargetState } from "./lib/appDetailTarget";

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

  const backToPanel = () => {
    if (window.location.pathname.startsWith("/formularios/")) {
      window.history.pushState(null, "", "/");
    }
    window.location.hash = "";
    setPublicRoute(null);
    setScreen(currentUser?.id ? "events" : "list");
  };

  if (loading) {
    return <AppStatusScreen loading tone="loading" message="Carregando aplicaÃƒÂ§ÃƒÂ£o..." />;
  }

  if (error) {
    return <AppStatusScreen tone="error" title="Erro ao iniciar" message={error} actionLabel="Tentar novamente" onAction={() => refreshBootstrap({ preserveSelection: false })} />;
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
    return <AppStatusScreen loading tone="loading" message="Carregando dados do formulario..." />;
  }

  if (publicForm) {
    return <AppPublicViewport app={app} onBack={backToPanel} />;
  }

  if (!currentUser) {
    return (
      <AppStatusScreen width={480} tone="info">
        <div className="login-screen">
          <div className="login-screen__header" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.primary, fontWeight: 800 }}>NF</div>
            <div>
              <h2 style={{ margin: 0, fontSize: 20 }}>Acesso restrito</h2>
              <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 13 }}>Entre com sua conta para acessar a pÃ¡gina inicial e os formulÃ¡rios internos.</p>
            </div>
          </div>
          <AuthPanel
            user={null}
            onLogin={login}
            onLogout={logout}
            theme={theme}
            fontScale={fontScale}
            onIncreaseTextSize={increaseFontScale}
            onDecreaseTextSize={decreaseFontScale}
            onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
            onOpenSettings={() => app.onNavigate("settings")}
            variant="sheet"
          />
        </div>
      </AppStatusScreen>
    );
  }

  return <AppShellContent app={app} />;
};
