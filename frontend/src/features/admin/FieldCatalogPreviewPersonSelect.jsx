import React from "react";
import { COLORS } from "../../components/ui";

export const FieldCatalogPreviewPersonSelect = ({ draft, externalBase }) => (
  <>
    <select
      disabled
      style={{
        width: "100%",
        minHeight: 42,
        padding: "10px 12px",
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        background: COLORS.surface,
        color: COLORS.text,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <option>{draft.selectionSource?.kind === "external_base" ? "Selecione uma opção..." : "Selecione uma pessoa..."}</option>
    </select>
    <div style={{ marginTop: 8, fontSize: 11, color: COLORS.textMuted, lineHeight: 1.45 }}>
      {draft.selectionSource?.kind === "external_base"
        ? `Vínculo configurado: ${externalBase?.name || "base externa"}`
        : "Vínculo configurado: base central de sócios"}
    </div>
  </>
);
