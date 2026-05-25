/**
 * @file frontend/src/features/events/components/eventMessagesListPanel.jsx
 * @summary Lista visual de mensagens vinculadas a um evento.
 */

import React from "react";
import { Btn, COLORS, Icon } from "../../../components/ui";
import { MessageStatusBadge, MESSAGE_TYPE_LABELS } from "../../../components/MessageStatusBadge";

export const EventMessagesPanel = ({ messages, eligible, canManage, onCreate, onOpen }) => {
  if (!eligible) {
    return (
      <div style={{ border: `1px dashed ${COLORS.border}`, borderRadius: 8, padding: 18, color: COLORS.textSecondary, fontSize: 13 }}>
        Vincule um formulario de presenca ou escala da organ para habilitar mensagens neste evento.
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div style={{ border: `1px dashed ${COLORS.border}`, borderRadius: 8, padding: 18, color: COLORS.textSecondary, fontSize: 13, display: "grid", gap: 12, justifyItems: "start" }}>
        Nenhuma mensagem cadastrada neste evento.
        {canManage && onCreate && <Btn icon="plus" sz="sm" onClick={onCreate}>Nova mensagem</Btn>}
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {messages.map(message => (
        <div
          key={message.id}
          role="button"
          tabIndex={0}
          onClick={() => onOpen && onOpen(message)}
          onKeyDown={keyEvent => {
            if (keyEvent.key === "Enter" || keyEvent.key === " ") {
              keyEvent.preventDefault();
              onOpen && onOpen(message);
            }
          }}
          style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: 14, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
        >
          <div style={{ width: 38, height: 38, borderRadius: 10, background: COLORS.primaryLight, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="share" size={18} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <strong style={{ fontSize: 14 }}>{MESSAGE_TYPE_LABELS[message.type] || message.type}</strong>
              <MessageStatusBadge status={message.status} />
              {message.scheduledFor && (
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>
                  Agendada para {new Date(message.scheduledFor).toLocaleString("pt-BR")}
                </span>
              )}
              {message.sentAt && (
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>
                  Disparada em {new Date(message.sentAt).toLocaleString("pt-BR")}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {message.body?.split("\n")[0] || ""}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
