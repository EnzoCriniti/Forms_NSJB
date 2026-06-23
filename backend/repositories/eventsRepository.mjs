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
  eligibleGraus: parseJson(row.eligible_graus_json, []),
  messageConfig: parseJson(row.message_config_json, {}),
  publishedAt: row.published_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const EVENT_SELECT = "id, title, description, date, opening, closing, status, form_ids_json, eligible_graus_json, message_config_json, published_at, created_at, updated_at";

const buildEventSearchWhere = search => {
  const normalizedSearch = String(search || "").trim().toLowerCase();
  if (!normalizedSearch) return { where: "", params: [] };
  const pattern = `%${normalizedSearch}%`;
  return {
    where: "WHERE LOWER(COALESCE(title, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(status, '') || ' ' || COALESCE(CAST(date AS TEXT), '')) LIKE ?",
    params: [pattern],
  };
};

export const listEvents = async () => (await database.queryMany(`
  SELECT ${EVENT_SELECT}
  FROM events
  ORDER BY date DESC NULLS LAST, id DESC
`)).map(mapEventRow);

export const listEventsPage = async ({ search = "", limit = 20, offset = 0 } = {}) => {
  const pageLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const pageOffset = Math.max(Number(offset) || 0, 0);
  const { where, params } = buildEventSearchWhere(search);
  const events = (await database.queryMany(`
    SELECT ${EVENT_SELECT}
    FROM events
    ${where}
    ORDER BY date DESC NULLS LAST, id DESC
    LIMIT ? OFFSET ?
  `, [...params, pageLimit, pageOffset])).map(mapEventRow);
  const countRow = await database.queryOne(`
    SELECT COUNT(*) AS count
    FROM events
    ${where}
  `, params);
  const total = Number(countRow?.count || 0);
  return { events, total, limit: pageLimit, offset: pageOffset, search: String(search || "").trim() };
};

export const findEventById = async eventId => {
  const row = await database.queryOne(`
    SELECT ${EVENT_SELECT}
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
      SET title = ?, description = ?, date = ?, opening = ?, closing = ?, status = ?, form_ids_json = ?, eligible_graus_json = ?, message_config_json = ?,
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
      stringifyJson(payload.eligibleGraus),
      stringifyJson(payload.messageConfig),
      payload.publishedAt,
      now,
      payload.id,
    ]);
    return payload.id;
  }

  const result = await database.execute(`
    INSERT INTO events (
      title, description, date, opening, closing, status, form_ids_json, eligible_graus_json, message_config_json, published_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING id
  `, [
    payload.title,
    payload.description,
    payload.date,
    payload.opening,
    payload.closing,
    payload.status,
    stringifyJson(payload.formIds),
    stringifyJson(payload.eligibleGraus),
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
