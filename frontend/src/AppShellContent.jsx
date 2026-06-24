/**
 * @file frontend/src/AppShellContent.jsx
 * @summary Shell autenticado do frontend.
 * @responsibility Renderizar a navegacao principal e delegar telas do shell apos o login.
 */

import React from "react";
import { COLORS } from "./components/ui";
import { AppHeader } from "./components/AppHeader";
import { AppShellRoutes } from "./AppShellRoutes";
import { getShellActions, getShellData, getShellSetters, getShellState } from "./lib/appShellObject";

export const AppShellContent = ({ app }) => {
  const state = getShellState(app);
  const data = getShellData(app);
  const actions = getShellActions(app);
  const setters = getShellSetters(app);
  const {
    nav,
    screen,
    currentUser,
    theme,
    fontScale,
    activeEventId,
    activeForm,
  } = state;
  const {
    events,
  } = data;
  const {
    onNavigate,
    onIncreaseFontScale,
    onDecreaseFontScale,
    onToggleTheme,
    onOpenSettings,
    onLogin,
    onLogout,
  } = actions;
  const {
    setActiveEventId,
    setScreen,
  } = setters;

  const handleBackFromDetail = () => {
    const activeEvent = (events || []).find(event => String(event.id) === String(activeEventId));
    const shouldReturnToEvent = Boolean(
      activeEvent
      && activeForm?.id
      && (activeEvent.formIds || []).some(formId => String(formId) === String(activeForm.id)),
    );

    if (shouldReturnToEvent) {
      setActiveEventId(activeEvent.id);
      setScreen("events");
      return;
    }

    onNavigate("list");
  };

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
        onBackFromDetail={handleBackFromDetail}
      />
      <main className="app-main" style={{ maxWidth: 1120, margin: "0 auto", padding: "24px 20px" }}>
        <AppShellRoutes app={app} />
      </main>
    </div>
  );
};
