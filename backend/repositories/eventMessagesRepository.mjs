/**
 * @file backend/repositories/eventMessagesRepository.mjs
 * @summary Acesso a dados de mensagens vinculadas a eventos.
 * @responsibility Persistir instancias de mensagens (rascunho/agendada/disparada) por evento.
 */

import { nowIso, parseJson, stringifyJson } from "../database/shared.mjs";
import { database } from "../database/index.mjs";

const mapRow = row => ({
  id: row.id,
  eventId: row.event_id,
  type: row.type,
  templateId: row.template_id,
  body: row.body,
  config: parseJson(row.config_json, {}),
  scheduledFor: row.scheduled_for,
  windowOption: row.window_option,
  autoDispatchEnabled: Boolean(row.auto_dispatch_enabled),
  status: row.status,
  sentAt: row.sent_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const listEventMessages = async () => (await database.queryMany(`
  SELECT id, event_id, type, template_id, body, config_json, scheduled_for, window_option,
         auto_dispatch_enabled, status, sent_at, created_at, updated_at
  FROM event_messages
  ORDER BY event_id DESC, id DESC
`)).map(mapRow);

export const listEventMessagesByEventId = async eventId => (await database.queryMany(`
  SELECT id, event_id, type, template_id, body, config_json, scheduled_for, window_option,
         auto_dispatch_enabled, status, sent_at, created_at, updated_at
  FROM event_messages
  WHERE event_id = ?
  ORDER BY id DESC
`, [eventId])).map(mapRow);

export const listScheduledEventMessagesDue = async cutoffIso => (await database.queryMany(`
  SELECT id, event_id, type, template_id, body, config_json, scheduled_for, window_option,
         auto_dispatch_enabled, status, sent_at, created_at, updated_at
  FROM event_messages
  WHERE status = 'agendada' AND scheduled_for IS NOT NULL AND scheduled_for <= ?
  ORDER BY scheduled_for ASC, id ASC
`, [cutoffIso])).map(mapRow);

export const findEventMessageById = async messageId => {
  const row = await database.queryOne(`
    SELECT id, event_id, type, template_id, body, config_json, scheduled_for, window_option,
           auto_dispatch_enabled, status, sent_at, created_at, updated_at
    FROM event_messages
    WHERE id = ?
  `, [messageId]);
  return row ? mapRow(row) : null;
};

export const upsertEventMessageRecord = async payload => {
  const now = nowIso();
  if (payload.id) {
    await database.execute(`
      UPDATE event_messages
      SET event_id = ?, type = ?, template_id = ?, body = ?, config_json = ?, scheduled_for = ?,
          window_option = ?, auto_dispatch_enabled = ?, status = ?, sent_at = ?, updated_at = ?
      WHERE id = ?
    `, [
      payload.eventId,
      payload.type,
      payload.templateId || null,
      payload.body,
      stringifyJson(payload.config || {}),
      payload.scheduledFor || null,
      payload.windowOption || null,
      payload.autoDispatchEnabled !== false,
      payload.status,
      payload.sentAt || null,
      now,
      payload.id,
    ]);
    return payload.id;
  }
  const result = await database.execute(`
    INSERT INTO event_messages (
      event_id, type, template_id, body, config_json, scheduled_for, window_option,
      auto_dispatch_enabled, status, sent_at, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING id
  `, [
    payload.eventId,
    payload.type,
    payload.templateId || null,
    payload.body,
    stringifyJson(payload.config || {}),
    payload.scheduledFor || null,
    payload.windowOption || null,
    payload.autoDispatchEnabled !== false,
    payload.status,
    payload.sentAt || null,
    now,
    now,
  ]);
  return Number(result.lastInsertId);
};

export const deleteEventMessageRecord = async messageId => {
  await database.execute("DELETE FROM event_messages WHERE id = ?", [messageId]);
};
