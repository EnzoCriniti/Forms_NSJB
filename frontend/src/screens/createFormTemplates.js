/**
 * @file frontend/src/screens/createFormTemplates.js
 * @summary Helpers de template da criacao de formulario.
 * @responsibility Montar payload de template e restaurar estado reutilizavel no editor.
 */

import { getFormMode, getScalePersonLimit } from "../lib/forms";
import { createDefaultPresenceFields } from "./createFormDefaults";
import { normalizePresenceFieldsForMode } from "./createFormMemberBindings";
import { createDefaultResultsConfig, syncResultsConfigWithFields } from "./createFormResultsConfig";

export const buildCreateFormTemplatePayload = ({
  type,
  presetName,
  desc,
  closingText,
  selLabels,
  format,
  formMode,
  fields,
  resultsConfig,
  scaleLimit,
  scaleDraft,
}) => {
  const normalizedFields = normalizePresenceFieldsForMode(fields, formMode);
  return {
    type,
    name: presetName.trim(),
    desc,
    closingText,
    labels: selLabels,
    fieldDefinitions: format === "presenca" ? normalizedFields : [],
    resultsConfig: format === "presenca"
      ? syncResultsConfigWithFields({ ...resultsConfig, formMode }, normalizedFields)
      : { ...resultsConfig, maxAssignmentsPerPerson: scaleLimit },
    scaleSections: format === "escala_organ" ? scaleDraft : [],
  };
};

export const buildCreateFormTemplateState = (template) => {
  if (!template) return null;
  const nextMode = getFormMode(template);
  const nextFields = template.fieldDefinitions?.length ? template.fieldDefinitions : createDefaultPresenceFields(nextMode);
  return {
    format: template.type,
    formMode: nextMode,
    fields: template.fieldDefinitions?.length ? template.fieldDefinitions : null,
    scaleDraft: template.scaleSections?.length ? template.scaleSections : null,
    desc: template.desc !== undefined ? template.desc : null,
    closingText: template.closingText !== undefined ? template.closingText : null,
    selLabels: template.labels?.length ? template.labels : null,
    resultsConfig: syncResultsConfigWithFields({
      ...(template.resultsConfig || createDefaultResultsConfig(nextFields)),
      formMode: nextMode,
    }, nextFields),
    scaleLimit: getScalePersonLimit(template),
  };
};
