import { auditLevelFromError, auditStatusFromError, writeAudit } from "./requestHelpers.mjs";

export const writeEventSaveAudit = (req, auth, { body, event = null, error = null }) => {
  const isUpdate = Boolean(body?.id);
  const action = isUpdate ? "update_event" : "create_event";

  return writeAudit(req, auth, {
    level: error ? auditLevelFromError(error) : "info",
    category: "events",
    action,
    status: error ? auditStatusFromError(error) : "success",
    screen: "eventos",
    entityType: "event",
    entityId: error ? (body?.id || null) : event.id,
    entityLabel: error ? (body?.title || null) : event.title,
    message: error?.message || (isUpdate ? "Evento atualizado." : "Evento criado."),
    metadata: error
      ? { formIds: Array.isArray(body?.formIds) ? body.formIds : [] }
      : {
          eventId: event.id,
          status: event.status,
          formIds: event.formIds,
        },
  });
};

export const writeEventPublishAudit = (req, auth, { eventId, event = null, error = null }) => (
  writeAudit(req, auth, {
    level: error ? auditLevelFromError(error) : "info",
    category: "events",
    action: "publish_event",
    status: error ? auditStatusFromError(error) : "success",
    screen: "eventos",
    entityType: "event",
    entityId: event?.id || eventId,
    entityLabel: event?.title || null,
    message: error?.message || "Evento publicado.",
    metadata: error
      ? { eventId }
      : {
          eventId: event.id,
          formIds: event.formIds,
          publishedAt: event.publishedAt,
        },
  })
);

export const writeEventDeleteAudit = (req, auth, { eventId, result = null, error = null }) => (
  writeAudit(req, auth, {
    level: error ? auditLevelFromError(error) : "info",
    category: "events",
    action: "delete_event",
    status: error ? auditStatusFromError(error) : "success",
    screen: "eventos",
    entityType: "event",
    entityId: eventId,
    entityLabel: result?.event?.title || null,
    message: error?.message || "Evento excluido.",
    metadata: { eventId },
  })
);
