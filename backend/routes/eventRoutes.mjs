/**
 * @file backend/routes/eventRoutes.mjs
 * @summary Rotas administrativas de eventos.
 * @responsibility Salvar eventos e controlar publicacao manual.
 */

import { sendJson } from "../core/http.mjs";
import { deleteEvent, saveEvent, publishEvent } from "../services/eventsService.mjs";
import { validateDeleteId, validateEventPayload } from "../validators/payloadValidators.mjs";
import {
  auditLevelFromError,
  auditStatusFromError,
  readBody,
  requireAdmin,
  sendKnownError,
  writeAudit,
} from "./requestHelpers.mjs";

export const handleEventRoutes = async (req, res, url) => {
  if (req.method === "POST" && url.pathname === "/api/events") {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    const body = await readBody(req);
    try {
      validateEventPayload(body);
      const event = await saveEvent(body);
      sendJson(res, 200, { event });
      writeAudit(req, auth, {
        level: "info",
        category: "events",
        action: body?.id ? "update_event" : "create_event",
        status: "success",
        screen: "eventos",
        entityType: "event",
        entityId: event.id,
        entityLabel: event.title,
        message: body?.id ? "Evento atualizado." : "Evento criado.",
        metadata: {
          eventId: event.id,
          status: event.status,
          formIds: event.formIds,
        },
      });
    } catch (error) {
      writeAudit(req, auth, {
        level: auditLevelFromError(error),
        category: "events",
        action: body?.id ? "update_event" : "create_event",
        status: auditStatusFromError(error),
        screen: "eventos",
        entityType: "event",
        entityId: body?.id || null,
        entityLabel: body?.title || null,
        message: error.message,
        metadata: {
          formIds: Array.isArray(body?.formIds) ? body.formIds : [],
        },
      });
      if (!sendKnownError(res, error)) {
        sendJson(res, error.statusCode || 400, { error: error.message, code: error.code || undefined });
      }
    }
    return true;
  }

  if (req.method === "POST" && url.pathname.startsWith("/api/events/") && url.pathname.endsWith("/publish")) {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    const eventId = validateDeleteId(url.pathname.split("/")[3], "Id do evento");
    try {
      const event = await publishEvent(eventId);
      sendJson(res, 200, { event });
      writeAudit(req, auth, {
        level: "info",
        category: "events",
        action: "publish_event",
        status: "success",
        screen: "eventos",
        entityType: "event",
        entityId: event.id,
        entityLabel: event.title,
        message: "Evento publicado.",
        metadata: {
          eventId: event.id,
          formIds: event.formIds,
          publishedAt: event.publishedAt,
        },
      });
    } catch (error) {
      writeAudit(req, auth, {
        level: auditLevelFromError(error),
        category: "events",
        action: "publish_event",
        status: auditStatusFromError(error),
        screen: "eventos",
        entityType: "event",
        entityId: eventId,
        entityLabel: null,
        message: error.message,
        metadata: { eventId },
      });
      if (!sendKnownError(res, error)) {
        sendJson(res, error.statusCode || 400, { error: error.message, code: error.code || undefined });
      }
    }
    return true;
  }

  if (req.method === "DELETE" && url.pathname.startsWith("/api/events/")) {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    const eventId = validateDeleteId(url.pathname.split("/").pop(), "Id do evento");
    try {
      const result = await deleteEvent(eventId);
      sendJson(res, 200, { ok: true });
      writeAudit(req, auth, {
        level: "info",
        category: "events",
        action: "delete_event",
        status: "success",
        screen: "eventos",
        entityType: "event",
        entityId: eventId,
        entityLabel: result.event.title,
        message: "Evento excluido.",
        metadata: { eventId },
      });
    } catch (error) {
      writeAudit(req, auth, {
        level: auditLevelFromError(error),
        category: "events",
        action: "delete_event",
        status: auditStatusFromError(error),
        screen: "eventos",
        entityType: "event",
        entityId: eventId,
        entityLabel: null,
        message: error.message,
        metadata: { eventId },
      });
      if (!sendKnownError(res, error)) {
        sendJson(res, error.statusCode || 400, { error: error.message, code: error.code || undefined });
      }
    }
    return true;
  }

  return false;
};
