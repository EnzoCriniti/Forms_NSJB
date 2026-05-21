/**
 * @file backend/validators/securityPayloadValidators.mjs
 * @summary Validadores de payload de autenticacao e chave mestra.
 * @responsibility Validar entrada de login e operacoes de seguranca administrativas.
 */

import {
  assertPayload as assert,
  isNonEmptyString,
  isObject,
  isOptionalString,
} from "./payloadValidatorPrimitives.mjs";

export const validateFormDeleteKeyPayload = payload => {
  assert(isObject(payload), "Payload da chave mestra invalido.");
  assert(isNonEmptyString(payload.masterKey), "Chave mestra e obrigatoria.");
};

export const validateFormDeleteKeyUpdatePayload = payload => {
  assert(isObject(payload), "Payload da chave mestra invalido.");
  assert(isOptionalString(payload.currentMasterKey), "Chave mestra atual invalida.");
  assert(isNonEmptyString(payload.newMasterKey), "Nova chave mestra e obrigatoria.");
};

export const validateAuthLoginPayload = payload => {
  assert(isObject(payload), "Payload de autenticacao invalido.");
  assert(isNonEmptyString(payload.username), "Username e obrigatorio.");
  assert(isNonEmptyString(payload.password), "Senha e obrigatoria.");
};
