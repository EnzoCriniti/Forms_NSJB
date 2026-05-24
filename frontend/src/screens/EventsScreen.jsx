/**
 * @file frontend/src/screens/EventsScreen.jsx
 * @summary Tela administrativa de eventos.
 * @responsibility Criar eventos e listar os formularios vinculados a cada evento.
 */

import React, { useMemo, useState } from "react";
import { COLORS, Btn, ConfirmModal, FeedbackBanner, ScreenHeader, resolveActionErrorMessage } from "../components/ui";
import { EventCard, EventDetailHeader, EventDetailTabs, EventEditorPanel, EventFormsList, EventMessagesPanel, EventPaginationControls } from "../features/events/components/eventsPanels";
import { buildEventDraft, emptyEventDraft, isEventEligibleForMessages, paginateItems, selectEventForms, sortEvents } from "./eventsDomain";

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
  const canManageEvents = user?.role === "admin";
  const [mode, setMode] = useState(initialSelectedEventId ? "detail" : "list");
  const [selectedEventId, setSelectedEventId] = useState(initialSelectedEventId);
  const [draft, setDraft] = useState(() => ({ ...emptyEventDraft }));
  const [feedback, setFeedback] = useState(null);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusAction, setStatusAction] = useState(null);
  const [eventsPage, setEventsPage] = useState(1);
  const [formsPage, setFormsPage] = useState(1);
  const [detailTab, setDetailTab] = useState("forms");

  const pinnedEventSet = useMemo(() => new Set(pinnedEventIds), [pinnedEventIds]);
  const pinnedFormSet = useMemo(() => new Set(pinnedFormIds), [pinnedFormIds]);
  const sortedEvents = useMemo(() => sortEvents(events, pinnedEventSet), [events, pinnedEventSet]);
  const selectedEvent = useMemo(() => events.find(event => event.id === selectedEventId) || null, [events, selectedEventId]);
  const eventForms = useMemo(() => selectEventForms({ forms, selectedEvent, user }), [forms, selectedEvent, user]);

  const openEvent = event => {
    setSelectedEventId(event.id);
    setFormsPage(1);
    setDetailTab("forms");
    setMode("detail");
    setFeedback(null);
  };

  const eventMessages = selectedEvent?.messages || [];
  const messagesEligible = isEventEligibleForMessages(eventForms);

  const eventsPagination = paginateItems({ items: sortedEvents, page: eventsPage });
  const formsPagination = paginateItems({ items: eventForms, page: formsPage });

  const startNew = () => {
    setDraft({ ...emptyEventDraft });
    setSelectedEventId(null);
    setMode("edit");
    setFeedback(null);
  };

  const editEvent = event => {
    setDraft(buildEventDraft(event));
    setSelectedEventId(event.id);
    setMode("edit");
    setFeedback(null);
  };

  const cancelEdit = () => {
    setDraft({ ...emptyEventDraft });
    setMode(selectedEventId ? "detail" : "list");
  };

  const save = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const saved = await onSaveEvent(draft);
      setSelectedEventId(saved.id);
      setDraft(buildEventDraft(saved));
      setMode("detail");
      setFeedback({ tone: "success", message: "Evento salvo." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    if (!selectedEvent || !onPublishEvent) return;
    setStatusAction("publish");
    setFeedback(null);
    try {
      await onPublishEvent(selectedEvent.id);
      setFeedback({ tone: "success", message: "Evento publicado." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setStatusAction(null);
    }
  };

  const close = async () => {
    if (!selectedEvent || !onSaveEvent) return;
    setStatusAction("close");
    setFeedback(null);
    try {
      await onSaveEvent({ ...selectedEvent, status: "encerrado" });
      setFeedback({ tone: "success", message: "Evento encerrado." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setStatusAction(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    setFeedback(null);
    try {
      await onDeleteEvent(pendingDelete.id);
      setPendingDelete(null);
      setSelectedEventId(current => current === pendingDelete.id ? null : current);
      setMode("list");
      setFeedback({ tone: "success", message: "Evento excluido." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setDeleting(false);
    }
  };

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
        ) : eventForms.length === 0 ? (
          <div style={{ border: `1px dashed ${COLORS.border}`, borderRadius: 8, padding: 18, color: COLORS.textSecondary, fontSize: 13 }}>
            Nenhum formulario criado neste evento.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 18 }}>
            <EventFormsList
              forms={formsPagination.pageItems}
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
              pagination={formsPagination}
              totalItems={eventForms.length}
              onPrevious={() => setFormsPage(current => Math.max(1, current - 1))}
              onNext={() => setFormsPage(current => Math.min(formsPagination.totalPages, current + 1))}
            />
          </div>
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
      <div style={{ display: "grid", gap: 18 }}>
        {sortedEvents.length === 0 ? (
          <div style={{ border: `1px dashed ${COLORS.border}`, borderRadius: 8, padding: 18, color: COLORS.textSecondary, fontSize: 13 }}>
            Nenhum evento criado.
          </div>
        ) : eventsPagination.pageItems.map(event => (
          <EventCard
            key={event.id}
            event={event}
            isPinned={pinnedEventSet.has(event.id)}
            canManageEvents={canManageEvents}
            onOpen={openEvent}
            onEdit={editEvent}
            onDelete={setPendingDelete}
            onTogglePinned={onTogglePinnedEvent}
          />
        ))}
        <EventPaginationControls
          pagination={eventsPagination}
          totalItems={sortedEvents.length}
          onPrevious={() => setEventsPage(current => Math.max(1, current - 1))}
          onNext={() => setEventsPage(current => Math.min(eventsPagination.totalPages, current + 1))}
        />
      </div>
      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Excluir evento"
        message={`Excluir o evento "${pendingDelete?.title || ""}" remove apenas o agrupamento. Os formularios continuam salvos.`}
        confirmLabel="Excluir"
        tone="danger"
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
