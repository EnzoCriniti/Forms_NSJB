/**
 * @file frontend/src/AppViewportGates.jsx
 * @summary Gates visuais de alto nivel do app.
 * @responsibility Renderizar loading, erro, espera de detalhe e login do viewport principal.
 */

import React from "react";
import { COLORS } from "./components/ui";
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
  <AppStatusScreen width={480} tone="info">
    <div className="login-screen">
      <div className="login-screen__header" style={{ marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 20 }}>Acesso restrito</h2>
        <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 13 }}>Entre com sua conta para acessar a pagina inicial e os formularios internos.</p>
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
  </AppStatusScreen>
);
