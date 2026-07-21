/**
 * @file backend/bi/reportsService.mjs
 * @summary Relatorios/BI sobre snapshots de participacao e escala.
 * @responsibility Agregar o read model e os dados de dominio em metricas consultaveis.
 */

import { summarizeMemberParticipation } from "../../shared/eventParticipation.mjs";
import { buildOverview } from "../../shared/biOverview.mjs";
import { composeTimeline } from "../../shared/biTimeline.mjs";
import { personSectionRecurrence, sectionVacancy, escalaLoadByPerson, escalaFocusByPerson, escalaFocusSummary } from "../../shared/biEscala.mjs";
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

/**
 * Filtro de periodo (por data do evento). `null` = sem filtro (todos). Datas em
 * ISO "YYYY-MM-DD"; a comparacao textual funciona porque o formato e ordenavel.
 */
/** Normaliza a data do evento para "YYYY-MM-DD" (Postgres devolve Date, nao string). */
const toDateKey = value => {
  if (!value) return "";
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? "" : value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
};

const inRange = (date, range) => {
  if (!range) return true;
  const value = toDateKey(date);
  if (!value) return false;
  if (range.from && value < range.from) return false;
  if (range.to && value > range.to) return false;
  return true;
};

/** Ids dos eventos dentro do periodo (ou `null` quando nao ha filtro). */
const eventIdsInRange = (events, range) => (range ? events.filter(event => inRange(event.date, range)).map(event => event.id) : null);

/** Mapa formId -> data do evento, para posicionar escala/claims no tempo. */
const eventDateByFormId = events => {
  const map = new Map();
  for (const event of events) for (const formId of event.formIds || []) map.set(formId, event.date);
  return map;
};

/** Mantem so as atribuicoes de escala cujo evento cai no periodo. */
const assignmentsInRange = (assignments, events, range) => {
  if (!range) return assignments;
  const dateByForm = eventDateByFormId(events);
  return assignments.filter(assignment => inRange(dateByForm.get(assignment.formId), range));
};

export const getMemberParticipationReport = async (eventIds = null) => {
  const rows = await aggregateMemberParticipation(eventIds);
  return rows.map(summarizeMemberParticipation);
};

export const getOverviewReport = async (range = null) => {
  const [escalaAssignments, people, events] = await Promise.all([
    listAllEscalaAssignments(),
    listPeople(),
    listEvents(),
  ]);
  const memberReport = await getMemberParticipationReport(eventIdsInRange(events, range));
  return buildOverview({ memberReport, escalaAssignments: assignmentsInRange(escalaAssignments, events, range), people });
};

const round = (part, total) => (total > 0 ? Math.round((part / total) * 1000) / 10 : 0);

/**
 * Payload único do dashboard: evita 4 round-trips no carregamento da tela.
 * O perfil por sócio (`getMemberDetail`) segue sob demanda, fora deste pacote.
 */
export const getDashboardReport = async (range = null) => {
  const [overview, timeline, escala, matrix] = await Promise.all([
    getOverviewReport(range),
    getTimelineReport(range),
    getEscalaAnalytics(range),
    getParticipationMatrix(range),
  ]);
  return { overview, timeline: timeline.timeline, escala, matrix };
};

export const getTimelineReport = async (range = null) => {
  const [rows, events] = await Promise.all([aggregateEventTimeline(), listEvents()]);
  const eventsById = new Map(events.map(event => [event.id, { title: event.title, date: event.date }]));
  const scoped = range ? rows.filter(row => inRange(eventsById.get(row.eventId)?.date, range)) : rows;
  return { timeline: composeTimeline(scoped, eventsById) };
};

export const getEscalaAnalytics = async (range = null) => {
  const [allAssignments, allClaims, events] = await Promise.all([
    listAllEscalaAssignments(),
    listEscalaClaimAudits(),
    listEvents(),
  ]);
  const assignments = assignmentsInRange(allAssignments, events, range);
  const dateByForm = eventDateByFormId(events);
  const claims = range ? allClaims.filter(claim => inRange(dateByForm.get(claim.formId), range)) : allClaims;
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
    focus: { summary: escalaFocusSummary(assignments), people: escalaFocusByPerson(assignments) },
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

export const getParticipationMatrix = async (range = null) => {
  const [allRows, events] = await Promise.all([listAllEventParticipation(), listEvents()]);
  const inScope = eventId => inRange(events.find(event => event.id === eventId)?.date, range);
  const rows = range ? allRows.filter(row => inScope(row.eventId)) : allRows;
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
