/**
 * @file backend/bi/reportsService.mjs
 * @summary Relatorios/BI sobre snapshots de participacao e escala.
 * @responsibility Agregar o read model e os dados de dominio em metricas consultaveis.
 */

import { summarizeMemberParticipation } from "../../shared/eventParticipation.mjs";
import { buildOverview } from "../../shared/biOverview.mjs";
import { composeTimeline } from "../../shared/biTimeline.mjs";
import { personSectionRecurrence, sectionVacancy, escalaLoadByPerson } from "../../shared/biEscala.mjs";
import { escalaTimingBySection } from "../../shared/biEscalaTiming.mjs";
import { normalizePersonKey } from "../../shared/personIdentity.mjs";
import { listAllEscalaAssignments } from "../repositories/escalaRepository.mjs";
import { listPeople } from "../repositories/peopleRepository.mjs";
import { listEvents } from "../repositories/eventsRepository.mjs";
import { listForms } from "../repositories/formsRepository.mjs";
import {
  aggregateEventTimeline,
  aggregateMemberParticipation,
  listAllEventParticipation,
  listEscalaClaimAudits,
  listEventParticipationByPersonKey,
} from "./biRepository.mjs";

export const getMemberParticipationReport = async () => {
  const rows = await aggregateMemberParticipation();
  return rows.map(summarizeMemberParticipation);
};

export const getOverviewReport = async () => {
  const [memberReport, escalaAssignments, people] = await Promise.all([
    getMemberParticipationReport(),
    listAllEscalaAssignments(),
    listPeople(),
  ]);
  return buildOverview({ memberReport, escalaAssignments, people });
};

const round = (part, total) => (total > 0 ? Math.round((part / total) * 1000) / 10 : 0);

/**
 * Payload único do dashboard: evita 4 round-trips no carregamento da tela.
 * O perfil por sócio (`getMemberDetail`) segue sob demanda, fora deste pacote.
 */
export const getDashboardReport = async () => {
  const [overview, timeline, escala, matrix] = await Promise.all([
    getOverviewReport(),
    getTimelineReport(),
    getEscalaAnalytics(),
    getParticipationMatrix(),
  ]);
  return { overview, timeline: timeline.timeline, escala, matrix };
};

export const getTimelineReport = async () => {
  const [rows, events] = await Promise.all([aggregateEventTimeline(), listEvents()]);
  const eventsById = new Map(events.map(event => [event.id, { title: event.title, date: event.date }]));
  return { timeline: composeTimeline(rows, eventsById) };
};

export const getEscalaAnalytics = async () => {
  const [assignments, claims, events] = await Promise.all([
    listAllEscalaAssignments(),
    listEscalaClaimAudits(),
    listEvents(),
  ]);
  const eventByFormId = new Map();
  for (const event of events) {
    for (const formId of event.formIds || []) eventByFormId.set(formId, event);
  }
  const formMeta = new Map(assignments.map(assignment => [assignment.formId, {
    opening: eventByFormId.get(assignment.formId)?.opening || null,
    sectionTitles: (assignment.sections || []).map(section => String(section?.title || "—").trim() || "—"),
  }]));
  return {
    vacancy: sectionVacancy(assignments),
    recurrence: personSectionRecurrence(assignments),
    load: escalaLoadByPerson(assignments),
    timing: escalaTimingBySection(claims, formMeta),
  };
};

export const getMemberDetail = async personKey => {
  const key = normalizePersonKey(personKey);
  const [rows, forms, events, assignments] = await Promise.all([
    listEventParticipationByPersonKey(key),
    listForms(),
    listEvents(),
    listAllEscalaAssignments(),
  ]);
  const formsById = new Map(forms.map(form => [form.id, form]));
  const eventsById = new Map(events.map(event => [event.id, event]));
  const presenca = rows.map(row => {
    const form = formsById.get(row.formId);
    const event = eventsById.get(row.eventId);
    return {
      eventId: row.eventId,
      eventTitle: event?.title || null,
      date: event?.date || null,
      formId: row.formId,
      formTitle: form?.title || null,
      formType: form?.type || null,
      filled: row.filled,
      expected: row.expected,
      exemptionReason: row.exemptionReason || "",
      respondedAt: row.respondedAt,
      timeToFillMinutes: row.timeToFillMinutes,
    };
  });
  const expected = presenca.filter(item => item.expected !== false).length;
  const filled = presenca.filter(item => item.expected !== false && item.filled).length;
  const exempted = presenca.filter(item => item.expected === false).length;
  const lastFilledAt = presenca
    .filter(item => item.expected !== false && item.filled && item.respondedAt)
    .map(item => item.respondedAt)
    .sort()
    .slice(-1)[0] || null;
  const { people } = personSectionRecurrence(assignments);
  const escala = people.find(person => person.personKey === key) || { personName: "", total: 0, bySection: {} };
  return {
    personKey: key,
    personName: rows[0]?.personName || escala.personName || "",
    grau: rows[0]?.grau || "",
    summary: { expected, filled, exempted, rate: round(filled, expected), lastFilledAt, escalaTotal: escala.total },
    presenca,
    escala: Object.entries(escala.bySection || {})
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count),
  };
};

export const getParticipationMatrix = async () => {
  const [rows, events] = await Promise.all([listAllEventParticipation(), listEvents()]);
  const eventIds = new Set(rows.map(row => row.eventId));
  const dateValue = value => { const time = new Date(value).getTime(); return Number.isFinite(time) ? time : 0; };
  const cols = events
    .filter(event => eventIds.has(event.id))
    .map(event => ({ eventId: event.id, title: event.title, date: event.date }))
    .sort((a, b) => dateValue(a.date) - dateValue(b.date) || (a.eventId - b.eventId));
  const byPerson = new Map();
  for (const row of rows) {
    const person = byPerson.get(row.personKey) || { personKey: row.personKey, personName: row.personName, grau: row.grau, cells: {} };
    person.cells[row.eventId] = row.filled;
    if (!person.personName && row.personName) person.personName = row.personName;
    byPerson.set(row.personKey, person);
  }
  return { events: cols, people: [...byPerson.values()] };
};
