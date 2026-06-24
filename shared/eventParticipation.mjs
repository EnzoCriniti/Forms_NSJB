/**
 * @file shared/eventParticipation.mjs
 * @summary Calculo puro do snapshot de participacao de um evento.
 * @responsibility Cruzar base de socios esperados com respostas no fechamento do evento.
 *
 * O snapshot e gravado quando o evento e encerrado para que o historico de
 * "quem era esperado x quem preencheu" sobreviva a mudancas posteriores na base
 * de socios. Alimenta o BI por socio.
 */

import { filterByEligibleGraus } from "./grauEligibility.mjs";
import { getPersonKey, getResponsePersonKey } from "./personIdentity.mjs";

export const minutesBetween = (fromIso, toIso) => {
  if (!fromIso || !toIso) return null;
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
  if (to < from) return null;
  return Math.round((to - from) / 60000);
};

const isActivePerson = person => person?.active !== false;

/**
 * Monta as linhas do snapshot (uma por socio esperado x formulario de presenca).
 * @param {object} event evento com eligibleGraus e opening.
 * @param {number[]} presencaFormIds ids dos formularios de presenca do evento.
 * @param {object[]} people base de socios.
 * @param {Record<number, object[]>} responsesByForm respostas por formulario.
 * @param {string} capturedAt timestamp da captura.
 */
export const buildParticipationRows = ({ event, presencaFormIds = [], people = [], responsesByForm = {}, capturedAt, exemptionsByPersonKey = {} }) => {
  const expectedPeople = filterByEligibleGraus(people.filter(isActivePerson), event?.eligibleGraus);
  const rows = [];
  const exemptions = exemptionsByPersonKey instanceof Map
    ? exemptionsByPersonKey
    : new Map(Object.entries(exemptionsByPersonKey || {}));

  for (const formId of presencaFormIds) {
    const responses = responsesByForm[formId] || [];
    const responseByKey = new Map(responses.map(response => [getResponsePersonKey(response), response]));

    for (const person of expectedPeople) {
      const personKey = getPersonKey(person);
      const response = responseByKey.get(personKey) || null;
      const filled = Boolean(response);
      const respondedAt = filled ? (response.createdAt || null) : null;
      const exemptionReason = exemptions.get(personKey) || "";
      rows.push({
        eventId: event?.id ?? null,
        formId,
        personKey,
        personName: person?.name || "",
        grau: person?.grau || "",
        expected: !exemptionReason,
        filled,
        respondedAt,
        timeToFillMinutes: filled ? minutesBetween(event?.opening, respondedAt) : null,
        exemptionReason,
        capturedAt,
      });
    }
  }

  return rows;
};

/**
 * Resume agregado de participacao de um socio para o relatorio/BI.
 * Recebe contagens ja agregadas e devolve as metricas derivadas.
 */
export const summarizeMemberParticipation = ({
  personKey,
  personName = "",
  grau = "",
  expectedCount = 0,
  filledCount = 0,
  exemptedCount = 0,
  avgTimeToFillMinutes = null,
  lastFilledAt = null,
} = {}) => {
  const expected = Number(expectedCount) || 0;
  const filled = Number(filledCount) || 0;
  const missed = Math.max(expected - filled, 0);
  const fillRate = expected > 0 ? Math.round((filled / expected) * 1000) / 10 : 0;
  const avg = avgTimeToFillMinutes === null || avgTimeToFillMinutes === undefined
    ? null
    : Math.round(Number(avgTimeToFillMinutes));
  return {
    personKey,
    personName,
    grau,
    expected,
    filled,
    exempted: Number(exemptedCount) || 0,
    missed,
    fillRate,
    avgTimeToFillMinutes: Number.isFinite(avg) ? avg : null,
    lastFilledAt: lastFilledAt || null,
  };
};
