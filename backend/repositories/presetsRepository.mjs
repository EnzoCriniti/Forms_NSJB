/**
 * @file backend/repositories/presetsRepository.mjs
 * @summary Acesso a dados de presets.
 * @responsibility Persistir templates reutilizaveis de formularios e escalas.
 */

import { nowIso, parseJson, stringifyJson } from "../database/shared.mjs";
import { database } from "../database/index.mjs";

export const listPresets = async () => (await database.queryMany(`
  SELECT id, type, name, description, closing_text, labels_json, field_definitions_json, results_config_json, scale_sections_json, created_by
  FROM presets
  ORDER BY id ASC
`)).map(row => ({
  id: row.id,
  type: row.type,
  name: row.name,
  desc: row.description,
  closingText: row.closing_text,
  labels: parseJson(row.labels_json, []),
  fieldDefinitions: parseJson(row.field_definitions_json, []),
  resultsConfig: parseJson(row.results_config_json, {}),
  scaleSections: parseJson(row.scale_sections_json, []),
  createdBy: row.created_by,
}));

export const upsertPresetRecord = async ({ id, type, name, desc, closingText, labels, fieldDefinitions, resultsConfig, scaleSections, createdBy }) => {
  const now = nowIso();
  if (id) {
    await database.execute(`
      UPDATE presets
      SET type = ?, name = ?, description = ?, closing_text = ?, labels_json = ?, field_definitions_json = ?,
          results_config_json = ?, scale_sections_json = ?, created_by = ?, updated_at = ?
      WHERE id = ?
    `, [type, name, desc, closingText, stringifyJson(labels), stringifyJson(fieldDefinitions), stringifyJson(resultsConfig), stringifyJson(scaleSections), createdBy, now, id]);
    return;
  }

  await database.execute(`
    INSERT INTO presets (
      type, name, description, closing_text, labels_json, field_definitions_json, results_config_json,
      scale_sections_json, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING id
  `, [type, name, desc, closingText, stringifyJson(labels), stringifyJson(fieldDefinitions), stringifyJson(resultsConfig), stringifyJson(scaleSections), createdBy, now, now]);
};

export const deletePresetRecord = async id => {
  await database.execute("DELETE FROM presets WHERE id = ?", [id]);
};
