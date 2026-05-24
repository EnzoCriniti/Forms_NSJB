/**
 * @file frontend/src/components/ui.jsx
 * @summary Componentes visuais base.
 * @responsibility Reunir cores, icones, badges e elementos de UI compartilhados.
 */

import React from "react";
import { Badge, StatusBadge, TypeBadge } from "./uiBadges";
import { Btn } from "./uiButton";
import { resolveActionErrorMessage } from "./uiErrors";
import { FeedbackBanner } from "./uiFeedback";
import { Icon, ThemeIcon } from "./uiIcons";
import { COLORS } from "./uiTheme";

export { Badge, Btn, COLORS, FeedbackBanner, Icon, StatusBadge, ThemeIcon, TypeBadge, resolveActionErrorMessage };

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

