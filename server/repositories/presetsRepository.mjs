/**
 * @file server/repositories/presetsRepository.mjs
 * @summary Acesso a dados de presets.
 * @responsibility Persistir templates reutilizaveis de formularios e escalas.
 */

import { db, nowIso, parseJson, stringifyJson } from "../db.mjs";

export const listPresets = () => db.prepare(`
  SELECT id, type, name, description, closing_text, labels_json, field_definitions_json, results_config_json, scale_sections_json, created_by
  FROM presets
  ORDER BY id ASC
`).all().map(row => ({
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

export const upsertPresetRecord = ({ id, type, name, desc, closingText, labels, fieldDefinitions, resultsConfig, scaleSections, createdBy }) => {
  const now = nowIso();
  if (id) {
    db.prepare(`
      UPDATE presets
      SET type = ?, name = ?, description = ?, closing_text = ?, labels_json = ?, field_definitions_json = ?,
          results_config_json = ?, scale_sections_json = ?, created_by = ?, updated_at = ?
      WHERE id = ?
    `).run(type, name, desc, closingText, stringifyJson(labels), stringifyJson(fieldDefinitions), stringifyJson(resultsConfig), stringifyJson(scaleSections), createdBy, now, id);
    return;
  }

  db.prepare(`
    INSERT INTO presets (
      type, name, description, closing_text, labels_json, field_definitions_json, results_config_json,
      scale_sections_json, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(type, name, desc, closingText, stringifyJson(labels), stringifyJson(fieldDefinitions), stringifyJson(resultsConfig), stringifyJson(scaleSections), createdBy, now, now);
};

export const deletePresetRecord = id => {
  db.prepare("DELETE FROM presets WHERE id = ?").run(id);
};
