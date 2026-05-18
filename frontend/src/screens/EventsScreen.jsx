/**
 * @file frontend/src/screens/EventsScreen.jsx
 * @summary Tela administrativa de eventos.
 * @responsibility Criar eventos e listar os formularios vinculados a cada evento.
 */

import React, { useMemo, useState } from "react";
import { COLORS, Btn, ConfirmModal, FeedbackBanner, Icon, ScreenHeader, StatusBadge, resolveActionErrorMessage } from "../components/ui";
import { FormListCard } from "../components/FormListCard";
import { MessageStatusBadge, MESSAGE_TYPE_LABELS } from "../components/MessageStatusBadge";
import { formatDate, formatDateTime } from "../lib/forms";

const ELIGIBLE_FORM_TYPES_FOR_MESSAGES = ["presenca", "escala_organ"];
const isEventEligibleForMessages = forms => forms.some(form => ELIGIBLE_FORM_TYPES_FOR_MESSAGES.includes(form.type));

const MessagesPanel = ({ messages, eligible, canManage, onCreate, onOpen }) => {
  if (!eligible) {
    return (
      <div style={{ border: `1px dashed ${COLORS.border}`, borderRadius: 8, padding: 18, color: COLORS.textSecondary, fontSize: 13 }}>
        Vincule um formulario de presenca ou escala da organ para habilitar mensagens neste evento.
      </div>
    );
  }
  if (messages.length === 0) {
    return (
      <div style={{ border: `1px dashed ${COLORS.border}`, borderRadius: 8, padding: 18, color: COLORS.textSecondary, fontSize: 13, display: "grid", gap: 12, justifyItems: "start" }}>
        Nenhuma mensagem cadastrada neste evento.
        {canManage && onCreate && <Btn icon="plus" sz="sm" onClick={onCreate}>Nova mensagem</Btn>}
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {messages.map(message => (
        <div
          key={message.id}
          role="button"
          tabIndex={0}
          onClick={() => onOpen && onOpen(message)}
          onKeyDown={keyEvent => {
            if (keyEvent.key === "Enter" || keyEvent.key === " ") {
              keyEvent.preventDefault();
              onOpen && onOpen(message);
            }
          }}
          style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: 14, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
        >
          <div style={{ width: 38, height: 38, borderRadius: 10, background: COLORS.primaryLight, color: COLORS.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon name="share" size={18} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <strong style={{ fontSize: 14 }}>{MESSAGE_TYPE_LABELS[message.type] || message.type}</strong>
              <MessageStatusBadge status={message.status} />
              {message.scheduledFor && (
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>
                  Agendada para {new Date(message.scheduledFor).toLocaleString("pt-BR")}
                </span>
              )}
              {message.sentAt && (
                <span style={{ fontSize: 11, color: COLORS.textMuted }}>
                  Disparada em {new Date(message.sentAt).toLocaleString("pt-BR")}
                </span>
              )}
            </div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {message.body?.split("\n")[0] || ""}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

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

  const renderEventCard = event => {
    const isPinned = pinnedEventSet.has(event.id);
    return (
      <div
        key={event.id}
        className="form-card form-card--interactive elevated"
        role="button"
        tabIndex={0}
        onClick={() => openEvent(event)}
        onKeyDown={keyboardEvent => {
          if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
            keyboardEvent.preventDefault();
            openEvent(event);
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
            <Btn v={isPinned ? "warning" : "ghost"} icon="pin" sz="sm" style={LIST_ACTION_STYLE} title={isPinned ? "Desfixar evento" : "Fixar evento"} aria-label={isPinned ? "Desfixar evento" : "Fixar evento"} onClick={() => onTogglePinnedEvent?.(event.id)} />
            <Btn v="ghost" icon="edit" sz="sm" style={LIST_ACTION_STYLE} title="Editar evento" aria-label="Editar evento" onClick={() => editEvent(event)} />
            <Btn v="danger" icon="trash" sz="sm" style={LIST_ACTION_STYLE} title="Excluir evento" aria-label="Excluir evento" onClick={() => setPendingDelete(event)} />
          </div>
        )}
      </div>
    );
  };

  if (mode === "edit") {
    return (
      <div>
        {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} fixed />}
        <ScreenHeader
          className="settings-top-card"
          leading={<Btn v="ghost" icon="back" onClick={cancelEdit} aria-label="Voltar" />}
          title={draft.id ? "Editar evento" : "Novo evento"}
          titleSize={20}
        />
        <section style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 18 }}>
          <div style={{ display: "grid", gap: 14 }}>
            <div className="events-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 12 }}>
              <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
                Nome do evento
                <input value={draft.title} onChange={event => setDraft(current => ({ ...current, title: event.target.value }))} placeholder="Ex: Reuniao mensal - Maio" style={{ padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, background: COLORS.surface, color: COLORS.text }} />
              </label>
              <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
                Data
                <input type="date" value={draft.date || ""} onChange={event => setDraft(current => ({ ...current, date: event.target.value }))} style={{ padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, background: COLORS.surface, color: COLORS.text }} />
              </label>
            </div>
            <div className="events-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
                Abertura
                <input type="datetime-local" value={draft.opening || ""} onChange={event => setDraft(current => ({ ...current, opening: event.target.value }))} style={{ padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, background: COLORS.surface, color: COLORS.text }} />
              </label>
              <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
                Fechamento
                <input type="datetime-local" value={draft.closing || ""} onChange={event => setDraft(current => ({ ...current, closing: event.target.value }))} style={{ padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, background: COLORS.surface, color: COLORS.text }} />
              </label>
            </div>
            <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
              Descricao
              <textarea value={draft.description || ""} onChange={event => setDraft(current => ({ ...current, description: event.target.value }))} rows={3} style={{ padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, background: COLORS.surface, color: COLORS.text, resize: "vertical" }} />
            </label>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Btn v="secondary" onClick={cancelEdit}>Cancelar</Btn>
              <Btn icon="save" onClick={save} loading={saving} disabled={!draft.title.trim()}>Salvar evento</Btn>
            </div>
          </div>
        </section>
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
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          <Btn v={detailTab === "forms" ? "primary" : "ghost"} sz="sm" onClick={() => setDetailTab("forms")}>
            Formularios{eventForms.length > 0 ? ` (${eventForms.length})` : ""}
          </Btn>
          {messagesEligible && (
            <Btn v={detailTab === "messages" ? "primary" : "ghost"} sz="sm" onClick={() => setDetailTab("messages")}>
              Mensagens{eventMessages.length > 0 ? ` (${eventMessages.length})` : ""}
            </Btn>
          )}
        </div>
        {detailTab === "messages" ? (
          <MessagesPanel
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
            {pagedEventForms.map(form => (
              <FormListCard
                key={form.id}
                form={form}
                user={user}
                labels={labels}
                isPinned={pinnedFormSet.has(form.id)}
                canPinForms={canManageEvents}
                onNavigate={onNavigate}
                onDuplicateForm={onDuplicateForm}
                onTogglePinnedForm={onTogglePinnedForm}
                onArchiveForm={onArchiveForm}
                onDeleteForm={onDeleteForm}
              />
            ))}
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
        ) : pagedEvents.map(renderEventCard)}
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
