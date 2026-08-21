/**
 * @file frontend/src/screens/resultsPresenceTableDomain.js
 * @summary Linhas, totais e largura da planilha de presenca.
 */

import { getPersonKey, getResponsePersonKey } from "../../../shared/personIdentity.mjs";

export const NO_VALUES = ["Nao", "NÃƒÂ£o", "NÃƒÆ’Ã‚Â£o", "NÃƒÆ’Ã‚Æ’Ãƒâ€šÃ‚Â£o"];

const normalizeFieldLabel = value => String(value || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase();

const MEAL_LABEL_PATTERN = /\b(almoco|jantar|lanche|cafe|refeicao|ceia)\b/;

const getCompanionCategory = field => {
  if (field.type !== "number") return null;
  const label = normalizeFieldLabel(field.label);
  if (/\bcrianca/.test(label)) return "children";
  if (/\b(jovem|jovens)\b/.test(label)) return "youths";
  if (/\b(visitante|convidado|acompanhante adulto)/.test(label)) return "adultVisitors";
  return null;
};

const toCount = value => {
  const count = Number(value || 0);
  return Number.isFinite(count) && count > 0 ? count : 0;
};

export const buildPresenceStats = ({
  hasExpectedTotal,
  filteredResponsesLength,
  selectedGrau,
  expectedTotal,
  filteredRowsLength,
}) => {
  if (hasExpectedTotal) {
    return [
      { l: "Respostas", v: filteredResponsesLength, s: `de ${selectedGrau === "todos" ? expectedTotal : filteredRowsLength}`, c: "var(--primary)" },
      { l: "Faltam", v: Math.max((selectedGrau === "todos" ? expectedTotal : filteredRowsLength) - filteredResponsesLength, 0), s: "pendentes", c: "#c93c3c" },
    ];
  }

  return [
    { l: "Respostas", v: filteredResponsesLength, s: "recebidas", c: "var(--primary)" },
  ];
};

export const buildPresenceTableRows = ({ responses = [], people = [], showLinkedRows = false }) => {
  if (!showLinkedRows) {
    return responses.map(response => ({
      key: response.id || `${response.respondentGrau}-${response.respondentName}`,
      grau: response.respondentGrau || "",
      name: response.respondentName || "",
      status: "Respondido",
      response,
    }));
  }

  const responseByPersonKey = new Map(responses.map(response => [getResponsePersonKey(response), response]));
  return people.map(person => {
    const response = responseByPersonKey.get(getPersonKey(person)) || null;
    return {
      key: `${person.grau}-${person.name}`,
      grau: person.grau || "",
      name: person.name || "",
      status: response ? "Respondido" : "Pendente",
      response,
    };
  });
};

export const buildPresenceBaseResponses = ({ responses = [], people = [], showLinkedRows = false }) => {
  if (!showLinkedRows) {
    return responses;
  }

  const peopleKeys = new Set(people.map(getPersonKey));
  return responses.filter(response => peopleKeys.has(getResponsePersonKey(response)));
};

export const buildPresenceTotals = ({ columns = [], responses = [], getFieldValue }) => {
  const result = {};
  const companionFields = columns
    .map(field => ({ field, category: getCompanionCategory(field) }))
    .filter(item => item.category);
  for (const col of columns) {
    if (col.type === "yes_no") {
      const affirmativeResponses = responses.filter(response => getFieldValue(response, col.id) === "Sim");
      result[col.id] = {
        sim: affirmativeResponses.length,
        nao: responses.filter(response => NO_VALUES.includes(getFieldValue(response, col.id))).length,
      };
      if (MEAL_LABEL_PATTERN.test(normalizeFieldLabel(col.label))) {
        const attendance = affirmativeResponses.reduce((totals, response) => {
          for (const { field, category } of companionFields) {
            totals[category] += toCount(getFieldValue(response, field.id));
          }
          return totals;
        }, { respondents: affirmativeResponses.length, children: 0, youths: 0, adultVisitors: 0 });
        result[col.id].mealAttendance = {
          ...attendance,
          total: attendance.respondents + attendance.children + attendance.youths + attendance.adultVisitors,
        };
      }
    } else if (col.type === "number") {
      result[col.id] = {
        sum: responses.reduce((sum, response) => sum + Number(getFieldValue(response, col.id) || 0), 0),
      };
    }
  }
  return result;
};

export const buildPresenceTotalsLayout = ({ columns = [], totalsLayout = [] }) => {
  const configured = totalsLayout
    .map(item => ({ ...item, field: columns.find(col => String(col.id) === String(item.fieldId)) }))
    .filter(item => item.field);

  if (configured.length > 0) return configured;

  return columns
    .filter(col => col.total)
    .map(col => ({ fieldId: col.id, style: col.type === "yes_no" ? "split" : "number", field: col }));
};

export const buildPresenceTableMinWidth = ({ columnsLength = 0, showLinkedRows = false }) => {
  const base = showLinkedRows ? 350 : 240;
  const dynamic = columnsLength * 160;
  return Math.max(960, base + dynamic);
};

export const attachPresenceTotalsSummary = ({ totalsLayout = [], totals = {} }) => totalsLayout.map(item => {
  const col = item.field;
  return {
    ...item,
    summary: col ? totals[col.id] : null,
  };
});
