/**
 * @file frontend/src/screens/EventMessageDetailScreen.jsx
 * @summary Detalhe e operacoes de uma mensagem de evento.
 * @responsibility Preview renderizado, dispatch manual, cancelamento, exclusao e historico de logs.
 */

import React, { useCallback, useEffect, useState } from "react";
import { Btn, COLORS, ConfirmModal, FeedbackBanner, Icon, ScreenHeader, resolveActionErrorMessage } from "../components/ui";
import { MessageStatusBadge, MESSAGE_TYPE_LABELS } from "../components/MessageStatusBadge";
import {
  cancelEventMessage as apiCancelEventMessage,
  deleteEventMessage as apiDeleteEventMessage,
  dispatchEventMessage as apiDispatchEventMessage,
  fetchEventMessage,
  fetchEventMessagePreview,
} from "../lib/api";

const isEditable = status => ["rascunho", "agendada"].includes(status);
const isCancellable = status => ["rascunho", "agendada", "pronta"].includes(status);
const isDispatchable = status => ["rascunho", "agendada", "pronta"].includes(status);

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

  const recipientsActive = (preview?.recipients || []).filter(item => !item.skipped);
  const recipientsSkipped = (preview?.recipients || []).filter(item => item.skipped);

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
            {isEditable(message.status) && onEdit && (
              <Btn v="secondary" icon="edit" onClick={onEdit}>Editar</Btn>
            )}
            {isCancellable(message.status) && (
              <Btn v="secondary" icon="close" onClick={() => requestConfirm("cancel")} loading={busyAction === "cancel"} disabled={Boolean(busyAction)}>Cancelar</Btn>
            )}
            {message.status === "cancelada" && (
              <Btn v="danger" icon="trash" onClick={() => requestConfirm("delete")} loading={busyAction === "delete"} disabled={Boolean(busyAction)}>Excluir</Btn>
            )}
            {isDispatchable(message.status) && (
              <Btn icon="share" onClick={() => requestConfirm("dispatch")} loading={busyAction === "dispatch"} disabled={Boolean(busyAction)}>Disparar agora</Btn>
            )}
          </>
        )}
        titleSize={20}
      />

      {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} />}

      <section style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 18, display: "grid", gap: 16 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: COLORS.textMuted }}>
            <span>Evento: <strong style={{ color: COLORS.text }}>{event?.title}</strong></span>
            {message.scheduledFor && <span>Agendada: {formatDateTime(message.scheduledFor)}</span>}
            {message.sentAt && <span>Disparada: {formatDateTime(message.sentAt)}</span>}
            <span>Auto: {message.autoDispatchEnabled ? "sim" : "nao"}</span>
          </div>
        </div>

        <div>
          <h4 style={{ margin: "0 0 8px", fontSize: 13, color: COLORS.textSecondary }}>Corpo renderizado</h4>
          {loading ? (
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>Carregando preview...</div>
          ) : preview?.renderedBody ? (
            <div style={{ position: "relative" }}>
              <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 12, fontFamily: "inherit", fontSize: 13, margin: 0 }}>
                {preview.renderedBody}
              </pre>
              <div style={{ marginTop: 8 }}>
                <Btn v="secondary" sz="sm" icon="link" onClick={() => copy(preview.renderedBody, "body")}>
                  {copiedKey === "body" ? "Copiado!" : "Copiar texto"}
                </Btn>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: COLORS.textMuted }}>Preview indisponivel.</div>
          )}
        </div>

        {!loading && preview && preview.kind === "group" && (
          <div style={{ border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 12, fontSize: 13, color: COLORS.textSecondary }}>
            Mensagem destinada ao grupo {preview.groupName ? <strong style={{ color: COLORS.text }}>{preview.groupName}</strong> : <em>(nome do grupo nao configurado)</em>}. Cole o texto acima no grupo do WhatsApp.
          </div>
        )}

        {!loading && preview && preview.kind === "dm" && (
          <div>
            <h4 style={{ margin: "0 0 8px", fontSize: 13, color: COLORS.textSecondary }}>
              Destinatarios ({recipientsActive.length} com telefone{recipientsSkipped.length > 0 ? `, ${recipientsSkipped.length} sem telefone` : ""})
            </h4>
            {recipientsActive.length === 0 && recipientsSkipped.length === 0 && (
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>Nenhum destinatario calculado.</div>
            )}
            <div style={{ display: "grid", gap: 6 }}>
              {recipientsActive.map(recipient => (
                <div key={recipient.key || recipient.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, background: COLORS.surface, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <strong style={{ fontSize: 13 }}>{recipient.name}</strong>
                    {recipient.grau && <span style={{ fontSize: 11, color: COLORS.textMuted, marginLeft: 6 }}>({recipient.grau})</span>}
                    <div style={{ fontSize: 11, color: COLORS.textMuted }}>{recipient.phone}</div>
                  </div>
                  {recipient.waLink && (
                    <a
                      href={recipient.waLink}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: 12, color: COLORS.primary, textDecoration: "none", padding: "6px 10px", border: `1px solid ${COLORS.primary}`, borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 4 }}
                    >
                      <Icon name="share" size={12} /> wa.me
                    </a>
                  )}
                </div>
              ))}
              {recipientsSkipped.map(recipient => (
                <div key={`skipped-${recipient.key || recipient.name}`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", border: `1px dashed ${COLORS.border}`, borderRadius: 8, background: COLORS.surfaceAlt, opacity: 0.7 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <strong style={{ fontSize: 13 }}>{recipient.name}</strong>
                    {recipient.grau && <span style={{ fontSize: 11, color: COLORS.textMuted, marginLeft: 6 }}>({recipient.grau})</span>}
                    <div style={{ fontSize: 11, color: COLORS.warning }}>sem telefone</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 16 }}>Historico de disparos</h3>
        {logs.length === 0 ? (
          <div style={{ border: `1px dashed ${COLORS.border}`, borderRadius: 8, padding: 18, color: COLORS.textSecondary, fontSize: 13 }}>
            Nenhum disparo registrado ainda.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {logs.map(log => (
              <div key={log.id} style={{ border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 12, background: COLORS.surface }}>
                <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, fontSize: 12, color: COLORS.textMuted }}>
                  <span>{formatDateTime(log.dispatchedAt)} - modo {log.mode}</span>
                  <span>{log.status} ({log.dispatcherVersion})</span>
                </div>
                <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 6, padding: 10, fontFamily: "inherit", fontSize: 12, margin: "8px 0 0" }}>
                  {log.renderedBody}
                </pre>
                {log.groupName && <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 6 }}>Grupo: {log.groupName}</div>}
                {Array.isArray(log.recipients) && log.recipients.length > 0 && (
                  <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 6 }}>
                    {log.recipients.filter(item => !item.skipped).length} destinatario(s){log.recipients.some(item => item.skipped) ? `, ${log.recipients.filter(item => item.skipped).length} ignorado(s)` : ""}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <ConfirmModal
        open={Boolean(confirmAction)}
        title={confirmAction === "dispatch" ? "Disparar mensagem" : confirmAction === "cancel" ? "Cancelar mensagem" : "Excluir mensagem"}
        message={
          confirmAction === "dispatch"
            ? "No modo log-only nada e enviado de fato — apenas o disparo e registrado no historico e o status passa a 'disparada'. Confirma?"
            : confirmAction === "cancel"
              ? "Cancelar move a mensagem para o estado 'cancelada' e impede edicoes e disparos futuros. Continuar?"
              : "Excluir remove a mensagem e o historico de logs associado. Continuar?"
        }
        confirmLabel={confirmAction === "delete" ? "Excluir" : confirmAction === "cancel" ? "Cancelar mensagem" : "Disparar"}
        tone={confirmAction === "delete" ? "danger" : confirmAction === "cancel" ? "warning" : "primary"}
        onCancel={closeConfirm}
        onConfirm={runConfirm}
      />
    </div>
  );
};
