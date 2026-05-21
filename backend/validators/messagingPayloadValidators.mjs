/**
 * @file backend/validators/messagingPayloadValidators.mjs
 * @summary Validadores de payload do dominio de mensagens.
 * @responsibility Validar modelos, presets, configuracao e agendamentos de mensagens.
 */

import {
  assertPayload as assert,
  isIdLike,
  isNonEmptyString,
  isObject,
  isOptionalBoolean,
  isOptionalString,
} from "./payloadValidatorPrimitives.mjs";

const MESSAGE_TEMPLATE_TYPES = ["new_scale", "fill_reminder", "open_slots"];
const MESSAGE_STATUSES_VALID = ["rascunho", "agendada", "pronta", "disparada", "cancelada"];
const MESSAGE_WINDOW_OPTIONS = ["morning_of_closing", "12h_before", "1h_before"];
const MESSAGE_RECIPIENT_MODES = ["auto", "preset", "manual"];

export const validateMessageTemplatePayload = payload => {
  assert(isObject(payload), "Payload do modelo invalido.");
  assert(isIdLike(payload.id), "Id do modelo invalido.");
  assert(isNonEmptyString(payload.name), "Nome do modelo e obrigatorio.");
  assert(MESSAGE_TEMPLATE_TYPES.includes(payload.type), "Tipo do modelo invalido.");
  assert(isNonEmptyString(payload.body), "Corpo do modelo e obrigatorio.");
};

export const validatePersonPresetPayload = payload => {
  assert(isObject(payload), "Payload do preset invalido.");
  assert(isIdLike(payload.id), "Id do preset invalido.");
  assert(isNonEmptyString(payload.name), "Nome do preset e obrigatorio.");
  assert(payload.personKeys === undefined || Array.isArray(payload.personKeys), "Lista de pessoas do preset invalida.");
};

export const validateMessagingConfigPayload = payload => {
  assert(isObject(payload), "Payload da configuracao de mensagens invalido.");
  assert(isOptionalString(payload.whatsappGroupName), "Nome do grupo invalido.");
  assert(isOptionalBoolean(payload.autoDispatchEnabled), "Flag autoDispatchEnabled invalida.");
  assert(isOptionalString(payload.publicBaseUrl), "URL publica invalida.");
};

export const validateEventMessagePayload = payload => {
  assert(isObject(payload), "Payload da mensagem invalido.");
  assert(isIdLike(payload.id), "Id da mensagem invalido.");
  assert(MESSAGE_TEMPLATE_TYPES.includes(payload.type), "Tipo da mensagem invalido.");
  assert(isNonEmptyString(payload.body), "Corpo da mensagem e obrigatorio.");
  assert(isIdLike(payload.templateId), "Modelo da mensagem invalido.");
  assert(payload.config === undefined || payload.config === null || isObject(payload.config), "Configuracao da mensagem invalida.");
  if (payload.config?.formId !== undefined && payload.config?.formId !== null) {
    assert(Number.isInteger(Number(payload.config.formId)) && Number(payload.config.formId) > 0, "Form da mensagem invalido.");
  }
  if (payload.config?.recipients) {
    assert(MESSAGE_RECIPIENT_MODES.includes(payload.config.recipients.mode), "Modo de selecao de destinatarios invalido.");
    if (payload.config.recipients.mode === "preset") {
      assert(Number.isInteger(Number(payload.config.recipients.presetId)) && Number(payload.config.recipients.presetId) > 0, "Preset selecionado invalido.");
    }
    if (payload.config.recipients.mode === "manual") {
      assert(Array.isArray(payload.config.recipients.personKeys), "Lista de pessoas invalida.");
    }
  }
  assert(payload.scheduledFor === undefined || payload.scheduledFor === null || typeof payload.scheduledFor === "string", "scheduledFor invalido.");
  assert(payload.windowOption === undefined || payload.windowOption === null || MESSAGE_WINDOW_OPTIONS.includes(payload.windowOption), "Janela de agendamento invalida.");
  assert(payload.autoDispatchEnabled === undefined || typeof payload.autoDispatchEnabled === "boolean", "Flag autoDispatchEnabled invalida.");
  assert(payload.status === undefined || MESSAGE_STATUSES_VALID.includes(payload.status), "Status da mensagem invalido.");
};
