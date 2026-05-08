/**
 * @file backend/config.mjs
 * @summary Configuracao central do backend local.
 * @responsibility Expor porta, driver de banco e defaults compartilhados da API.
 */

export const API_PORT = Number(process.env.NSJB_API_PORT || 8787);
export const ORCHESTRATOR_INTERVAL_MS = Number(process.env.NSJB_ORCHESTRATOR_INTERVAL_MS || 60_000);
export const DB_DRIVER = String(process.env.NSJB_DB_DRIVER || "sqlite").toLowerCase();
export const DB_PATH = process.env.NSJB_DB_PATH || "";
export const PGHOST = process.env.NSJB_PGHOST || "postgres";
export const PGPORT = Number(process.env.NSJB_PGPORT || 5432);
export const PGDATABASE = process.env.NSJB_PGDATABASE || "nsjb_forms";
export const PGUSER = process.env.NSJB_PGUSER || "nsjb";
export const PGPASSWORD = process.env.NSJB_PGPASSWORD || "nsjb";
export const PGSSLMODE = process.env.NSJB_PGSSLMODE || "disable";
