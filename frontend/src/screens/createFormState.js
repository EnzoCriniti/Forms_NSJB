/**
 * @file frontend/src/screens/createFormState.js
 * @summary Estado inicial da criacao de formulario.
 * @responsibility Preparar estado do editor ao abrir, trocar formato e concluir salvamento.
 */

import { FORM_MODES, getFormMode, getScalePersonLimit } from "../lib/forms";
import { createDefaultPresenceFields } from "./createFormDefaults";
import { createDefaultResultsConfig, syncResultsConfigWithFields } from "./createFormResultsConfig";
import { createDefaultScaleSections } from "./createFormScaleDraft";

export const buildCreateFormInitialState = ({ form, isDuplicateMode = false }) => {
  if (!form) {
    const format = "presenca";
    const formMode = FORM_MODES.NUCLEO;
    const fields = createDefaultPresenceFields(formMode);
    return {
      format,
      formMode,
      preset: null,
      title: "",
      desc: "",
      selLabels: [],
      eventDate: "",
      closingDate: "",
      status: "rascunho",
      totalExpected: "",
      closingText: "Este formulário não está mais aceitando respostas.",
      fields,
      resultsConfig: createDefaultResultsConfig(fields),
      scaleLimit: 1,
      scaleDraft: createDefaultScaleSections(),
      setupStep: "type",
    };
  }

  const formMode = getFormMode(form);
  const fields = form.fieldDefinitions?.length ? form.fieldDefinitions : createDefaultPresenceFields(formMode);
  return {
    format: form.type,
    formMode,
    preset: null,
    title: form.title || "",
    desc: form.description || "",
    selLabels: form.labels || [],
    eventDate: form.date || "",
    closingDate: form.closing || "",
    status: form.status || "rascunho",
    totalExpected: form.totalExpected > 0 ? String(form.totalExpected) : "",
    closingText: form.closingText || "",
    fields,
    resultsConfig: syncResultsConfigWithFields({
      ...(form.resultsConfig || createDefaultResultsConfig(fields)),
      formMode,
    }, fields),
    scaleLimit: getScalePersonLimit(form),
    scaleDraft: form.scaleSections?.length ? form.scaleSections : createDefaultScaleSections(),
    setupStep: "editor",
  };
};

export const buildCreateFormFormatSelectionState = nextFormat => {
  if (nextFormat === "presenca") {
    const formMode = FORM_MODES.NUCLEO;
    const fields = createDefaultPresenceFields(formMode);
    return {
      format: nextFormat,
      formMode,
      fields,
      resultsConfig: createDefaultResultsConfig(fields),
    };
  }

  return {
    format: nextFormat,
    formMode: FORM_MODES.GERAL,
    fields: createDefaultPresenceFields(FORM_MODES.GERAL),
    scaleDraft: createDefaultScaleSections(),
    scaleLimit: 1,
  };
};

export const buildCreateFormSaveOutcome = ({ form, isDuplicateMode = false }) => ({
  title: form && !isDuplicateMode ? "Formulário alterado com sucesso" : "Formulário salvo com sucesso",
  message: form && !isDuplicateMode
    ? "As alterações foram gravadas e já estão disponíveis na listagem."
    : "O formulário foi salvo e já está disponível na listagem.",
});
