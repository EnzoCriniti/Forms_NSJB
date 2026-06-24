/**
 * @file backend/repositories/teamPeriodsRepository.mjs
 * @summary Acesso a dados dos periodos de equipes.
 */

import { nowIso, parseJson, stringifyJson } from "../database/shared.mjs";
import { database } from "../database/index.mjs";

const mapTeamPeriodRow = row => ({
  id: row.id,
  title: row.title || "",
  startDate: row.start_date,
  endDate: row.end_date,
  assistantMasterPersonId: row.assistant_master_person_id,
  directAssistantPersonId: row.direct_assistant_person_id,
  assistantMemberIds: parseJson(row.assistant_member_ids_json, []),
  organMemberIds: parseJson(row.organ_member_ids_json, []),
  notes: row.notes || "",
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const TEAM_PERIOD_SELECT = `
  id, title, start_date, end_date, assistant_master_person_id, direct_assistant_person_id,
  assistant_member_ids_json, organ_member_ids_json, notes, created_at, updated_at
`;

export const listTeamPeriods = async () => (await database.queryMany(`
  SELECT ${TEAM_PERIOD_SELECT}
  FROM team_periods
  ORDER BY start_date DESC, id DESC
`)).map(mapTeamPeriodRow);

export const findTeamPeriodById = async id => {
  const row = await database.queryOne(`
    SELECT ${TEAM_PERIOD_SELECT}
    FROM team_periods
    WHERE id = ?
  `, [id]);
  return row ? mapTeamPeriodRow(row) : null;
};

export const findOverlappingTeamPeriod = async ({ id = null, startDate, endDate }) => {
  if (!id) {
    const row = await database.queryOne(`
      SELECT ${TEAM_PERIOD_SELECT}
      FROM team_periods
      WHERE start_date <= ?
        AND end_date >= ?
      ORDER BY start_date ASC, id ASC
      LIMIT 1
    `, [endDate, startDate]);
    return row ? mapTeamPeriodRow(row) : null;
  }
  const row = await database.queryOne(`
    SELECT ${TEAM_PERIOD_SELECT}
    FROM team_periods
    WHERE start_date <= ?
      AND end_date >= ?
      AND id != ?
    ORDER BY start_date ASC, id ASC
    LIMIT 1
  `, [endDate, startDate, id]);
  return row ? mapTeamPeriodRow(row) : null;
};

export const upsertTeamPeriodRecord = async payload => {
  const now = nowIso();
  if (payload.id) {
    await database.execute(`
      UPDATE team_periods
      SET title = ?, start_date = ?, end_date = ?, assistant_master_person_id = ?, direct_assistant_person_id = ?,
          assistant_member_ids_json = ?, organ_member_ids_json = ?, notes = ?, updated_at = ?
      WHERE id = ?
    `, [
      payload.title,
      payload.startDate,
      payload.endDate,
      payload.assistantMasterPersonId,
      payload.directAssistantPersonId,
      stringifyJson(payload.assistantMemberIds),
      stringifyJson(payload.organMemberIds),
      payload.notes,
      now,
      payload.id,
    ]);
    return payload.id;
  }

  const result = await database.execute(`
    INSERT INTO team_periods (
      title, start_date, end_date, assistant_master_person_id, direct_assistant_person_id,
      assistant_member_ids_json, organ_member_ids_json, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING id
  `, [
    payload.title,
    payload.startDate,
    payload.endDate,
    payload.assistantMasterPersonId,
    payload.directAssistantPersonId,
    stringifyJson(payload.assistantMemberIds),
    stringifyJson(payload.organMemberIds),
    payload.notes,
    now,
    now,
  ]);
  return Number(result.lastInsertId);
};

export const deleteTeamPeriodRecord = async id => {
  await database.execute("DELETE FROM team_periods WHERE id = ?", [id]);
};

export const getTeamPeriodSummaryRecords = async ({ startDate, endDate }) => {
  const forms = await database.queryMany(`
    SELECT id, slug, type, status, title, session_name, date, created_at
    FROM forms
    WHERE (created_at::date BETWEEN ? AND ?)
       OR (date BETWEEN ? AND ?)
    ORDER BY COALESCE(date, created_at::date) DESC, id DESC
  `, [startDate, endDate, startDate, endDate]);

  const events = await database.queryMany(`
    SELECT id, title, description, date, status, form_ids_json
    FROM events
    WHERE date BETWEEN ? AND ?
    ORDER BY date DESC NULLS LAST, id DESC
  `, [startDate, endDate]);

  return { forms, events };
};

export const listTeamSummaryFormsByIds = async ids => {
  const formIds = [...new Set((ids || []).map(Number).filter(id => Number.isInteger(id) && id > 0))];
  if (!formIds.length) return [];
  const placeholders = formIds.map(() => "?").join(", ");
  return database.queryMany(`
    SELECT id, slug, type, status, title, session_name, date, created_at
    FROM forms
    WHERE id IN (${placeholders})
    ORDER BY COALESCE(date, created_at::date) DESC, id DESC
  `, formIds);
};
