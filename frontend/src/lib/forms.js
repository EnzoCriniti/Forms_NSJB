/**
 * @file frontend/src/lib/forms.js
 * @summary Helpers de formularios da interface.
 * @responsibility Formatacao e leitura de campos, respostas e configuracoes de exibicao.
 */

import { getScalePersonLimit, validateResponseValuesAgainstForm } from "../../../shared/formRules.mjs";

export const formatDate = value => {
  if (!value) return "";
  const [year, month, day] = value.split("T")[0].split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
};

export const formatDateTime = value => {
  if (!value) return "";
  const [date, time] = value.split("T");
  if (!date) return value;
  const formattedDate = formatDate(date);
  return time ? `${formattedDate} ${time.slice(0, 5)}` : formattedDate;
};

export const normalizeSearchText = value => String(value || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .trim();

export const buildFormSearchIndex = (form, labels = []) => {
  const labelText = [...new Set(form?.labels || [])]
    .map(labelId => labels.find(label => label.id === labelId)?.name || "")
    .filter(Boolean)
    .join(" ");
  return normalizeSearchText([
    form?.title,
    form?.description,
    form?.status,
    form?.type === "escala_organ" ? "escala da organ" : "presenca",
    labelText,
    form?.closing,
    form?.date,
  ].join(" "));
};

export const summarizeFieldValidation = field => {
  const rules = field?.validation || {};
  if (field?.type === "text") {
    const parts = [];
    if (Number.isFinite(Number(rules.minLength))) parts.push(`min ${Number(rules.minLength)} caracteres`);
    if (Number.isFinite(Number(rules.maxLength))) parts.push(`max ${Number(rules.maxLength)} caracteres`);
    return parts.join(" | ");
  }
  if (field?.type === "number") {
    const parts = [];
    if (Number.isFinite(Number(rules.min))) parts.push(`min ${Number(rules.min)}`);
    if (Number.isFinite(Number(rules.max))) parts.push(`max ${Number(rules.max)}`);
    return parts.join(" | ");
  }
  if (field?.type === "grid" && Array.isArray(rules.requiredRows) && rules.requiredRows.length > 0) {
    return `${rules.requiredRows.length} linha(s) obrigatoria(s)`;
  }
  return "";
};

export const getVisibleFields = form => (form?.fieldDefinitions || []).filter(field => field.show !== false);

export const getPersonField = form => (form?.fieldDefinitions || []).find(field => field.type === "person_select");

export const hasLinkedPeopleField = form => Boolean(getPersonField(form));

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
