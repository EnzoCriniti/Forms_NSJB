/**
 * @file frontend/src/components/AppHeader.jsx
 * @summary Cabecalho principal do frontend.
 * @responsibility Exibir navegacao, marca e controles de sessao no topo.
 */

import React, { useEffect, useState } from "react";
import appData from "../data/appData.json";
import { AuthPanel } from "../features/auth/AuthPanel";
import { Icon } from "./ui";

export const AppHeader = ({
  nav,
  screen,
  currentUser,
  theme,
  fontScale,
  onNavigate,
  onIncreaseFontScale,
  onDecreaseFontScale,
  onToggleTheme,
  onOpenSettings,
  onLogin,
  onLogout,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const canOpenDrawer = Boolean(currentUser);

  useEffect(() => {
    setDrawerOpen(false);
  }, [screen]);

  const navigateAndClose = nextScreen => {
    setDrawerOpen(false);
    onNavigate(nextScreen);
  };

  const openSettingsAndClose = () => {
    setDrawerOpen(false);
    onOpenSettings();
  };

  const logoutAndClose = () => {
    setDrawerOpen(false);
    onLogout();
  };

  const toggleThemeAndClose = () => {
    onToggleTheme();
  };

  return (
    <>
      <header className="app-header" data-screen={screen} style={{ background: "var(--primary)", padding: "12px 24px", display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          {canOpenDrawer && (
            <button
              type="button"
              className="app-header__menu-toggle"
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menu"
              style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 12, border: "none", background: "rgba(255,255,255,0.12)", color: "#fff", cursor: "pointer", flex: "0 0 auto" }}
            >
              <Icon name="menu" size={18} />
            </button>
          )}
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#fff", flex: "0 0 auto" }}>NF</div>
          <span title={`Dados base JSON v${appData.version}`} style={{ fontWeight: 700, fontSize: 16, color: "#fff", letterSpacing: 0, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>NSJB Forms</span>
        </div>
        <nav className="app-nav" style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
          {nav.map(n => (
            <button
              key={n.key}
              onClick={() => onNavigate(n.key)}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                border: "none", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                background: screen === n.key ? "rgba(255,255,255,0.2)" : "transparent",
                color: screen === n.key ? "#fff" : "rgba(255,255,255,0.7)",
              }}
            >
              <Icon name={n.icon} size={14} />
              {n.label}
            </button>
          ))}
        </nav>
        <div className="app-header__session">
          <AuthPanel
            user={currentUser}
            onLogin={onLogin}
            onLogout={onLogout}
          theme={theme}
          fontScale={fontScale}
          onIncreaseTextSize={onIncreaseFontScale}
          onDecreaseTextSize={onDecreaseFontScale}
          onToggleTheme={onToggleTheme}
          onOpenSettings={onOpenSettings}
        />
        </div>
      </header>
      {canOpenDrawer && drawerOpen && (
        <div className="app-header-drawer" role="dialog" aria-modal="true" aria-label="Menu principal">
          <button
            type="button"
            className="app-header-drawer__backdrop"
            aria-label="Fechar menu"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="app-header-drawer__panel">
            <div className="app-header-drawer__top">
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.6 }}>Menu</div>
                <strong style={{ fontSize: 16, color: "var(--text)" }}>NSJB Forms</strong>
              </div>
              <button type="button" className="app-header-drawer__close" aria-label="Fechar menu" onClick={() => setDrawerOpen(false)}>
                <Icon name="close" size={18} />
              </button>
            </div>
            {nav.length > 0 && (
              <div className="app-header-drawer__nav">
                {nav.map(n => (
                  <button
                    key={n.key}
                    onClick={() => navigateAndClose(n.key)}
                    className="app-header-drawer__nav-item"
                    data-active={screen === n.key}
                  >
                    <span className="app-header-drawer__nav-icon">
                      <Icon name={n.icon} size={16} />
                    </span>
                    <span>
                      <strong>{n.label}</strong>
                      <small>{n.key === "dashboard" ? "Visao geral" : n.key === "list" ? "Formularios e filtros" : "Criar e publicar"}</small>
                    </span>
                  </button>
                ))}
              </div>
            )}
            <div className="app-header-drawer__section">
              <div className="app-header-drawer__section-label">Conta</div>
              <div className="app-header-drawer__account">
                <strong>{currentUser?.name || "Usuario"}</strong>
                <small>{currentUser?.role === "admin" ? "Administrador" : "Visualizacao"}</small>
              </div>
              <div className="app-header-drawer__actions">
                <button type="button" className="app-header-drawer__action" onClick={toggleThemeAndClose}>
                  <span>{theme === "dark" ? "Modo claro" : "Modo escuro"}</span>
                </button>
                <button type="button" className="app-header-drawer__action" onClick={onDecreaseFontScale} disabled={fontScale <= 0.9}>
                  <span>Diminuir fonte</span>
                </button>
                <button type="button" className="app-header-drawer__action" onClick={onIncreaseFontScale} disabled={fontScale >= 1.3}>
                  <span>Aumentar fonte</span>
                </button>
                {currentUser?.role === "admin" && (
                  <button type="button" className="app-header-drawer__action" onClick={openSettingsAndClose}>
                    <span>Configuracoes</span>
                  </button>
                )}
                <button type="button" className="app-header-drawer__action" onClick={logoutAndClose}>
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
