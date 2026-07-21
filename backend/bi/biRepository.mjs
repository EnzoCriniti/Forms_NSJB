/**
 * @file backend/bi/biRepository.mjs
 * @summary Read model do BI: dono da tabela event_participation.
 * @responsibility Persistir e ler o historico imutavel de esperados x preenchidos.
 *
 * Este e o unico modulo que faz SQL direto em event_participation. Para dados de
 * dominio (pessoas, respostas, escala) o BI le pelos repositorios de dominio.
 */

import { database } from "../database/index.mjs";
import { parseJson } from "../database/shared.mjs";

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
  exemptionReason: row.exemption_reason || "",
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
        event_id, form_id, person_key, person_name, grau, expected, filled, responded_at, time_to_fill_minutes, exemption_reason, captured_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        row.exemptionReason || "",
        row.capturedAt,
      ]);
    }
  });
};

export const listEventParticipationByEvent = async eventId => (await database.queryMany(`
  SELECT id, event_id, form_id, person_key, person_name, grau, expected, filled, responded_at, time_to_fill_minutes, exemption_reason, captured_at
  FROM event_participation
  WHERE event_id = ?
  ORDER BY filled ASC, lower(person_name) ASC
`, [eventId])).map(mapRow);

/**
 * Agrega participacao por socio. Se `eventIds` for um array, restringe aos
 * eventos informados (usado pelo filtro de periodo do dashboard). `null` agrega
 * todos os eventos; `[]` (periodo sem eventos) devolve vazio, como esperado.
 */
export const aggregateMemberParticipation = async (eventIds = null) => (await database.queryMany(`
  SELECT
    person_key,
    (ARRAY_AGG(person_name ORDER BY captured_at DESC, id DESC))[1] AS person_name,
    (ARRAY_AGG(grau ORDER BY captured_at DESC, id DESC))[1] AS grau,
    COUNT(*) FILTER (WHERE expected) AS expected_count,
    COUNT(*) FILTER (WHERE expected AND filled) AS filled_count,
    COUNT(*) FILTER (WHERE NOT expected) AS exempted_count,
    AVG(time_to_fill_minutes) FILTER (WHERE expected AND filled AND time_to_fill_minutes IS NOT NULL) AS avg_time_to_fill,
    MAX(responded_at) FILTER (WHERE expected AND filled) AS last_filled_at
  FROM event_participation
  ${Array.isArray(eventIds) ? "WHERE event_id = ANY(?)" : ""}
  GROUP BY person_key
  ORDER BY lower((ARRAY_AGG(person_name ORDER BY captured_at DESC, id DESC))[1]) ASC
`, Array.isArray(eventIds) ? [eventIds] : [])).map(row => ({
  personKey: row.person_key,
  personName: row.person_name || "",
  grau: row.grau || "",
  expectedCount: Number(row.expected_count) || 0,
  filledCount: Number(row.filled_count) || 0,
  exemptedCount: Number(row.exempted_count) || 0,
  avgTimeToFillMinutes: row.avg_time_to_fill === null || row.avg_time_to_fill === undefined ? null : Number(row.avg_time_to_fill),
  lastFilledAt: row.last_filled_at || null,
}));

export const listEventParticipationByPersonKey = async personKey => (await database.queryMany(`
  SELECT id, event_id, form_id, person_key, person_name, grau, expected, filled, responded_at, time_to_fill_minutes, exemption_reason, captured_at
  FROM event_participation
  WHERE person_key = ?
  ORDER BY captured_at DESC, id DESC
`, [personKey])).map(mapRow);

/**
 * Contagens de esperados x preenchidos por evento e grau, para a serie temporal.
 */
export const aggregateEventTimeline = async () => (await database.queryMany(`
  SELECT
    event_id,
    grau,
    COUNT(*) FILTER (WHERE expected) AS expected,
    COUNT(*) FILTER (WHERE expected AND filled) AS filled,
    COUNT(*) FILTER (WHERE NOT expected) AS exempted
  FROM event_participation
  GROUP BY event_id, grau
`)).map(row => ({
  eventId: row.event_id,
  grau: row.grau || "",
  expected: Number(row.expected) || 0,
  filled: Number(row.filled) || 0,
  exempted: Number(row.exempted) || 0,
}));

/**
 * Participacao consolidada por socio×evento (qualquer form de presenca do evento),
 * para a matriz/heatmap. So inclui eventos ja encerrados (com snapshot).
 */
export const listAllEventParticipation = async () => (await database.queryMany(`
  SELECT
    person_key,
    event_id,
    (ARRAY_AGG(person_name ORDER BY captured_at DESC, id DESC))[1] AS person_name,
    (ARRAY_AGG(grau ORDER BY captured_at DESC, id DESC))[1] AS grau,
    bool_or(filled) FILTER (WHERE expected) AS filled,
    bool_or(NOT expected) AS exempted
  FROM event_participation
  WHERE expected
  GROUP BY person_key, event_id
`)).map(row => ({
  personKey: row.person_key,
  eventId: row.event_id,
  personName: row.person_name || "",
  grau: row.grau || "",
  filled: row.filled === true,
  exempted: row.exempted === true,
}));

/**
 * Claims de vaga de escala registrados no audit log (timestamp por preenchimento).
 */
export const listEscalaClaimAudits = async () => (await database.queryMany(`
  SELECT created_at, entity_id, metadata_json
  FROM audit_logs
  WHERE action = 'claim_escala_slot' AND status = 'success'
`)).map(row => {
  const metadata = parseJson(row.metadata_json, {});
  return {
    createdAt: row.created_at,
    formId: Number(row.entity_id ?? metadata.formId),
    sectionIndex: Number(metadata.sectionIndex),
    slotIndex: Number(metadata.slotIndex),
  };
});
