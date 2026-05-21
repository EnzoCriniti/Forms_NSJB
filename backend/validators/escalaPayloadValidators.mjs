/**
 * @file backend/validators/escalaPayloadValidators.mjs
 * @summary Validadores de payload do dominio de escala.
 * @responsibility Validar secoes, slots e inscricoes de escala antes da camada de servicos.
 */

import {
  assertPayload as assert,
  isNonEmptyString,
  isObject,
  isOptionalString,
} from "./payloadValidatorPrimitives.mjs";

const validateEscalaSection = section => {
  assert(isObject(section), "Secao da escala invalida.");
  assert(isNonEmptyString(section.title), "Secao da escala precisa de titulo.");
  assert(isOptionalString(section.color), "Cor da secao invalida.");
  assert(Array.isArray(section.slots), "Secao da escala precisa de slots.");
  for (const slot of section.slots) {
    assert(isObject(slot), "Slot da escala invalido.");
    assert(isNonEmptyString(slot.role), "Slot da escala precisa de funcao.");
    assert(isOptionalString(slot.person), "Pessoa da escala invalida.");
  }
};

export const validateEscalaPayload = (formId, payload) => {
  assert(Number.isInteger(Number(formId)) && Number(formId) > 0, "formId da escala invalido.");
  assert(isObject(payload), "Payload da escala invalido.");
  assert(Array.isArray(payload.sections), "Escala precisa de secoes.");
  for (const section of payload.sections) validateEscalaSection(section);
};

export const validateEscalaClaimPayload = payload => {
  assert(isObject(payload), "Payload da inscricao da escala invalido.");
  assert(Number.isInteger(Number(payload.sectionIndex)) && Number(payload.sectionIndex) >= 0, "sectionIndex da escala invalido.");
  assert(Number.isInteger(Number(payload.slotIndex)) && Number(payload.slotIndex) >= 0, "slotIndex da escala invalido.");
  assert(isNonEmptyString(payload.person), "Nome da inscricao invalido.");
};
