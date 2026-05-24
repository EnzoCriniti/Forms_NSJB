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
import { FieldControl, MetricCard, NotePanel, SplitSection, SurfacePanel } from "./uiLayout";
import { ConfirmModal } from "./uiModal";
import { COLORS } from "./uiTheme";

export { Badge, Btn, COLORS, ConfirmModal, FeedbackBanner, FieldControl, Icon, MetricCard, NotePanel, SplitSection, StatusBadge, SurfacePanel, ThemeIcon, TypeBadge, resolveActionErrorMessage };

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

