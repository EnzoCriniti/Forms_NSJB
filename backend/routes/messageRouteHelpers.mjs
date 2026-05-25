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

export const matchEventMessagePath = pathname => {
  const match = pathname.match(/^\/api\/events\/(\d+)\/messages(?:\/(\d+))?(?:\/(preview|dispatch|cancel|logs))?$/);
  if (!match) return null;
  return {
    eventId: Number(match[1]),
    messageId: match[2] ? Number(match[2]) : null,
    action: match[3] || null,
  };
};
