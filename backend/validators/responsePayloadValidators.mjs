/**
 * @file backend/validators/responsePayloadValidators.mjs
 * @summary Validadores de payload do dominio de respostas.
 * @responsibility Validar respostas enviadas para formularios antes da camada de servicos.
 */

import {
  assertPayload as assert,
  isNonEmptyString,
  isObject,
  isOptionalString,
} from "./payloadValidatorPrimitives.mjs";

export const validateResponsePayload = payload => {
  assert(isObject(payload), "Payload de resposta invalido.");
  assert(Number.isInteger(Number(payload.formId)) && Number(payload.formId) > 0, "formId invalido.");
  assert(isNonEmptyString(payload.respondentName), "Respondente invalido.");
  assert(isOptionalString(payload.respondentGrau), "Grau do respondente invalido.");
  assert(isObject(payload.values), "Valores da resposta precisam ser um objeto.");
};
