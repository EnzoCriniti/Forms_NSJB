/**
 * @file server/repositories/catalogRepository.mjs
 * @summary Acesso aos catalogos normalizados.
 * @responsibility Persistir campos base de formulario e tarefas base de escala.
 */

import { db, nowIso, parseJson, stringifyJson } from "../db.mjs";

const toCatalogItem = row => ({
  id: row.id,
  key: row.key,
  name: row.name,
  type: row.type,
  category: row.category,
  defaultLabel: row.default_label,
  gridSchema: parseJson(row.grid_schema_json, {}),
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

export const listFieldCatalog = () => db.prepare(`
  SELECT id, key, name, type, category, default_label, grid_schema_json, description, active
  FROM field_catalog
  ORDER BY active DESC, category ASC, name ASC
`).all().map(toCatalogItem);

export const listScaleTaskCatalog = () => db.prepare(`
  SELECT id, key, name, category, default_label, description, active
  FROM scale_task_catalog
  ORDER BY active DESC, category ASC, name ASC
`).all().map(toTaskItem);

export const findFieldCatalogConflict = (key, id) => {
  if (id) return db.prepare("SELECT id FROM field_catalog WHERE key = ? AND id != ?").get(key, id);
  return db.prepare("SELECT id FROM field_catalog WHERE key = ?").get(key);
};

export const findScaleTaskCatalogConflict = (key, id) => {
  if (id) return db.prepare("SELECT id FROM scale_task_catalog WHERE key = ? AND id != ?").get(key, id);
  return db.prepare("SELECT id FROM scale_task_catalog WHERE key = ?").get(key);
};

export const upsertFieldCatalogRecord = item => {
  const now = nowIso();
  if (item.id) {
    db.prepare(`
      UPDATE field_catalog
      SET key = ?, name = ?, type = ?, category = ?, default_label = ?, grid_schema_json = ?, description = ?, active = ?, updated_at = ?
      WHERE id = ?
    `).run(item.key, item.name, item.type, item.category, item.defaultLabel, stringifyJson(item.gridSchema || {}), item.description, item.active ? 1 : 0, now, item.id);
    return;
  }

  db.prepare(`
    INSERT INTO field_catalog (key, name, type, category, default_label, grid_schema_json, description, active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(item.key, item.name, item.type, item.category, item.defaultLabel, stringifyJson(item.gridSchema || {}), item.description, item.active ? 1 : 0, now, now);
};

export const upsertScaleTaskCatalogRecord = item => {
  const now = nowIso();
  if (item.id) {
    db.prepare(`
      UPDATE scale_task_catalog
      SET key = ?, name = ?, category = ?, default_label = ?, description = ?, active = ?, updated_at = ?
      WHERE id = ?
    `).run(item.key, item.name, item.category, item.defaultLabel, item.description, item.active ? 1 : 0, now, item.id);
    return;
  }

  db.prepare(`
    INSERT INTO scale_task_catalog (key, name, category, default_label, description, active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(item.key, item.name, item.category, item.defaultLabel, item.description, item.active ? 1 : 0, now, now);
};

export const deleteFieldCatalogRecord = id => {
  db.prepare("DELETE FROM field_catalog WHERE id = ?").run(id);
};

export const deleteScaleTaskCatalogRecord = id => {
  db.prepare("DELETE FROM scale_task_catalog WHERE id = ?").run(id);
};
