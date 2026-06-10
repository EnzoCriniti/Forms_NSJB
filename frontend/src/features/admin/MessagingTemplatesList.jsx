import React from "react";
import { Btn } from "../../components/ui";
import { MESSAGE_TYPE_LABELS } from "./messagingSettingsShared";

export const MessagingTemplatesList = ({
  onEdit,
  onRequestDelete,
  templates,
}) => (
  <div>
    <h4 className="msg-subtitle">Modelos existentes</h4>
    {templates.length === 0 ? (
      <div className="msg-empty">Nenhum modelo cadastrado.</div>
    ) : (
      <div className="msg-list">
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
