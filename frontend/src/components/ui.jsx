/**
 * @file frontend/src/components/ui.jsx
 * @summary Componentes visuais base.
 * @responsibility Reunir cores, icones, badges e elementos de UI compartilhados.
 */

import React from "react";
import { Badge, StatusBadge, TypeBadge } from "./uiBadges";
import { resolveActionErrorMessage } from "./uiErrors";
import { Icon, ThemeIcon } from "./uiIcons";
import { COLORS } from "./uiTheme";

export { Badge, COLORS, Icon, StatusBadge, ThemeIcon, TypeBadge, resolveActionErrorMessage };

export const Btn = ({ children, v = "primary", sz = "md", icon, onClick, style: extra, disabled, loading = false, type = "button", className = "", ...props }) => {
  const pad = sz === "sm" ? "6px 12px" : sz === "lg" ? "12px 24px" : "8px 16px";
  const fs = sz === "sm" ? 12 : sz === "lg" ? 15 : 13;
  const vars = {
    primary: { background: COLORS.primary, color: "#fff" },
    secondary: { background: COLORS.surfaceAlt, color: COLORS.text, border: `1px solid ${COLORS.border}` },
    ghost: { background: "transparent", color: COLORS.textSecondary, padding: "6px 8px" },
    warning: { background: COLORS.warningLight, color: "#b86e00", border: `1px solid ${COLORS.warning}` },
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
    >{loading && <span className="ui-spinner" aria-hidden="true" />}{icon && !loading && <Icon name={icon} size={sz === "sm" ? 14 : 16} />}{children}</button>
  );
};

export const SurfacePanel = ({
  as: Component = "div",
  className = "",
  style,
  children,
  background = COLORS.surface,
  border = COLORS.borderLight,
  radius = 12,
  padding = 14,
}) => (
  <Component
    className={className}
    style={{
      background,
      border: `1px solid ${border}`,
      borderRadius: radius,
      padding,
      ...style,
    }}
  >
    {children}
  </Component>
);

export const MetricCard = ({ value, label, tone = COLORS.primary, background = COLORS.surface, border = COLORS.borderLight, style }) => (
  <SurfacePanel
    style={{ textAlign: "center", ...style }}
    background={background}
    border={border}
    radius={10}
    padding="12px 16px"
  >
    <div style={{ fontSize: 22, fontWeight: 700, color: tone }}>{value}</div>
    <div style={{ fontSize: 11, color: COLORS.textMuted }}>{label}</div>
  </SurfacePanel>
);

export const FieldControl = ({
  label,
  hint,
  children,
  className = "",
  style,
  labelStyle,
  hintStyle,
  required = false,
  htmlFor,
  actions,
}) => (
  <div className={className} style={{ display: "grid", gap: 6, ...style }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
      <label htmlFor={htmlFor} style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, ...labelStyle }}>
        {label}{required ? " *" : ""}
      </label>
      {actions}
    </div>
    {children}
  {hint && <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.45, ...hintStyle }}>{hint}</div>}
  </div>
);

export const NotePanel = ({ children, style, tone = "neutral" }) => {
  const palette = {
    neutral: { background: COLORS.surfaceAlt, border: COLORS.borderLight, color: COLORS.textSecondary },
    primary: { background: COLORS.primaryLight, border: COLORS.borderLight, color: COLORS.textSecondary },
    warning: { background: COLORS.warningLight, border: COLORS.warning, color: COLORS.textSecondary },
  }[tone] || { background: COLORS.surfaceAlt, border: COLORS.borderLight, color: COLORS.textSecondary };

  return (
    <div
      style={{
        background: palette.background,
        border: `1px solid ${palette.border}`,
        borderRadius: 10,
        padding: 12,
        fontSize: 12,
        color: palette.color,
        lineHeight: 1.55,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const SplitSection = ({
  className = "settings-grid",
  leftTitle,
  rightTitle,
  left,
  right,
  leftTitleStyle,
  rightTitleStyle,
  leftTitleProps = {},
  rightTitleProps = {},
  leftColStyle,
  rightColStyle,
  style,
}) => (
  <section className={className} style={style}>
    <div style={leftColStyle}>
      {leftTitle && <h4 style={{ margin: "0 0 10px", ...leftTitleStyle }} {...leftTitleProps}>{leftTitle}</h4>}
      {left}
    </div>
    <div style={rightColStyle}>
      {rightTitle && <h4 style={{ margin: "0 0 10px", ...rightTitleStyle }} {...rightTitleProps}>{rightTitle}</h4>}
      {right}
    </div>
  </section>
);

export const ScreenHeader = ({
  className = "",
  style,
  leading,
  title,
  subtitle,
  titleContent,
  actions,
  titleSize = 22,
  titleStyle,
  subtitleStyle,
  gap = 12,
  marginBottom = 24,
  alignItems = "center",
}) => (
  <div
    className={`screen-top-card${className ? ` ${className}` : ""}`}
    style={{
      display: "flex",
      alignItems,
      gap,
      marginBottom,
      flexWrap: "wrap",
      ...style,
    }}
  >
    {leading}
    <div style={{ minWidth: 0, flex: 1 }}>
      {titleContent || (
        <>
          {title && <h2 style={{ margin: 0, fontSize: titleSize, ...titleStyle }}>{title}</h2>}
          {subtitle && <p style={{ margin: "2px 0 0", fontSize: 13, color: COLORS.textMuted, ...subtitleStyle }}>{subtitle}</p>}
        </>
      )}
    </div>
    {actions}
  </div>
);

export const FeedbackBanner = ({ tone = "info", title, message, fixed = false }) => {
  if (!message) return null;
  const config = {
    success: { bg: "var(--feedback-success-bg)", border: "var(--feedback-success-border)", color: "var(--feedback-success-text)", icon: "check", label: title || "Sucesso" },
    error: { bg: "var(--feedback-error-bg)", border: "var(--feedback-error-border)", color: "var(--feedback-error-text)", icon: "warning", label: title || "Erro" },
    loading: { bg: "var(--feedback-loading-bg)", border: "var(--feedback-loading-border)", color: "var(--feedback-loading-text)", icon: "spinner", label: title || "Processando" },
    info: { bg: "var(--feedback-info-bg)", border: "var(--feedback-info-border)", color: "var(--feedback-info-text)", icon: "info", label: title || "Aviso" },
  }[tone] || null;
  if (!config) return null;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`ui-feedback ui-feedback--${tone}${fixed ? " ui-feedback--fixed" : ""}`}
      style={{ background: config.bg, borderColor: config.border, color: config.color }}
    >
      <span className="ui-feedback__icon" style={{ background: config.border, color: config.color }}>
        {config.icon === "spinner" ? <span className="ui-spinner" aria-hidden="true" /> : <Icon name={config.icon} size={14} />}
      </span>
      <div className="ui-feedback__content">
        <strong>{config.label}</strong>
        <span>{message}</span>
      </div>
    </div>
  );
};

export const ConfirmModal = ({
  open,
  title,
  message,
  children,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "danger",
  busy = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ width: "min(440px, 100%)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto", background: tone === "danger" ? COLORS.dangerLight : COLORS.warningLight, color: tone === "danger" ? COLORS.danger : COLORS.warning }}>
            <Icon name={tone === "danger" ? "trash" : "warning"} size={20} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 17 }}>{title}</h3>
            <p style={{ margin: "8px 0 0", color: COLORS.textSecondary, fontSize: 13, lineHeight: 1.5 }}>{message}</p>
          </div>
        </div>
        {children && <div style={{ marginTop: 16 }}>{children}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
          <Btn v="secondary" onClick={onCancel} disabled={busy}>{cancelLabel}</Btn>
          <Btn v={tone === "danger" ? "danger" : "warning"} onClick={onConfirm} loading={busy} disabled={confirmDisabled}>{confirmLabel}</Btn>
        </div>
      </div>
    </div>
  );
};

