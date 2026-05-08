/**
 * @file shared/formRules.mjs
 * @summary Regras compartilhadas de formularios.
 * @responsibility Centralizar validacao de respostas e limites usados por frontend e backend.
 */

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

const validateFormFieldValue = (field, value) => {
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

export const getScalePersonLimit = form => normalizePositiveInteger(form?.resultsConfig?.maxAssignmentsPerPerson) || 1;
