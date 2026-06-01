/**
 * @file backend/validators/catalogPayloadValidators.mjs
 * @summary Validadores de payload dos catalogos administrativos.
 * @responsibility Validar campos base e tarefas base antes da camada de servicos.
 */

import {
  assertPayload as assert,
  isIdLike,
  isNonEmptyString,
  isObject,
  isOptionalString,
} from "./payloadValidatorPrimitives.mjs";
import {
  FIELD_TYPES,
  SELECTION_SOURCE_KIND_VALUES,
  SELECTION_SOURCE_KINDS,
} from "../../shared/formFieldRules.mjs";

export { FIELD_TYPES };

export const FIELD_CATEGORIES = ["presenca", "quantidade", "texto", "avaliacao", "outro"];

const SCALE_TASK_CATEGORIES = ["cozinha", "limpeza", "organizacao", "sessao", "outro"];

export const validateSelectionSource = (type, selectionSource) => {
  if (selectionSource === undefined || selectionSource === null) return;
  assert(isObject(selectionSource), "Origem de selecao do campo invalida.");
  assert(type === "person_select", "Somente campos de pessoa podem usar origem de selecao.");
  assert(SELECTION_SOURCE_KIND_VALUES.includes(selectionSource.kind), "Tipo de origem de selecao invalido.");
  if (selectionSource.kind === SELECTION_SOURCE_KINDS.EXTERNAL_BASE) {
    assert(isIdLike(selectionSource.externalBaseId), "Base externa vinculada invalida.");
  }
};

export const validateGridSchema = schema => {
  assert(schema === undefined || isObject(schema), "Schema de grade invalido.");
  if (!schema) return;
  assert(schema.rows === undefined || Array.isArray(schema.rows), "Linhas da grade precisam ser um array.");
  assert(schema.cols === undefined || Array.isArray(schema.cols), "Colunas da grade precisam ser um array.");
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
