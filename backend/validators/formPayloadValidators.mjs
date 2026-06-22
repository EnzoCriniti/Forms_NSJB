/**
 * @file backend/validators/formPayloadValidators.mjs
 * @summary Validadores de payload de formularios e presets.
 * @responsibility Validar estrutura de formularios, campos, resultados e presets antes dos servicos.
 */

import {
  FIELD_TYPES,
  validateSelectionSource,
} from "./catalogPayloadValidators.mjs";
import { FORM_MODE_VALUES } from "../../shared/formModes.mjs";
import { MEMBER_BINDING_ROLE_VALUES, SELECTION_SOURCE_KINDS } from "../../shared/formFieldRules.mjs";
import {
  assertPayload as assert,
  isIdLike,
  isNonEmptyString,
  isObject,
  isOptionalNumberLike,
  isOptionalPositiveIntegerLike,
  isOptionalString,
} from "./payloadValidatorPrimitives.mjs";

const FORM_TYPES = ["presenca", "escala_organ"];
const FORM_STATUS = ["rascunho", "aberto", "fechado", "arquivado"];
const TOTAL_LAYOUT_STYLES = ["bar", "metric", "split", "number"];

const validateFieldDefinition = field => {
  assert(isObject(field), "Campo de formulario invalido.");
  assert(isIdLike(field.id), "Campo de formulario precisa de id numerico.");
  assert(FIELD_TYPES.includes(field.type), "Tipo de campo invalido.");
  assert(isNonEmptyString(field.label), "Campo de formulario precisa de rotulo.");
  assert(isOptionalString(field.baseLabel), "Rotulo base do campo invalido.");
  assert(isOptionalString(field.scheduleText), "Horario do campo invalido.");
  assert(typeof field.required === "boolean", "Campo de formulario precisa informar required.");
  assert(typeof field.show === "boolean", "Campo de formulario precisa informar show.");
  assert(typeof field.total === "boolean", "Campo de formulario precisa informar total.");
  validateSelectionSource(field.type, field.selectionSource);
  if (field.memberBinding !== undefined && field.memberBinding !== null) {
    assert(isObject(field.memberBinding), "Vinculo de base do campo invalido.");
    assert(field.type === "person_select", "Somente campos de pessoa podem usar vinculo com a base.");
    assert(field.memberBinding.source === undefined || field.memberBinding.source === SELECTION_SOURCE_KINDS.MEMBERS, "Origem do vinculo do campo invalida.");
    assert(field.memberBinding.role === undefined || MEMBER_BINDING_ROLE_VALUES.includes(field.memberBinding.role), "Papel do vinculo do campo invalido.");
  }
  if (field.validation !== undefined && field.validation !== null) {
    assert(isObject(field.validation), "Regras de validacao invalidas.");
    const keys = Object.keys(field.validation);
    if (field.type === "text") {
      assert(keys.every(key => ["minLength", "maxLength"].includes(key)), "Regras de validacao invalidas.");
      assert(isOptionalNumberLike(field.validation.minLength), "Minimo de caracteres invalido.");
      assert(isOptionalNumberLike(field.validation.maxLength), "Maximo de caracteres invalido.");
      const minLength = field.validation.minLength === undefined || field.validation.minLength === null || field.validation.minLength === "" ? null : Number(field.validation.minLength);
      const maxLength = field.validation.maxLength === undefined || field.validation.maxLength === null || field.validation.maxLength === "" ? null : Number(field.validation.maxLength);
      assert(minLength === null || maxLength === null || minLength <= maxLength, "Regras de validacao invalidas.");
    } else if (field.type === "number") {
      assert(keys.every(key => ["min", "max"].includes(key)), "Regras de validacao invalidas.");
      assert(isOptionalNumberLike(field.validation.min), "Valor minimo invalido.");
      assert(isOptionalNumberLike(field.validation.max), "Valor maximo invalido.");
      const min = field.validation.min === undefined || field.validation.min === null || field.validation.min === "" ? null : Number(field.validation.min);
      const max = field.validation.max === undefined || field.validation.max === null || field.validation.max === "" ? null : Number(field.validation.max);
      assert(min === null || max === null || min <= max, "Regras de validacao invalidas.");
    } else {
      assert(keys.length === 0, "Regras de validacao invalidas.");
    }
  }
  if (field.type === "grid") {
    assert(Array.isArray(field.gridRows), "Campo grid precisa de linhas.");
    assert(Array.isArray(field.gridCols), "Campo grid precisa de colunas.");
  }
};

const validateScaleSectionTemplate = section => {
  assert(isObject(section), "Secao de escala invalida.");
  assert(isNonEmptyString(section.title), "Secao de escala precisa de titulo.");
  assert(Number.isInteger(Number(section.responsaveis)) && Number(section.responsaveis) >= 0, "Responsaveis da secao invalidos.");
  assert(Number.isInteger(Number(section.auxiliares)) && Number(section.auxiliares) >= 0, "Auxiliares da secao invalidos.");
};

const validateResultsConfig = config => {
  assert(config === undefined || isObject(config), "resultsConfig invalido.");
  if (!config) return;
  assert(config.searchEnabled === undefined || typeof config.searchEnabled === "boolean", "searchEnabled invalido.");
  assert(config.showLinkedRoster === undefined || typeof config.showLinkedRoster === "boolean", "showLinkedRoster invalido.");
  assert(config.blockDuplicatePersonResponses === undefined || typeof config.blockDuplicatePersonResponses === "boolean", "blockDuplicatePersonResponses invalido.");
  assert(config.formMode === undefined || FORM_MODE_VALUES.includes(config.formMode), "formMode invalido.");
  assert(config.maxAssignmentsPerPerson === undefined || isOptionalPositiveIntegerLike(config.maxAssignmentsPerPerson), "maxAssignmentsPerPerson invalido.");
  if (config.totalsLayout !== undefined) {
    assert(Array.isArray(config.totalsLayout), "totalsLayout invalido.");
    for (const item of config.totalsLayout) {
      assert(isObject(item), "Item de totalsLayout invalido.");
      assert(isIdLike(item.fieldId), "fieldId de totalizacao invalido.");
      assert(item.style === undefined || TOTAL_LAYOUT_STYLES.includes(item.style), "Estilo de totalizacao invalido.");
    }
  }
};

export const validateFormPayload = payload => {
  assert(isObject(payload), "Payload de formulario invalido.");
  assert(isIdLike(payload.id), "Id do formulario invalido.");
  assert(FORM_TYPES.includes(payload.type), "Tipo de formulario invalido.");
  assert(FORM_STATUS.includes(payload.status), "Status do formulario invalido.");
  assert(isNonEmptyString(payload.title), "Titulo do formulario e obrigatorio.");
  assert(isOptionalString(payload.slug), "Slug do formulario invalido.");
  assert(isOptionalString(payload.sessionName), "Nome da sessao invalido.");
  assert(isOptionalString(payload.description), "Descricao do formulario invalida.");
  assert(isOptionalString(payload.date), "Data do formulario invalida.");
  assert(isOptionalString(payload.closing), "Fechamento do formulario invalido.");
  assert(isOptionalString(payload.closingText), "Texto de fechamento invalido.");
  assert(isOptionalNumberLike(payload.totalExpected), "Total esperado invalido.");
  assert(Array.isArray(payload.labels), "Labels do formulario precisam ser um array.");
  validateResultsConfig(payload.resultsConfig);

  if (payload.type === "presenca") {
    assert(Array.isArray(payload.fieldDefinitions), "Formulario de presenca precisa de fieldDefinitions.");
    for (const field of payload.fieldDefinitions) validateFieldDefinition(field);
  }

  if (payload.type === "escala_organ") {
    assert(Array.isArray(payload.scaleSections), "Formulario de escala precisa de scaleSections.");
    for (const section of payload.scaleSections) validateScaleSectionTemplate(section);
  }
};

export const validatePresetPayload = payload => {
  assert(isObject(payload), "Payload de preset invalido.");
  assert(isIdLike(payload.id), "Id do preset invalido.");
  assert(FORM_TYPES.includes(payload.type), "Tipo do preset invalido.");
  assert(isNonEmptyString(payload.name), "Nome do preset e obrigatorio.");
  assert(isOptionalString(payload.desc), "Descricao do preset invalida.");
  assert(isOptionalString(payload.closingText), "Texto de fechamento do preset invalido.");
  assert(Array.isArray(payload.labels), "Labels do preset precisam ser um array.");
  assert(Array.isArray(payload.fieldDefinitions), "fieldDefinitions do preset precisam ser um array.");
  assert(Array.isArray(payload.scaleSections), "scaleSections do preset precisam ser um array.");
  validateResultsConfig(payload.resultsConfig);
  for (const field of payload.fieldDefinitions) validateFieldDefinition(field);
  for (const section of payload.scaleSections) validateScaleSectionTemplate(section);
};
