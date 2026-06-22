/**
 * @file frontend/src/screens/eventsScreenController.js
 * @summary Controller da tela de eventos.
 * @responsibility Agrupar estado, seletores e acoes usadas por EventsScreen.
 */

import { useMemo, useState } from "react";
import { resolveActionErrorMessage } from "../components/ui";
import { deleteEventMessage as apiDeleteEventMessage } from "../lib/api";
import { buildEventDraft, emptyEventDraft, isEventEligibleForMessages, paginateItems, selectEventForms, sortEvents } from "./eventsDomain";

export const useEventsScreenController = ({
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
  const [pendingMessageDelete, setPendingMessageDelete] = useState(null);
  const [deletingMessage, setDeletingMessage] = useState(false);

  const pinnedEventSet = useMemo(() => new Set(pinnedEventIds), [pinnedEventIds]);
  const pinnedFormSet = useMemo(() => new Set(pinnedFormIds), [pinnedFormIds]);
  const sortedEvents = useMemo(() => sortEvents(events, pinnedEventSet), [events, pinnedEventSet]);
  const selectedEvent = useMemo(() => events.find(event => event.id === selectedEventId) || null, [events, selectedEventId]);
  const eventForms = useMemo(() => selectEventForms({ forms, selectedEvent, user }), [forms, selectedEvent, user]);
  const eventMessages = selectedEvent?.messages || [];
  const messagesEligible = isEventEligibleForMessages(eventForms);
  const eventsPagination = paginateItems({ items: sortedEvents, page: eventsPage });
  const formsPagination = paginateItems({ items: eventForms, page: formsPage });

  const openEvent = event => {
    setSelectedEventId(event.id);
    setFormsPage(1);
    setDetailTab("forms");
    setMode("detail");
    setFeedback(null);
  };

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

  const requestDeleteMessage = message => setPendingMessageDelete(message);

  const cancelDeleteMessage = () => {
    if (deletingMessage) return;
    setPendingMessageDelete(null);
  };

  const confirmDeleteMessage = async () => {
    if (!pendingMessageDelete || !selectedEvent) return;
    setDeletingMessage(true);
    setFeedback(null);
    try {
      await apiDeleteEventMessage(selectedEvent.id, pendingMessageDelete.id);
      if (onDeleteEventMessage) onDeleteEventMessage(pendingMessageDelete.id);
      setPendingMessageDelete(null);
      setFeedback({ tone: "success", message: "Mensagem excluida." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setDeletingMessage(false);
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

  return {
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
    eventsPage,
    setEventsPage,
    formsPage,
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
  };
};
