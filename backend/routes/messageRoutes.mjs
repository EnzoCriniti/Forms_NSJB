/**
 * @file backend/routes/messageRoutes.mjs
 * @summary Rotas administrativas da feature de mensagens.
 * @responsibility CRUD de modelos, presets, config global e mensagens vinculadas a eventos, mais dispatch manual.
 */

import { sendJson } from "../core/http.mjs";
import {
  cancelEventMessage,
  dispatchEventMessage,
  getEventMessage,
  getEventMessagePreview,
  getEventMessages,
  saveEventMessage,
} from "../services/eventMessagesService.mjs";
import {
  deleteMessageTemplate,
  getMessageTemplates,
  saveMessageTemplate,
} from "../services/messageTemplatesService.mjs";
import {
  deletePersonPreset,
  getPersonPresets,
  savePersonPreset,
} from "../services/personPresetsService.mjs";
import {
  getMessagingConfig,
  updateMessagingConfig,
} from "../services/messagingConfigService.mjs";
import { deleteEventMessageRecord } from "../repositories/eventMessagesRepository.mjs";
import { listMessageDispatchLogsByMessageId } from "../repositories/messageDispatchLogRepository.mjs";
import {
  validateDeleteId,
  validateEventMessagePayload,
  validateMessageTemplatePayload,
  validateMessagingConfigPayload,
  validatePersonPresetPayload,
} from "../validators/payloadValidators.mjs";
import { readBody, requireAdmin } from "./requestHelpers.mjs";
import {
  matchEventMessagePath,
  respondMessageRouteError,
  writeMessageAudit,
  writeMessageErrorAudit,
} from "./messageRouteHelpers.mjs";

export const handleMessageRoutes = async (req, res, url) => {
  if (url.pathname === "/api/messaging-config" && (req.method === "GET" || req.method === "PUT")) {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    if (req.method === "GET") {
      sendJson(res, 200, { config: await getMessagingConfig() });
      return true;
    }
    const body = await readBody(req);
    try {
      validateMessagingConfigPayload(body);
      const config = await updateMessagingConfig(body);
      sendJson(res, 200, { config });
    } catch (error) {
      respondMessageRouteError(res, error);
    }
    return true;
  }

  if (url.pathname === "/api/message-templates") {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    if (req.method === "GET") {
      sendJson(res, 200, { templates: await getMessageTemplates() });
      return true;
    }
    if (req.method === "POST") {
      const body = await readBody(req);
      try {
        validateMessageTemplatePayload(body);
        const template = await saveMessageTemplate(body);
        sendJson(res, 200, { template });
      } catch (error) {
        respondMessageRouteError(res, error);
      }
      return true;
    }
  }

  if (url.pathname.startsWith("/api/message-templates/") && req.method === "DELETE") {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    try {
      const id = validateDeleteId(url.pathname.split("/").pop(), "Id do modelo");
      const result = await deleteMessageTemplate(id);
      sendJson(res, 200, { ok: true, template: result.template });
    } catch (error) {
      respondMessageRouteError(res, error);
    }
    return true;
  }

  if (url.pathname === "/api/person-presets") {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    if (req.method === "GET") {
      sendJson(res, 200, { presets: await getPersonPresets() });
      return true;
    }
    if (req.method === "POST") {
      const body = await readBody(req);
      try {
        validatePersonPresetPayload(body);
        const preset = await savePersonPreset(body);
        sendJson(res, 200, { preset });
      } catch (error) {
        respondMessageRouteError(res, error);
      }
      return true;
    }
  }

  if (url.pathname.startsWith("/api/person-presets/") && req.method === "DELETE") {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;
    try {
      const id = validateDeleteId(url.pathname.split("/").pop(), "Id do preset");
      const result = await deletePersonPreset(id);
      sendJson(res, 200, { ok: true, preset: result.preset });
    } catch (error) {
      respondMessageRouteError(res, error);
    }
    return true;
  }

  const match = matchEventMessagePath(url.pathname);
  if (match) {
    const auth = await requireAdmin(req, res);
    if (!auth) return true;

    if (!match.messageId && req.method === "GET") {
      try {
        sendJson(res, 200, { messages: await getEventMessages(match.eventId) });
      } catch (error) {
        respondMessageRouteError(res, error);
      }
      return true;
    }

    if (!match.messageId && req.method === "POST") {
      const body = await readBody(req);
      try {
        validateEventMessagePayload(body);
        const message = await saveEventMessage(match.eventId, body);
        sendJson(res, 200, { message });
        writeMessageAudit(req, auth, {
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
      } catch (error) {
        writeMessageErrorAudit(req, auth, {
          action: body?.id ? "update_event_message" : "create_event_message",
          error,
          entityId: body?.id || null,
          entityLabel: body?.type || null,
          metadata: {
            eventId: match.eventId,
            type: body?.type || null,
          },
        });
        respondMessageRouteError(res, error);
      }
      return true;
    }

    if (match.messageId && match.action === null && req.method === "GET") {
      try {
        const message = await getEventMessage(match.messageId);
        const logs = await listMessageDispatchLogsByMessageId(match.messageId);
        sendJson(res, 200, { message, logs });
      } catch (error) {
        respondMessageRouteError(res, error);
      }
      return true;
    }

    if (match.messageId && match.action === null && req.method === "DELETE") {
      try {
        const message = await getEventMessage(match.messageId);
        if (message.eventId !== match.eventId) {
          sendJson(res, 404, { error: "Mensagem nao encontrada." });
          return true;
        }
        await deleteEventMessageRecord(message.id);
        sendJson(res, 200, { ok: true });
      } catch (error) {
        respondMessageRouteError(res, error);
      }
      return true;
    }

    if (match.messageId && match.action === "preview" && req.method === "GET") {
      try {
        sendJson(res, 200, { preview: await getEventMessagePreview(match.messageId) });
      } catch (error) {
        respondMessageRouteError(res, error);
      }
      return true;
    }

    if (match.messageId && match.action === "dispatch" && req.method === "POST") {
      try {
        const result = await dispatchEventMessage(match.messageId, "manual");
        sendJson(res, 200, result);
        writeMessageAudit(req, auth, {
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
      } catch (error) {
        writeMessageErrorAudit(req, auth, {
          action: "dispatch_event_message",
          error,
          entityId: match.messageId,
          entityLabel: null,
          metadata: { eventId: match.eventId, messageId: match.messageId },
        });
        respondMessageRouteError(res, error);
      }
      return true;
    }

    if (match.messageId && match.action === "cancel" && req.method === "POST") {
      try {
        const message = await cancelEventMessage(match.messageId);
        sendJson(res, 200, { message });
        writeMessageAudit(req, auth, {
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
      } catch (error) {
        writeMessageErrorAudit(req, auth, {
          action: "cancel_event_message",
          error,
          entityId: match.messageId,
          entityLabel: null,
          metadata: { eventId: match.eventId, messageId: match.messageId },
        });
        respondMessageRouteError(res, error);
      }
      return true;
    }

    if (match.messageId && match.action === "logs" && req.method === "GET") {
      try {
        sendJson(res, 200, { logs: await listMessageDispatchLogsByMessageId(match.messageId) });
      } catch (error) {
        respondMessageRouteError(res, error);
      }
      return true;
    }
  }

  return false;
};
