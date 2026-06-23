/**
 * @file backend/services/eventsService.mjs
 * @summary Regras de negocio de eventos.
 * @responsibility Normalizar eventos, vincular formularios e controlar publicacao manual.
 */

import { nowIso } from "../database/shared.mjs";
import { findFormById } from "../repositories/formsRepository.mjs";
import { deleteEventRecord, findEventById, listEvents, listEventsPage, upsertEventRecord } from "../repositories/eventsRepository.mjs";
import { listEventMessages } from "../repositories/eventMessagesRepository.mjs";
import { onEventClosed } from "../bi/index.mjs";

const makeError = (message, statusCode, code) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

const EVENT_STATUS = ["rascunho", "pronto", "publicado", "encerrado"];

const normalizeFormIds = ids => [...new Set((ids || [])
  .map(id => Number(id))
  .filter(id => Number.isInteger(id) && id > 0))];

const normalizeEligibleGraus = graus => [...new Set((Array.isArray(graus) ? graus : [])
  .map(grau => String(grau || "").trim())
  .filter(Boolean))];

const ensureLinkedFormsExist = async formIds => {
  for (const formId of formIds) {
    if (!(await findFormById(formId))) {
      throw makeError("Formulario vinculado nao encontrado.", 404, "EVENT_FORM_NOT_FOUND");
    }
  }
};

const normalizeStatus = (requestedStatus, formIds, existingEvent) => {
  if (requestedStatus === "encerrado") return "encerrado";
  if (requestedStatus === "publicado" || existingEvent?.status === "publicado") return "publicado";
  return formIds.length > 0 ? "pronto" : "rascunho";
};

export const getEvents = () => listEvents();

const attachMessagesToEvents = async events => {
  const allEventMessages = await listEventMessages();
  const messagesByEventId = allEventMessages.reduce((acc, message) => {
    const list = acc.get(message.eventId) || [];
    list.push(message);
    acc.set(message.eventId, list);
    return acc;
  }, new Map());
  return events.map(event => ({
    ...event,
    messages: messagesByEventId.get(event.id) || [],
  }));
};

export const searchEvents = async ({ search = "", status = "", sortBy = "date", sortDir = "desc", limit = 20, offset = 0 } = {}) => {
  const page = await listEventsPage({ search, status, sortBy, sortDir, limit, offset });
  return {
    ...page,
    events: await attachMessagesToEvents(page.events),
  };
};

export const saveEvent = async payload => {
  const title = String(payload.title || "").trim();
  if (!title) throw makeError("Nome do evento e obrigatorio.", 400, "EVENT_TITLE_REQUIRED");

  const existingEvent = payload.id ? await findEventById(Number(payload.id)) : null;
  if (payload.id && !existingEvent) throw makeError("Evento nao encontrado.", 404, "EVENT_NOT_FOUND");

  const formIds = normalizeFormIds(payload.formIds);
  await ensureLinkedFormsExist(formIds);

  const status = normalizeStatus(payload.status, formIds, existingEvent);
  const eventId = await upsertEventRecord({
    id: payload.id ? Number(payload.id) : null,
    title,
    description: String(payload.description || "").trim(),
    date: payload.date || null,
    opening: payload.opening || null,
    closing: payload.closing || null,
    status,
    formIds,
    eligibleGraus: normalizeEligibleGraus(payload.eligibleGraus),
    messageConfig: payload.messageConfig && typeof payload.messageConfig === "object" ? payload.messageConfig : {},
    publishedAt: existingEvent?.publishedAt || payload.publishedAt || null,
  });

  const savedEvent = await findEventById(eventId);
  if (status === "encerrado" && existingEvent?.status !== "encerrado") {
    // O fechamento e a fonte de verdade e nao pode depender do BI. A captura
    // do snapshot e best-effort (idempotente, regeravel), entao uma falha aqui
    // e logada mas nao derruba o encerramento do evento.
    try {
      await onEventClosed(savedEvent);
    } catch (error) {
      console.error(`[bi] Falha ao capturar participacao do evento ${savedEvent.id}:`, error);
    }
  }
  return savedEvent;
};

export const publishEvent = async eventId => {
  const event = await findEventById(Number(eventId));
  if (!event) throw makeError("Evento nao encontrado.", 404, "EVENT_NOT_FOUND");
  if (!event.formIds.length) throw makeError("Vincule pelo menos um formulario antes de publicar.", 400, "EVENT_WITHOUT_FORMS");

  await ensureLinkedFormsExist(event.formIds);
  const publishedAt = event.publishedAt || nowIso();
  await upsertEventRecord({
    ...event,
    status: "publicado",
    publishedAt,
  });
  return findEventById(event.id);
};

export const deleteEvent = async eventId => {
  const event = await findEventById(Number(eventId));
  if (!event) throw makeError("Evento nao encontrado.", 404, "EVENT_NOT_FOUND");
  await deleteEventRecord(event.id);
  return { ok: true, event };
};
