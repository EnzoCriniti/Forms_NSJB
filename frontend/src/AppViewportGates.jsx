/**
 * @file frontend/src/AppViewportGates.jsx
 * @summary Gates visuais de alto nivel do app.
 * @responsibility Renderizar loading, erro, espera de detalhe e login do viewport principal.
 */

import React from "react";
import { ThemeIcon } from "./components/ui";

const appVersion = import.meta.env.VITE_APP_VERSION || "dev";
const loginVersionLabel = appVersion === "dev" ? "Versão de desenvolvimento" : `Versão ${appVersion}`;
import { AppStatusScreen } from "./components/AppStatusScreen";
import { AuthPanel } from "./features/auth/AuthPanel";

export const AppLoadingGate = () => (
  <AppStatusScreen loading tone="loading" message="Carregando aplicacao..." />
);

export const AppErrorGate = ({ error, onRetry }) => (
  <AppStatusScreen tone="error" title="Erro ao iniciar" message={error} actionLabel="Tentar novamente" onAction={onRetry} />
);

export const AppDetailLoadingGate = () => (
  <AppStatusScreen loading tone="loading" message="Carregando dados do formulário..." />
);

export const AppLoginGate = ({
  login,
  logout,
  theme,
  fontScale,
  increaseFontScale,
  decreaseFontScale,
  setTheme,
  onOpenSettings,
}) => (
  <div className="login-screen-root">
    <header className="login-screen-topbar">
      <span className="login-screen-brand">
        <span className="login-screen-mark">NF</span>
        <strong className="login-screen-brand-name">NSJB Forms</strong>
      </span>
      <button
        type="button"
        className="login-screen-theme"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        title={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
        aria-label={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
      >
        <ThemeIcon theme={theme} />
      </button>
    </header>
    <main className="login-screen-main">
      <div className="login-screen">
        <div className="login-screen__header">
          <div className="login-screen__eyebrow">Acesso restrito</div>
          <h2 className="login-screen__title">Entrar no painel</h2>
          <p className="login-screen__lead">
            Use suas credenciais de administrador ou visualização para acessar formulários, escalas e relatórios.
          </p>
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
          onOpenSettings={onOpenSettings}
          variant="sheet"
        />
      </div>
    </main>
    <footer className="login-screen-foot">{loginVersionLabel}</footer>
  </div>
);
