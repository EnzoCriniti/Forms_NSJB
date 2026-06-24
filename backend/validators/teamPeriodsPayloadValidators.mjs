/**
 * @file backend/validators/teamPeriodsPayloadValidators.mjs
 * @summary Validadores de payload do dominio de equipes.
 */

import {
  assertPayload as assert,
  isIdLike,
  isObject,
  isOptionalString,
} from "./payloadValidatorPrimitives.mjs";

const isDateString = value => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

const assertIdList = (value, label) => {
  assert(value === undefined || Array.isArray(value), `${label} precisa ser uma lista.`);
  for (const id of value || []) {
    assert(Number.isInteger(Number(id)) && Number(id) > 0, `${label} contem pessoa invalida.`);
  }
};

export const validateTeamPeriodPayload = payload => {
  assert(isObject(payload), "Payload de periodo de equipe invalido.");
  assert(isIdLike(payload.id), "Id do periodo invalido.");
  assert(isOptionalString(payload.title), "Titulo do periodo invalido.");
  assert(isDateString(payload.startDate), "Inicio do periodo e obrigatorio.");
  assert(isDateString(payload.endDate), "Conclusao do periodo e obrigatoria.");
  assert(String(payload.endDate) >= String(payload.startDate), "Conclusao nao pode ser anterior ao inicio.");
  assert(Number.isInteger(Number(payload.assistantMasterPersonId)) && Number(payload.assistantMasterPersonId) > 0, "Mestre Assistente e obrigatorio.");
  assert(Number.isInteger(Number(payload.directAssistantPersonId)) && Number(payload.directAssistantPersonId) > 0, "Auxiliar Direto e obrigatorio.");
  assertIdList(payload.assistantMemberIds, "Equipe do Mestre Assistente");
  assertIdList(payload.organMemberIds, "Equipe da Organ");
  assert(isOptionalString(payload.notes), "Observacoes do periodo invalidas.");
};
