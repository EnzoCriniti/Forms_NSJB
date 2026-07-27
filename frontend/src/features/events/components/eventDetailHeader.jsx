import React from "react";
import { Btn, ScreenHeader, StatusBadge } from "../../../components/ui";

export const EventDetailHeader = ({
  event,
  canManageEvents,
  detailTab,
  messagesEligible,
  statusAction,
  onBack,
  onPublish,
  onClose,
  onEdit,
  onCreateForm,
  onCreateMessage,
}) => (
  <ScreenHeader
    className="settings-top-card"
    onBack={onBack}
    titleContent={(
      <div style={{ minWidth: 0, flex: 1, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <StatusBadge status={event.status} />
      </div>
    )}
    actions={(
      <>
        {canManageEvents && event.status === "pronto" && onPublish && (
          <Btn v="secondary" icon="check" onClick={onPublish} loading={statusAction === "publish"} disabled={Boolean(statusAction)}>Publicar</Btn>
        )}
        {canManageEvents && event.status === "publicado" && (
          <Btn v="secondary" icon="lock" onClick={onClose} loading={statusAction === "close"} disabled={Boolean(statusAction)}>Encerrar</Btn>
        )}
        {canManageEvents && <Btn v="secondary" icon="edit" onClick={onEdit}>Editar</Btn>}
        {canManageEvents && detailTab === "forms" && <Btn icon="plus" onClick={onCreateForm} aria-label="Novo formulário" title="Novo formulário" />}
        {canManageEvents && detailTab === "messages" && messagesEligible && onCreateMessage && (
          <Btn icon="plus" onClick={onCreateMessage} aria-label="Nova mensagem" title="Nova mensagem" />
        )}
      </>
    )}
  />
);
