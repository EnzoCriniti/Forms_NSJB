/**
 * @file server/config.mjs
 * @summary Configuracao central do backend local.
 * @responsibility Expor porta e defaults compartilhados da API/SQLite.
 */

export const API_PORT = Number(process.env.NSJB_API_PORT || 8787);
export const ORCHESTRATOR_INTERVAL_MS = Number(process.env.NSJB_ORCHESTRATOR_INTERVAL_MS || 60_000);
