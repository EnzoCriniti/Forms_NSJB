/**
 * @file backend/services/eventMessagesService.mjs
 * @summary Regras de negocio das mensagens vinculadas a eventos.
 * @responsibility Validar elegibilidade, transicoes, agendamento, renderizar corpo, calcular destinatarios e disparar.
 */

import {
  ELIGIBLE_FORM_TYPES,
  MESSAGE_DM_TYPES,
  MESSAGE_GROUP_TYPES,
  MESSAGE_STATUSES,
  MESSAGE_TYPES,
  TYPE_TO_FORM_TYPE,
  WINDOW_OPTIONS,
  buildPublicFormLink,
  buildWaLink,
  computeScheduledFor,
  renderTemplate,
} from "../core/messages.mjs";
import { findEventById } from "../repositories/eventsRepository.mjs";
import { listForms } from "../repositories/formsRepository.mjs";
import { findMessageTemplateById } from "../repositories/messageTemplatesRepository.mjs";
import { getJsonSetting } from "../repositories/settingsRepository.mjs";
import {
  deleteEventMessageRecord,
  findEventMessageById,
  listEventMessagesByEventId,
  listScheduledEventMessagesDue,
  upsertEventMessageRecord,
} from "../repositories/eventMessagesRepository.mjs";
import { getMessagingConfig } from "./messagingConfigService.mjs";
import { calculateRecipients } from "./messageRecipientsService.mjs";
import { logOnlyDispatcher } from "../dispatchers/logOnlyDispatcher.mjs";

const makeError = (message, statusCode, code) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

const dispatcher = logOnlyDispatcher;

const eligibleFormTypesForEvent = forms => new Set(
  forms.filter(form => ELIGIBLE_FORM_TYPES.includes(form.type)).map(form => form.type),
);

export const isEventEligible = forms => eligibleFormTypesForEvent(forms).size > 0;

export const eligibleMessageTypesForEvent = forms => {
  const types = eligibleFormTypesForEvent(forms);
  return MESSAGE_TYPES.filter(messageType => TYPE_TO_FORM_TYPE[messageType].some(formType => types.has(formType)));
};

const loadEventForms = async event => {
  const all = await listForms();
  const ids = new Set(event.formIds || []);
  return all.filter(form => ids.has(form.id));
};

const loadFormForMessage = async (type, configFormId, eventForms) => {
  if (type === "new_scale") return null;
  const expected = TYPE_TO_FORM_TYPE[type];
  const candidate = eventForms.find(form => Number(form.id) === Number(configFormId));
  if (!candidate) throw makeError("Formulario do evento nao encontrado para esta mensagem.", 400, "MESSAGE_FORM_NOT_FOUND");
  if (!expected.includes(candidate.type)) {
    throw makeError("Tipo de formulario incompativel com o tipo da mensagem.", 400, "MESSAGE_FORM_TYPE_INVALID");
  }
  return candidate;
};

const ensurePhoneColumnConfigured = async type => {
  if (!MESSAGE_DM_TYPES.includes(type)) return;
  const membersConfig = await getJsonSetting("membersConfig", {});
  if (!String(membersConfig?.phoneColumn || "").trim()) {
    throw makeError("Coluna de telefone nao configurada na base central.", 400, "PHONE_COLUMN_NOT_CONFIGURED");
  }
};

const sanitizePayload = payload => {
  const type = String(payload?.type || "").trim();
  if (!MESSAGE_TYPES.includes(type)) throw makeError("Tipo da mensagem invalido.", 400, "MESSAGE_TYPE_INVALID");
  const body = String(payload?.body || "").trim();
  if (!body) throw makeError("Corpo da mensagem e obrigatorio.", 400, "MESSAGE_BODY_REQUIRED");
  const status = String(payload?.status || "rascunho");
  if (!MESSAGE_STATUSES.includes(status)) throw makeError("Status da mensagem invalido.", 400, "MESSAGE_STATUS_INVALID");
  const windowOption = payload?.windowOption ? String(payload.windowOption) : null;
  if (windowOption && !WINDOW_OPTIONS.includes(windowOption)) {
    throw makeError("Janela de agendamento invalida.", 400, "MESSAGE_WINDOW_INVALID");
  }
  return {
    type,
    body,
    status,
    templateId: payload?.templateId ? Number(payload.templateId) : null,
    config: typeof payload?.config === "object" && payload.config !== null ? payload.config : {},
    scheduledFor: payload?.scheduledFor || null,
    windowOption,
    autoDispatchEnabled: payload?.autoDispatchEnabled !== false,
  };
};

const computeScheduledForFromConfig = (sanitized, formForMessage) => {
  if (sanitized.type === "fill_reminder" && sanitized.windowOption && formForMessage?.closing) {
    return computeScheduledFor(sanitized.windowOption, formForMessage.closing);
  }
  return sanitized.scheduledFor;
};

const deriveStatusOnSave = (sanitized, scheduledFor) => {
  if (sanitized.status === "cancelada") return "cancelada";
  if (scheduledFor) return "agendada";
  return "rascunho";
};

const buildRenderContext = ({ event, eventForms, form, messagingConfig, person }) => ({
  event,
  forms: eventForms,
  form,
  publicBaseUrl: messagingConfig.publicBaseUrl,
  group: { name: messagingConfig.whatsappGroupName },
  person,
});

const renderForRecipients = ({ message, event, eventForms, form, messagingConfig, recipients }) => {
  if (recipients.kind === "group") {
    const ctx = buildRenderContext({ event, eventForms, form, messagingConfig, person: null });
    return { renderedBody: renderTemplate(message.body, ctx), perPerson: [] };
  }
  const baseCtx = buildRenderContext({ event, eventForms, form, messagingConfig, person: null });
  const groupRender = renderTemplate(message.body, baseCtx);
  const perPerson = recipients.recipients.map(recipient => {
    const personCtx = buildRenderContext({ event, eventForms, form, messagingConfig, person: recipient });
    const personalText = renderTemplate(message.body, personCtx);
    const link = recipient.phone ? buildWaLink(recipient.phone, personalText) : "";
    return { ...recipient, renderedBody: personalText, waLink: link };
  });
  return { renderedBody: groupRender, perPerson };
};

const buildPreview = async (message, event, eventForms, messagingConfig) => {
  const form = await loadFormForMessage(message.type, message.config?.formId, eventForms);
  const recipients = await calculateRecipients({
    message,
    type: message.type,
    form,
    group: { name: messagingConfig.whatsappGroupName },
  });
  const rendered = renderForRecipients({ message, event, eventForms, form, messagingConfig, recipients });
  return {
    kind: recipients.kind,
    groupName: recipients.kind === "group" ? messagingConfig.whatsappGroupName : null,
    renderedBody: rendered.renderedBody,
    recipients: recipients.kind === "group" ? [] : rendered.perPerson,
    formLink: form ? buildPublicFormLink(form, messagingConfig.publicBaseUrl) : null,
  };
};

export const getEventMessages = async eventId => {
  const event = await findEventById(Number(eventId));
  if (!event) throw makeError("Evento nao encontrado.", 404, "EVENT_NOT_FOUND");
  return listEventMessagesByEventId(event.id);
};

export const getEventMessage = async messageId => {
  const message = await findEventMessageById(Number(messageId));
  if (!message) throw makeError("Mensagem nao encontrada.", 404, "MESSAGE_NOT_FOUND");
  return message;
};

export const getEventMessagePreview = async messageId => {
  const message = await getEventMessage(messageId);
  const event = await findEventById(message.eventId);
  if (!event) throw makeError("Evento nao encontrado.", 404, "EVENT_NOT_FOUND");
  const eventForms = await loadEventForms(event);
  const messagingConfig = await getMessagingConfig();
  return buildPreview(message, event, eventForms, messagingConfig);
};

export const saveEventMessage = async (eventId, payload) => {
  const event = await findEventById(Number(eventId));
  if (!event) throw makeError("Evento nao encontrado.", 404, "EVENT_NOT_FOUND");

  const eventForms = await loadEventForms(event);
  if (!isEventEligible(eventForms)) {
    throw makeError("Evento nao possui formularios elegiveis para mensagens.", 400, "EVENT_NOT_ELIGIBLE_FOR_MESSAGES");
  }

  const sanitized = sanitizePayload(payload);

  if (!eligibleMessageTypesForEvent(eventForms).includes(sanitized.type)) {
    throw makeError("Este evento nao possui formulario compativel com o tipo da mensagem.", 400, "MESSAGE_TYPE_NOT_AVAILABLE");
  }

  await ensurePhoneColumnConfigured(sanitized.type);

  if (sanitized.templateId) {
    const template = await findMessageTemplateById(sanitized.templateId);
    if (!template || template.type !== sanitized.type) {
      throw makeError("Modelo selecionado e incompativel com o tipo.", 400, "TEMPLATE_TYPE_MISMATCH");
    }
  }

  const formForMessage = await loadFormForMessage(sanitized.type, sanitized.config?.formId, eventForms);
  if (sanitized.type !== "new_scale" && !formForMessage) {
    throw makeError("Selecione o formulario alvo da mensagem.", 400, "MESSAGE_FORM_REQUIRED");
  }

  const scheduledFor = computeScheduledForFromConfig(sanitized, formForMessage);
  const status = deriveStatusOnSave(sanitized, scheduledFor);

  if (payload?.id) {
    const existing = await findEventMessageById(Number(payload.id));
    if (!existing) throw makeError("Mensagem nao encontrada.", 404, "MESSAGE_NOT_FOUND");
    if (!["rascunho", "agendada"].includes(existing.status) && status !== "cancelada") {
      throw makeError("Mensagem nao pode mais ser editada neste estado.", 400, "MESSAGE_NOT_EDITABLE");
    }
    await upsertEventMessageRecord({ id: existing.id, eventId: event.id, ...sanitized, scheduledFor, status });
    return findEventMessageById(existing.id);
  }

  const id = await upsertEventMessageRecord({ eventId: event.id, ...sanitized, scheduledFor, status });
  return findEventMessageById(id);
};

export const cancelEventMessage = async messageId => {
  const message = await getEventMessage(messageId);
  if (!["rascunho", "agendada", "pronta"].includes(message.status)) {
    throw makeError("Mensagem nao pode mais ser cancelada neste estado.", 400, "MESSAGE_NOT_CANCELLABLE");
  }
  await upsertEventMessageRecord({ ...message, status: "cancelada" });
  return findEventMessageById(message.id);
};

export const dispatchEventMessage = async (messageId, mode = "manual") => {
  const message = await getEventMessage(messageId);
  if (!["rascunho", "agendada", "pronta"].includes(message.status)) {
    throw makeError("Mensagem nao pode ser disparada neste estado.", 400, "MESSAGE_NOT_DISPATCHABLE");
  }
  const event = await findEventById(message.eventId);
  if (!event) throw makeError("Evento nao encontrado.", 404, "EVENT_NOT_FOUND");
  const eventForms = await loadEventForms(event);
  const messagingConfig = await getMessagingConfig();
  const preview = await buildPreview(message, event, eventForms, messagingConfig);

  const dispatchResult = await dispatcher.dispatch({
    messageId: message.id,
    mode,
    renderedBody: preview.renderedBody,
    recipients: preview.recipients,
    groupName: preview.groupName,
  });

  const sentAt = new Date().toISOString();
  await upsertEventMessageRecord({ ...message, status: "disparada", sentAt });
  return {
    message: await findEventMessageById(message.id),
    dispatch: dispatchResult,
    preview,
  };
};

export const processScheduledMessages = async (cutoffIso = new Date().toISOString()) => {
  const messagingConfig = await getMessagingConfig();
  const due = await listScheduledEventMessagesDue(cutoffIso);
  const results = [];
  for (const message of due) {
    if (!messagingConfig.autoDispatchEnabled || !message.autoDispatchEnabled) {
      await upsertEventMessageRecord({ ...message, status: "pronta" });
      results.push({ messageId: message.id, action: "marked_ready" });
      continue;
    }
    try {
      const outcome = await dispatchEventMessage(message.id, "scheduled");
      results.push({ messageId: message.id, action: "dispatched", logId: outcome.dispatch?.logId });
    } catch (error) {
      results.push({ messageId: message.id, action: "failed", error: error.message });
    }
  }
  return results;
};

export const isMessageEditable = message => ["rascunho", "agendada"].includes(message?.status);
