/**
 * @file backend/repositories/messageDispatchLogRepository.mjs
 * @summary Acesso a dados do log de disparos de mensagens.
 * @responsibility Append-only de tentativas de disparo (manual ou agendado) com texto e destinatarios.
 */

import { nowIso, parseJson, stringifyJson } from "../database/shared.mjs";
import { database } from "../database/index.mjs";

const mapRow = row => ({
  id: row.id,
  messageId: row.message_id,
  dispatchedAt: row.dispatched_at,
  mode: row.mode,
  renderedBody: row.rendered_body,
  recipients: parseJson(row.recipients_json, []),
  groupName: row.group_name,
  status: row.status,
  dispatcherVersion: row.dispatcher_version,
  createdAt: row.created_at,
});

export const listMessageDispatchLogsByMessageId = async messageId => (await database.queryMany(`
  SELECT id, message_id, dispatched_at, mode, rendered_body, recipients_json, group_name, status, dispatcher_version, created_at
  FROM message_dispatch_log
  WHERE message_id = ?
  ORDER BY dispatched_at DESC, id DESC
`, [messageId])).map(mapRow);

export const insertMessageDispatchLogRecord = async payload => {
  const now = nowIso();
  const dispatchedAt = payload.dispatchedAt || now;
  const result = await database.execute(`
    INSERT INTO message_dispatch_log (
      message_id, dispatched_at, mode, rendered_body, recipients_json, group_name, status, dispatcher_version, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING id
  `, [
    payload.messageId,
    dispatchedAt,
    payload.mode,
    payload.renderedBody,
    stringifyJson(payload.recipients || []),
    payload.groupName || null,
    payload.status || "logged_only",
    payload.dispatcherVersion,
    now,
  ]);
  return Number(result.lastInsertId);
};
