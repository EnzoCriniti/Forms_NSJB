/**
 * @file frontend/src/AppShellContent.jsx
 * @summary Shell autenticado do frontend.
 * @responsibility Renderizar a navegacao principal e delegar telas do shell apos o login.
 */

import React from "react";
import { COLORS } from "./components/ui";
import { AppHeader } from "./components/AppHeader";
import { AppShellRoutes } from "./AppShellRoutes";
import { getShellActions, getShellState } from "./lib/appShellObject";

export const AppShellContent = ({ app }) => {
  const state = getShellState(app);
  const actions = getShellActions(app);
  const {
    nav,
    screen,
    currentUser,
    theme,
    fontScale,
  } = state;
  const {
    onNavigate,
    onIncreaseFontScale,
    onDecreaseFontScale,
    onToggleTheme,
    onOpenSettings,
    onLogin,
    onLogout,
  } = actions;

  return (
    <div className="app-root" style={{ fontFamily: "'Segoe UI', -apple-system, sans-serif", minHeight: "100vh", background: COLORS.surfaceAlt, color: COLORS.text }}>
      <AppHeader
        nav={nav}
        screen={screen}
        currentUser={currentUser}
        theme={theme}
        fontScale={fontScale}
        onNavigate={onNavigate}
        onIncreaseFontScale={onIncreaseFontScale}
        onDecreaseFontScale={onDecreaseFontScale}
        onToggleTheme={onToggleTheme}
        onOpenSettings={onOpenSettings}
        onLogin={onLogin}
        onLogout={onLogout}
      />
      <main className="app-main" style={{ maxWidth: 1120, margin: "0 auto", padding: "24px 20px" }}>
        <AppShellRoutes app={app} />
      </main>
    </div>
  );
};
