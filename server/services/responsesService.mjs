/**
 * @file server/services/responsesService.mjs
 * @summary Regras de negocio das respostas.
 * @responsibility Validar e salvar respostas dinamicas por formulario.
 */

import { listResponsesByFormId, upsertResponseRecord } from "../repositories/responsesRepository.mjs";
import { findFormById } from "../repositories/formsRepository.mjs";
import { validateResponseValuesAgainstForm } from "../../src/lib/forms.js";

const makeError = (message, statusCode = 400, code = "FIELD_VALIDATION_ERROR") => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

export const saveResponse = payload => {
  const respondentName = String(payload.respondentName || "").trim();
  if (!payload.formId || !respondentName) throw new Error("Formulario e respondente sao obrigatorios.");
  const form = findFormById(payload.formId);
  if (!form) throw new Error("Formulario nao encontrado.");
  const validationError = validateResponseValuesAgainstForm(form, payload.values || {});
  if (validationError) throw makeError(validationError);
  const duplicateBlocked = form.resultsConfig?.blockDuplicatePersonResponses === true;
  if (duplicateBlocked) {
    const normalizedRespondentName = respondentName.toLowerCase();
    const existingResponse = listResponsesByFormId(payload.formId).find(response => String(response.respondentName || "").trim().toLowerCase() === normalizedRespondentName);
    if (existingResponse) throw makeError("Esta pessoa ja respondeu e novas respostas estao bloqueadas para este formulario.", 409, "DUPLICATE_RESPONSE_BLOCKED");
  }
  const result = upsertResponseRecord({
    formId: payload.formId,
    respondentName,
    respondentGrau: payload.respondentGrau || "",
    values: payload.values || {},
    fieldDefinitions: form.fieldDefinitions || [],
  });
  return {
    responses: listResponsesByFormId(payload.formId),
    responseId: result.responseId,
    mode: result.mode,
  };
};

export const getResponsesByFormId = formId => listResponsesByFormId(formId);
