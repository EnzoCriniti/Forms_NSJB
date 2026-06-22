/**
 * @file backend/bi/biRepository.mjs
 * @summary Read model do BI: dono da tabela event_participation.
 * @responsibility Persistir e ler o historico imutavel de esperados x preenchidos.
 *
 * Este e o unico modulo que faz SQL direto em event_participation. Para dados de
 * dominio (pessoas, respostas, escala) o BI le pelos repositorios de dominio.
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

export const aggregateMemberParticipation = async () => (await database.queryMany(`
  SELECT
    person_key,
    (ARRAY_AGG(person_name ORDER BY captured_at DESC, id DESC))[1] AS person_name,
    (ARRAY_AGG(grau ORDER BY captured_at DESC, id DESC))[1] AS grau,
    COUNT(*) AS expected_count,
    COUNT(*) FILTER (WHERE filled) AS filled_count,
    AVG(time_to_fill_minutes) FILTER (WHERE filled AND time_to_fill_minutes IS NOT NULL) AS avg_time_to_fill,
    MAX(responded_at) FILTER (WHERE filled) AS last_filled_at
  FROM event_participation
  GROUP BY person_key
  ORDER BY lower((ARRAY_AGG(person_name ORDER BY captured_at DESC, id DESC))[1]) ASC
`)).map(row => ({
  personKey: row.person_key,
  personName: row.person_name || "",
  grau: row.grau || "",
  expectedCount: Number(row.expected_count) || 0,
  filledCount: Number(row.filled_count) || 0,
  avgTimeToFillMinutes: row.avg_time_to_fill === null || row.avg_time_to_fill === undefined ? null : Number(row.avg_time_to_fill),
  lastFilledAt: row.last_filled_at || null,
}));

export const listEventParticipationByPersonKey = async personKey => (await database.queryMany(`
  SELECT id, event_id, form_id, person_key, person_name, grau, expected, filled, responded_at, time_to_fill_minutes, captured_at
  FROM event_participation
  WHERE person_key = ?
  ORDER BY captured_at DESC, id DESC
`, [personKey])).map(mapRow);
