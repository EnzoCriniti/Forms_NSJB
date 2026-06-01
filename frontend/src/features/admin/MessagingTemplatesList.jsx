import React from "react";
import { Btn, COLORS } from "../../components/ui";
import { MESSAGE_TYPE_LABELS } from "./messagingSettingsShared";

export const MessagingTemplatesList = ({
  onEdit,
  onRequestDelete,
  templates,
}) => (
  <div>
    <h4 style={{ margin: "0 0 10px" }}>Modelos existentes</h4>
    {templates.length === 0 ? (
      <div style={{ border: `1px dashed ${COLORS.border}`, borderRadius: 8, padding: 18, color: COLORS.textSecondary, fontSize: 13 }}>
        Nenhum modelo cadastrado.
      </div>
    ) : (
      <div style={{ display: "grid", gap: 10 }}>
        {templates.map(template => (
          <div key={template.id} className="settings-row">
            <div style={{ minWidth: 0, flex: 1 }}>
              <strong>{template.name}</strong>
              <div>{MESSAGE_TYPE_LABELS[template.type] || template.type}</div>
            </div>
            <Btn v="secondary" sz="sm" onClick={() => onEdit(template)}>Editar</Btn>
            <Btn v="danger" sz="sm" onClick={() => onRequestDelete(template)}>Remover</Btn>
          </div>
        ))}
      </div>
    )}
  </div>
);
