import { sendJson } from "../core/http.mjs";
import { auditLevelFromError, auditStatusFromError, sendKnownError, writeAudit } from "./requestHelpers.mjs";

export const respondMessageRouteError = (res, error) => {
  if (sendKnownError(res, error)) return;
  sendJson(res, error.statusCode || 400, { error: error.message, code: error.code || undefined });
};

export const writeMessageAudit = (req, auth, {
  action,
  status,
  level,
  message,
  entityId = null,
  entityLabel = null,
  metadata = {},
}) => writeAudit(req, auth, {
  level,
  category: "messages",
  action,
  status,
  screen: "eventos",
  entityType: "event_message",
  entityId,
  entityLabel,
  message,
  metadata,
});

export const writeMessageErrorAudit = (req, auth, {
  action,
  error,
  entityId = null,
  entityLabel = null,
  metadata = {},
}) => writeMessageAudit(req, auth, {
  level: auditLevelFromError(error),
  action,
  status: auditStatusFromError(error),
  entityId,
  entityLabel,
  message: error.message,
  metadata,
});

export const writeEventMessageSaveAudit = (req, auth, { body, match, message }) => writeMessageAudit(req, auth, {
  level: "info",
  action: body?.id ? "update_event_message" : "create_event_message",
  status: "success",
  entityId: message.id,
  entityLabel: message.type,
  message: body?.id ? "Mensagem de evento atualizada." : "Mensagem de evento criada.",
  metadata: {
    eventId: match.eventId,
    messageId: message.id,
    type: message.type,
    status: message.status,
    scheduledFor: message.scheduledFor,
  },
});

export const writeEventMessageSaveErrorAudit = (req, auth, { body, error, match }) => writeMessageErrorAudit(req, auth, {
  action: body?.id ? "update_event_message" : "create_event_message",
  error,
  entityId: body?.id || null,
  entityLabel: body?.type || null,
  metadata: {
    eventId: match.eventId,
    type: body?.type || null,
  },
});

export const writeEventMessageDispatchAudit = (req, auth, { match, result }) => writeMessageAudit(req, auth, {
  level: "info",
  action: "dispatch_event_message",
  status: "success",
  entityId: result.message?.id || match.messageId,
  entityLabel: result.message?.type || null,
  message: "Mensagem de evento disparada em modo log-only.",
  metadata: {
    eventId: match.eventId,
    messageId: result.message?.id || match.messageId,
    type: result.message?.type || null,
    dispatchStatus: result.dispatch?.status,
    logId: result.dispatch?.logId,
    recipients: Array.isArray(result.preview?.recipients) ? result.preview.recipients.length : 0,
  },
});

export const writeEventMessageDispatchErrorAudit = (req, auth, { error, match }) => writeMessageErrorAudit(req, auth, {
  action: "dispatch_event_message",
  error,
  entityId: match.messageId,
  entityLabel: null,
  metadata: { eventId: match.eventId, messageId: match.messageId },
});

export const writeEventMessageCancelAudit = (req, auth, { match, message }) => writeMessageAudit(req, auth, {
  level: "info",
  action: "cancel_event_message",
  status: "success",
  entityId: message.id,
  entityLabel: message.type,
  message: "Mensagem de evento cancelada.",
  metadata: {
    eventId: match.eventId,
    messageId: message.id,
    type: message.type,
    status: message.status,
  },
});

export const writeEventMessageCancelErrorAudit = (req, auth, { error, match }) => writeMessageErrorAudit(req, auth, {
  action: "cancel_event_message",
  error,
  entityId: match.messageId,
  entityLabel: null,
  metadata: { eventId: match.eventId, messageId: match.messageId },
});

export const matchEventMessagePath = pathname => {
  const match = pathname.match(/^\/api\/events\/(\d+)\/messages(?:\/(\d+))?(?:\/(preview|dispatch|cancel|logs))?$/);
  if (!match) return null;
  return {
    eventId: Number(match[1]),
    messageId: match[2] ? Number(match[2]) : null,
    action: match[3] || null,
  };
};
