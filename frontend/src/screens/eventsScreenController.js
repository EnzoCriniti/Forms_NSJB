/**
 * @file frontend/src/screens/eventsScreenController.js
 * @summary Controller da tela de eventos.
 * @responsibility Agrupar estado, seletores e acoes usadas por EventsScreen.
 */

import { useEffect, useMemo, useState } from "react";
import { resolveActionErrorMessage } from "../components/ui";
import { deleteEventMessage as apiDeleteEventMessage } from "../lib/api";
import { buildEventDraft, emptyEventDraft, isEventEligibleForMessages, paginateItems, selectEventForms, sortEvents } from "./eventsDomain";

export const useEventsScreenController = ({
  events,
  eventsPage: remoteEventsPage,
  forms,
  user,
  pinnedEventIds,
  pinnedFormIds,
  initialSelectedEventId,
  onSaveEvent,
  onPublishEvent,
  onDeleteEvent,
  onDeleteEventMessage,
  onLoadEventsPage,
  onSelectEvent,
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
  const [eventSearchDraft, setEventSearchDraft] = useState(remoteEventsPage?.search || "");
  const [eventStatusFilter, setEventStatusFilter] = useState(remoteEventsPage?.status || "");
  const [eventSortBy, setEventSortBy] = useState(remoteEventsPage?.sortBy || "date");
  const [eventSortDir, setEventSortDir] = useState(remoteEventsPage?.sortDir || "desc");
  const [eventSearchLoading, setEventSearchLoading] = useState(false);
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
  const usesRemoteEventsPage = Boolean(onLoadEventsPage);
  const remoteLimit = Number(remoteEventsPage?.limit || 20);
  const remoteOffset = Number(remoteEventsPage?.offset || 0);
  const remoteTotal = Number(remoteEventsPage?.total ?? sortedEvents.length);
  const eventsPagination = usesRemoteEventsPage
    ? {
        totalPages: Math.max(1, Math.ceil(remoteTotal / remoteLimit)),
        safePage: Math.floor(remoteOffset / remoteLimit) + 1,
        pageItems: sortedEvents,
        rangeStart: remoteTotal === 0 ? 0 : remoteOffset + 1,
        rangeEnd: Math.min(remoteOffset + sortedEvents.length, remoteTotal),
      }
    : paginateItems({ items: sortedEvents, page: eventsPage });
  const eventsTotalItems = usesRemoteEventsPage ? remoteTotal : sortedEvents.length;
  const formsPagination = paginateItems({ items: eventForms, page: formsPage });

  useEffect(() => {
    setEventSearchDraft(remoteEventsPage?.search || "");
  }, [remoteEventsPage?.search]);

  useEffect(() => {
    setEventStatusFilter(remoteEventsPage?.status || "");
  }, [remoteEventsPage?.status]);

  useEffect(() => {
    setEventSortBy(remoteEventsPage?.sortBy || "date");
  }, [remoteEventsPage?.sortBy]);

  useEffect(() => {
    setEventSortDir(remoteEventsPage?.sortDir || "desc");
  }, [remoteEventsPage?.sortDir]);

  useEffect(() => {
    if (initialSelectedEventId) {
      setSelectedEventId(initialSelectedEventId);
      setFormsPage(1);
      setDetailTab("forms");
      setMode("detail");
      return;
    }
    setSelectedEventId(null);
    setMode("list");
  }, [initialSelectedEventId]);

  const openEvent = event => {
    setSelectedEventId(event.id);
    onSelectEvent?.(event.id);
    setFormsPage(1);
    setDetailTab("forms");
    setMode("detail");
    setFeedback(null);
  };

  const loadEventsPage = async ({
    search = eventSearchDraft,
    status = eventStatusFilter,
    sortBy = eventSortBy,
    sortDir = eventSortDir,
    offset = 0,
  } = {}) => {
    if (!onLoadEventsPage) return;
    setEventSearchLoading(true);
    setFeedback(null);
    try {
      await onLoadEventsPage({ search, status, sortBy, sortDir, limit: remoteLimit, offset });
      setEventsPage(Math.floor(offset / remoteLimit) + 1);
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setEventSearchLoading(false);
    }
  };

  const submitEventSearch = event => {
    event?.preventDefault?.();
    loadEventsPage({ search: eventSearchDraft.trim(), offset: 0 });
  };

  const clearEventSearch = () => {
    setEventSearchDraft("");
    setEventStatusFilter("");
    setEventSortBy("date");
    setEventSortDir("desc");
    loadEventsPage({ search: "", status: "", sortBy: "date", sortDir: "desc", offset: 0 });
  };

  const previousEventsPage = () => {
    if (usesRemoteEventsPage) {
      loadEventsPage({
        search: remoteEventsPage?.search || "",
        status: remoteEventsPage?.status || "",
        sortBy: remoteEventsPage?.sortBy || "date",
        sortDir: remoteEventsPage?.sortDir || "desc",
        offset: Math.max(0, remoteOffset - remoteLimit),
      });
      return;
    }
    setEventsPage(current => Math.max(1, current - 1));
  };

  const nextEventsPage = () => {
    if (usesRemoteEventsPage) {
      loadEventsPage({
        search: remoteEventsPage?.search || "",
        status: remoteEventsPage?.status || "",
        sortBy: remoteEventsPage?.sortBy || "date",
        sortDir: remoteEventsPage?.sortDir || "desc",
        offset: Math.min((eventsPagination.totalPages - 1) * remoteLimit, remoteOffset + remoteLimit),
      });
      return;
    }
    setEventsPage(current => Math.min(eventsPagination.totalPages, current + 1));
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
      onSelectEvent?.(saved.id);
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
    formsPage,
    setFormsPage,
    eventSearchDraft,
    setEventSearchDraft,
    eventStatusFilter,
    setEventStatusFilter,
    eventSortBy,
    setEventSortBy,
    eventSortDir,
    setEventSortDir,
    eventSearchLoading,
    submitEventSearch,
    clearEventSearch,
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
    eventsTotalItems,
    formsPagination,
    openEvent,
    startNew,
    editEvent,
    cancelEdit,
    save,
    publish,
    close,
    confirmDelete,
    previousEventsPage,
    nextEventsPage,
  };
};
