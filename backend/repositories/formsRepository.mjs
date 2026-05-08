/**
 * @file backend/repositories/formsRepository.mjs
 * @summary Acesso a dados de formularios.
 * @responsibility Ler, gravar e remover registros da tabela forms.
 */

import { nowIso, parseJson, stringifyJson } from "../database/shared.mjs";
import { database } from "../database/index.mjs";

const mapFormRow = row => ({
  id: row.id,
  slug: row.slug,
  type: row.type,
  status: row.status,
  title: row.title,
  sessionName: row.session_name,
  description: row.description,
  date: row.date,
  closing: row.closing,
  closingText: row.closing_text,
  totalExpected: row.total_expected,
  labels: parseJson(row.labels_json, []),
  fieldDefinitions: parseJson(row.field_definitions_json, []),
  resultsConfig: parseJson(row.results_config_json, {}),
  scaleSections: parseJson(row.scale_sections_json, []),
});

export const listForms = async () => (await database.queryMany(`
  SELECT id, slug, type, status, title, session_name, description, date, closing, closing_text,
         total_expected, labels_json, field_definitions_json, results_config_json, scale_sections_json
  FROM forms
  ORDER BY date DESC, id DESC
`)).map(mapFormRow);

export const findFormById = async formId => {
  const row = await database.queryOne(`
  SELECT id, slug, type, status, title, session_name, description, date, closing, closing_text,
         total_expected, labels_json, field_definitions_json, results_config_json, scale_sections_json
  FROM forms
  WHERE id = ?
  `, [formId]);
  return row ? mapFormRow(row) : null;
};

export const findConflictingFormBySlug = async (slug, id) => {
  if (id) return database.queryOne("SELECT id FROM forms WHERE slug = ? AND id != ?", [slug, id]);
  return database.queryOne("SELECT id FROM forms WHERE slug = ?", [slug]);
};

export const upsertFormRecord = async payload => {
  const now = nowIso();
  if (payload.id) {
    await database.execute(`
      UPDATE forms
      SET slug = ?, type = ?, status = ?, title = ?, session_name = ?, description = ?, date = ?, closing = ?,
          closing_text = ?, total_expected = ?, labels_json = ?, field_definitions_json = ?, results_config_json = ?, scale_sections_json = ?,
          updated_at = ?
      WHERE id = ?
    `, [
      payload.slug,
      payload.type,
      payload.status,
      payload.title,
      payload.sessionName,
      payload.description,
      payload.date,
      payload.closing,
      payload.closingText,
      payload.totalExpected,
      stringifyJson(payload.labels),
      stringifyJson(payload.fieldDefinitions),
      stringifyJson(payload.resultsConfig),
      stringifyJson(payload.scaleSections),
      now,
      payload.id,
    ]);
    return payload.id;
  }

  const result = await database.execute(`
    INSERT INTO forms (
        slug, type, status, title, session_name, description, date, closing, closing_text,
        total_expected, labels_json, field_definitions_json, results_config_json, scale_sections_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id
    `, [
    payload.slug,
    payload.type,
    payload.status,
    payload.title,
    payload.sessionName,
    payload.description,
    payload.date,
    payload.closing,
    payload.closingText,
      payload.totalExpected,
      stringifyJson(payload.labels),
      stringifyJson(payload.fieldDefinitions),
      stringifyJson(payload.resultsConfig),
      stringifyJson(payload.scaleSections),
      now,
      now,
  ]);
  return Number(result.lastInsertId);
};

export const deleteFormRecord = async formId => {
  await database.execute("DELETE FROM forms WHERE id = ?", [formId]);
};

export const deleteFormRecordWithDependencies = async formId => {
  await database.execute("DELETE FROM response_values WHERE form_id = ?", [formId]);
  await database.execute("DELETE FROM responses WHERE form_id = ?", [formId]);
  await database.execute("DELETE FROM escala_assignments WHERE form_id = ?", [formId]);
  await deleteFormRecord(formId);
};

export const closeExpiredFormRecords = async cutoff => {
  const result = await database.execute(`
    UPDATE forms
    SET status = 'fechado', updated_at = ?
    WHERE status = 'aberto'
      AND closing IS NOT NULL
      AND closing <= ?
  `, [nowIso(), cutoff]);
  return Number(result.rowCount || 0);
};

export const openScheduledFormRecords = async cutoffDate => {
  const result = await database.execute(`
    UPDATE forms
    SET status = 'aberto', updated_at = ?
    WHERE status = 'rascunho'
      AND date IS NOT NULL
      AND date <= ?
  `, [nowIso(), cutoffDate]);
  return Number(result.rowCount || 0);
};
