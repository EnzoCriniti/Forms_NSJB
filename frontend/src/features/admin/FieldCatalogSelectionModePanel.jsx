import React from "react";
import { COLORS } from "../../components/ui";

export const FieldCatalogSelectionModePanel = ({ selectionSource, setMembersSource, setExternalBaseSource }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
    <button
      onClick={setMembersSource}
      style={{ border: `1px solid ${selectionSource.kind !== "external_base" ? COLORS.primary : COLORS.border}`, background: selectionSource.kind !== "external_base" ? COLORS.primaryLight : COLORS.surface, color: selectionSource.kind !== "external_base" ? COLORS.primary : COLORS.textSecondary, borderRadius: 10, padding: "10px 12px", textAlign: "left", minHeight: 72 }}
    >
      <strong style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Base central de socios</strong>
      <span style={{ fontSize: 11 }}>Usa a base central como origem.</span>
    </button>
    <button
      onClick={setExternalBaseSource}
      style={{ border: `1px solid ${selectionSource.kind === "external_base" ? COLORS.primary : COLORS.border}`, background: selectionSource.kind === "external_base" ? COLORS.primaryLight : COLORS.surface, color: selectionSource.kind === "external_base" ? COLORS.primary : COLORS.textSecondary, borderRadius: 10, padding: "10px 12px", textAlign: "left", minHeight: 72 }}
    >
      <strong style={{ display: "block", fontSize: 12, marginBottom: 4 }}>Base externa sincronizada</strong>
      <span style={{ fontSize: 11 }}>Aponta para uma lista sincronizada.</span>
    </button>
  </div>
);
