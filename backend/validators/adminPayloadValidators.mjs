/**
 * @file backend/validators/adminPayloadValidators.mjs
 * @summary Validadores de payload administrativos.
 * @responsibility Validar usuarios, classificacoes, socios e bases externas antes dos servicos.
 */

import {
  assertPayload as assert,
  isIdLike,
  isNonEmptyString,
  isObject,
  isOptionalBoolean,
  isOptionalPositiveIntegerLike,
  isOptionalString,
} from "./payloadValidatorPrimitives.mjs";

export const validateUserPayload = payload => {
  assert(isObject(payload), "Payload de usuario invalido.");
  assert(isIdLike(payload.id), "Id do usuario invalido.");
  assert(isOptionalString(payload.name), "Nome do usuario invalido.");
  assert(isNonEmptyString(payload.username), "Username do usuario e obrigatorio.");
  assert(isOptionalString(payload.password), "Senha do usuario invalida.");
  assert(payload.layerId != null && isIdLike(payload.layerId), "Camada de acesso do usuario e obrigatoria.");
};

export const validateAccessLayerPayload = payload => {
  assert(isObject(payload), "Payload de camada invalido.");
  assert(isIdLike(payload.id), "Id da camada invalido.");
  assert(isNonEmptyString(payload.name), "Nome da camada e obrigatorio.");
  assert(isOptionalString(payload.description), "Descricao da camada invalida.");
  assert(Array.isArray(payload.permissions), "Permissoes da camada invalidas.");
  for (const permission of payload.permissions) {
    assert(typeof permission === "string", "Permissao da camada invalida.");
  }
};

export const validateLabelPayload = payload => {
  assert(isObject(payload), "Payload de classificacao invalido.");
  assert(isIdLike(payload.id), "Id da classificacao invalido.");
  assert(isNonEmptyString(payload.name), "Nome da classificacao e obrigatorio.");
  assert(isNonEmptyString(payload.color), "Cor da classificacao e obrigatoria.");
  assert(isOptionalString(payload.createdBy), "createdBy da classificacao invalido.");
};

export const validatePeoplePayload = payload => {
  assert(isObject(payload), "Payload de socios invalido.");
  assert(Array.isArray(payload.people), "Lista de socios invalida.");
  for (const person of payload.people) {
    assert(isObject(person), "Socio invalido.");
    assert(isIdLike(person.id), "Id do socio invalido.");
    assert(isNonEmptyString(person.name), "Socio precisa de nome.");
    assert(isOptionalString(person.grau), "Grau do socio invalido.");
    assert(isOptionalString(person.phone), "Telefone do socio invalido.");
    assert(isOptionalBoolean(person.active), "Status do socio invalido.");
    assert(isOptionalString(person.source), "Origem do socio invalida.");
    assert(isOptionalString(person.externalKey), "Chave externa do socio invalida.");
    assert(isOptionalString(person.syncedAt), "Data de sincronizacao do socio invalida.");
    assert(person.metadata === undefined || isObject(person.metadata), "Metadata do socio invalida.");
  }
};

export const validateMembersConfigPayload = payload => {
  assert(isObject(payload), "Payload de configuracao de socios invalido.");
  assert(isOptionalString(payload.sourceType), "sourceType invalido.");
  assert(isOptionalString(payload.sheetUrl), "sheetUrl invalido.");
  assert(isOptionalString(payload.nameColumn), "nameColumn invalido.");
  assert(isOptionalString(payload.grauColumn), "grauColumn invalido.");
  assert(isOptionalString(payload.phoneColumn), "phoneColumn invalido.");
  assert(isOptionalString(payload.sexColumn), "sexColumn invalido.");
  assert(isOptionalString(payload.externalIdColumn), "externalIdColumn invalido.");
  assert(isOptionalString(payload.activeColumn), "activeColumn invalido.");
  assert(isOptionalString(payload.range), "range invalido.");
  assert(isOptionalBoolean(payload.syncEnabled), "syncEnabled invalido.");
  assert(isOptionalPositiveIntegerLike(payload.syncFrequencyHours), "syncFrequencyHours invalido.");
  assert(isOptionalString(payload.lastSyncedAt), "lastSyncedAt invalido.");
};

export const validateExternalBasePayload = payload => {
  assert(isObject(payload), "Payload de base externa invalido.");
  assert(isIdLike(payload.id), "Id da base externa invalido.");
  assert(isNonEmptyString(payload.name), "Nome da base externa e obrigatorio.");
  assert(isOptionalString(payload.description), "Descricao da base externa invalida.");
  assert(isOptionalString(payload.sourceType), "sourceType da base externa invalido.");
  assert(isOptionalString(payload.sheetUrl), "sheetUrl da base externa invalido.");
  assert(isOptionalString(payload.range), "range da base externa invalido.");
  assert(isOptionalString(payload.valueColumn), "valueColumn da base externa invalido.");
  assert(isOptionalString(payload.labelColumn), "labelColumn da base externa invalido.");
  assert(isOptionalString(payload.descriptionColumn), "descriptionColumn da base externa invalido.");
  assert(isOptionalString(payload.activeColumn), "activeColumn da base externa invalido.");
  assert(isOptionalBoolean(payload.active), "active da base externa invalido.");
  assert(isOptionalBoolean(payload.syncEnabled), "syncEnabled da base externa invalido.");
  assert(isOptionalPositiveIntegerLike(payload.syncFrequencyHours), "syncFrequencyHours da base externa invalido.");
  assert(isOptionalString(payload.lastSyncedAt), "lastSyncedAt da base externa invalido.");
  assert(payload.items === undefined || Array.isArray(payload.items), "items da base externa invalido.");
  for (const item of payload.items || []) {
    assert(isObject(item), "Item da base externa invalido.");
    assert(isOptionalString(item.value), "Valor do item da base externa invalido.");
    assert(isOptionalString(item.label), "Rotulo do item da base externa invalido.");
    assert(isOptionalString(item.description), "Descricao do item da base externa invalida.");
    assert(isOptionalBoolean(item.active), "Status do item da base externa invalido.");
  }
};
