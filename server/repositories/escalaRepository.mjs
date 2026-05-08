/**
 * @file server/repositories/escalaRepository.mjs
 * @summary Acesso a dados da escala da Organ.
 * @responsibility Ler e gravar secoes e slots preenchidos por formulario.
 */

import { db, nowIso, parseJson, stringifyJson } from "../db.mjs";

export const getEscalaByFormId = formId => {
  const row = db.prepare("SELECT sections_json FROM escala_assignments WHERE form_id = ?").get(formId);
  return parseJson(row?.sections_json, []);
};

export const upsertEscalaRecord = (formId, sections) => {
  db.prepare(`
    INSERT INTO escala_assignments (form_id, sections_json, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(form_id) DO UPDATE SET sections_json = excluded.sections_json, updated_at = excluded.updated_at
  `).run(formId, stringifyJson(sections), nowIso());
};
