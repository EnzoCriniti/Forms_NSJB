/**
 * @file frontend/src/lib/formFieldAccess.js
 * @summary Leitura de campos e modo estrutural dos formularios.
 */

import { FORM_MODES, FORM_MODE_VALUES } from "../../../shared/formModes.mjs";
import {
  getFieldSelectionSource,
  isExternalBaseSelectionField,
  isMembersSelectionField,
} from "../../../shared/formFieldRules.mjs";

export { FORM_MODES };
export {
  getFieldSelectionSource,
  isExternalBaseSelectionField,
  isMembersSelectionField,
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

export const getStoredFormMode = form => {
  const mode = form?.resultsConfig?.formMode;
  return FORM_MODE_VALUES.includes(mode) ? mode : null;
};

export const getPeopleBaseFields = form => (form?.fieldDefinitions || []).filter(field => field.type === "person_select" && isMembersSelectionField(field));

export const getFormMode = form => {
  if (form?.type !== "presenca") return FORM_MODES.GERAL;
  const stored = getStoredFormMode(form);
  if (stored) return stored;
  return getPeopleBaseFields(form).length > 0 ? FORM_MODES.NUCLEO : FORM_MODES.GERAL;
};

export const getFormModeLabel = form => getFormMode(form) === FORM_MODES.NUCLEO ? "Com base de socios" : "Formulario geral";

export const getPrimaryPeopleBaseField = form => {
  const personFields = getPeopleBaseFields(form);
  const explicitPrimary = personFields.find(field => field?.memberBinding?.role === "primary");
  return explicitPrimary || personFields[0] || null;
};

export const getPersonField = form => getPrimaryPeopleBaseField(form);

export const getPeopleBaseFieldRole = (form, field) => {
  if (!field || field.type !== "person_select") return null;
  if (field?.memberBinding?.role) return field.memberBinding.role;
  const primaryField = getPrimaryPeopleBaseField(form);
  return primaryField && String(primaryField.id) === String(field.id) ? "primary" : "secondary";
};

export const isPrimaryPeopleBaseField = (form, field) => getPeopleBaseFieldRole(form, field) === "primary";

export const hasLinkedPeopleField = form => Boolean(getPrimaryPeopleBaseField(form));
