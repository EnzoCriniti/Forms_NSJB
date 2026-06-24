/**
 * @file backend/repositories/accessLayersRepository.mjs
 * @summary Acesso a dados das camadas de acesso (RBAC).
 * @responsibility Ler e gravar camadas e suas permissões; camadas de sistema são protegidas.
 */

import { nowIso, parseJson, stringifyJson } from "../database/shared.mjs";
import { database } from "../database/index.mjs";
import { normalizePermissions } from "../../shared/permissions.mjs";

const mapRow = row => ({
  id: row.id,
  name: row.name,
  description: row.description || "",
  permissions: parseJson(row.permissions_json, []),
  isSystem: row.is_system === true,
});

const SELECT = "SELECT id, name, description, permissions_json, is_system FROM access_layers";

export const listAccessLayers = async () => (await database.queryMany(
  `${SELECT} ORDER BY is_system DESC, lower(name) ASC`,
)).map(mapRow);

export const findAccessLayerById = async id => {
  const row = await database.queryOne(`${SELECT} WHERE id = ?`, [id]);
  return row ? mapRow(row) : null;
};

export const findConflictingLayerByName = async (name, id) => {
  if (id) return database.queryOne("SELECT id FROM access_layers WHERE lower(name) = lower(?) AND id != ?", [name, id]);
  return database.queryOne("SELECT id FROM access_layers WHERE lower(name) = lower(?)", [name]);
};

export const insertAccessLayer = async ({ name, description, permissions }) => {
  const now = nowIso();
  const result = await database.execute(
    "INSERT INTO access_layers (name, description, permissions_json, is_system, created_at, updated_at) VALUES (?, ?, ?, FALSE, ?, ?) RETURNING id",
    [name, description, stringifyJson(normalizePermissions(permissions)), now, now],
  );
  return result.lastInsertId;
};

export const updateAccessLayer = async (id, { name, description, permissions }) => {
  await database.execute(
    "UPDATE access_layers SET name = ?, description = ?, permissions_json = ?, updated_at = ? WHERE id = ? AND is_system = FALSE",
    [name, description, stringifyJson(normalizePermissions(permissions)), nowIso(), id],
  );
};

export const deleteAccessLayerRecord = async id => {
  await database.execute("DELETE FROM access_layers WHERE id = ? AND is_system = FALSE", [id]);
};

export const countUsersInLayer = async id => {
  const row = await database.queryOne("SELECT COUNT(*) AS count FROM users WHERE layer_id = ?", [id]);
  return Number(row?.count || 0);
};
