/**
 * @file backend/database/drivers/postgresDriver.mjs
 * @summary Driver PostgreSQL.
 * @responsibility Expor queries, execucao e transacoes em cima do cliente PostgreSQL.
 */

import fs from "node:fs";
import path from "node:path";
import { Pool, types } from "pg";
import { PGDATABASE, PGHOST, PGPASSWORD, PGPORT, PGSSLMODE, PGUSER } from "../../config.mjs";
import { SYSTEM_LAYERS } from "../../../shared/permissions.mjs";

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
    await client.query("ALTER TABLE responses ADD COLUMN IF NOT EXISTS person_key TEXT");
    await client.query("CREATE INDEX IF NOT EXISTS idx_responses_person_key ON responses(person_key)");
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
    await client.query("ALTER TABLE events ADD COLUMN IF NOT EXISTS eligible_graus_json JSONB NOT NULL DEFAULT '[]'::jsonb");
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
    await client.query(`
      CREATE TABLE IF NOT EXISTS event_participation (
        id BIGSERIAL PRIMARY KEY,
        event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
        form_id BIGINT REFERENCES forms(id) ON DELETE CASCADE,
        person_key TEXT NOT NULL,
        person_name TEXT NOT NULL,
        grau TEXT,
        expected BOOLEAN NOT NULL DEFAULT TRUE,
        filled BOOLEAN NOT NULL DEFAULT FALSE,
        responded_at TIMESTAMPTZ,
        time_to_fill_minutes INTEGER,
        captured_at TIMESTAMPTZ NOT NULL
      )
    `);
    await client.query("CREATE INDEX IF NOT EXISTS idx_event_participation_event ON event_participation(event_id)");
    await client.query("CREATE INDEX IF NOT EXISTS idx_event_participation_person ON event_participation(person_key)");
    await client.query("ALTER TABLE event_participation ADD COLUMN IF NOT EXISTS exemption_reason TEXT NOT NULL DEFAULT ''");

    await client.query(`
      CREATE TABLE IF NOT EXISTS team_periods (
        id BIGSERIAL PRIMARY KEY,
        title TEXT NOT NULL DEFAULT '',
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        assistant_master_person_id BIGINT NOT NULL REFERENCES people(id),
        organ_person_id BIGINT NOT NULL REFERENCES people(id),
        direct_assistant_person_id BIGINT NOT NULL REFERENCES people(id),
        organ_direct_assistant_person_id BIGINT REFERENCES people(id),
        assistant_member_ids_json JSONB NOT NULL DEFAULT '[]'::jsonb,
        organ_member_ids_json JSONB NOT NULL DEFAULT '[]'::jsonb,
        notes TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL
      )
    `);
    await client.query("ALTER TABLE team_periods ADD COLUMN IF NOT EXISTS organ_person_id BIGINT REFERENCES people(id)");
    await client.query("ALTER TABLE team_periods ADD COLUMN IF NOT EXISTS organ_direct_assistant_person_id BIGINT REFERENCES people(id)");
    await client.query("CREATE INDEX IF NOT EXISTS idx_team_periods_dates ON team_periods(start_date, end_date)");

    await client.query(`
      CREATE TABLE IF NOT EXISTS access_layers (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        permissions_json JSONB NOT NULL DEFAULT '[]'::jsonb,
        is_system BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
    await client.query("CREATE UNIQUE INDEX IF NOT EXISTS idx_access_layers_name ON access_layers(lower(name))");
    await client.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS layer_id BIGINT REFERENCES access_layers(id)");

    for (const layer of Object.values(SYSTEM_LAYERS)) {
      const perms = JSON.stringify(layer.permissions);
      await client.query(
        `INSERT INTO access_layers (name, description, permissions_json, is_system, created_at, updated_at)
         SELECT $1, $2, $3::jsonb, TRUE, now(), now()
         WHERE NOT EXISTS (SELECT 1 FROM access_layers WHERE lower(name) = lower($1))`,
        [layer.name, layer.description, perms],
      );
      // mantém as camadas de sistema sincronizadas com o registro de capacidades
      await client.query(
        "UPDATE access_layers SET permissions_json = $2::jsonb, is_system = TRUE, updated_at = now() WHERE lower(name) = lower($1)",
        [layer.name, perms],
      );
    }
    // backfill: usuários sem camada herdam a do papel legado
    await client.query(
      "UPDATE users SET layer_id = (SELECT id FROM access_layers WHERE is_system AND lower(name) = lower($1) LIMIT 1) WHERE layer_id IS NULL AND role = 'admin'",
      [SYSTEM_LAYERS.admin.name],
    );
    await client.query(
      "UPDATE users SET layer_id = (SELECT id FROM access_layers WHERE is_system AND lower(name) = lower($1) LIMIT 1) WHERE layer_id IS NULL",
      [SYSTEM_LAYERS.viewer.name],
    );
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
