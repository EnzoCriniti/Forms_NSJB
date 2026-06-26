/**
 * @file backend/services/messageTemplatesService.mjs
 * @summary CRUD de modelos de mensagem.
 * @responsibility Validar payloads e delegar persistencia ao repositorio.
 */

import { MESSAGE_TYPES } from "../core/messages.mjs";
import {
  deleteMessageTemplateRecord,
  findMessageTemplateById,
  listMessageTemplates,
  upsertMessageTemplateRecord,
} from "../repositories/messageTemplatesRepository.mjs";

const makeError = (message, statusCode, code) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

const sanitizeConfig = config => {
  if (typeof config !== "object" || config === null) return {};
  const out = {};
  if (config.recipients && typeof config.recipients === "object") {
    out.recipients = {
      mode: config.recipients.mode || "auto",
      graus: Array.isArray(config.recipients.graus) ? config.recipients.graus : [],
      ...(config.recipients.presetId ? { presetId: Number(config.recipients.presetId) } : {}),
    };
  }
  if (Array.isArray(config.windowOptions)) out.windowOptions = config.windowOptions.map(String);
  return out;
};

const sanitize = payload => {
  const name = String(payload?.name || "").trim();
  const type = String(payload?.type || "").trim();
  const body = String(payload?.body || "").trim();
  if (!name) throw makeError("Nome do modelo e obrigatorio.", 400, "TEMPLATE_NAME_REQUIRED");
  if (!MESSAGE_TYPES.includes(type)) throw makeError("Tipo do modelo invalido.", 400, "TEMPLATE_TYPE_INVALID");
  if (!body) throw makeError("Corpo do modelo e obrigatorio.", 400, "TEMPLATE_BODY_REQUIRED");
  return { name, type, body, config: sanitizeConfig(payload.config) };
};

export const getMessageTemplates = () => listMessageTemplates();

export const saveMessageTemplate = async payload => {
  const sanitized = sanitize(payload);
  if (payload?.id) {
    const existing = await findMessageTemplateById(Number(payload.id));
    if (!existing) throw makeError("Modelo nao encontrado.", 404, "TEMPLATE_NOT_FOUND");
    await upsertMessageTemplateRecord({ id: existing.id, ...sanitized });
    return findMessageTemplateById(existing.id);
  }
  const id = await upsertMessageTemplateRecord(sanitized);
  return findMessageTemplateById(id);
};

export const deleteMessageTemplate = async templateId => {
  const id = Number(templateId);
  const existing = await findMessageTemplateById(id);
  if (!existing) throw makeError("Modelo nao encontrado.", 404, "TEMPLATE_NOT_FOUND");
  await deleteMessageTemplateRecord(id);
  return { ok: true, template: existing };
};
