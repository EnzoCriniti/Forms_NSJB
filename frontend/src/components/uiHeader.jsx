import React from "react";
import { COLORS } from "./uiTheme";

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
