/**
 * @file backend/database/sqliteSchema.mjs
 * @summary Schema e migracoes do SQLite.
 * @responsibility Garantir estrutura base e evolucao do banco SQLite.
 */

const ensureBaseSchema = db => {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;

    CREATE TABLE IF NOT EXISTS forms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      title TEXT NOT NULL,
      session_name TEXT,
      description TEXT,
      date TEXT,
      closing TEXT,
      closing_text TEXT,
      total_expected INTEGER NOT NULL DEFAULT 0,
      labels_json TEXT NOT NULL DEFAULT '[]',
      field_definitions_json TEXT NOT NULL DEFAULT '[]',
      scale_sections_json TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_id INTEGER NOT NULL,
      respondent_name TEXT NOT NULL,
      respondent_grau TEXT,
      respondent_key TEXT NOT NULL,
      values_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE (form_id, respondent_key),
      FOREIGN KEY (form_id) REFERENCES forms (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS escala_assignments (
      form_id INTEGER PRIMARY KEY,
      sections_json TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (form_id) REFERENCES forms (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      password_hash TEXT,
      password_salt TEXT,
      password_algorithm TEXT,
      password_iterations INTEGER,
      password_migrated_at TEXT,
      role TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS labels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      created_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS presets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      closing_text TEXT,
      labels_json TEXT NOT NULL DEFAULT '[]',
      field_definitions_json TEXT NOT NULL DEFAULT '[]',
      scale_sections_json TEXT NOT NULL DEFAULT '[]',
      created_by TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS people (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      grau TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS auth_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      revoked_at TEXT,
      last_used_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS field_catalog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      default_label TEXT NOT NULL,
      description TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scale_task_catalog (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      default_label TEXT NOT NULL,
      description TEXT,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
};

const ensureMigrationTable = db => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);
};

const hasColumn = (db, tableName, columnName) => {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  return columns.some(column => column.name === columnName);
};

const buildMigrations = db => [
  {
    version: 1,
    name: "add_results_config_json_columns",
    apply: () => {
      if (!hasColumn(db, "forms", "results_config_json")) {
        db.exec("ALTER TABLE forms ADD COLUMN results_config_json TEXT NOT NULL DEFAULT '{}'");
      }

      if (!hasColumn(db, "presets", "results_config_json")) {
        db.exec("ALTER TABLE presets ADD COLUMN results_config_json TEXT NOT NULL DEFAULT '{}'");
      }
    },
  },
  {
    version: 2,
    name: "add_grid_schema_json_column",
    apply: () => {
      if (!hasColumn(db, "field_catalog", "grid_schema_json")) {
        db.exec("ALTER TABLE field_catalog ADD COLUMN grid_schema_json TEXT NOT NULL DEFAULT '{}'");
      }
    },
  },
  {
    version: 3,
    name: "add_listing_indexes",
    apply: () => {
      db.exec(`
        CREATE INDEX IF NOT EXISTS idx_forms_status ON forms(status);
        CREATE INDEX IF NOT EXISTS idx_forms_type ON forms(type);
        CREATE INDEX IF NOT EXISTS idx_people_name_lower ON people(lower(name));
      `);
    },
  },
  {
    version: 4,
    name: "add_response_values_table",
    apply: () => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS response_values (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          response_id INTEGER NOT NULL,
          form_id INTEGER NOT NULL,
          field_id TEXT NOT NULL,
          field_type TEXT,
          value_text TEXT,
          value_number REAL,
          value_boolean INTEGER,
          value_json TEXT NOT NULL DEFAULT '{}',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          UNIQUE (response_id, field_id),
          FOREIGN KEY (response_id) REFERENCES responses (id) ON DELETE CASCADE,
          FOREIGN KEY (form_id) REFERENCES forms (id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_response_values_form_id ON response_values(form_id);
      `);
    },
  },
  {
    version: 5,
    name: "add_auth_session_and_user_secret_columns",
    apply: () => {
      if (!hasColumn(db, "users", "password_hash")) {
        db.exec("ALTER TABLE users ADD COLUMN password_hash TEXT");
      }
      if (!hasColumn(db, "users", "password_salt")) {
        db.exec("ALTER TABLE users ADD COLUMN password_salt TEXT");
      }
      if (!hasColumn(db, "users", "password_algorithm")) {
        db.exec("ALTER TABLE users ADD COLUMN password_algorithm TEXT");
      }
      if (!hasColumn(db, "users", "password_iterations")) {
        db.exec("ALTER TABLE users ADD COLUMN password_iterations INTEGER");
      }
      if (!hasColumn(db, "users", "password_migrated_at")) {
        db.exec("ALTER TABLE users ADD COLUMN password_migrated_at TEXT");
      }

      db.exec(`
        CREATE TABLE IF NOT EXISTS auth_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          token_hash TEXT NOT NULL UNIQUE,
          created_at TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          revoked_at TEXT,
          last_used_at TEXT,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
        CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions(expires_at);
      `);
    },
  },
  {
    version: 6,
    name: "add_audit_logs_table",
    apply: () => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          created_at TEXT NOT NULL,
          level TEXT NOT NULL,
          category TEXT NOT NULL,
          action TEXT NOT NULL,
          status TEXT NOT NULL,
          screen TEXT,
          actor_id INTEGER,
          actor_name TEXT,
          actor_role TEXT,
          entity_type TEXT,
          entity_id TEXT,
          entity_label TEXT,
          message TEXT,
          metadata_json TEXT NOT NULL DEFAULT '{}',
          request_id TEXT,
          ip_address TEXT,
          user_agent TEXT
        );

        CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC, id DESC);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_category_created_at ON audit_logs(category, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created_at ON audit_logs(action, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_status_created_at ON audit_logs(status, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_name_created_at ON audit_logs(actor_name, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type_created_at ON audit_logs(entity_type, created_at DESC);
      `);
    },
  },
];

const applyMigrations = db => {
  ensureMigrationTable(db);

  const appliedVersions = new Set(
    db.prepare("SELECT version FROM schema_migrations").all().map(row => row.version),
  );
  const migrations = buildMigrations(db);

  db.exec("BEGIN IMMEDIATE");

  try {
    for (const migration of migrations) {
      if (appliedVersions.has(migration.version)) continue;

      migration.apply();
      db.prepare(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)",
      ).run(migration.version, migration.name, new Date().toISOString());
      appliedVersions.add(migration.version);
    }

    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
};

export const initSqliteSchema = db => {
  ensureBaseSchema(db);
  applyMigrations(db);
};
