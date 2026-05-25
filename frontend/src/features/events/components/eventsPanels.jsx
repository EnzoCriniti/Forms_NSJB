/**
 * @file frontend/src/features/events/components/eventsPanels.jsx
 * @summary Paineis reutilizaveis da area de eventos.
 * @responsibility Conter blocos visuais de lista, edicao e detalhe de evento.
 */

import React from "react";
import { Btn, ScreenHeader } from "../../../components/ui";
import { EventEditorFieldsPanel } from "./eventEditorFieldsPanel";

export { EventDeleteConfirmModal } from "./eventDeleteConfirmModal";
export { EventDetailFormsPanel, EventFormsList } from "./eventDetailFormsPanel";
export { EventDetailHeader } from "./eventDetailHeader";
export { EventDetailTabs } from "./eventDetailTabs";
export { EventEditorFieldsPanel } from "./eventEditorFieldsPanel";
export { EventCard, EventListPanel } from "./eventListPanel";
export { EventMessagesPanel } from "./eventMessagesListPanel";
export { EventPaginationControls } from "./eventPaginationControls";

export const EventEditorPanel = ({ draft, onChangeDraft, onCancel, onSave, saving, title }) => (
  <div>
    <ScreenHeader
      className="settings-top-card"
      leading={<Btn v="ghost" icon="back" onClick={onCancel} aria-label="Voltar" />}
      title={title}
      titleSize={20}
    />
    <EventEditorFieldsPanel
      draft={draft}
      onCancel={onCancel}
      onChangeDraft={onChangeDraft}
      onSave={onSave}
      saving={saving}
    />
  </div>
);
