/**
 * @file backend/validators/eventPayloadValidators.mjs
 * @summary Validadores de payload do dominio de eventos.
 * @responsibility Validar a forma estrutural de eventos antes da camada de servicos.
 */

import {
  assertPayload as assert,
  isIdLike,
  isNonEmptyString,
  isObject,
  isOptionalString,
} from "./payloadValidatorPrimitives.mjs";

const EVENT_STATUS = ["rascunho", "pronto", "publicado", "encerrado"];

export const validateEventPayload = payload => {
  assert(isObject(payload), "Payload de evento invalido.");
  assert(isIdLike(payload.id), "Id do evento invalido.");
  assert(isNonEmptyString(payload.title), "Nome do evento e obrigatorio.");
  assert(isOptionalString(payload.description), "Descricao do evento invalida.");
  assert(isOptionalString(payload.date), "Data do evento invalida.");
  assert(isOptionalString(payload.opening), "Abertura do evento invalida.");
  assert(isOptionalString(payload.closing), "Fechamento do evento invalido.");
  assert(payload.status === undefined || EVENT_STATUS.includes(payload.status), "Status do evento invalido.");
  assert(Array.isArray(payload.formIds), "Formularios do evento precisam ser um array.");
  for (const formId of payload.formIds) {
    assert(Number.isInteger(Number(formId)) && Number(formId) > 0, "Formulario do evento invalido.");
  }
  assert(payload.messageConfig === undefined || payload.messageConfig === null || isObject(payload.messageConfig), "Configuracao de mensagem do evento invalida.");
};
