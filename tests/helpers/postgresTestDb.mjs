/**
 * @file tests/helpers/postgresTestDb.mjs
 * @summary Helper de PostgreSQL para testes.
 * @responsibility Criar bancos descartaveis, abrir conexoes e limpar residuos entre testes.
 */

import { randomUUID } from "node:crypto";
import { Client, Pool } from "pg";

const TEST_PGHOST = process.env.NSJB_TEST_PGHOST || process.env.NSJB_PGHOST || "127.0.0.1";
const TEST_PGPORT = Number(process.env.NSJB_TEST_PGPORT || process.env.NSJB_PGPORT || 5432);
const TEST_PGDATABASE = process.env.NSJB_TEST_PGDATABASE || "postgres";
const TEST_PGUSER = process.env.NSJB_TEST_PGUSER || process.env.NSJB_PGUSER || "nsjb";
const TEST_PGPASSWORD = process.env.NSJB_TEST_PGPASSWORD || process.env.NSJB_PGPASSWORD || "nsjb";
const TEST_PGSSLMODE = process.env.NSJB_TEST_PGSSLMODE || process.env.NSJB_PGSSLMODE || "disable";

const ssl = TEST_PGSSLMODE === "disable" ? false : { rejectUnauthorized: false };

const quoteIdentifier = value => `"${String(value).replace(/"/g, '""')}"`;

const adminConnectionOptions = {
  host: TEST_PGHOST,
  port: TEST_PGPORT,
  database: TEST_PGDATABASE,
  user: TEST_PGUSER,
  password: TEST_PGPASSWORD,
  ssl,
};

const databaseConnectionOptions = dbName => ({
  host: TEST_PGHOST,
  port: TEST_PGPORT,
  database: dbName,
  user: TEST_PGUSER,
  password: TEST_PGPASSWORD,
  ssl,
  max: 5,
});

const toPostgresSql = sql => {
  let index = 0;
  return String(sql).replace(/\?/g, () => `$${++index}`);
};

export const buildTestDatabaseEnv = dbName => ({
  NSJB_DB_DRIVER: "postgres",
  NSJB_PGHOST: TEST_PGHOST,
  NSJB_PGPORT: String(TEST_PGPORT),
  NSJB_PGDATABASE: dbName,
  NSJB_PGUSER: TEST_PGUSER,
  NSJB_PGPASSWORD: TEST_PGPASSWORD,
  NSJB_PGSSLMODE: TEST_PGSSLMODE,
});

export const createTestDatabaseName = prefix => `${prefix}_${randomUUID().replace(/-/g, "")}`;

export const createTestDatabase = async (dbName = createTestDatabaseName("nsjb_test")) => {
  const client = new Client(adminConnectionOptions);
  await client.connect();
  try {
    await client.query(`CREATE DATABASE ${quoteIdentifier(dbName)}`);
    return dbName;
  } finally {
    await client.end();
  }
};

export const dropTestDatabase = async dbName => {
  const client = new Client(adminConnectionOptions);
  await client.connect();
  try {
    await client.query("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()", [dbName]);
    await client.query(`DROP DATABASE IF EXISTS ${quoteIdentifier(dbName)}`);
  } finally {
    await client.end();
  }
};

export const openTestDatabase = dbName => {
  const pool = new Pool(databaseConnectionOptions(dbName));

  return {
    async queryOne(sql, params = []) {
      const result = await pool.query(toPostgresSql(sql), params);
      return result.rows[0] || null;
    },
    async queryMany(sql, params = []) {
      const result = await pool.query(toPostgresSql(sql), params);
      return result.rows;
    },
    async execute(sql, params = []) {
      const result = await pool.query(toPostgresSql(sql), params);
      return {
        rowCount: Number(result?.rowCount || 0),
        lastInsertId: result?.rows?.[0]?.id === undefined || result?.rows?.[0]?.id === null
          ? null
          : Number(result.rows[0].id),
      };
    },
    async exec(sql) {
      return pool.query(String(sql));
    },
    async close() {
      await pool.end();
    },
  };
};
