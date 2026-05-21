/**
 * @file backend/services/formSaveRules.mjs
 * @summary Regras de preparo do save de formularios.
 * @responsibility Normalizar o registro persistido e validar regras de save antes do upsert.
 */

import {
  assertPresenceFormModeFields,
  normalizeResultsConfig,
  resolveFormMode,
} from "./formModeRules.mjs";

const FORM_TYPES = ["presenca", "escala_organ"];
const FORM_STATUSES = ["rascunho", "aberto", "fechado", "arquivado"];

export const buildFormSaveValues = (payload, slug) => {
  const formMode = resolveFormMode(payload.type, payload.resultsConfig, payload.fieldDefinitions);
  const values = {
    id: payload.id,
    slug,
    type: payload.type,
    status: payload.status,
    title: payload.title,
    sessionName: payload.sessionName || "",
    description: payload.description || "",
    date: payload.date || null,
    closing: payload.closing || null,
    closingText: payload.closingText || "",
    totalExpected: Number(payload.totalExpected || 0),
    labels: payload.labels || [],
    fieldDefinitions: payload.fieldDefinitions || [],
    resultsConfig: normalizeResultsConfig(payload.resultsConfig, formMode),
    scaleSections: payload.scaleSections || [],
  };

  if (!values.title?.trim()) throw new Error("Titulo e obrigatorio.");
  if (!FORM_TYPES.includes(values.type)) throw new Error("Tipo de formulario invalido.");
  if (!FORM_STATUSES.includes(values.status)) throw new Error("Status invalido.");
  assertPresenceFormModeFields(values, formMode);

  return values;
};
