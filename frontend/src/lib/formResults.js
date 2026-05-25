/**
 * @file frontend/src/lib/formResults.js
 * @summary Leitura de respostas e configuracoes de resultados de formulario.
 */

import { getScalePersonLimit, validateResponseValuesAgainstForm } from "../../../shared/formRules.mjs";
import { hasLinkedPeopleField } from "./formFieldAccess";

export const getPersonOptionLabel = person => {
  if (!person) return "";
  return String(person.name || "").trim();
};

export const resolvePersonBySelectionValue = (people = [], value) => {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return null;
  return people.find(person => {
    const name = String(person?.name || "").trim().toLowerCase();
    const grauName = person?.grau ? `${String(person.grau).trim().toLowerCase()} - ${name}` : "";
    return raw === name || raw === grauName;
  }) || null;
};

export const getFieldValue = (response, fieldId) => response?.values?.[String(fieldId)];

export const getRespondentDisplay = response => {
  if (!response) return "";
  return response.respondentGrau ? `${response.respondentGrau} - ${response.respondentName}` : response.respondentName;
};

export const getExpectedResponses = (form, people = []) => {
  if (!form) return 0;
  if (Number(form.totalExpected) > 0) return Number(form.totalExpected);
  if (hasLinkedPeopleField(form)) return people.length;
  return 0;
};

export const getResultsConfig = form => ({
  searchEnabled: form?.resultsConfig?.searchEnabled ?? true,
  showLinkedRoster: form?.resultsConfig?.showLinkedRoster ?? true,
  blockDuplicatePersonResponses: form?.resultsConfig?.blockDuplicatePersonResponses ?? false,
  totalsLayout: Array.isArray(form?.resultsConfig?.totalsLayout) ? form.resultsConfig.totalsLayout : [],
});

export const isFormClosedForPublic = form => form?.status === "fechado" || form?.status === "rascunho" || form?.status === "arquivado";

export { getScalePersonLimit, validateResponseValuesAgainstForm };
