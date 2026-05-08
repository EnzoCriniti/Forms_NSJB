/**
 * @file backend/database/sqliteRuntime.mjs
 * @summary Runtime SQLite.
 * @responsibility Resolver caminho do banco, abrir conexao e inicializar schema.
 */

import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { initSqliteSchema } from "./sqliteSchema.mjs";

const DEFAULT_STORAGE_DIR = path.resolve(process.cwd(), "storage");
const DB_PATH = process.env.NSJB_DB_PATH
  ? path.resolve(process.env.NSJB_DB_PATH)
  : path.join(DEFAULT_STORAGE_DIR, "nsjb-forms.sqlite");
const STORAGE_DIR = path.dirname(DB_PATH);

fs.mkdirSync(STORAGE_DIR, { recursive: true });

export const db = new DatabaseSync(DB_PATH);

initSqliteSchema(db);

export const storagePath = DB_PATH;
