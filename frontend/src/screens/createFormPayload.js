/**
 * @file frontend/src/screens/createFormPayload.js
 * @summary Payload final do editor de criacao de formulario.
 * @responsibility Montar o contrato salvo pela API a partir do estado ja normalizado do editor.
 */

import {
  normalizePresenceFieldsForMode,
} from "./createFormMemberBindings";
import { syncResultsConfigWithFields } from "./createFormResultsConfig";

export const buildCreateFormPayload = ({
  form,
  format,
  formMode,
  status,
  formTitle,
  desc,
  selLabels,
  eventDate,
  closingDate,
  closingText,
  totalExpected,
  resultsConfig,
  scaleLimit,
  fields,
  scaleDraft,
  linkedPeopleField,
}) => {
  const normalizedFields = normalizePresenceFieldsForMode(fields, formMode);
  return {
    id: form?.id,
    slug: form?.slug,
    type: format,
    status,
    title: formTitle,
    sessionName: "",
    description: desc,
    labels: selLabels,
    date: eventDate,
    closing: closingDate,
    closingText,
    totalExpected: format === "presenca" && linkedPeopleField ? Number(totalExpected || 0) : 0,
    fieldDefinitions: format === "presenca" ? normalizedFields : [],
    resultsConfig: format === "presenca"
      ? syncResultsConfigWithFields({ ...resultsConfig, formMode }, normalizedFields)
      : { ...resultsConfig, maxAssignmentsPerPerson: scaleLimit },
    scaleSections: format === "escala_organ" ? scaleDraft : [],
  };
};
