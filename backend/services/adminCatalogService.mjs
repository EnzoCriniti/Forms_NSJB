/**
 * @file backend/services/adminCatalogService.mjs
 * @summary Regras administrativas dos catalogos base.
 * @responsibility Salvar e excluir campos e tarefas base com normalizacao do catalogo.
 */

import {
  deleteFieldCatalogRecord,
  deleteScaleTaskCatalogRecord,
  findFieldCatalogConflict,
  findScaleTaskCatalogConflict,
  listFieldCatalog,
  listScaleTaskCatalog,
  upsertFieldCatalogRecord,
  upsertScaleTaskCatalogRecord,
} from "../repositories/catalogRepository.mjs";

const normalizeKey = value => String(value || "")
  .trim()
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "");

const normalizeGridSchema = payload => ({
  rows: Array.isArray(payload?.rows) ? payload.rows.map(item => String(item || "").trim()).filter(Boolean) : [],
  cols: Array.isArray(payload?.cols) ? payload.cols.map(item => String(item || "").trim()).filter(Boolean) : [],
});

export const saveFieldCatalogItem = async payload => {
  const key = normalizeKey(payload.key);
  if (!key) throw new Error("Chave do campo base e obrigatoria.");
  if (await findFieldCatalogConflict(key, payload.id)) throw new Error("Ja existe um campo base com esta chave.");
  await upsertFieldCatalogRecord({
    id: payload.id,
    key,
    name: payload.name.trim(),
    type: payload.type,
    category: payload.category,
    defaultLabel: payload.defaultLabel.trim(),
    gridSchema: payload.type === "grid" ? normalizeGridSchema(payload.gridSchema) : {},
    selectionSource: payload.selectionSource,
    description: String(payload.description || "").trim(),
    active: payload.active !== false,
  });
  return listFieldCatalog();
};

export const deleteFieldCatalogItem = async id => {
  await deleteFieldCatalogRecord(id);
  return listFieldCatalog();
};

export const saveScaleTaskCatalogItem = async payload => {
  const key = normalizeKey(payload.key);
  if (!key) throw new Error("Chave da tarefa base e obrigatoria.");
  if (await findScaleTaskCatalogConflict(key, payload.id)) throw new Error("Ja existe uma tarefa base com esta chave.");
  await upsertScaleTaskCatalogRecord({
    id: payload.id,
    key,
    name: payload.name.trim(),
    category: payload.category,
    defaultLabel: payload.defaultLabel.trim(),
    description: String(payload.description || "").trim(),
    active: payload.active !== false,
  });
  return listScaleTaskCatalog();
};

export const deleteScaleTaskCatalogItem = async id => {
  await deleteScaleTaskCatalogRecord(id);
  return listScaleTaskCatalog();
};
