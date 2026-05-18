/**
 * @file frontend/src/screens/EventsScreen.jsx
 * @summary Tela administrativa de eventos.
 * @responsibility Criar eventos e listar os formularios vinculados a cada evento.
 */

import React, { useMemo, useState } from "react";
import { COLORS, Btn, ConfirmModal, FeedbackBanner, Icon, ScreenHeader, StatusBadge, resolveActionErrorMessage } from "../components/ui";
import { formatDate, formatDateTime } from "../lib/forms";
import { EventCard, EventDetailTabs, EventEditorPanel, EventFormsList, EventMessagesPanel } from "../features/events/components/eventsPanels";

const ELIGIBLE_FORM_TYPES_FOR_MESSAGES = ["presenca", "escala_organ"];
const isEventEligibleForMessages = forms => forms.some(form => ELIGIBLE_FORM_TYPES_FOR_MESSAGES.includes(form.type));

const emptyDraft = {
  title: "",
  description: "",
  date: "",
  opening: "",
  closing: "",
  status: "rascunho",
  formIds: [],
  messageConfig: {},
};

const toDraft = event => ({
  ...emptyDraft,
  ...(event || {}),
  formIds: Array.isArray(event?.formIds) ? event.formIds : [],
  date: event?.date || "",
  opening: event?.opening || "",
  closing: event?.closing || "",
});

const LIST_ACTION_STYLE = {
  width: 42,
  height: 42,
  minWidth: 42,
  padding: 0,
  justifyContent: "center",
  borderRadius: 12,
};

const sortEvents = (events, pinnedSet) => [...events].sort((a, b) => {
  const aPinned = pinnedSet.has(a.id);
  const bPinned = pinnedSet.has(b.id);
  if (aPinned !== bPinned) return aPinned ? -1 : 1;
  return String(b.date || "").localeCompare(String(a.date || "")) || Number(b.id || 0) - Number(a.id || 0);
});

const visibleEventFormsFor = (user, eventForms) => {
  if (user?.role === "admin") return eventForms;
  return eventForms.filter(form => form.status !== "arquivado");
};

const PAGE_SIZE = 4;

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
  const [draft, setDraft] = useState(() => ({ ...emptyDraft }));
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
  const eventForms = useMemo(() => {
    const ids = new Set(selectedEvent?.formIds || []);
    return visibleEventFormsFor(user, forms.filter(form => ids.has(form.id)));
  }, [forms, selectedEvent, user]);

  const openEvent = event => {
    setSelectedEventId(event.id);
    setFormsPage(1);
    setDetailTab("forms");
    setMode("detail");
    setFeedback(null);
  };

  const eventMessages = selectedEvent?.messages || [];
  const messagesEligible = isEventEligibleForMessages(eventForms);

  const eventsTotalPages = Math.max(1, Math.ceil(sortedEvents.length / PAGE_SIZE));
  const safeEventsPage = Math.min(eventsPage, eventsTotalPages);
  const pagedEvents = sortedEvents.slice((safeEventsPage - 1) * PAGE_SIZE, safeEventsPage * PAGE_SIZE);

  const formsTotalPages = Math.max(1, Math.ceil(eventForms.length / PAGE_SIZE));
  const safeFormsPage = Math.min(formsPage, formsTotalPages);
  const pagedEventForms = eventForms.slice((safeFormsPage - 1) * PAGE_SIZE, safeFormsPage * PAGE_SIZE);

  const startNew = () => {
    setDraft({ ...emptyDraft });
    setSelectedEventId(null);
    setMode("edit");
    setFeedback(null);
  };

  const editEvent = event => {
    setDraft(toDraft(event));
    setSelectedEventId(event.id);
    setMode("edit");
    setFeedback(null);
  };

  const cancelEdit = () => {
    setDraft({ ...emptyDraft });
    setMode(selectedEventId ? "detail" : "list");
  };

  const save = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const saved = await onSaveEvent(draft);
      setSelectedEventId(saved.id);
      setDraft(toDraft(saved));
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
        <ScreenHeader
          className="settings-top-card"
          leading={<Btn v="ghost" icon="back" onClick={() => setMode("list")} aria-label="Voltar" />}
          titleContent={(
            <div style={{ minWidth: 0, flex: 1, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, fontSize: 20 }}>{selectedEvent.date ? `${selectedEvent.title} - ${formatDate(selectedEvent.date)}` : selectedEvent.title}</h2>
              <StatusBadge status={selectedEvent.status} />
            </div>
          )}
          actions={(
            <>
              {canManageEvents && selectedEvent.status === "pronto" && onPublishEvent && (
                <Btn v="secondary" icon="check" onClick={publish} loading={statusAction === "publish"} disabled={Boolean(statusAction)}>Publicar</Btn>
              )}
              {canManageEvents && selectedEvent.status === "publicado" && (
                <Btn v="secondary" icon="lock" onClick={close} loading={statusAction === "close"} disabled={Boolean(statusAction)}>Encerrar</Btn>
              )}
              {canManageEvents && <Btn v="secondary" icon="edit" onClick={() => editEvent(selectedEvent)}>Editar</Btn>}
              {canManageEvents && detailTab === "forms" && <Btn icon="plus" onClick={() => onCreateFormInEvent(selectedEvent)} aria-label="Novo formulario" title="Novo formulario" />}
              {canManageEvents && detailTab === "messages" && messagesEligible && onCreateEventMessage && (
                <Btn icon="plus" onClick={() => onCreateEventMessage(selectedEvent)} aria-label="Nova mensagem" title="Nova mensagem" />
              )}
            </>
          )}
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
              forms={pagedEventForms}
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
            {eventForms.length > PAGE_SIZE && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>
                  Exibindo {(safeFormsPage - 1) * PAGE_SIZE + 1} a {Math.min(safeFormsPage * PAGE_SIZE, eventForms.length)} de {eventForms.length}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn v="secondary" sz="sm" onClick={() => setFormsPage(current => Math.max(1, current - 1))} disabled={safeFormsPage === 1}>Anterior</Btn>
                  <div style={{ display: "flex", alignItems: "center", fontSize: 13, color: COLORS.textSecondary, padding: "0 8px" }}>Pagina {safeFormsPage} de {formsTotalPages}</div>
                  <Btn v="secondary" sz="sm" onClick={() => setFormsPage(current => Math.min(formsTotalPages, current + 1))} disabled={safeFormsPage === formsTotalPages}>Proxima</Btn>
                </div>
              </div>
            )}
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
        ) : pagedEvents.map(event => (
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
        {sortedEvents.length > PAGE_SIZE && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>
              Exibindo {(safeEventsPage - 1) * PAGE_SIZE + 1} a {Math.min(safeEventsPage * PAGE_SIZE, sortedEvents.length)} de {sortedEvents.length}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn v="secondary" sz="sm" onClick={() => setEventsPage(current => Math.max(1, current - 1))} disabled={safeEventsPage === 1}>Anterior</Btn>
              <div style={{ display: "flex", alignItems: "center", fontSize: 13, color: COLORS.textSecondary, padding: "0 8px" }}>Pagina {safeEventsPage} de {eventsTotalPages}</div>
              <Btn v="secondary" sz="sm" onClick={() => setEventsPage(current => Math.min(eventsTotalPages, current + 1))} disabled={safeEventsPage === eventsTotalPages}>Proxima</Btn>
            </div>
          </div>
        )}
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
