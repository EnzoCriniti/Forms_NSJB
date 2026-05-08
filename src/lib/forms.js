/**
 * @file src/lib/forms.js
 * @summary Helpers de formularios.
 * @responsibility Formatacao e leitura de campos/respostas dinamicas.
 */

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

const isFiniteNumberLike = value => value === undefined || value === null || value === "" || Number.isFinite(Number(value));

const normalizeRuleNumber = value => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizePositiveInteger = value => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
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

export const validateFormFieldValue = (field, value) => {
  const rules = field?.validation || {};
  const empty = value === undefined || value === null || value === "";
  if (field?.required && empty) {
    return `${field.label} e obrigatorio.`;
  }
  if (empty) return null;

  if (field?.type === "text") {
    const text = String(value);
    const minLength = normalizeRuleNumber(rules.minLength);
    const maxLength = normalizeRuleNumber(rules.maxLength);
    if (minLength !== null && text.length < minLength) return `${field.label} precisa ter pelo menos ${minLength} caracteres.`;
    if (maxLength !== null && text.length > maxLength) return `${field.label} precisa ter no maximo ${maxLength} caracteres.`;
  }

  if (field?.type === "number") {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return `${field.label} precisa ser um numero valido.`;
    const min = normalizeRuleNumber(rules.min);
    const max = normalizeRuleNumber(rules.max);
    if (min !== null && numeric < min) return `${field.label} precisa ser maior ou igual a ${min}.`;
    if (max !== null && numeric > max) return `${field.label} precisa ser menor ou igual a ${max}.`;
  }

  if (field?.type === "grid") {
    if (typeof value !== "object") return `${field.label} precisa ser preenchido corretamente.`;
    const rows = Array.isArray(field.gridRows) ? field.gridRows : [];
    for (const row of rows) {
      if (!value[row]) return `${field.label} precisa ter resposta em "${row}".`;
    }
  }

  return null;
};

export const validateResponseValuesAgainstForm = (form, values = {}) => {
  const fields = Array.isArray(form?.fieldDefinitions) ? form.fieldDefinitions : [];
  for (const field of fields) {
    const key = String(field.id);
    const value = values[key];
    const error = validateFormFieldValue(field, value);
    if (error) return error;
  }

  return null;
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

export const getScalePersonLimit = form => normalizePositiveInteger(form?.resultsConfig?.maxAssignmentsPerPerson) || 1;

export const isFormClosedForPublic = form => form?.status === "fechado" || form?.status === "rascunho" || form?.status === "arquivado";
