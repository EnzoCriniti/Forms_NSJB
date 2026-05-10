/**
 * @file backend/services/eventsService.mjs
 * @summary Regras de negocio de eventos.
 * @responsibility Normalizar eventos, vincular formularios e controlar publicacao manual.
 */

import { nowIso } from "../database/shared.mjs";
import { findFormById } from "../repositories/formsRepository.mjs";
import { findEventById, listEvents, upsertEventRecord } from "../repositories/eventsRepository.mjs";

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

const ensureLinkedFormsExist = async formIds => {
  for (const formId of formIds) {
    if (!(await findFormById(formId))) {
      throw makeError("Formulario vinculado nao encontrado.", 404, "EVENT_FORM_NOT_FOUND");
    }
  }
};

const normalizeStatus = (requestedStatus, formIds, existingEvent) => {
  if (requestedStatus === "publicado" || existingEvent?.status === "publicado") return "publicado";
  if (requestedStatus === "encerrado") return "encerrado";
  return formIds.length > 0 ? "pronto" : "rascunho";
};

export const getEvents = () => listEvents();

export const saveEvent = async payload => {
  const title = String(payload.title || "").trim();
  if (!title) throw makeError("Nome do evento e obrigatorio.", 400, "EVENT_TITLE_REQUIRED");

  const existingEvent = payload.id ? await findEventById(Number(payload.id)) : null;
  if (payload.id && !existingEvent) throw makeError("Evento nao encontrado.", 404, "EVENT_NOT_FOUND");

  const formIds = normalizeFormIds(payload.formIds);
  await ensureLinkedFormsExist(formIds);

  const eventId = await upsertEventRecord({
    id: payload.id ? Number(payload.id) : null,
    title,
    description: String(payload.description || "").trim(),
    date: payload.date || null,
    opening: payload.opening || null,
    closing: payload.closing || null,
    status: normalizeStatus(payload.status, formIds, existingEvent),
    formIds,
    messageConfig: payload.messageConfig && typeof payload.messageConfig === "object" ? payload.messageConfig : {},
    publishedAt: existingEvent?.publishedAt || payload.publishedAt || null,
  });

  return findEventById(eventId);
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
