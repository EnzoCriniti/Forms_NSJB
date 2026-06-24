/**
 * @file backend/services/teamPeriodsService.mjs
 * @summary Regras de negocio dos periodos de equipes.
 */

import { parseJson } from "../database/shared.mjs";
import { listPeople } from "../repositories/peopleRepository.mjs";
import {
  deleteTeamPeriodRecord,
  findOverlappingTeamPeriod,
  findTeamPeriodById,
  getTeamPeriodSummaryRecords,
  listTeamPeriods,
  listTeamSummaryFormsByIds,
  upsertTeamPeriodRecord,
} from "../repositories/teamPeriodsRepository.mjs";

const makeError = (message, statusCode, code) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

const normalizeIdList = value => [...new Set((Array.isArray(value) ? value : [])
  .map(id => Number(id))
  .filter(id => Number.isInteger(id) && id > 0))];

const normalizeTeamPeriodPayload = payload => ({
  id: payload.id ? Number(payload.id) : null,
  title: String(payload.title || "").trim(),
  startDate: String(payload.startDate || "").trim(),
  endDate: String(payload.endDate || "").trim(),
  assistantMasterPersonId: Number(payload.assistantMasterPersonId),
  organPersonId: Number(payload.organPersonId),
  directAssistantPersonId: Number(payload.directAssistantPersonId),
  organDirectAssistantPersonId: Number(payload.organDirectAssistantPersonId),
  assistantMemberIds: normalizeIdList(payload.assistantMemberIds),
  organMemberIds: normalizeIdList(payload.organMemberIds),
  notes: String(payload.notes || "").trim(),
});

const normalizeGrau = value => String(value || "")
  .trim()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toUpperCase();

const isMasterGrau = person => {
  const grau = normalizeGrau(person?.grau);
  return grau === "QM";
};

const isOrganGrau = person => normalizeGrau(person?.grau).includes("CDC");

const ensurePeopleRules = async period => {
  const people = await listPeople();
  const peopleById = new Map(people.map(person => [Number(person.id), person]));
  const referencedIds = [
    period.assistantMasterPersonId,
    period.organPersonId,
    period.directAssistantPersonId,
    period.organDirectAssistantPersonId,
    ...period.assistantMemberIds,
    ...period.organMemberIds,
  ];
  const missing = referencedIds.find(id => !peopleById.has(Number(id)));
  if (missing) throw makeError("Pessoa selecionada nao encontrada na base de socios.", 404, "TEAM_PERSON_NOT_FOUND");
  if (!isMasterGrau(peopleById.get(period.assistantMasterPersonId))) {
    throw makeError("Mestre Assistente precisa estar no quadro de mestres (QM).", 400, "TEAM_MASTER_GRAU_REQUIRED");
  }
  if (!isOrganGrau(peopleById.get(period.organPersonId))) {
    throw makeError("Organ precisa ter grau CDC.", 400, "TEAM_ORGAN_GRAU_REQUIRED");
  }
};

const buildDefaultTitle = period => `Equipes ${period.startDate} a ${period.endDate}`;

export const getTeamPeriods = () => listTeamPeriods();

export const saveTeamPeriod = async payload => {
  const period = normalizeTeamPeriodPayload(payload);
  const existing = period.id ? await findTeamPeriodById(period.id) : null;
  if (period.id && !existing) throw makeError("Periodo de equipes nao encontrado.", 404, "TEAM_PERIOD_NOT_FOUND");

  await ensurePeopleRules(period);

  const overlap = await findOverlappingTeamPeriod({
    id: period.id,
    startDate: period.startDate,
    endDate: period.endDate,
  });
  if (overlap) {
    throw makeError("Ja existe um periodo de equipes com datas sobrepostas.", 409, "TEAM_PERIOD_OVERLAP");
  }

  const id = await upsertTeamPeriodRecord({
    ...period,
    title: period.title || buildDefaultTitle(period),
  });
  return findTeamPeriodById(id);
};

export const deleteTeamPeriod = async id => {
  const period = await findTeamPeriodById(Number(id));
  if (!period) throw makeError("Periodo de equipes nao encontrado.", 404, "TEAM_PERIOD_NOT_FOUND");
  await deleteTeamPeriodRecord(period.id);
  return { ok: true, period };
};

const mapSummaryForm = row => ({
  id: row.id,
  slug: row.slug,
  type: row.type,
  status: row.status,
  title: row.title,
  sessionName: row.session_name || "",
  date: row.date,
  createdAt: row.created_at,
});

const isDateWithin = (value, startDate, endDate) => {
  const text = String(value || "").slice(0, 10);
  return text >= startDate && text <= endDate;
};

export const getTeamPeriodSummary = async id => {
  const period = await findTeamPeriodById(Number(id));
  if (!period) throw makeError("Periodo de equipes nao encontrado.", 404, "TEAM_PERIOD_NOT_FOUND");

  const { forms: periodFormsRaw, events: eventsRaw } = await getTeamPeriodSummaryRecords(period);
  const eventFormIds = eventsRaw.flatMap(event => parseJson(event.form_ids_json, []));
  const missingEventFormIds = eventFormIds.filter(formId => !periodFormsRaw.some(form => Number(form.id) === Number(formId)));
  const eventFormsRaw = await listTeamSummaryFormsByIds(missingEventFormIds);
  const forms = [...periodFormsRaw, ...eventFormsRaw].map(mapSummaryForm);
  const formsById = new Map(forms.map(form => [Number(form.id), form]));
  const linkedFormIds = new Set();

  const events = eventsRaw.map(event => {
    const eventForms = parseJson(event.form_ids_json, [])
      .map(formId => formsById.get(Number(formId)))
      .filter(Boolean);
    eventForms.forEach(form => linkedFormIds.add(Number(form.id)));
    return {
      id: event.id,
      title: event.title,
      description: event.description || "",
      date: event.date,
      status: event.status,
      formIds: eventForms.map(form => form.id),
      forms: eventForms,
      hasPresence: eventForms.some(form => form.type === "presenca"),
      hasOrganScale: eventForms.some(form => form.type === "escala_organ"),
    };
  });

  const unlinkedForms = forms
    .filter(form => !linkedFormIds.has(Number(form.id)))
    .filter(form => isDateWithin(form.createdAt, period.startDate, period.endDate) || isDateWithin(form.date, period.startDate, period.endDate));

  return {
    period,
    events,
    unlinkedForms,
  };
};
