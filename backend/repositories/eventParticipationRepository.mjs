/**
 * @file backend/repositories/eventParticipationRepository.mjs
 * @summary Acesso a dados do snapshot de participacao por evento.
 * @responsibility Persistir e ler o historico imutavel de esperados x preenchidos.
 */

import { database } from "../database/index.mjs";

const mapRow = row => ({
  id: row.id,
  eventId: row.event_id,
  formId: row.form_id,
  personKey: row.person_key,
  personName: row.person_name,
  grau: row.grau || "",
  expected: row.expected !== false,
  filled: row.filled === true,
  respondedAt: row.responded_at,
  timeToFillMinutes: row.time_to_fill_minutes === null ? null : Number(row.time_to_fill_minutes),
  capturedAt: row.captured_at,
});

/**
 * Regrava o snapshot de um evento de forma idempotente: o fechamento e a fonte
 * de verdade, entao recapturar substitui o snapshot anterior daquele evento.
 */
export const replaceEventParticipation = async (eventId, rows) => {
  await database.withTransaction(async tx => {
    await tx.execute("DELETE FROM event_participation WHERE event_id = ?", [eventId]);
    const insertSql = `
      INSERT INTO event_participation (
        event_id, form_id, person_key, person_name, grau, expected, filled, responded_at, time_to_fill_minutes, captured_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    for (const row of rows) {
      await tx.execute(insertSql, [
        row.eventId,
        row.formId,
        row.personKey,
        row.personName,
        row.grau || "",
        row.expected !== false,
        row.filled === true,
        row.respondedAt || null,
        row.timeToFillMinutes === null || row.timeToFillMinutes === undefined ? null : Math.round(row.timeToFillMinutes),
        row.capturedAt,
      ]);
    }
  });
};

export const listEventParticipationByEvent = async eventId => (await database.queryMany(`
  SELECT id, event_id, form_id, person_key, person_name, grau, expected, filled, responded_at, time_to_fill_minutes, captured_at
  FROM event_participation
  WHERE event_id = ?
  ORDER BY filled ASC, lower(person_name) ASC
`, [eventId])).map(mapRow);

export const listEventParticipationByPersonKey = async personKey => (await database.queryMany(`
  SELECT id, event_id, form_id, person_key, person_name, grau, expected, filled, responded_at, time_to_fill_minutes, captured_at
  FROM event_participation
  WHERE person_key = ?
  ORDER BY captured_at DESC, id DESC
`, [personKey])).map(mapRow);
