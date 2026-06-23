/**
 * @file backend/routes/eventRoutes.mjs
 * @summary Rotas administrativas de eventos.
 * @responsibility Salvar eventos e controlar publicacao manual.
 */

import { sendJson } from "../core/http.mjs";
import { deleteEvent, saveEvent, publishEvent, searchEvents } from "../services/eventsService.mjs";
import { validateDeleteId, validateEventPayload } from "../validators/payloadValidators.mjs";
import { readBody, requireAdmin, requireAuth, sendKnownError } from "./requestHelpers.mjs";
import { writeEventDeleteAudit, writeEventPublishAudit, writeEventSaveAudit } from "./eventRouteAudit.mjs";

export const handleEventRoutes = async (req, res, url) => {
  if (req.method === "GET" && url.pathname === "/api/events") {
    const auth = await requireAuth(req);
    if (!auth) {
      sendJson(res, 401, { error: "Nao autenticado." });
      return true;
    }
    try {
      const result = await searchEvents({
        search: url.searchParams.get("search") || "",
        limit: url.searchParams.get("limit") || 20,
        offset: url.searchParams.get("offset") || 0,
      });
      sendJson(res, 200, result);
    } catch (error) {
      if (!sendKnownError(res, error)) {
        sendJson(res, error.statusCode || 400, { error: error.message, code: error.code || undefined });
      }
    }
    return true;
  }

  if (req.method === "POST" && url.pathname === "/api/events") {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    const body = await readBody(req);
    try {
      validateEventPayload(body);
      const event = await saveEvent(body);
      sendJson(res, 200, { event });
      writeEventSaveAudit(req, auth, { body, event });
    } catch (error) {
      writeEventSaveAudit(req, auth, { body, error });
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
      writeEventPublishAudit(req, auth, { eventId, event });
    } catch (error) {
      writeEventPublishAudit(req, auth, { eventId, error });
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
      writeEventDeleteAudit(req, auth, { eventId, result });
    } catch (error) {
      writeEventDeleteAudit(req, auth, { eventId, error });
      if (!sendKnownError(res, error)) {
        sendJson(res, error.statusCode || 400, { error: error.message, code: error.code || undefined });
      }
    }
    return true;
  }

  return false;
};
