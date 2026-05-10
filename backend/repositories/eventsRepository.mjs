/**
 * @file backend/repositories/eventsRepository.mjs
 * @summary Acesso a dados de eventos.
 * @responsibility Persistir agrupadores operacionais de formularios.
 */

import { nowIso, parseJson, stringifyJson } from "../database/shared.mjs";
import { database } from "../database/index.mjs";

const mapEventRow = row => ({
  id: row.id,
  title: row.title,
  description: row.description,
  date: row.date,
  opening: row.opening,
  closing: row.closing,
  status: row.status,
  formIds: parseJson(row.form_ids_json, []),
  messageConfig: parseJson(row.message_config_json, {}),
  publishedAt: row.published_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const listEvents = async () => (await database.queryMany(`
  SELECT id, title, description, date, opening, closing, status, form_ids_json, message_config_json, published_at, created_at, updated_at
  FROM events
  ORDER BY date DESC NULLS LAST, id DESC
`)).map(mapEventRow);

export const findEventById = async eventId => {
  const row = await database.queryOne(`
    SELECT id, title, description, date, opening, closing, status, form_ids_json, message_config_json, published_at, created_at, updated_at
    FROM events
    WHERE id = ?
  `, [eventId]);
  return row ? mapEventRow(row) : null;
};

export const upsertEventRecord = async payload => {
  const now = nowIso();
  if (payload.id) {
    await database.execute(`
      UPDATE events
      SET title = ?, description = ?, date = ?, opening = ?, closing = ?, status = ?, form_ids_json = ?, message_config_json = ?,
          published_at = ?, updated_at = ?
      WHERE id = ?
    `, [
      payload.title,
      payload.description,
      payload.date,
      payload.opening,
      payload.closing,
      payload.status,
      stringifyJson(payload.formIds),
      stringifyJson(payload.messageConfig),
      payload.publishedAt,
      now,
      payload.id,
    ]);
    return payload.id;
  }

  const result = await database.execute(`
    INSERT INTO events (
      title, description, date, opening, closing, status, form_ids_json, message_config_json, published_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING id
  `, [
    payload.title,
    payload.description,
    payload.date,
    payload.opening,
    payload.closing,
    payload.status,
    stringifyJson(payload.formIds),
    stringifyJson(payload.messageConfig),
    payload.publishedAt,
    now,
    now,
  ]);
  return Number(result.lastInsertId);
};

export const deleteEventRecord = async eventId => {
  await database.execute("DELETE FROM events WHERE id = ?", [eventId]);
};
