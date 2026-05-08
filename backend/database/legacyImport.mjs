/**
 * @file backend/database/legacyImport.mjs
 * @summary Importacao unica do snapshot SQLite legado para PostgreSQL.
 * @responsibility Restaurar a base historica local antes de abandonar o driver antigo.
 */

import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { nowIso, parseJson, stringifyJson } from "./shared.mjs";

const LEGACY_DB_PATH = path.resolve(process.cwd(), "storage/nsjb-forms.sqlite");
const IMPORT_MARKER_KEY = "legacy_sqlite_import_v1";

const LEGACY_TABLES = [
  "forms",
  "users",
  "labels",
  "presets",
  "people",
  "settings",
  "field_catalog",
  "scale_task_catalog",
  "auth_sessions",
  "responses",
  "response_values",
  "escala_assignments",
  "audit_logs",
];

const TRUNCATE_SQL = `TRUNCATE TABLE ${LEGACY_TABLES.join(", ")} RESTART IDENTITY CASCADE;`;

const normalizeNullableText = value => {
  const text = String(value ?? "").trim();
  return text || null;
};

const normalizeBoolean = value => {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return null;
    if (["0", "false", "no", "n", "nao", "não"].includes(normalized)) return false;
    if (["1", "true", "yes", "y", "sim"].includes(normalized)) return true;
  }
  return Boolean(value);
};

const normalizeJson = (value, fallback) => stringifyJson(parseJson(value, fallback));

const legacyDbExists = () => fs.existsSync(LEGACY_DB_PATH);

const openLegacyDb = () => {
  if (!legacyDbExists()) return null;
  return new DatabaseSync(LEGACY_DB_PATH);
};

const hasLegacyColumn = (legacyDb, tableName, columnName) => {
  const columns = legacyDb.prepare(`PRAGMA table_info(${tableName})`).all();
  return columns.some(column => column.name === columnName);
};

const readLegacyRows = (legacyDb, sql) => legacyDb.prepare(sql).all();

const readLegacySnapshot = legacyDb => {
  const formsHasResultsConfig = hasLegacyColumn(legacyDb, "forms", "results_config_json");
  const presetsHasResultsConfig = hasLegacyColumn(legacyDb, "presets", "results_config_json");
  const fieldCatalogHasGridSchema = hasLegacyColumn(legacyDb, "field_catalog", "grid_schema_json");

  return {
    forms: readLegacyRows(legacyDb, `
      SELECT
        id, slug, type, status, title, session_name, description, date, closing, closing_text,
        total_expected, labels_json, field_definitions_json,
        ${formsHasResultsConfig ? "results_config_json" : "'{}' AS results_config_json"},
        scale_sections_json, created_at, updated_at
      FROM forms
      ORDER BY id ASC
    `),
    users: readLegacyRows(legacyDb, `
      SELECT
        id, name, username, password, password_hash, password_salt, password_algorithm,
        password_iterations, password_migrated_at, role, created_at, updated_at
      FROM users
      ORDER BY id ASC
    `),
    labels: readLegacyRows(legacyDb, `
      SELECT id, name, color, created_by, created_at, updated_at
      FROM labels
      ORDER BY id ASC
    `),
    presets: readLegacyRows(legacyDb, `
      SELECT
        id, type, name, description, closing_text, labels_json, field_definitions_json,
        ${presetsHasResultsConfig ? "results_config_json" : "'{}' AS results_config_json"},
        scale_sections_json, created_by, created_at, updated_at
      FROM presets
      ORDER BY id ASC
    `),
    people: readLegacyRows(legacyDb, `
      SELECT id, name, grau, created_at, updated_at
      FROM people
      ORDER BY id ASC
    `),
    settings: readLegacyRows(legacyDb, `
      SELECT key, value_json, updated_at
      FROM settings
      ORDER BY key ASC
    `),
    fieldCatalog: readLegacyRows(legacyDb, `
      SELECT
        id, key, name, type, category, default_label,
        ${fieldCatalogHasGridSchema ? "grid_schema_json" : "'{}' AS grid_schema_json"},
        description, active, created_at, updated_at
      FROM field_catalog
      ORDER BY id ASC
    `),
    scaleTaskCatalog: readLegacyRows(legacyDb, `
      SELECT id, key, name, category, default_label, description, active, created_at, updated_at
      FROM scale_task_catalog
      ORDER BY id ASC
    `),
    authSessions: readLegacyRows(legacyDb, `
      SELECT id, user_id, token_hash, created_at, expires_at, revoked_at, last_used_at
      FROM auth_sessions
      ORDER BY id ASC
    `),
    responses: readLegacyRows(legacyDb, `
      SELECT id, form_id, respondent_name, respondent_grau, respondent_key, values_json, created_at, updated_at
      FROM responses
      ORDER BY id ASC
    `),
    responseValues: readLegacyRows(legacyDb, `
      SELECT id, response_id, form_id, field_id, field_type, value_text, value_number, value_boolean, value_json, created_at, updated_at
      FROM response_values
      ORDER BY id ASC
    `),
    escalaAssignments: readLegacyRows(legacyDb, `
      SELECT form_id, sections_json, updated_at
      FROM escala_assignments
      ORDER BY form_id ASC
    `),
    auditLogs: readLegacyRows(legacyDb, `
      SELECT
        id, created_at, level, category, action, status, screen, actor_id, actor_name, actor_role,
        entity_type, entity_id, entity_label, message, metadata_json, request_id, ip_address, user_agent
      FROM audit_logs
      ORDER BY id ASC
    `),
  };
};

const syncIdentitySequence = async (tx, tableName) => {
  const row = await tx.queryOne(`SELECT MAX(id) AS max_id, COUNT(*) AS row_count FROM ${tableName}`);
  const maxId = Number(row?.max_id || 1);
  const rowCount = Number(row?.row_count || 0);
  await tx.execute(`SELECT setval(pg_get_serial_sequence('${tableName}', 'id'), ?, ?)`, [maxId, rowCount > 0]);
};

const insertRows = async (tx, sql, rows, mapper = row => row) => {
  for (const row of rows) {
    await tx.execute(sql, mapper(row));
  }
};

export const applyLegacySnapshot = async (tx, snapshot) => {
  await tx.exec(TRUNCATE_SQL);

  await insertRows(tx, `
    INSERT INTO forms (
      id, slug, type, status, title, session_name, description, date, closing, closing_text,
      total_expected, labels_json, field_definitions_json, results_config_json, scale_sections_json,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, snapshot.forms, row => [
    row.id,
    row.slug,
    row.type,
    row.status,
    row.title,
    normalizeNullableText(row.session_name),
    normalizeNullableText(row.description),
    normalizeNullableText(row.date),
    normalizeNullableText(row.closing),
    normalizeNullableText(row.closing_text),
    Number(row.total_expected || 0),
    normalizeJson(row.labels_json, []),
    normalizeJson(row.field_definitions_json, []),
    normalizeJson(row.results_config_json, {}),
    normalizeJson(row.scale_sections_json, []),
    normalizeNullableText(row.created_at) || nowIso(),
    normalizeNullableText(row.updated_at) || nowIso(),
  ]);
  await syncIdentitySequence(tx, "forms");

  await insertRows(tx, `
    INSERT INTO users (
      id, name, username, password, password_hash, password_salt, password_algorithm,
      password_iterations, password_migrated_at, role, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, snapshot.users, row => [
    row.id,
    row.name,
    row.username,
    row.password || "",
    row.password_hash || null,
    row.password_salt || null,
    row.password_algorithm || null,
    row.password_iterations == null ? null : Number(row.password_iterations),
    normalizeNullableText(row.password_migrated_at),
    row.role,
    normalizeNullableText(row.created_at) || nowIso(),
    normalizeNullableText(row.updated_at) || nowIso(),
  ]);
  await syncIdentitySequence(tx, "users");

  await insertRows(tx, `
    INSERT INTO labels (id, name, color, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `, snapshot.labels, row => [
    row.id,
    row.name,
    row.color,
    row.created_by || null,
    normalizeNullableText(row.created_at) || nowIso(),
    normalizeNullableText(row.updated_at) || nowIso(),
  ]);
  await syncIdentitySequence(tx, "labels");

  await insertRows(tx, `
    INSERT INTO presets (
      id, type, name, description, closing_text, labels_json, field_definitions_json,
      results_config_json, scale_sections_json, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, snapshot.presets, row => [
    row.id,
    row.type,
    row.name,
    row.description || null,
    row.closing_text || null,
    normalizeJson(row.labels_json, []),
    normalizeJson(row.field_definitions_json, []),
    normalizeJson(row.results_config_json, {}),
    normalizeJson(row.scale_sections_json, []),
    row.created_by || null,
    normalizeNullableText(row.created_at) || nowIso(),
    normalizeNullableText(row.updated_at) || nowIso(),
  ]);
  await syncIdentitySequence(tx, "presets");

  await insertRows(tx, `
    INSERT INTO people (id, name, grau, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `, snapshot.people, row => [
    row.id,
    row.name,
    row.grau || null,
    normalizeNullableText(row.created_at) || nowIso(),
    normalizeNullableText(row.updated_at) || nowIso(),
  ]);
  await syncIdentitySequence(tx, "people");

  await insertRows(tx, `
    INSERT INTO settings (key, value_json, updated_at)
    VALUES (?, ?, ?)
  `, snapshot.settings, row => [
    row.key,
    normalizeJson(row.value_json, {}),
    normalizeNullableText(row.updated_at) || nowIso(),
  ]);

  await insertRows(tx, `
    INSERT INTO field_catalog (
      id, key, name, type, category, default_label, grid_schema_json, description, active,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, snapshot.fieldCatalog, row => [
    row.id,
    row.key,
    row.name,
    row.type,
    row.category,
    row.default_label,
    normalizeJson(row.grid_schema_json, {}),
    row.description || null,
    normalizeBoolean(row.active) ?? true,
    normalizeNullableText(row.created_at) || nowIso(),
    normalizeNullableText(row.updated_at) || nowIso(),
  ]);
  await syncIdentitySequence(tx, "field_catalog");

  await insertRows(tx, `
    INSERT INTO scale_task_catalog (
      id, key, name, category, default_label, description, active, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, snapshot.scaleTaskCatalog, row => [
    row.id,
    row.key,
    row.name,
    row.category,
    row.default_label,
    row.description || null,
    normalizeBoolean(row.active) ?? true,
    normalizeNullableText(row.created_at) || nowIso(),
    normalizeNullableText(row.updated_at) || nowIso(),
  ]);
  await syncIdentitySequence(tx, "scale_task_catalog");

  await insertRows(tx, `
    INSERT INTO auth_sessions (
      id, user_id, token_hash, created_at, expires_at, revoked_at, last_used_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `, snapshot.authSessions, row => [
    row.id,
    row.user_id,
    row.token_hash,
    normalizeNullableText(row.created_at) || nowIso(),
    normalizeNullableText(row.expires_at) || nowIso(),
    normalizeNullableText(row.revoked_at),
    normalizeNullableText(row.last_used_at),
  ]);
  await syncIdentitySequence(tx, "auth_sessions");

  await insertRows(tx, `
    INSERT INTO responses (
      id, form_id, respondent_name, respondent_grau, respondent_key, values_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, snapshot.responses, row => [
    row.id,
    row.form_id,
    row.respondent_name,
    row.respondent_grau || null,
    row.respondent_key,
    normalizeJson(row.values_json, {}),
    normalizeNullableText(row.created_at) || nowIso(),
    normalizeNullableText(row.updated_at) || nowIso(),
  ]);
  await syncIdentitySequence(tx, "responses");

  await insertRows(tx, `
    INSERT INTO response_values (
      id, response_id, form_id, field_id, field_type, value_text, value_number, value_boolean,
      value_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, snapshot.responseValues, row => [
    row.id,
    row.response_id,
    row.form_id,
    row.field_id,
    row.field_type || null,
    row.value_text || null,
    row.value_number == null ? null : Number(row.value_number),
    normalizeBoolean(row.value_boolean),
    normalizeJson(row.value_json, {}),
    normalizeNullableText(row.created_at) || nowIso(),
    normalizeNullableText(row.updated_at) || nowIso(),
  ]);
  await syncIdentitySequence(tx, "response_values");

  await insertRows(tx, `
    INSERT INTO escala_assignments (form_id, sections_json, updated_at)
    VALUES (?, ?, ?)
  `, snapshot.escalaAssignments, row => [
    row.form_id,
    normalizeJson(row.sections_json, []),
    normalizeNullableText(row.updated_at) || nowIso(),
  ]);

  await insertRows(tx, `
    INSERT INTO audit_logs (
      id, created_at, level, category, action, status, screen, actor_id, actor_name, actor_role,
      entity_type, entity_id, entity_label, message, metadata_json, request_id, ip_address, user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, snapshot.auditLogs, row => [
    row.id,
    normalizeNullableText(row.created_at) || nowIso(),
    row.level,
    row.category,
    row.action,
    row.status,
    row.screen || null,
    row.actor_id == null ? null : Number(row.actor_id),
    row.actor_name || null,
    row.actor_role || null,
    row.entity_type || null,
    row.entity_id || null,
    row.entity_label || null,
    row.message || null,
    normalizeJson(row.metadata_json, {}),
    row.request_id || null,
    row.ip_address || null,
    row.user_agent || null,
  ]);
  await syncIdentitySequence(tx, "audit_logs");

  await tx.execute(`
    INSERT INTO settings (key, value_json, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT (key) DO UPDATE SET
      value_json = excluded.value_json,
      updated_at = excluded.updated_at
  `, [IMPORT_MARKER_KEY, stringifyJson({
    importedAt: nowIso(),
    source: LEGACY_DB_PATH,
  }), nowIso()]);
};

export const importLegacySqliteSnapshot = async targetDb => {
  if (!legacyDbExists()) {
    return { imported: false, reason: "snapshot-missing" };
  }

  const marker = await targetDb.queryOne("SELECT value_json FROM settings WHERE key = ?", [IMPORT_MARKER_KEY]);
  if (marker) {
    return { imported: false, reason: "already-imported" };
  }

  const legacyDb = openLegacyDb();
  if (!legacyDb) {
    return { imported: false, reason: "snapshot-unavailable" };
  }

  try {
    const snapshot = readLegacySnapshot(legacyDb);
    await targetDb.withTransaction(async tx => {
      await applyLegacySnapshot(tx, snapshot);
    });
    return {
      imported: true,
      counts: Object.fromEntries(Object.entries(snapshot).map(([key, value]) => [key, Array.isArray(value) ? value.length : 0])),
    };
  } finally {
    legacyDb.close();
  }
};
