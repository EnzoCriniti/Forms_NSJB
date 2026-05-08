/**
 * @file backend/database/index.mjs
 * @summary Camada minima de acesso a banco.
 * @responsibility Expor interface padronizada para queries e transacoes.
 */

import { DB_DRIVER } from "../config.mjs";
import { PGDATABASE, PGHOST, PGPORT } from "../config.mjs";
import { importLegacySqliteSnapshot } from "./legacyImport.mjs";
import { createPostgresDriver } from "./drivers/postgresDriver.mjs";
import { createSqliteDriver } from "./drivers/sqliteDriver.mjs";

const databaseDriver = await (async () => {
  if (DB_DRIVER === "sqlite") {
    const { db, storagePath } = await import("./sqliteRuntime.mjs");
    return {
      database: createSqliteDriver(db),
      databaseInfo: { driver: "sqlite", path: storagePath, location: storagePath },
    };
  }
  if (DB_DRIVER === "postgres") {
    const database = await createPostgresDriver();
    await importLegacySqliteSnapshot(database);
    return {
      database,
      databaseInfo: {
        driver: "postgres",
        path: null,
        location: `${PGHOST}:${PGPORT}/${PGDATABASE}`,
      },
    };
  }
  throw new Error(`Unsupported DB driver: ${DB_DRIVER}.`);
})();

export const database = databaseDriver.database;
export const databaseInfo = databaseDriver.databaseInfo;
