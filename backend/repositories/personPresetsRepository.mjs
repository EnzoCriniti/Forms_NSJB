/**
 * @file backend/repositories/personPresetsRepository.mjs
 * @summary Acesso a dados de presets de selecao de pessoas.
 * @responsibility Persistir listas reutilizaveis de pessoas para destinatarios de mensagens.
 */

import { nowIso, parseJson, stringifyJson } from "../database/shared.mjs";
import { database } from "../database/index.mjs";

const mapRow = row => ({
  id: row.id,
  name: row.name,
  personKeys: parseJson(row.person_keys_json, []),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const listPersonPresets = async () => (await database.queryMany(`
  SELECT id, name, person_keys_json, created_at, updated_at
  FROM person_selection_presets
  ORDER BY name ASC, id ASC
`)).map(mapRow);

export const findPersonPresetById = async presetId => {
  const row = await database.queryOne(`
    SELECT id, name, person_keys_json, created_at, updated_at
    FROM person_selection_presets
    WHERE id = ?
  `, [presetId]);
  return row ? mapRow(row) : null;
};

export const upsertPersonPresetRecord = async payload => {
  const now = nowIso();
  if (payload.id) {
    await database.execute(`
      UPDATE person_selection_presets
      SET name = ?, person_keys_json = ?, updated_at = ?
      WHERE id = ?
    `, [payload.name, stringifyJson(payload.personKeys || []), now, payload.id]);
    return payload.id;
  }
  const result = await database.execute(`
    INSERT INTO person_selection_presets (name, person_keys_json, created_at, updated_at)
    VALUES (?, ?, ?, ?)
    RETURNING id
  `, [payload.name, stringifyJson(payload.personKeys || []), now, now]);
  return Number(result.lastInsertId);
};

export const deletePersonPresetRecord = async presetId => {
  await database.execute("DELETE FROM person_selection_presets WHERE id = ?", [presetId]);
};
