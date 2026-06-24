/**
 * @file frontend/src/screens/EventMessageDetailScreen.jsx
 * @summary Detalhe e operacoes de uma mensagem de evento.
 * @responsibility Preview renderizado, dispatch manual, cancelamento, exclusao e historico de logs.
 */

import React, { useCallback, useEffect, useState } from "react";
import { Btn, ConfirmModal, FeedbackBanner, ScreenHeader, resolveActionErrorMessage } from "../components/ui";
import { EventMessageDetailHeader, MessageDetailSummaryPanel, MessageLogsPanel } from "../features/events/components/eventMessageDetailPanels";
import { getEventMessageConfirmProps, isEventMessageCancellable, isEventMessageDispatchable, isEventMessageEditable, splitPreviewRecipients } from "./eventMessageDomain";
import { copyTextToClipboard, formatEventMessageDateTime } from "./eventMessageDetailUtils";
import {
  cancelEventMessage as apiCancelEventMessage,
  deleteEventMessage as apiDeleteEventMessage,
  dispatchEventMessage as apiDispatchEventMessage,
  fetchEventMessage,
  fetchEventMessagePreview,
} from "../lib/api";

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
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(current => current === key ? null : current), 1500);
    } else {
      setFeedback({ tone: "info", message: "Copie manualmente: seu navegador bloqueou a cópia automática." });
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
          onBack={onBack}
          title="Mensagem não encontrada"
          titleSize={20}
        />
      </div>
    );
  }

  const { recipientsActive, recipientsSkipped } = splitPreviewRecipients(preview);
  const confirmProps = getEventMessageConfirmProps(confirmAction);

  return (
    <div>
      <EventMessageDetailHeader
        busyAction={busyAction}
        canCancel={isEventMessageCancellable(message.status)}
        canDelete={message.status === "cancelada"}
        canDispatch={isEventMessageDispatchable(message.status)}
        canEdit={isEventMessageEditable(message.status) && Boolean(onEdit)}
        message={message}
        onBack={onBack}
        onEdit={onEdit}
        onRequestConfirm={requestConfirm}
      />

      {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} />}

      <MessageDetailSummaryPanel
        copiedKey={copiedKey}
        event={event}
        formatDateTime={formatEventMessageDateTime}
        loading={loading}
        message={message}
        onCopy={copy}
        preview={preview}
        recipientsActive={recipientsActive}
        recipientsSkipped={recipientsSkipped}
      />

      <MessageLogsPanel logs={logs} formatDateTime={formatEventMessageDateTime} />

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
