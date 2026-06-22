/**
 * @file frontend/src/screens/EventsScreen.jsx
 * @summary Tela administrativa de eventos.
 * @responsibility Criar eventos e listar os formularios vinculados a cada evento.
 */

import React from "react";
import { useEventsScreenController } from "./eventsScreenController";
import { EventDetailView, EventEditView, EventListView } from "./EventsScreenViews";

export const EventsScreen = ({
  events = [],
  forms = [],
  labels = [],
  people = [],
  user,
  pinnedEventIds = [],
  pinnedFormIds = [],
  initialSelectedEventId = null,
  onSaveEvent,
  onPublishEvent,
  onDeleteEvent,
  onTogglePinnedEvent,
  onCreateFormInEvent,
  onDuplicateForm,
  onArchiveForm,
  onTogglePinnedForm,
  onDeleteForm,
  onCreateEventMessage,
  onOpenEventMessage,
  onEditEventMessage,
  onDeleteEventMessage,
  onNavigate,
}) => {
  const controller = useEventsScreenController({
    events,
    forms,
    user,
    pinnedEventIds,
    pinnedFormIds,
    initialSelectedEventId,
    onSaveEvent,
    onPublishEvent,
    onDeleteEvent,
    onDeleteEventMessage,
  });

  const {
    canManageEvents,
    mode,
    setMode,
    draft,
    setDraft,
    feedback,
    saving,
    pendingDelete,
    setPendingDelete,
    deleting,
    statusAction,
    setEventsPage,
    setFormsPage,
    detailTab,
    setDetailTab,
    pendingMessageDelete,
    deletingMessage,
    requestDeleteMessage,
    cancelDeleteMessage,
    confirmDeleteMessage,
    pinnedEventSet,
    pinnedFormSet,
    sortedEvents,
    selectedEvent,
    eventForms,
    eventMessages,
    messagesEligible,
    eventsPagination,
    formsPagination,
    openEvent,
    startNew,
    editEvent,
    cancelEdit,
    save,
    publish,
    close,
    confirmDelete,
  } = controller;

  if (mode === "edit") {
    return (
      <EventEditView
        draft={draft}
        feedback={feedback}
        onCancel={cancelEdit}
        onChangeDraft={setDraft}
        onSave={save}
        saving={saving}
        people={people}
      />
    );
  }

  if (mode === "detail" && selectedEvent) {
    return (
      <EventDetailView
        canManageEvents={canManageEvents}
        detailTab={detailTab}
        eventForms={eventForms}
        eventMessages={eventMessages}
        feedback={feedback}
        formsPagination={formsPagination}
        labels={labels}
        messagesEligible={messagesEligible}
        onArchiveForm={onArchiveForm}
        onBack={() => setMode("list")}
        onChangeDetailTab={setDetailTab}
        onClose={close}
        onCreateForm={() => onCreateFormInEvent(selectedEvent)}
        onCreateMessage={onCreateEventMessage ? () => onCreateEventMessage(selectedEvent) : null}
        onDeleteForm={onDeleteForm}
        onDuplicateForm={onDuplicateForm}
        onEdit={() => editEvent(selectedEvent)}
        onNextFormsPage={() => setFormsPage(current => Math.min(formsPagination.totalPages, current + 1))}
        onNavigate={onNavigate}
        onOpenMessage={message => onOpenEventMessage && onOpenEventMessage(selectedEvent, message)}
        onEditMessage={onEditEventMessage ? message => onEditEventMessage(selectedEvent, message) : null}
        onDeleteMessage={requestDeleteMessage}
        pendingMessageDelete={pendingMessageDelete}
        deletingMessage={deletingMessage}
        onCancelMessageDelete={cancelDeleteMessage}
        onConfirmMessageDelete={confirmDeleteMessage}
        onPreviousFormsPage={() => setFormsPage(current => Math.max(1, current - 1))}
        onPublish={onPublishEvent ? publish : null}
        onTogglePinnedForm={onTogglePinnedForm}
        pinnedFormSet={pinnedFormSet}
        selectedEvent={selectedEvent}
        statusAction={statusAction}
        user={user}
      />
    );
  }

  return (
    <EventListView
      canManageEvents={canManageEvents}
      deleting={deleting}
      eventsPagination={eventsPagination}
      feedback={feedback}
      onCancelDelete={() => {
        if (deleting) return;
        setPendingDelete(null);
      }}
      onConfirmDelete={confirmDelete}
      onDelete={setPendingDelete}
      onEdit={editEvent}
      onNextEventsPage={() => setEventsPage(current => Math.min(eventsPagination.totalPages, current + 1))}
      onOpen={openEvent}
      onPreviousEventsPage={() => setEventsPage(current => Math.max(1, current - 1))}
      onStartNew={startNew}
      onTogglePinnedEvent={onTogglePinnedEvent}
      pendingDelete={pendingDelete}
      pinnedEventSet={pinnedEventSet}
      sortedEvents={sortedEvents}
    />
  );
};
