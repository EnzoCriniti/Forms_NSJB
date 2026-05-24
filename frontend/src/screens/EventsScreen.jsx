/**
 * @file frontend/src/screens/EventsScreen.jsx
 * @summary Tela administrativa de eventos.
 * @responsibility Criar eventos e listar os formularios vinculados a cada evento.
 */

import React from "react";
import { Btn, FeedbackBanner, ScreenHeader } from "../components/ui";
import { EventDeleteConfirmModal, EventDetailFormsPanel, EventDetailHeader, EventDetailTabs, EventEditorPanel, EventListPanel, EventMessagesPanel } from "../features/events/components/eventsPanels";
import { useEventsScreenController } from "./eventsScreenController";

export const EventsScreen = ({
  events = [],
  forms = [],
  labels = [],
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
      <div>
        {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} fixed />}
        <EventEditorPanel
          draft={draft}
          onChangeDraft={setDraft}
          onCancel={cancelEdit}
          onSave={save}
          saving={saving}
          title={draft.id ? "Editar evento" : "Novo evento"}
        />
      </div>
    );
  }

  if (mode === "detail" && selectedEvent) {
    return (
      <div>
        {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} fixed />}
        <EventDetailHeader
          event={selectedEvent}
          canManageEvents={canManageEvents}
          detailTab={detailTab}
          messagesEligible={messagesEligible}
          statusAction={statusAction}
          onBack={() => setMode("list")}
          onPublish={onPublishEvent ? publish : null}
          onClose={close}
          onEdit={() => editEvent(selectedEvent)}
          onCreateForm={() => onCreateFormInEvent(selectedEvent)}
          onCreateMessage={onCreateEventMessage ? () => onCreateEventMessage(selectedEvent) : null}
        />
        <EventDetailTabs
          activeTab={detailTab}
          onChangeTab={setDetailTab}
          formsCount={eventForms.length}
          messagesCount={eventMessages.length}
          hasMessages={messagesEligible}
        />
        {detailTab === "messages" ? (
          <EventMessagesPanel
            messages={eventMessages}
            eligible={messagesEligible}
            canManage={canManageEvents}
            onCreate={() => onCreateEventMessage && onCreateEventMessage(selectedEvent)}
            onOpen={message => onOpenEventMessage && onOpenEventMessage(selectedEvent, message)}
          />
        ) : (
          <EventDetailFormsPanel
            forms={eventForms}
            pagination={formsPagination}
            user={user}
            labels={labels}
            pinnedFormSet={pinnedFormSet}
            canManageEvents={canManageEvents}
            onNavigate={onNavigate}
            onDuplicateForm={onDuplicateForm}
            onTogglePinnedForm={onTogglePinnedForm}
            onArchiveForm={onArchiveForm}
            onDeleteForm={onDeleteForm}
            onPreviousPage={() => setFormsPage(current => Math.max(1, current - 1))}
            onNextPage={() => setFormsPage(current => Math.min(formsPagination.totalPages, current + 1))}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} fixed />}
      <ScreenHeader
        className="settings-top-card"
        title="Eventos"
        titleSize={20}
        actions={canManageEvents ? <Btn icon="plus" onClick={startNew} aria-label="Novo evento" title="Novo evento" /> : null}
      />
      <EventListPanel
        events={sortedEvents}
        pagination={eventsPagination}
        pinnedEventSet={pinnedEventSet}
        canManageEvents={canManageEvents}
        onOpen={openEvent}
        onEdit={editEvent}
        onDelete={setPendingDelete}
        onTogglePinned={onTogglePinnedEvent}
        onPreviousPage={() => setEventsPage(current => Math.max(1, current - 1))}
        onNextPage={() => setEventsPage(current => Math.min(eventsPagination.totalPages, current + 1))}
      />
      <EventDeleteConfirmModal
        event={pendingDelete}
        busy={deleting}
        onCancel={() => {
          if (deleting) return;
          setPendingDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
};
