/**
 * @file backend/repositories/messageTemplatesRepository.mjs
 * @summary Acesso a dados de modelos de mensagem.
 * @responsibility Persistir templates reutilizaveis para o disparo de mensagens em eventos.
 */

import { nowIso, parseJson, stringifyJson } from "../database/shared.mjs";
import { database } from "../database/index.mjs";

const mapRow = row => ({
  id: row.id,
  name: row.name,
  type: row.type,
  body: row.body,
  config: parseJson(row.config_json, {}),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const listMessageTemplates = async () => (await database.queryMany(`
  SELECT id, name, type, body, config_json, created_at, updated_at
  FROM message_templates
  ORDER BY type ASC, name ASC, id ASC
`)).map(mapRow);

export const findMessageTemplateById = async templateId => {
  const row = await database.queryOne(`
    SELECT id, name, type, body, config_json, created_at, updated_at
    FROM message_templates
    WHERE id = ?
  `, [templateId]);
  return row ? mapRow(row) : null;
};

export const upsertMessageTemplateRecord = async payload => {
  const now = nowIso();
  const config = stringifyJson(payload.config || {});
  if (payload.id) {
    await database.execute(`
      UPDATE message_templates
      SET name = ?, type = ?, body = ?, config_json = ?, updated_at = ?
      WHERE id = ?
    `, [payload.name, payload.type, payload.body, config, now, payload.id]);
    return payload.id;
  }
  const result = await database.execute(`
    INSERT INTO message_templates (name, type, body, config_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    RETURNING id
  `, [payload.name, payload.type, payload.body, config, now, now]);
  return Number(result.lastInsertId);
};

export const deleteMessageTemplateRecord = async templateId => {
  await database.execute("DELETE FROM message_templates WHERE id = ?", [templateId]);
};
