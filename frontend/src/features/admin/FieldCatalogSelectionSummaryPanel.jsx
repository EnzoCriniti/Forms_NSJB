import React from "react";
import { COLORS, SurfacePanel } from "../../components/ui";
import { getExternalBaseName } from "./adminSettingsConstants";

export const FieldCatalogSelectionSummaryPanel = ({ selectionSource, externalBases }) => (
  <SurfacePanel style={{ display: "grid", gap: 10 }}>
    <div style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.4, color: COLORS.textMuted, marginBottom: 4 }}>
      Resumo do vínculo
    </div>
    <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text }}>
      {selectionSource.kind === "external_base"
        ? `Base externa sincronizada: ${getExternalBaseName(externalBases, selectionSource.externalBaseId)}`
        : "Base central de sócios"}
    </div>
  </SurfacePanel>
);
