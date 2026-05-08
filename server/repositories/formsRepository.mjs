/**
 * @file server/repositories/formsRepository.mjs
 * @summary Acesso a dados de formularios.
 * @responsibility Ler, gravar e remover registros da tabela forms.
 */

import { db, nowIso, parseJson, stringifyJson } from "../db.mjs";

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

export const listForms = () => db.prepare(`
  SELECT id, slug, type, status, title, session_name, description, date, closing, closing_text,
         total_expected, labels_json, field_definitions_json, results_config_json, scale_sections_json
  FROM forms
  ORDER BY date DESC, id DESC
`).all().map(mapFormRow);

export const findFormById = formId => {
  const row = db.prepare(`
  SELECT id, slug, type, status, title, session_name, description, date, closing, closing_text,
         total_expected, labels_json, field_definitions_json, results_config_json, scale_sections_json
  FROM forms
  WHERE id = ?
  `).get(formId);
  return row ? mapFormRow(row) : null;
};

export const findConflictingFormBySlug = (slug, id) => {
  if (id) return db.prepare("SELECT id FROM forms WHERE slug = ? AND id != ?").get(slug, id);
  return db.prepare("SELECT id FROM forms WHERE slug = ?").get(slug);
};

export const upsertFormRecord = payload => {
  const now = nowIso();
  if (payload.id) {
    db.prepare(`
      UPDATE forms
      SET slug = ?, type = ?, status = ?, title = ?, session_name = ?, description = ?, date = ?, closing = ?,
          closing_text = ?, total_expected = ?, labels_json = ?, field_definitions_json = ?, results_config_json = ?, scale_sections_json = ?,
          updated_at = ?
      WHERE id = ?
    `).run(
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
    );
    return payload.id;
  }

  const result = db.prepare(`
    INSERT INTO forms (
        slug, type, status, title, session_name, description, date, closing, closing_text,
        total_expected, labels_json, field_definitions_json, results_config_json, scale_sections_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
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
  );
  return Number(result.lastInsertRowid);
};

export const deleteFormRecord = formId => {
  db.prepare("DELETE FROM forms WHERE id = ?").run(formId);
};

export const deleteFormRecordWithDependencies = formId => {
  db.prepare("DELETE FROM response_values WHERE form_id = ?").run(formId);
  db.prepare("DELETE FROM responses WHERE form_id = ?").run(formId);
  db.prepare("DELETE FROM escala_assignments WHERE form_id = ?").run(formId);
  deleteFormRecord(formId);
};

export const closeExpiredFormRecords = cutoff => {
  const result = db.prepare(`
    UPDATE forms
    SET status = 'fechado', updated_at = ?
    WHERE status = 'aberto'
      AND closing IS NOT NULL
      AND closing != ''
      AND closing <= ?
  `).run(nowIso(), cutoff);
  return Number(result.changes || 0);
};

export const openScheduledFormRecords = cutoffDate => {
  const result = db.prepare(`
    UPDATE forms
    SET status = 'aberto', updated_at = ?
    WHERE status = 'rascunho'
      AND date IS NOT NULL
      AND date != ''
      AND date <= ?
  `).run(nowIso(), cutoffDate);
  return Number(result.changes || 0);
};
