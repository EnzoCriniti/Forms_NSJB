/**
 * @file backend/bi/participationService.mjs
 * @summary Captura do snapshot de participacao no fechamento do evento.
 * @responsibility Reunir base, respostas e graus elegiveis e persistir o read model.
 */

import { nowIso } from "../database/shared.mjs";
import { buildParticipationRows } from "../../shared/eventParticipation.mjs";
import { getPersonKey } from "../../shared/personIdentity.mjs";
import { findFormById } from "../repositories/formsRepository.mjs";
import { listPeople } from "../repositories/peopleRepository.mjs";
import { listResponsesByFormId } from "../repositories/responsesRepository.mjs";
import { listTeamPeriods } from "../repositories/teamPeriodsRepository.mjs";
import { listEventParticipationByEvent, replaceEventParticipation } from "./biRepository.mjs";

const PRESENCA_TYPE = "presenca";

const isDateWithinPeriod = (date, period) => {
  const value = String(date || "").slice(0, 10);
  return Boolean(value && value >= period.startDate && value <= period.endDate);
};

const buildTeamExemptions = ({ event, people, teamPeriods }) => {
  const matchingPeriods = (teamPeriods || []).filter(period => isDateWithinPeriod(event?.date, period));
  if (!matchingPeriods.length) return new Map();
  const peopleById = new Map((people || []).map(person => [Number(person.id), person]));
  const exemptions = new Map();
  for (const period of matchingPeriods) {
    const personIds = [
      period.assistantMasterPersonId,
      period.organPersonId,
      period.directAssistantPersonId,
      period.organDirectAssistantPersonId,
      ...(period.assistantMemberIds || []),
      ...(period.organMemberIds || []),
    ];
    for (const id of personIds) {
      const person = peopleById.get(Number(id));
      if (!person) continue;
      const key = getPersonKey(person);
      if (key) exemptions.set(key, `Dispensado por equipe no periodo: ${period.title || `${period.startDate} a ${period.endDate}`}`);
    }
  }
  return exemptions;
};

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

  const [people, teamPeriods] = await Promise.all([
    listPeople(),
    listTeamPeriods(),
  ]);
  const exemptionsByPersonKey = buildTeamExemptions({ event, people, teamPeriods });
  const responsesByForm = {};
  for (const formId of presencaFormIds) {
    responsesByForm[formId] = await listResponsesByFormId(formId);
  }

  const rows = buildParticipationRows({
    event,
    presencaFormIds,
    people,
    responsesByForm,
    exemptionsByPersonKey,
    capturedAt: nowIso(),
  });

  await replaceEventParticipation(event.id, rows);
  return rows.length;
};

export const getEventParticipation = eventId => listEventParticipationByEvent(eventId);
