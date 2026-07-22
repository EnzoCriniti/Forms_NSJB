/**
 * @file frontend/src/AppShellContent.jsx
 * @summary Shell autenticado do frontend.
 * @responsibility Renderizar a navegacao principal e delegar telas do shell apos o login.
 */

import React, { useMemo, useState } from "react";
import { COLORS } from "./components/ui";
import { AppHeader } from "./components/AppHeader";
import { AppSidebar } from "./components/AppSidebar";
import { AppShellRoutes } from "./AppShellRoutes";
import { HeaderBackContext } from "./lib/headerBack";
import { getShellActions, getShellData, getShellSetters, getShellState } from "./lib/appShellObject";

export const AppShellContent = ({ app }) => {
  const [headerBack, setHeaderBack] = useState(null);
  const headerBackContext = useMemo(() => ({ setBack: setHeaderBack }), []);
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

  const pageTitle = (nav || []).find(item => item.key === screen)?.label || "";

  return (
    <HeaderBackContext.Provider value={headerBackContext}>
      <div className="app-root" style={{ fontFamily: "'Segoe UI', -apple-system, sans-serif", minHeight: "100vh", background: COLORS.surfaceAlt, color: COLORS.text }}>
        <div className="app-layout">
          <AppSidebar nav={nav} screen={screen} onNavigate={onNavigate} />
          <div className="app-shell-main">
            <AppHeader
              nav={nav}
              screen={screen}
              pageTitle={pageTitle}
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
              headerBack={headerBack}
            />
            <main className="app-main">
              <AppShellRoutes app={app} />
            </main>
          </div>
        </div>
      </div>
    </HeaderBackContext.Provider>
  );
};
