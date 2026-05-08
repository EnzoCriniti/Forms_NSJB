/**
 * @file backend/repositories/escalaRepository.mjs
 * @summary Acesso a dados da escala da Organ.
 * @responsibility Ler e gravar secoes e slots preenchidos por formulario.
 */

import { nowIso, parseJson, stringifyJson } from "../database/shared.mjs";
import { database } from "../database/index.mjs";

export const getEscalaByFormId = async formId => {
  const row = await database.queryOne("SELECT sections_json FROM escala_assignments WHERE form_id = ?", [formId]);
  return parseJson(row?.sections_json, []);
};

export const upsertEscalaRecord = async (formId, sections) => {
  await database.execute(`
    INSERT INTO escala_assignments (form_id, sections_json, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(form_id) DO UPDATE SET sections_json = excluded.sections_json, updated_at = excluded.updated_at
  `, [formId, stringifyJson(sections), nowIso()]);
};
