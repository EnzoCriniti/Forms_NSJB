import React from "react";
import { Btn } from "../../components/ui";

export const MessagingPresetsList = ({ presets, onEdit, onRequestDelete }) => (
  <div>
    <h4 className="msg-subtitle">Presets existentes</h4>
    {presets.length === 0 ? (
      <div className="msg-empty">Nenhum preset cadastrado.</div>
    ) : (
      <div className="msg-list">
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
