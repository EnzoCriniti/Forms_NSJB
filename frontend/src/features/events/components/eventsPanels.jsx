/**
 * @file frontend/src/features/events/components/eventsPanels.jsx
 * @summary Paineis reutilizaveis da area de eventos.
 * @responsibility Conter blocos visuais de lista, edicao e detalhe de evento.
 */

import React from "react";
import { COLORS, Btn, Icon, ScreenHeader, StatusBadge } from "../../../components/ui";
import { FormListCard } from "../../../components/FormListCard";
import { formatDate, formatDateTime } from "../../../lib/forms";
import { EventEditorFieldsPanel } from "./eventEditorFieldsPanel";
import { EventPaginationControls } from "./eventPaginationControls";

export { EventDeleteConfirmModal } from "./eventDeleteConfirmModal";
export { EventDetailHeader } from "./eventDetailHeader";
export { EventDetailTabs } from "./eventDetailTabs";
export { EventEditorFieldsPanel } from "./eventEditorFieldsPanel";
export { EventMessagesPanel } from "./eventMessagesListPanel";
export { EventPaginationControls } from "./eventPaginationControls";

export const EventCard = ({ event, isPinned, canManageEvents, onOpen, onEdit, onDelete, onTogglePinned }) => (
  <div
    className="form-card form-card--interactive elevated"
    role="button"
    tabIndex={0}
    onClick={() => onOpen(event)}
    onKeyDown={keyboardEvent => {
      if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
        keyboardEvent.preventDefault();
        onOpen(event);
      }
    }}
    style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer" }}
  >
    <div style={{ width: 46, height: 46, borderRadius: 12, background: COLORS.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.primary, flexShrink: 0 }}>
      <Icon name="calendar" size={20} />
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <strong style={{ fontSize: 16 }}>{event.date ? `${event.title} - ${formatDate(event.date)}` : event.title}</strong>
        {isPinned && (
          <span title="Evento fixado" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 999, background: COLORS.warningLight, color: COLORS.warning }}>
            <Icon name="pin" size={12} />
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
        <StatusBadge status={event.status} />
        <span className="ui-badge" style={{ background: COLORS.surfaceAlt, color: COLORS.textSecondary }}>{event.formIds?.length || 0} forms</span>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: COLORS.textMuted }}>
        {event.opening && <span>Abertura: {formatDateTime(event.opening)}</span>}
        {event.closing && <span>Fechamento: {formatDateTime(event.closing)}</span>}
      </div>
    </div>
    {canManageEvents && (
      <div style={{ display: "flex", gap: 6 }} onClick={eventClick => eventClick.stopPropagation()}>
        <Btn v={isPinned ? "warning" : "ghost"} icon="pin" sz="sm" style={{ width: 42, height: 42, minWidth: 42, padding: 0, justifyContent: "center", borderRadius: 12 }} title={isPinned ? "Desfixar evento" : "Fixar evento"} aria-label={isPinned ? "Desfixar evento" : "Fixar evento"} onClick={() => onTogglePinned?.(event.id)} />
        <Btn v="ghost" icon="edit" sz="sm" style={{ width: 42, height: 42, minWidth: 42, padding: 0, justifyContent: "center", borderRadius: 12 }} title="Editar evento" aria-label="Editar evento" onClick={() => onEdit(event)} />
        <Btn v="danger" icon="trash" sz="sm" style={{ width: 42, height: 42, minWidth: 42, padding: 0, justifyContent: "center", borderRadius: 12 }} title="Excluir evento" aria-label="Excluir evento" onClick={() => onDelete(event)} />
      </div>
    )}
  </div>
);

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

export const EventListPanel = ({
  events,
  pagination,
  pinnedEventSet,
  canManageEvents,
  onOpen,
  onEdit,
  onDelete,
  onTogglePinned,
  onPreviousPage,
  onNextPage,
}) => (
  <div style={{ display: "grid", gap: 18 }}>
    {events.length === 0 ? (
      <div style={{ border: `1px dashed ${COLORS.border}`, borderRadius: 8, padding: 18, color: COLORS.textSecondary, fontSize: 13 }}>
        Nenhum evento criado.
      </div>
    ) : pagination.pageItems.map(event => (
      <EventCard
        key={event.id}
        event={event}
        isPinned={pinnedEventSet.has(event.id)}
        canManageEvents={canManageEvents}
        onOpen={onOpen}
        onEdit={onEdit}
        onDelete={onDelete}
        onTogglePinned={onTogglePinned}
      />
    ))}
    <EventPaginationControls
      pagination={pagination}
      totalItems={events.length}
      onPrevious={onPreviousPage}
      onNext={onNextPage}
    />
  </div>
);

export const EventFormsList = ({ forms, user, labels, isPinnedForm, canManageEvents, onNavigate, onDuplicateForm, onTogglePinnedForm, onArchiveForm, onDeleteForm }) => (
  <div style={{ display: "grid", gap: 18 }}>
    {forms.map(form => (
      <FormListCard
        key={form.id}
        form={form}
        user={user}
        labels={labels}
        isPinned={isPinnedForm(form.id)}
        canPinForms={canManageEvents}
        onNavigate={onNavigate}
        onDuplicateForm={onDuplicateForm}
        onTogglePinnedForm={onTogglePinnedForm}
        onArchiveForm={onArchiveForm}
        onDeleteForm={onDeleteForm}
      />
    ))}
  </div>
);

export const EventDetailFormsPanel = ({
  forms,
  pagination,
  user,
  labels,
  pinnedFormSet,
  canManageEvents,
  onNavigate,
  onDuplicateForm,
  onTogglePinnedForm,
  onArchiveForm,
  onDeleteForm,
  onPreviousPage,
  onNextPage,
}) => {
  if (forms.length === 0) {
    return (
      <div style={{ border: `1px dashed ${COLORS.border}`, borderRadius: 8, padding: 18, color: COLORS.textSecondary, fontSize: 13 }}>
        Nenhum formulario criado neste evento.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <EventFormsList
        forms={pagination.pageItems}
        user={user}
        labels={labels}
        isPinnedForm={formId => pinnedFormSet.has(formId)}
        canManageEvents={canManageEvents}
        onNavigate={onNavigate}
        onDuplicateForm={onDuplicateForm}
        onTogglePinnedForm={onTogglePinnedForm}
        onArchiveForm={onArchiveForm}
        onDeleteForm={onDeleteForm}
      />
      <EventPaginationControls
        pagination={pagination}
        totalItems={forms.length}
        onPrevious={onPreviousPage}
        onNext={onNextPage}
      />
    </div>
  );
};
