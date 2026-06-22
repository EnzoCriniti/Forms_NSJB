/**
 * @file frontend/src/components/AppHeader.jsx
 * @summary Cabecalho principal do frontend.
 * @responsibility Exibir navegacao, marca e controles de sessao no topo.
 */

import React, { useEffect, useState } from "react";
import appData from "../data/appData.json";
import { AuthPanel } from "../features/auth/AuthPanel";
import { FONT_SCALE_MAX, FONT_SCALE_MIN } from "../lib/appFontScale";
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
  const userInitials = String(currentUser?.name || "Usuário")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join("") || "U";

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
      <header className="app-header" data-screen={screen} style={{ background: "var(--header-bg)", padding: "12px 24px", display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          {currentUser && ["respond", "results"].includes(screen) && (
            <button
              type="button"
              className="app-header__back-button"
              onClick={() => onNavigate("list")}
              aria-label="Voltar para listagem"
              title="Voltar para listagem"
              style={{ width: 40, height: 40, display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 12, border: "none", background: "var(--header-control-bg)", color: "var(--header-fg)", cursor: "pointer", flex: "0 0 auto" }}
            >
              <Icon name="back" size={18} />
            </button>
          )}
          {canOpenDrawer && (
            <button
              type="button"
              className="app-header__menu-toggle"
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menu"
              style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 12, border: "none", background: "var(--header-control-bg)", color: "var(--header-fg)", cursor: "pointer", flex: "0 0 auto" }}
            >
              <Icon name="menu" size={18} />
            </button>
          )}
          <span title={`Dados base JSON v${appData.version}`} style={{ fontWeight: 700, fontSize: 16, color: "var(--header-fg)", letterSpacing: 0, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>NSJB Forms</span>
        </div>
        <nav className="app-nav" style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
          {nav.map(n => (
            <button
              key={n.key}
              onClick={() => onNavigate(n.key)}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                border: "none", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                background: screen === n.key ? "var(--header-control-bg-strong)" : "transparent",
                color: screen === n.key ? "var(--header-fg)" : "var(--header-fg-muted)",
              }}
            >
              <Icon name={n.icon} size={14} />
              {n.label}
            </button>
          ))}
        </nav>
        {currentUser && (
          <div className="app-header__mobile-tools" aria-label="Ajustes de leitura">
            <button type="button" className="app-header__mobile-font-button" onClick={onDecreaseFontScale} disabled={fontScale <= FONT_SCALE_MIN} aria-label="Diminuir fonte">
              A-
            </button>
            <button type="button" className="app-header__mobile-font-button" onClick={onIncreaseFontScale} disabled={fontScale >= FONT_SCALE_MAX} aria-label="Aumentar fonte">
              A+
            </button>
          </div>
        )}
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
                <strong style={{ fontSize: 13, color: "var(--text)" }}>NSJB Forms</strong>
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
                    <strong>{n.label}</strong>
                  </button>
                ))}
              </div>
            )}
            <div className="app-header-drawer__section">
              <div className="app-header-drawer__section-label">Conta</div>
              <div className="app-header-drawer__account">
                <span className="app-header-drawer__account-badge">{userInitials}</span>
                <div>
                  <strong>{currentUser?.name || "Usuário"}</strong>
                  <small>{currentUser?.role === "admin" ? "Administrador" : "Visualização"}</small>
                </div>
              </div>
              <div className="app-header-drawer__actions">
                <button type="button" className="app-header-drawer__action" onClick={toggleThemeAndClose}>
                  <span>{theme === "dark" ? "Modo claro" : "Modo escuro"}</span>
                </button>
                {currentUser?.role === "admin" && (
                  <button type="button" className="app-header-drawer__action app-header-drawer__action--primary" onClick={openSettingsAndClose}>
                    <span>Configurações</span>
                  </button>
                )}
                <button type="button" className="app-header-drawer__action app-header-drawer__action--danger" onClick={logoutAndClose}>
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
