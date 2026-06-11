import React from "react";
import { Btn, COLORS } from "../../components/ui";

export const CatalogManagementPresetsList = ({ presets, onRemovePreset }) => {
  const row = {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto auto",
    gap: 10,
    alignItems: "center",
    padding: "10px 0",
    borderBottom: `1px solid ${COLORS.borderLight}`,
    fontSize: 12,
  };

  return (
    <section>
      <h4 style={{ margin: "0 0 8px", fontSize: 14 }}>Presets</h4>
      {presets.map(preset => (
        <div key={preset.id} style={row}>
          <div style={{ minWidth: 0 }}>
            <strong style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{preset.name}</strong>
            <div style={{ color: COLORS.textMuted, marginTop: 2 }}>{preset.type === "escala_organ" ? "Escala da Organ" : "Presença"} • {preset.fields} campos • Criado por {preset.createdBy || "Sistema"}</div>
          </div>
          <span style={{ color: COLORS.textMuted }}>#{preset.id}</span>
          <Btn v="danger" sz="sm" icon="trash" onClick={() => onRemovePreset(preset.id)}>Remover</Btn>
        </div>
      ))}
    </section>
  );
};
