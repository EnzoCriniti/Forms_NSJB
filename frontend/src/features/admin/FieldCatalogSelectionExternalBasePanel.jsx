import React from "react";
import { COLORS } from "../../components/ui";
import { ADMIN_INPUT_STYLE } from "./adminSettingsConstants";

export const FieldCatalogSelectionExternalBasePanel = ({
  selectionSource,
  externalBases,
  setExternalBaseId,
}) => (
  <div style={{ display: "grid", gap: 6 }}>
    <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Base externa vinculada</label>
    <select
      value={selectionSource.externalBaseId || ""}
      onChange={event => setExternalBaseId(event.target.value)}
      style={ADMIN_INPUT_STYLE}
    >
      <option value="">Selecione uma base externa</option>
      {externalBases.filter(base => base.active !== false).map(base => <option key={base.id} value={base.id}>{base.name}</option>)}
    </select>
    <div style={{ fontSize: 11, color: COLORS.textMuted }}>
      O campo vai usar as opcoes sincronizadas desta base como origem.
    </div>
  </div>
);
