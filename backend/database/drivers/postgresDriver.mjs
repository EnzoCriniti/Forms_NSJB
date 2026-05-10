/**
 * @file backend/database/drivers/postgresDriver.mjs
 * @summary Driver PostgreSQL.
 * @responsibility Expor queries, execucao e transacoes em cima do cliente PostgreSQL.
 */

import fs from "node:fs";
import path from "node:path";
import { Pool, types } from "pg";
import { PGDATABASE, PGHOST, PGPASSWORD, PGPORT, PGSSLMODE, PGUSER } from "../../config.mjs";

const SCHEMA_PATH = path.resolve(process.cwd(), "docker/db/DDL-POSTGRESQL-INICIAL.sql");

types.setTypeParser(20, value => Number(value));
types.setTypeParser(114, value => value);
types.setTypeParser(3802, value => value);

const toParams = params => Array.isArray(params) ? params : [];

const toPostgresSql = sql => {
  let index = 0;
  return String(sql).replace(/\?/g, () => `$${++index}`);
};

const runQuery = (client, sql, params = []) => client.query(toPostgresSql(sql), toParams(params));

const buildExecuteMetadata = result => ({
  rowCount: Number(result?.rowCount || 0),
  lastInsertId: result?.rows?.[0]?.id === undefined || result?.rows?.[0]?.id === null
    ? null
    : Number(result.rows[0].id),
});

const buildPgFacade = client => ({
  async queryOne(sql, params = []) {
    const result = await runQuery(client, sql, params);
    return result.rows[0] || null;
  },
  async queryMany(sql, params = []) {
    const result = await runQuery(client, sql, params);
    return result.rows;
  },
  async execute(sql, params = []) {
    const result = await runQuery(client, sql, params);
    return buildExecuteMetadata(result);
  },
  async exec(sql) {
    return client.query(String(sql));
  },
  close() {},
  async withTransaction(callback) {
    throw new Error("Nested transactions are not supported on a transaction facade.");
  },
});

const ensureSchema = async pool => {
  const client = await pool.connect();
  try {
    const exists = await client.query("SELECT to_regclass('public.forms') AS exists");
    if (!exists.rows[0]?.exists) {
      const schemaSql = fs.readFileSync(SCHEMA_PATH, "utf8");
      await client.query(schemaSql);
    }
    await client.query("ALTER TABLE people ADD COLUMN IF NOT EXISTS phone TEXT");
    await client.query("ALTER TABLE people ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE");
    await client.query("ALTER TABLE people ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual'");
    await client.query("ALTER TABLE people ADD COLUMN IF NOT EXISTS external_key TEXT");
    await client.query("ALTER TABLE people ADD COLUMN IF NOT EXISTS metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb");
    await client.query("ALTER TABLE people ADD COLUMN IF NOT EXISTS synced_at TIMESTAMPTZ");
    await client.query("CREATE INDEX IF NOT EXISTS idx_people_external_key ON people(external_key)");
    await client.query("ALTER TABLE field_catalog ADD COLUMN IF NOT EXISTS selection_source_json JSONB NOT NULL DEFAULT '{}'::jsonb");
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        id BIGSERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        date DATE,
        opening TIMESTAMPTZ,
        closing TIMESTAMPTZ,
        status TEXT NOT NULL DEFAULT 'rascunho',
        form_ids_json JSONB NOT NULL DEFAULT '[]'::jsonb,
        message_config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        published_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      )
    `);
    await client.query("CREATE INDEX IF NOT EXISTS idx_events_status ON events(status)");
    await client.query("CREATE INDEX IF NOT EXISTS idx_events_date ON events(date)");
    await client.query("ALTER TABLE events ADD COLUMN IF NOT EXISTS opening TIMESTAMPTZ");
  } finally {
    client.release();
  }
};

export const createPostgresDriver = async () => {
  const pool = new Pool({
    host: PGHOST,
    port: PGPORT,
    database: PGDATABASE,
    user: PGUSER,
    password: PGPASSWORD,
    ssl: PGSSLMODE === "disable" ? false : { rejectUnauthorized: false },
    max: 5,
  });

  await ensureSchema(pool);

  return {
    async queryOne(sql, params = []) {
      const result = await pool.query(toPostgresSql(sql), toParams(params));
      return result.rows[0] || null;
    },
    async queryMany(sql, params = []) {
      const result = await pool.query(toPostgresSql(sql), toParams(params));
      return result.rows;
    },
    async execute(sql, params = []) {
      const result = await pool.query(toPostgresSql(sql), toParams(params));
      return buildExecuteMetadata(result);
    },
    async exec(sql) {
      return pool.query(String(sql));
    },
    async close() {
      await pool.end();
    },
    async withTransaction(callback) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const tx = buildPgFacade(client);
        const result = await callback(tx);
        await client.query("COMMIT");
        return result;
      } catch (error) {
        try {
          await client.query("ROLLBACK");
        } catch {
          // ignore rollback failures; the original error matters more
        }
        throw error;
      } finally {
        client.release();
      }
    },
  };
};
