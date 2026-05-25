import React from "react";
import { ConfirmModal } from "../../../components/ui";

export const EventDeleteConfirmModal = ({ event, busy, onCancel, onConfirm }) => (
  <ConfirmModal
    open={Boolean(event)}
    title="Excluir evento"
    message={`Excluir o evento "${event?.title || ""}" remove apenas o agrupamento. Os formularios continuam salvos.`}
    confirmLabel="Excluir"
    tone="danger"
    busy={busy}
    onCancel={onCancel}
    onConfirm={onConfirm}
  />
);
