/**
 * @file frontend/src/components/AppHeader.jsx
 * @summary Cabecalho principal do frontend.
 * @responsibility Exibir navegacao, marca e controles de sessao no topo.
 */

import React from "react";
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
}) => (
  <header className="app-header" data-screen={screen} style={{ background: "var(--primary)", padding: "12px 24px", display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#fff" }}>NF</div>
      <span title={`Dados base JSON v${appData.version}`} style={{ fontWeight: 700, fontSize: 16, color: "#fff", letterSpacing: 0 }}>NSJB Forms</span>
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
  </header>
);
