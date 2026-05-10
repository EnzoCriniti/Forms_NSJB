/**
 * @file backend/repositories/messageTemplatesRepository.mjs
 * @summary Acesso a dados de modelos de mensagem.
 * @responsibility Persistir templates reutilizaveis para o disparo de mensagens em eventos.
 */

import { nowIso } from "../database/shared.mjs";
import { database } from "../database/index.mjs";

const mapRow = row => ({
  id: row.id,
  name: row.name,
  type: row.type,
  body: row.body,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const listMessageTemplates = async () => (await database.queryMany(`
  SELECT id, name, type, body, created_at, updated_at
  FROM message_templates
  ORDER BY type ASC, name ASC, id ASC
`)).map(mapRow);

export const findMessageTemplateById = async templateId => {
  const row = await database.queryOne(`
    SELECT id, name, type, body, created_at, updated_at
    FROM message_templates
    WHERE id = ?
  `, [templateId]);
  return row ? mapRow(row) : null;
};

export const upsertMessageTemplateRecord = async payload => {
  const now = nowIso();
  if (payload.id) {
    await database.execute(`
      UPDATE message_templates
      SET name = ?, type = ?, body = ?, updated_at = ?
      WHERE id = ?
    `, [payload.name, payload.type, payload.body, now, payload.id]);
    return payload.id;
  }
  const result = await database.execute(`
    INSERT INTO message_templates (name, type, body, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
    RETURNING id
  `, [payload.name, payload.type, payload.body, now, now]);
  return Number(result.lastInsertId);
};

export const deleteMessageTemplateRecord = async templateId => {
  await database.execute("DELETE FROM message_templates WHERE id = ?", [templateId]);
};
