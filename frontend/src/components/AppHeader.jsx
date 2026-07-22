/**
 * @file frontend/src/components/AppHeader.jsx
 * @summary Cabecalho principal do frontend (topbar enxuta).
 * @responsibility No desktop mostra titulo/contexto da tela e as acoes de sessao;
 * no mobile vira uma barra compacta com marca, menu (drawer) e ajustes de leitura.
 */

import React, { useEffect, useState } from "react";
import { AuthPanel } from "../features/auth/AuthPanel";
import { FONT_SCALE_MAX, FONT_SCALE_MIN } from "../lib/appFontScale";
import { Icon } from "./ui";
import { StarMark } from "./StarMark";

export const AppHeader = ({
  nav,
  screen,
  pageTitle,
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
  onBackFromDetail,
  headerBack,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const canOpenDrawer = Boolean(currentUser);
  const showBack = currentUser && (headerBack || ["respond", "results"].includes(screen));
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

  const runBack = () => {
    if (headerBack) {
      headerBack.run();
      return;
    }
    if (onBackFromDetail) {
      onBackFromDetail();
      return;
    }
    onNavigate("list");
  };

  return (
    <>
      <header className="app-header" data-screen={screen}>
        <div className="app-header__left">
          {showBack && (
            <button
              type="button"
              className="app-header__icon-btn app-header__back-button"
              onClick={runBack}
              aria-label={headerBack ? headerBack.label : "Voltar para listagem"}
              title={headerBack ? headerBack.label : "Voltar para listagem"}
            >
              <Icon name="back" size={18} />
            </button>
          )}
          {canOpenDrawer && (
            <button
              type="button"
              className="app-header__icon-btn app-header__menu-toggle"
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menu"
            >
              <Icon name="menu" size={18} />
            </button>
          )}
          <span className="app-header__brand">
            <StarMark size={20} color="#ffffff" />
            <span className="app-header__brand-name">NSJB Forms</span>
          </span>
          {pageTitle && <span className="app-header__title">{pageTitle}</span>}
        </div>
        <div className="app-header__right">
          {currentUser && (
            <div className="app-header__mobile-tools" aria-label="Ajustes de leitura">
              <button type="button" className="app-header__mobile-font-button" onClick={onDecreaseFontScale} disabled={fontScale <= FONT_SCALE_MIN} aria-label="Diminuir fonte">A-</button>
              <button type="button" className="app-header__mobile-font-button" onClick={onIncreaseFontScale} disabled={fontScale >= FONT_SCALE_MAX} aria-label="Aumentar fonte">A+</button>
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
                <button type="button" className="app-header-drawer__action" onClick={onToggleTheme}>
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
