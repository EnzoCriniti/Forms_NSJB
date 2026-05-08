/**
 * @file scripts/verify-legacy-parity.mjs
 * @summary Verificador de paridade entre o snapshot SQLite legado e o PostgreSQL atual.
 * @responsibility Comparar estrutura e conteudo das tabelas migradas para reduzir risco antes de remover o legado.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { DatabaseSync } from "node:sqlite";
import pg from "pg";
import {
  PGDATABASE,
  PGHOST,
  PGPASSWORD,
  PGPORT,
  PGSSLMODE,
  PGUSER,
} from "../backend/config.mjs";

const { Pool } = pg;

const LEGACY_DB_PATH = path.resolve(process.cwd(), "storage/nsjb-forms.sqlite");
const VERIFY_PGHOST = process.env.NSJB_VERIFY_PGHOST || PGHOST;
const VERIFY_PGPORT = Number(process.env.NSJB_VERIFY_PGPORT || PGPORT);
const VERIFY_PGDATABASE = process.env.NSJB_VERIFY_PGDATABASE || PGDATABASE;
const VERIFY_PGUSER = process.env.NSJB_VERIFY_PGUSER || PGUSER;
const VERIFY_PGPASSWORD = process.env.NSJB_VERIFY_PGPASSWORD || PGPASSWORD;
const VERIFY_PGSSLMODE = process.env.NSJB_VERIFY_PGSSLMODE || PGSSLMODE;

const TABLES = [
  { name: "forms", orderBy: "id" },
  { name: "responses", orderBy: "id" },
  { name: "response_values", orderBy: "id" },
  { name: "escala_assignments", orderBy: "form_id" },
  { name: "users", orderBy: "id" },
  { name: "labels", orderBy: "id" },
  { name: "presets", orderBy: "id" },
  { name: "people", orderBy: "id" },
  { name: "settings", orderBy: "key" },
  { name: "auth_sessions", orderBy: "id" },
  { name: "field_catalog", orderBy: "id" },
  { name: "scale_task_catalog", orderBy: "id" },
  { name: "audit_logs", orderBy: "id" },
];

const normalizeValue = value => {
  if (value === undefined) return null;
  if (value === null) return null;
  if (typeof value === "bigint") return Number(value);
  if (Array.isArray(value)) return value.map(normalizeValue);
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = normalizeValue(value[key]);
        return acc;
      }, {});
  }
  if (typeof value === "number" && Number.isNaN(value)) return null;
  return value;
};

const normalizeRow = row => normalizeValue(row ?? {});

const rowKey = row => JSON.stringify(normalizeRow(row));

const readLegacyRows = (legacyDb, tableName, orderBy) =>
  legacyDb.prepare(`SELECT * FROM ${tableName} ORDER BY ${orderBy} ASC`).all();

const readPostgresRows = async (pool, tableName, orderBy) => {
  const result = await pool.query(`SELECT * FROM ${tableName} ORDER BY ${orderBy} ASC`);
  return result.rows;
};

const compareTable = async (pool, legacyDb, table) => {
  const legacyRows = readLegacyRows(legacyDb, table.name, table.orderBy).map(normalizeRow);
  const postgresRows = (await readPostgresRows(pool, table.name, table.orderBy)).map(normalizeRow);

  const legacyCount = legacyRows.length;
  const postgresCount = postgresRows.length;
  const countMatch = legacyCount === postgresCount;

  if (!countMatch) {
    return {
      ok: false,
      table: table.name,
      reason: `count mismatch legacy=${legacyCount} postgres=${postgresCount}`,
    };
  }

  for (let index = 0; index < legacyRows.length; index += 1) {
    const legacyRow = legacyRows[index];
    const postgresRow = postgresRows[index];
    if (rowKey(legacyRow) !== rowKey(postgresRow)) {
      const pkValue = legacyRow?.[table.orderBy] ?? postgresRow?.[table.orderBy] ?? index;
      return {
        ok: false,
        table: table.name,
        reason: `row mismatch at ${table.orderBy}=${JSON.stringify(pkValue)} (index ${index})`,
        legacyRow,
        postgresRow,
      };
    }
  }

  return { ok: true, table: table.name, count: legacyCount };
};

const main = async () => {
  if (!fs.existsSync(LEGACY_DB_PATH)) {
    console.error(`Legacy snapshot not found at ${LEGACY_DB_PATH}`);
    process.exitCode = 1;
    return;
  }

  const legacyDb = new DatabaseSync(LEGACY_DB_PATH);
  const pool = new Pool({
    host: VERIFY_PGHOST,
    port: VERIFY_PGPORT,
    database: VERIFY_PGDATABASE,
    user: VERIFY_PGUSER,
    password: VERIFY_PGPASSWORD,
    ssl: VERIFY_PGSSLMODE === "disable" ? false : { rejectUnauthorized: false },
  });

  try {
    const results = [];
    for (const table of TABLES) {
      results.push(await compareTable(pool, legacyDb, table));
    }

    const failures = results.filter(result => !result.ok);

    for (const result of results) {
      if (result.ok) {
        console.log(`OK ${result.table}: ${result.count} rows`);
      } else {
        console.log(`FAIL ${result.table}: ${result.reason}`);
      }
    }

    if (failures.length > 0) {
      process.exitCode = 1;
      return;
    }

    console.log("Legacy SQLite snapshot matches PostgreSQL for all compared tables.");
  } finally {
    legacyDb.close();
    await pool.end();
  }
};

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
