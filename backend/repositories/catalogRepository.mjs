/**
 * @file backend/repositories/catalogRepository.mjs
 * @summary Acesso aos catalogos normalizados.
 * @responsibility Persistir campos base de formulario e tarefas base de escala.
 */

import { nowIso, parseJson, stringifyJson } from "../database/shared.mjs";
import { database } from "../database/index.mjs";

const normalizeSelectionSource = (value, type) => {
  if (type !== "person_select") return null;
  const kind = value?.kind === "external_base" ? "external_base" : "members";
  if (kind === "external_base") {
    return {
      kind,
      externalBaseId: value.externalBaseId === undefined || value.externalBaseId === null ? null : Number(value.externalBaseId),
    };
  }
  return { kind: "members" };
};

const toCatalogItem = row => ({
  id: row.id,
  key: row.key,
  name: row.name,
  type: row.type,
  category: row.category,
  defaultLabel: row.default_label,
  gridSchema: parseJson(row.grid_schema_json, {}),
  selectionSource: normalizeSelectionSource(parseJson(row.selection_source_json, null), row.type),
  description: row.description || "",
  active: Boolean(row.active),
});

const toTaskItem = row => ({
  id: row.id,
  key: row.key,
  name: row.name,
  category: row.category,
  defaultLabel: row.default_label,
  description: row.description || "",
  active: Boolean(row.active),
});

export const listFieldCatalog = async () => (await database.queryMany(`
  SELECT id, key, name, type, category, default_label, grid_schema_json, selection_source_json, description, active
  FROM field_catalog
  ORDER BY active DESC, category ASC, name ASC
`)).map(toCatalogItem);

export const listScaleTaskCatalog = async () => (await database.queryMany(`
  SELECT id, key, name, category, default_label, description, active
  FROM scale_task_catalog
  ORDER BY active DESC, category ASC, name ASC
`)).map(toTaskItem);

export const findFieldCatalogConflict = async (key, id) => {
  if (id) return database.queryOne("SELECT id FROM field_catalog WHERE key = ? AND id != ?", [key, id]);
  return database.queryOne("SELECT id FROM field_catalog WHERE key = ?", [key]);
};

export const findScaleTaskCatalogConflict = async (key, id) => {
  if (id) return database.queryOne("SELECT id FROM scale_task_catalog WHERE key = ? AND id != ?", [key, id]);
  return database.queryOne("SELECT id FROM scale_task_catalog WHERE key = ?", [key]);
};

export const upsertFieldCatalogRecord = async item => {
  const now = nowIso();
  const selectionSource = item.type === "person_select" ? normalizeSelectionSource(item.selectionSource, item.type) : null;
  if (item.id) {
    await database.execute(`
      UPDATE field_catalog
      SET key = ?, name = ?, type = ?, category = ?, default_label = ?, grid_schema_json = ?, selection_source_json = ?, description = ?, active = ?, updated_at = ?
      WHERE id = ?
    `, [item.key, item.name, item.type, item.category, item.defaultLabel, stringifyJson(item.gridSchema || {}), stringifyJson(selectionSource || {}), item.description, item.active ? 1 : 0, now, item.id]);
    return;
  }

  await database.execute(`
    INSERT INTO field_catalog (key, name, type, category, default_label, grid_schema_json, selection_source_json, description, active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING id
  `, [item.key, item.name, item.type, item.category, item.defaultLabel, stringifyJson(item.gridSchema || {}), stringifyJson(selectionSource || {}), item.description, item.active ? 1 : 0, now, now]);
};

export const upsertScaleTaskCatalogRecord = async item => {
  const now = nowIso();
  if (item.id) {
    await database.execute(`
      UPDATE scale_task_catalog
      SET key = ?, name = ?, category = ?, default_label = ?, description = ?, active = ?, updated_at = ?
      WHERE id = ?
    `, [item.key, item.name, item.category, item.defaultLabel, item.description, item.active ? 1 : 0, now, item.id]);
    return;
  }

  await database.execute(`
    INSERT INTO scale_task_catalog (key, name, category, default_label, description, active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING id
  `, [item.key, item.name, item.category, item.defaultLabel, item.description, item.active ? 1 : 0, now, now]);
};

export const deleteFieldCatalogRecord = async id => {
  await database.execute("DELETE FROM field_catalog WHERE id = ?", [id]);
};

export const deleteScaleTaskCatalogRecord = async id => {
  await database.execute("DELETE FROM scale_task_catalog WHERE id = ?", [id]);
};
