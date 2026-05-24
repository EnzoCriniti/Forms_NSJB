import React from "react";
import { COLORS } from "./uiTheme";

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
