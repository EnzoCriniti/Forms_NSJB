/**
 * @file frontend/src/components/ui.jsx
 * @summary Componentes visuais base.
 * @responsibility Reunir cores, icones, badges e elementos de UI compartilhados.
 */

import { Badge, StatusBadge, TypeBadge } from "./uiBadges";
import { Btn } from "./uiButton";
import { resolveActionErrorMessage } from "./uiErrors";
import { FeedbackBanner } from "./uiFeedback";
import { ScreenHeader } from "./uiHeader";
import { Icon, ThemeIcon } from "./uiIcons";
import { FieldControl, MetricCard, NotePanel, SplitSection, SurfacePanel } from "./uiLayout";
import { ConfirmModal } from "./uiModal";
import { COLORS } from "./uiTheme";

export { Badge, Btn, COLORS, ConfirmModal, FeedbackBanner, FieldControl, Icon, MetricCard, NotePanel, ScreenHeader, SplitSection, StatusBadge, SurfacePanel, ThemeIcon, TypeBadge, resolveActionErrorMessage };

