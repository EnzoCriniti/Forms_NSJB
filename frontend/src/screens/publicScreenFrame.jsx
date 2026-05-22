/**
 * @file frontend/src/screens/publicScreenFrame.jsx
 * @summary Layout compartilhado para telas publicas e internas.
 * @responsibility Centralizar o container externo, o topo e o painel principal dos fluxos publicos.
 */

import React from "react";
import { COLORS, ScreenHeader } from "../components/ui";
import { PublicTopCompact } from "../components/publicUi";

export const PublicScreenLayout = ({ maxWidth, children }) => (
  <div style={{ maxWidth, margin: "0 auto" }}>
    {children}
  </div>
);

export const PublicScreenHeader = ({
  isInternal,
  form,
  onBack,
  readingControls,
  titleFallback,
  internalSubtitle,
  publicDescription,
  actionLabel = "",
  actionHref = "",
}) => (
  <>
    {isInternal ? (
      <ScreenHeader
        className="internal-response-header"
        title={form?.title || titleFallback}
        subtitle={internalSubtitle}
        titleStyle={{ color: COLORS.text }}
        subtitleStyle={{ color: COLORS.textMuted }}
        marginBottom={14}
      />
    ) : (
      <PublicTopCompact
        form={form}
        onBack={onBack}
        description={publicDescription}
        actionLabel={actionLabel}
        actionHref={actionHref}
        readingControls={readingControls}
      />
    )}
  </>
);

export const PublicScreenFrame = ({
  isInternal,
  cardClassName = "",
  cardStyle = {},
  children,
}) => {
  const combinedClassName = [
    isInternal ? "internal-response-card" : "public-response-card",
    cardClassName,
  ].filter(Boolean).join(" ");

  return (
    <div
      className={combinedClassName}
      style={{
        background: COLORS.surface,
        borderRadius: isInternal ? 12 : undefined,
        border: `1px solid ${COLORS.borderLight}`,
        borderTop: isInternal ? `1px solid ${COLORS.borderLight}` : "none",
        padding: 18,
        ...cardStyle,
      }}
    >
      {children}
    </div>
  );
};
