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
  writeEventMessageCancelAudit,
  writeEventMessageCancelErrorAudit,
  writeEventMessageDispatchAudit,
  writeEventMessageDispatchErrorAudit,
  writeEventMessageSaveAudit,
  writeEventMessageSaveErrorAudit,
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
        writeEventMessageSaveAudit(req, auth, { body, match, message });
      } catch (error) {
        writeEventMessageSaveErrorAudit(req, auth, { body, error, match });
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
        writeEventMessageDispatchAudit(req, auth, { match, result });
      } catch (error) {
        writeEventMessageDispatchErrorAudit(req, auth, { error, match });
        respondMessageRouteError(res, error);
      }
      return true;
    }

    if (match.messageId && match.action === "cancel" && req.method === "POST") {
      try {
        const message = await cancelEventMessage(match.messageId);
        sendJson(res, 200, { message });
        writeEventMessageCancelAudit(req, auth, { match, message });
      } catch (error) {
        writeEventMessageCancelErrorAudit(req, auth, { error, match });
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
