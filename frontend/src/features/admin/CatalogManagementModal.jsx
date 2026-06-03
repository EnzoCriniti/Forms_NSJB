/**
 * @file frontend/src/features/admin/CatalogManagementModal.jsx
 * @summary Modal legado de catalogos administrativos.
 * @responsibility Exibir e remover classificacoes/presets quando o fluxo exigir esse modal.
 */

import React from "react";
import { COLORS, Btn } from "../../components/ui";
import { CatalogManagementLabelsList } from "./CatalogManagementLabelsList";
import { CatalogManagementPresetsList } from "./CatalogManagementPresetsList";

export const CatalogManagementModal = ({ labels, presets, onRemoveLabel, onRemovePreset, onClose }) => (
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
        <CatalogManagementLabelsList labels={labels} onRemoveLabel={onRemoveLabel} />
        <CatalogManagementPresetsList presets={presets} onRemovePreset={onRemovePreset} />
      </div>
    </div>
  </div>
);
