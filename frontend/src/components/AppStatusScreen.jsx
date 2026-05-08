/**
 * @file frontend/src/components/AppStatusScreen.jsx
 * @summary Estado de tela centralizado do frontend.
 * @responsibility Renderizar carregamento, erro e bloqueios de acesso em um layout unico.
 */

import React from "react";
import { COLORS, Btn } from "./ui";

export const AppStatusScreen = ({
  title,
  message,
  actionLabel,
  onAction,
  children,
  tone = "info",
  width = 460,
  loading = false,
}) => {
  const palette = {
    info: { background: COLORS.surface, border: COLORS.borderLight, accent: COLORS.primary },
    error: { background: COLORS.surface, border: COLORS.borderLight, accent: COLORS.danger },
    loading: { background: COLORS.surfaceAlt, border: COLORS.borderLight, accent: COLORS.primary },
  }[tone];

  return (
    <div className="app-root" style={{ minHeight: "100vh", background: COLORS.surfaceAlt, color: COLORS.text, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: `min(${width}px, 100%)`, background: palette.background, border: `1px solid ${palette.border}`, borderRadius: 18, padding: 28, boxShadow: "var(--shadow-md)" }}>
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", border: `4px solid ${COLORS.borderLight}`, borderTopColor: palette.accent, animation: "spin 0.9s linear infinite" }} />
          </div>
        )}
        {children || (
          <>
            <h2 style={{ marginTop: 0 }}>{title}</h2>
            <p style={{ color: COLORS.textSecondary }}>{message}</p>
            {actionLabel && onAction && <Btn onClick={onAction}>{actionLabel}</Btn>}
          </>
        )}
      </div>
    </div>
  );
};
