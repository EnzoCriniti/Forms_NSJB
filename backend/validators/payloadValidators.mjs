/**
 * @file backend/validators/payloadValidators.mjs
 * @summary Validadores de payload da API.
 * @responsibility Verificar forma e tipos basicos dos dados antes da camada de servicos.
 */

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
const FIELD_TYPES = ["person_select", "yes_no", "number", "text", "grid"];
const FIELD_CATEGORIES = ["presenca", "quantidade", "texto", "avaliacao", "outro"];
const SCALE_TASK_CATEGORIES = ["cozinha", "limpeza", "organizacao", "sessao", "outro"];

const TOTAL_LAYOUT_STYLES = ["bar", "metric", "split", "number"];
const MEMBER_BINDING_ROLES = ["primary", "secondary"];
const SELECTION_SOURCE_KINDS = ["members", "external_base"];
const FORM_MODES = ["nucleo", "geral"];

const validateSelectionSource = (type, selectionSource) => {
  if (selectionSource === undefined || selectionSource === null) return;
  assert(isObject(selectionSource), "Origem de selecao do campo invalida.");
  assert(type === "person_select", "Somente campos de pessoa podem usar origem de selecao.");
  assert(SELECTION_SOURCE_KINDS.includes(selectionSource.kind), "Tipo de origem de selecao invalido.");
  if (selectionSource.kind === "external_base") {
    assert(isIdLike(selectionSource.externalBaseId), "Base externa vinculada invalida.");
  }
};

const validateFieldDefinition = field => {
  assert(isObject(field), "Campo de formulario invalido.");
  assert(isIdLike(field.id), "Campo de formulario precisa de id numerico.");
  assert(FIELD_TYPES.includes(field.type), "Tipo de campo invalido.");
  assert(isNonEmptyString(field.label), "Campo de formulario precisa de rotulo.");
  assert(typeof field.required === "boolean", "Campo de formulario precisa informar required.");
  assert(typeof field.show === "boolean", "Campo de formulario precisa informar show.");
  assert(typeof field.total === "boolean", "Campo de formulario precisa informar total.");
  validateSelectionSource(field.type, field.selectionSource);
  if (field.memberBinding !== undefined && field.memberBinding !== null) {
    assert(isObject(field.memberBinding), "Vinculo de base do campo invalido.");
    assert(field.type === "person_select", "Somente campos de pessoa podem usar vinculo com a base.");
    assert(field.memberBinding.source === undefined || field.memberBinding.source === "members", "Origem do vinculo do campo invalida.");
    assert(field.memberBinding.role === undefined || MEMBER_BINDING_ROLES.includes(field.memberBinding.role), "Papel do vinculo do campo invalido.");
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
  assert(config.formMode === undefined || FORM_MODES.includes(config.formMode), "formMode invalido.");
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

const validateGridSchema = schema => {
  assert(schema === undefined || isObject(schema), "Schema de grade invalido.");
  if (!schema) return;
  assert(schema.rows === undefined || Array.isArray(schema.rows), "Linhas da grade precisam ser um array.");
  assert(schema.cols === undefined || Array.isArray(schema.cols), "Colunas da grade precisam ser um array.");
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

export const validateFieldCatalogPayload = payload => {
  assert(isObject(payload), "Payload de campo base invalido.");
  assert(isIdLike(payload.id), "Id do campo base invalido.");
  assert(isNonEmptyString(payload.key), "Chave do campo base e obrigatoria.");
  assert(isNonEmptyString(payload.name), "Nome do campo base e obrigatorio.");
  assert(FIELD_TYPES.includes(payload.type), "Tipo do campo base invalido.");
  assert(FIELD_CATEGORIES.includes(payload.category), "Categoria do campo base invalida.");
  assert(isNonEmptyString(payload.defaultLabel), "Rotulo padrao do campo base e obrigatorio.");
  validateGridSchema(payload.gridSchema);
  validateSelectionSource(payload.type, payload.selectionSource);
  assert(isOptionalString(payload.description), "Descricao do campo base invalida.");
  assert(payload.active === undefined || typeof payload.active === "boolean", "Status do campo base invalido.");
};

export const validateScaleTaskCatalogPayload = payload => {
  assert(isObject(payload), "Payload de tarefa base invalido.");
  assert(isIdLike(payload.id), "Id da tarefa base invalido.");
  assert(isNonEmptyString(payload.key), "Chave da tarefa base e obrigatoria.");
  assert(isNonEmptyString(payload.name), "Nome da tarefa base e obrigatorio.");
  assert(SCALE_TASK_CATEGORIES.includes(payload.category), "Categoria da tarefa base invalida.");
  assert(isNonEmptyString(payload.defaultLabel), "Rotulo padrao da tarefa base e obrigatorio.");
  assert(isOptionalString(payload.description), "Descricao da tarefa base invalida.");
  assert(payload.active === undefined || typeof payload.active === "boolean", "Status da tarefa base invalido.");
};

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
