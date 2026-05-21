/**
 * @file frontend/src/screens/createFormResultsConfig.js
 * @summary Helpers de configuracao de resultados na criacao de formulario.
 * @responsibility Criar layouts de totais e sincronizar a configuracao com os campos atuais.
 */

import { FORM_MODES, isMembersSelectionField } from "../lib/forms";

export const getAutomaticTotalStyle = field => field.type === "yes_no" ? "split" : "number";

export const normalizeTotalStyle = (field, style) => {
  if (field?.type === "yes_no") {
    return style === "split" || style === "bar" ? "split" : "split";
  }
  return style === "number" || style === "metric" ? "number" : "number";
};

export const addTotalLayoutField = (totalsLayout, field) => ([
  ...totalsLayout,
  { fieldId: field.id, style: getAutomaticTotalStyle(field) },
]);

export const createDefaultResultsConfig = fields => ({
  searchEnabled: true,
  showLinkedRoster: true,
  blockDuplicatePersonResponses: false,
  publicResultsEnabled: false,
  formMode: fields.some(isMembersSelectionField) ? FORM_MODES.NUCLEO : FORM_MODES.GERAL,
  totalsLayout: (fields || []).filter(field => field.total).map(field => ({
    fieldId: field.id,
    style: getAutomaticTotalStyle(field),
  })),
});

export const syncResultsConfigWithFields = (config, fields) => {
  const totalFields = (fields || []).filter(field => field.total);
  const totalFieldIds = new Set(totalFields.map(field => String(field.id)));
  const hasSavedLayout = Array.isArray(config?.totalsLayout) && config.totalsLayout.length > 0;
  const currentLayout = hasSavedLayout
    ? config.totalsLayout
        .filter(item => totalFieldIds.has(String(item.fieldId)))
        .map(item => {
          const field = totalFields.find(current => String(current.id) === String(item.fieldId));
          return {
            fieldId: field.id,
            style: normalizeTotalStyle(field, item.style || getAutomaticTotalStyle(field)),
          };
        })
    : totalFields.map(field => ({
        fieldId: field.id,
        style: getAutomaticTotalStyle(field),
      }));

  return {
    searchEnabled: config?.searchEnabled ?? true,
    showLinkedRoster: config?.showLinkedRoster ?? true,
    blockDuplicatePersonResponses: config?.blockDuplicatePersonResponses ?? false,
    publicResultsEnabled: config?.publicResultsEnabled ?? false,
    formMode: config?.formMode || (fields.some(isMembersSelectionField) ? FORM_MODES.NUCLEO : FORM_MODES.GERAL),
    totalsLayout: currentLayout,
  };
};
