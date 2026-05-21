/**
 * @file backend/validators/payloadValidators.mjs
 * @summary Validadores de payload da API.
 * @responsibility Verificar forma e tipos basicos dos dados antes da camada de servicos.
 */

import {
  assertPayload as assert,
} from "./payloadValidatorPrimitives.mjs";

export const validateDeleteId = (value, label) => {
  assert(Number.isInteger(Number(value)) && Number(value) > 0, `${label} invalido.`);
  return Number(value);
};

export {
  validateExternalBasePayload,
  validateLabelPayload,
  validateMembersConfigPayload,
  validatePeoplePayload,
  validateUserPayload,
} from "./adminPayloadValidators.mjs";

export {
  validateFieldCatalogPayload,
  validateScaleTaskCatalogPayload,
} from "./catalogPayloadValidators.mjs";

export {
  validateFormPayload,
  validatePresetPayload,
} from "./formPayloadValidators.mjs";

export {
  validateEventPayload,
} from "./eventPayloadValidators.mjs";

export {
  validateEscalaClaimPayload,
  validateEscalaPayload,
} from "./escalaPayloadValidators.mjs";

export {
  validateResponsePayload,
} from "./responsePayloadValidators.mjs";

export {
  validateEventMessagePayload,
  validateMessageTemplatePayload,
  validateMessagingConfigPayload,
  validatePersonPresetPayload,
} from "./messagingPayloadValidators.mjs";

export {
  validateAuthLoginPayload,
  validateFormDeleteKeyPayload,
  validateFormDeleteKeyUpdatePayload,
} from "./securityPayloadValidators.mjs";
