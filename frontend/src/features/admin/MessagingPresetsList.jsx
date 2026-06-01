import React from "react";
import { Btn, COLORS } from "../../components/ui";

export const MessagingPresetsList = ({ presets, onEdit, onRequestDelete }) => (
  <div>
    <h4 style={{ margin: "0 0 10px" }}>Presets existentes</h4>
    {presets.length === 0 ? (
      <div style={{ border: `1px dashed ${COLORS.border}`, borderRadius: 8, padding: 18, color: COLORS.textSecondary, fontSize: 13 }}>
        Nenhum preset cadastrado.
      </div>
    ) : (
      <div style={{ display: "grid", gap: 10 }}>
        {presets.map(preset => (
          <div key={preset.id} className="settings-row">
            <div style={{ minWidth: 0, flex: 1 }}>
              <strong>{preset.name}</strong>
              <div>{preset.personKeys.length} pessoa(s)</div>
            </div>
            <Btn v="secondary" sz="sm" onClick={() => onEdit(preset)}>Editar</Btn>
            <Btn v="danger" sz="sm" onClick={() => onRequestDelete(preset)}>Remover</Btn>
          </div>
        ))}
      </div>
    )}
  </div>
);
