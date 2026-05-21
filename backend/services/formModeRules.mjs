/**
 * @file backend/services/formModeRules.mjs
 * @summary Regras de modo dos formularios de presenca.
 * @responsibility Resolver modo estrutural e normalizar configuracao de resultados ligada ao modo.
 */

const FORM_MODES = {
  NUCLEO: "nucleo",
  GERAL: "geral",
};

const getSelectionSourceKind = field => {
  if (!field || field.type !== "person_select") return null;
  return field?.selectionSource?.kind === "external_base" ? "external_base" : "members";
};

const isMembersSelectionField = field => getSelectionSourceKind(field) === "members";

const normalizeTotalLayoutStyle = style => {
  if (style === "bar" || style === "split") return "split";
  if (style === "metric" || style === "number") return "number";
  return style;
};

export const resolveFormMode = (type, resultsConfig, fieldDefinitions) => {
  if (type !== "presenca") return FORM_MODES.GERAL;
  if (resultsConfig?.formMode && Object.values(FORM_MODES).includes(resultsConfig.formMode)) {
    return resultsConfig.formMode;
  }
  return (fieldDefinitions || []).some(isMembersSelectionField) ? FORM_MODES.NUCLEO : FORM_MODES.GERAL;
};

export const normalizeResultsConfig = (config, formMode) => {
  if (!config || typeof config !== "object") {
    return formMode ? { formMode } : {};
  }
  return {
    ...config,
    formMode,
    totalsLayout: Array.isArray(config.totalsLayout)
      ? config.totalsLayout.map(item => ({
          ...item,
          style: normalizeTotalLayoutStyle(item?.style),
        }))
      : [],
  };
};

export const assertPresenceFormModeFields = (values, formMode) => {
  if (values.type !== "presenca") return;
  if (formMode === FORM_MODES.GERAL && values.fieldDefinitions.some(isMembersSelectionField)) {
    throw new Error("Formulario geral nao pode usar a base central de socios.");
  }
  if (formMode === FORM_MODES.NUCLEO && !values.fieldDefinitions.some(isMembersSelectionField)) {
    throw new Error("Presenca do nucleo precisa manter o campo principal da base central.");
  }
};
