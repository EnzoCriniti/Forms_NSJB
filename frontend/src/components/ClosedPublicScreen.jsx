import React from "react";
import { formatDateTime } from "../lib/forms";
import { PublicTopCompact } from "./PublicTopCompact";
import { COLORS, Icon } from "./ui";

export const ClosedPublicScreen = ({ form, onBack, actionLabel, actionHref, message, title = "Formulário fechado", readingControls }) => (
  <div style={{ maxWidth: 620, margin: "0 auto" }}>
    <PublicTopCompact form={form} onBack={onBack} actionLabel={actionLabel} actionHref={actionHref} readingControls={readingControls} />
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderTop: "none", borderRadius: "0 0 16px 16px", padding: "36px 24px", textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", background: COLORS.dangerLight, color: COLORS.danger }}><Icon name="warning" size={28} /></div>
      <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>{title}</h2>
      <p style={{ margin: "0 auto", maxWidth: 460, fontSize: 13, lineHeight: 1.55, color: COLORS.textSecondary }}>{message || form?.closingText || "Este formulário não está mais aceitando respostas."}</p>
      <p style={{ margin: "14px 0 0", fontSize: 12, color: COLORS.textMuted }}>Fechamento: {formatDateTime(form?.closing)}</p>
    </div>
  </div>
);
