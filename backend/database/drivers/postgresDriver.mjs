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
    await client.query(`
      CREATE TABLE IF NOT EXISTS message_templates (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        body TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      )
    `);
    await client.query("CREATE INDEX IF NOT EXISTS idx_message_templates_type ON message_templates(type)");
    await client.query(`
      CREATE TABLE IF NOT EXISTS person_selection_presets (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        person_keys_json JSONB NOT NULL DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      )
    `);
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_messages (
        id BIGSERIAL PRIMARY KEY,
        event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        template_id BIGINT REFERENCES message_templates(id) ON DELETE SET NULL,
        body TEXT NOT NULL,
        config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        scheduled_for TIMESTAMPTZ,
        window_option TEXT,
        auto_dispatch_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        status TEXT NOT NULL DEFAULT 'rascunho',
        sent_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      )
    `);
    await client.query("CREATE INDEX IF NOT EXISTS idx_event_messages_event_id ON event_messages(event_id)");
    await client.query("CREATE INDEX IF NOT EXISTS idx_event_messages_status_scheduled ON event_messages(status, scheduled_for)");
    await client.query(`
      CREATE TABLE IF NOT EXISTS message_dispatch_log (
        id BIGSERIAL PRIMARY KEY,
        message_id BIGINT NOT NULL REFERENCES event_messages(id) ON DELETE CASCADE,
        dispatched_at TIMESTAMPTZ NOT NULL,
        mode TEXT NOT NULL,
        rendered_body TEXT NOT NULL,
        recipients_json JSONB NOT NULL DEFAULT '[]'::jsonb,
        group_name TEXT,
        status TEXT NOT NULL DEFAULT 'logged_only',
        dispatcher_version TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL
      )
    `);
    await client.query("CREATE INDEX IF NOT EXISTS idx_message_dispatch_log_message_id ON message_dispatch_log(message_id)");
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
