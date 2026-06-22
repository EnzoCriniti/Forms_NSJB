/**
 * @file backend/bi/participationService.mjs
 * @summary Captura do snapshot de participacao no fechamento do evento.
 * @responsibility Reunir base, respostas e graus elegiveis e persistir o read model.
 */

import { nowIso } from "../database/shared.mjs";
import { buildParticipationRows } from "../../shared/eventParticipation.mjs";
import { findFormById } from "../repositories/formsRepository.mjs";
import { listPeople } from "../repositories/peopleRepository.mjs";
import { listResponsesByFormId } from "../repositories/responsesRepository.mjs";
import { listEventParticipationByEvent, replaceEventParticipation } from "./biRepository.mjs";

const PRESENCA_TYPE = "presenca";

/**
 * Gera e grava o snapshot imutavel de participacao do evento. Considera apenas
 * formularios de presenca, que tem o conceito de "esperado x preenchido".
 */
export const captureEventParticipation = async event => {
  if (!event?.id) return 0;
  const forms = await Promise.all((event.formIds || []).map(formId => findFormById(formId)));
  const presencaFormIds = forms.filter(form => form?.type === PRESENCA_TYPE).map(form => form.id);
  if (presencaFormIds.length === 0) {
    await replaceEventParticipation(event.id, []);
    return 0;
  }

  const people = await listPeople();
  const responsesByForm = {};
  for (const formId of presencaFormIds) {
    responsesByForm[formId] = await listResponsesByFormId(formId);
  }

  const rows = buildParticipationRows({
    event,
    presencaFormIds,
    people,
    responsesByForm,
    capturedAt: nowIso(),
  });

  await replaceEventParticipation(event.id, rows);
  return rows.length;
};

export const getEventParticipation = eventId => listEventParticipationByEvent(eventId);
