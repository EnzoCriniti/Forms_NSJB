/**
 * @file frontend/src/components/LoginModal.jsx
 * @summary Modal de login do frontend.
 * @responsibility Centralizar a entrada de credenciais fora do App principal.
 */

import React from "react";
import { AuthPanel } from "../features/auth/AuthPanel";
import { Btn } from "./ui";

export const LoginModal = ({ open, onClose, onLogin, onLogout, theme, fontScale, onIncreaseTextSize, onDecreaseTextSize, onToggleTheme, onOpenSettings }) => {
  if (!open) return null;

  return (
    <div className="modal-backdrop login-backdrop" onClick={onClose}>
      <div className="modal-card login-modal-card" onClick={event => event.stopPropagation()} style={{ width: "min(520px, 100%)" }}>
        <div className="login-modal-header" style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22 }}>Acesso</h2>
          </div>
          <Btn v="ghost" sz="sm" onClick={onClose}>
            Fechar
          </Btn>
        </div>
        <AuthPanel
          user={null}
          onLogin={onLogin}
          onLogout={onLogout}
          theme={theme}
          fontScale={fontScale}
          onIncreaseTextSize={onIncreaseTextSize}
          onDecreaseTextSize={onDecreaseTextSize}
          onToggleTheme={onToggleTheme}
          onOpenSettings={onOpenSettings}
          variant="sheet"
        />
      </div>
    </div>
  );
};
