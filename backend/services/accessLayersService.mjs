/**
 * @file backend/services/accessLayersService.mjs
 * @summary Regras de negócio das camadas de acesso (RBAC).
 * @responsibility Validar e persistir camadas; proteger as camadas de sistema.
 */

import { normalizePermissions } from "../../shared/permissions.mjs";
import {
  countUsersInLayer,
  deleteAccessLayerRecord,
  findAccessLayerById,
  findConflictingLayerByName,
  insertAccessLayer,
  listAccessLayers,
  updateAccessLayer,
} from "../repositories/accessLayersRepository.mjs";

const makeError = (message, statusCode, code) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

export const getAccessLayers = () => listAccessLayers();

export const saveAccessLayer = async payload => {
  const name = String(payload?.name || "").trim();
  if (!name) throw makeError("Nome da camada é obrigatório.", 400, "LAYER_NAME_REQUIRED");

  const id = payload?.id ? Number(payload.id) : null;
  if (id) {
    const existing = await findAccessLayerById(id);
    if (!existing) throw makeError("Camada não encontrada.", 404, "LAYER_NOT_FOUND");
    if (existing.isSystem) throw makeError("Camadas de sistema não podem ser editadas.", 409, "LAYER_SYSTEM_LOCKED");
  }

  if (await findConflictingLayerByName(name, id)) {
    throw makeError("Já existe uma camada com esse nome.", 409, "LAYER_NAME_CONFLICT");
  }

  const data = {
    name,
    description: String(payload?.description || "").trim(),
    permissions: normalizePermissions(payload?.permissions),
  };

  if (id) {
    await updateAccessLayer(id, data);
    return findAccessLayerById(id);
  }
  const newId = await insertAccessLayer(data);
  return findAccessLayerById(newId);
};

export const deleteAccessLayer = async id => {
  const layer = await findAccessLayerById(Number(id));
  if (!layer) throw makeError("Camada não encontrada.", 404, "LAYER_NOT_FOUND");
  if (layer.isSystem) throw makeError("Camadas de sistema não podem ser excluídas.", 409, "LAYER_SYSTEM_LOCKED");
  const inUse = await countUsersInLayer(layer.id);
  if (inUse > 0) throw makeError(`Há ${inUse} usuário(s) nesta camada. Reatribua antes de excluir.`, 409, "LAYER_IN_USE");
  await deleteAccessLayerRecord(layer.id);
  return { ok: true, layer };
};
