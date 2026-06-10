/**
 * @file frontend/src/components/uiButton.jsx
 * @summary Botao compartilhado da UI base.
 * @responsibility Renderizar comandos com variantes, tamanhos, icones e estado de carregamento.
 */

import React from "react";
import { Icon } from "./uiIcons";
import { COLORS } from "./uiTheme";

export const Btn = ({ children, v = "primary", sz = "md", icon, onClick, style: extra, disabled, loading = false, type = "button", className = "", ...props }) => {
  const pad = sz === "sm" ? "6px 12px" : sz === "lg" ? "12px 24px" : "8px 16px";
  const fs = sz === "sm" ? 12 : sz === "lg" ? 15 : 13;
  const vars = {
    primary: { background: COLORS.primary, color: "var(--on-primary)" },
    secondary: { background: COLORS.surfaceAlt, color: COLORS.text, border: `1px solid ${COLORS.border}` },
    ghost: { background: "transparent", color: COLORS.textSecondary, padding: "6px 8px" },
    warning: { background: COLORS.warningLight, color: "var(--on-warning)", border: `1px solid ${COLORS.warning}` },
    danger: { background: COLORS.dangerLight, color: COLORS.danger },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-variant={v}
      data-size={sz}
      className={`ui-btn${className ? ` ${className}` : ""}`}
      {...props}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, border: "none", borderRadius: 8,
        cursor: disabled || loading ? "not-allowed" : "pointer", fontWeight: 600, fontFamily: "inherit",
        transition: "all 0.15s", opacity: disabled || loading ? 0.5 : 1, padding: pad, fontSize: fs,
        ...vars[v], ...extra,
      }}
    >
      {loading && <span className="ui-spinner" aria-hidden="true" />}
      {icon && !loading && <Icon name={icon} size={sz === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
};
