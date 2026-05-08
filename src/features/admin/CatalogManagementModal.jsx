/**
 * @file src/features/admin/CatalogManagementModal.jsx
 * @summary Modal legado de catalogos administrativos.
 * @responsibility Exibir e remover classificacoes/presets quando o fluxo exigir esse modal.
 */

import React from "react";
import { COLORS, Btn } from "../../components/ui";

export const CatalogManagementModal = ({ labels, presets, onRemoveLabel, onRemovePreset, onClose }) => {
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
    <div className="modal-backdrop">
      <div className="modal-card modal-card-wide">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <h3 style={{ margin: 0 }}>Cadastros do MVP</h3>
            <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 12 }}>Gerencie classificacoes e presets usados na criacao dos formularios.</p>
          </div>
          <Btn v="ghost" onClick={onClose}>Fechar</Btn>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <section>
            <h4 style={{ margin: "0 0 8px", fontSize: 14 }}>Classificacoes</h4>
            {labels.map(label => (
              <div key={label.id} style={row}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 99, background: label.color, flexShrink: 0 }} />
                    <strong style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label.name}</strong>
                  </div>
                  <div style={{ color: COLORS.textMuted, marginTop: 2 }}>Criado por {label.createdBy || "Sistema"}</div>
                </div>
                <span style={{ color: COLORS.textMuted }}>#{label.id}</span>
                <Btn v="danger" sz="sm" icon="trash" onClick={() => onRemoveLabel(label.id)}>Remover</Btn>
              </div>
            ))}
          </section>

          <section>
            <h4 style={{ margin: "0 0 8px", fontSize: 14 }}>Presets</h4>
            {presets.map(preset => (
              <div key={preset.id} style={row}>
                <div style={{ minWidth: 0 }}>
                  <strong style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{preset.name}</strong>
                  <div style={{ color: COLORS.textMuted, marginTop: 2 }}>{preset.type === "escala_organ" ? "Escala da Organ" : "Presenca"} • {preset.fields} campos • Criado por {preset.createdBy || "Sistema"}</div>
                </div>
                <span style={{ color: COLORS.textMuted }}>#{preset.id}</span>
                <Btn v="danger" sz="sm" icon="trash" onClick={() => onRemovePreset(preset.id)}>Remover</Btn>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
};
