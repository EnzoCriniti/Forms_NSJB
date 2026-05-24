/**
 * @file frontend/src/screens/EventMessageDetailScreen.jsx
 * @summary Detalhe e operacoes de uma mensagem de evento.
 * @responsibility Preview renderizado, dispatch manual, cancelamento, exclusao e historico de logs.
 */

import React, { useCallback, useEffect, useState } from "react";
import { Btn, COLORS, ConfirmModal, FeedbackBanner, ScreenHeader, resolveActionErrorMessage } from "../components/ui";
import { MessageStatusBadge, MESSAGE_TYPE_LABELS } from "../components/MessageStatusBadge";
import { MessageLogsPanel, MessagePreviewPanel } from "../features/events/components/eventMessageDetailPanels";
import { getEventMessageConfirmProps, isEventMessageCancellable, isEventMessageDispatchable, isEventMessageEditable, splitPreviewRecipients } from "./eventMessageDomain";
import {
  cancelEventMessage as apiCancelEventMessage,
  deleteEventMessage as apiDeleteEventMessage,
  dispatchEventMessage as apiDispatchEventMessage,
  fetchEventMessage,
  fetchEventMessagePreview,
} from "../lib/api";

const formatDateTime = value => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("pt-BR");
};

const copyToClipboard = async text => {
  if (!text) return false;
  if (navigator?.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
  return false;
};

export const EventMessageDetailScreen = ({
  event,
  message: initialMessage,
  onMessageUpdated,
  onMessageDeleted,
  onEdit,
  onBack,
}) => {
  const [message, setMessage] = useState(initialMessage || null);
  const [preview, setPreview] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [busyAction, setBusyAction] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  const refresh = useCallback(async () => {
    if (!event?.id || !initialMessage?.id) return;
    setLoading(true);
    try {
      const [detail, previewPayload] = await Promise.all([
        fetchEventMessage(event.id, initialMessage.id),
        fetchEventMessagePreview(event.id, initialMessage.id).catch(error => ({ previewError: error })),
      ]);
      setMessage(detail.message);
      setLogs(detail.logs || []);
      if (previewPayload?.previewError) {
        setPreview(null);
        setFeedback({ tone: "error", message: resolveActionErrorMessage(previewPayload.previewError) });
      } else {
        setPreview(previewPayload.preview);
      }
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }, [event?.id, initialMessage?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const dispatch = async () => {
    setBusyAction("dispatch");
    setFeedback({ tone: "loading", message: "Disparando mensagem (modo log-only)..." });
    try {
      const result = await apiDispatchEventMessage(event.id, message.id);
      setMessage(result.message);
      if (onMessageUpdated) onMessageUpdated(result.message);
      setFeedback({ tone: "success", message: "Mensagem registrada no log. Status: disparada." });
      await refresh();
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setBusyAction(null);
    }
  };

  const cancel = async () => {
    setBusyAction("cancel");
    setFeedback({ tone: "loading", message: "Cancelando mensagem..." });
    try {
      const result = await apiCancelEventMessage(event.id, message.id);
      setMessage(result.message);
      if (onMessageUpdated) onMessageUpdated(result.message);
      setFeedback({ tone: "success", message: "Mensagem cancelada." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setBusyAction(null);
    }
  };

  const remove = async () => {
    setBusyAction("delete");
    setFeedback({ tone: "loading", message: "Excluindo mensagem..." });
    try {
      await apiDeleteEventMessage(event.id, message.id);
      if (onMessageDeleted) onMessageDeleted(message.id);
      if (onBack) onBack();
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
      setBusyAction(null);
    }
  };

  const copy = async (text, key) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(current => current === key ? null : current), 1500);
    } else {
      setFeedback({ tone: "info", message: "Copie manualmente: seu navegador bloqueou a copia automatica." });
    }
  };

  const requestConfirm = action => setConfirmAction(action);
  const closeConfirm = () => setConfirmAction(null);
  const runConfirm = async () => {
    const action = confirmAction;
    setConfirmAction(null);
    if (action === "dispatch") await dispatch();
    if (action === "cancel") await cancel();
    if (action === "delete") await remove();
  };

  if (!message) {
    return (
      <div>
        <ScreenHeader
          className="settings-top-card"
          leading={<Btn v="ghost" icon="back" onClick={onBack} aria-label="Voltar" />}
          title="Mensagem nao encontrada"
          titleSize={20}
        />
      </div>
    );
  }

  const { recipientsActive, recipientsSkipped } = splitPreviewRecipients(preview);
  const confirmProps = getEventMessageConfirmProps(confirmAction);

  return (
    <div>
      <ScreenHeader
        className="settings-top-card"
        leading={<Btn v="ghost" icon="back" onClick={onBack} aria-label="Voltar" />}
        titleContent={(
          <div style={{ minWidth: 0, flex: 1, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <h2 style={{ margin: 0, fontSize: 20 }}>{MESSAGE_TYPE_LABELS[message.type] || message.type}</h2>
            <MessageStatusBadge status={message.status} />
          </div>
        )}
        actions={(
          <>
            {isEventMessageEditable(message.status) && onEdit && (
              <Btn v="secondary" icon="edit" onClick={onEdit}>Editar</Btn>
            )}
            {isEventMessageCancellable(message.status) && (
              <Btn v="secondary" icon="close" onClick={() => requestConfirm("cancel")} loading={busyAction === "cancel"} disabled={Boolean(busyAction)}>Cancelar</Btn>
            )}
            {message.status === "cancelada" && (
              <Btn v="danger" icon="trash" onClick={() => requestConfirm("delete")} loading={busyAction === "delete"} disabled={Boolean(busyAction)}>Excluir</Btn>
            )}
            {isEventMessageDispatchable(message.status) && (
              <Btn icon="share" onClick={() => requestConfirm("dispatch")} loading={busyAction === "dispatch"} disabled={Boolean(busyAction)}>Disparar agora</Btn>
            )}
          </>
        )}
        titleSize={20}
      />

      {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} />}

      <section style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 18, display: "grid", gap: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: COLORS.textMuted }}>
          <span>Evento: <strong style={{ color: COLORS.text }}>{event?.title}</strong></span>
          {message.scheduledFor && <span>Agendada: {formatDateTime(message.scheduledFor)}</span>}
          {message.sentAt && <span>Disparada: {formatDateTime(message.sentAt)}</span>}
          <span>Auto: {message.autoDispatchEnabled ? "sim" : "nao"}</span>
        </div>

        <MessagePreviewPanel
          loading={loading}
          preview={preview}
          copiedKey={copiedKey}
          onCopy={copy}
          recipientsActive={recipientsActive}
          recipientsSkipped={recipientsSkipped}
        />
      </section>

      <MessageLogsPanel logs={logs} formatDateTime={formatDateTime} />

      <ConfirmModal
        open={Boolean(confirmAction)}
        title={confirmProps.title}
        message={confirmProps.message}
        confirmLabel={confirmProps.confirmLabel}
        tone={confirmProps.tone}
        onCancel={closeConfirm}
        onConfirm={runConfirm}
      />
    </div>
  );
};
