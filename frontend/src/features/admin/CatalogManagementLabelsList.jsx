import React from "react";
import { Btn, COLORS } from "../../components/ui";

export const CatalogManagementLabelsList = ({ labels, onRemoveLabel }) => {
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
  );
};
