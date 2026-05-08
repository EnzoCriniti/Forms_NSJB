/**
 * @file backend/repositories/settingsRepository.mjs
 * @summary Acesso a configuracoes simples do sistema.
 * @responsibility Ler e gravar pares chave-valor em JSON.
 */

import { nowIso, parseJson, stringifyJson } from "../database/shared.mjs";
import { database } from "../database/index.mjs";

export const getJsonSetting = async (key, fallback = {}) => {
  const row = await database.queryOne("SELECT value_json FROM settings WHERE key = ?", [key]);
  return parseJson(row?.value_json, fallback);
};

export const saveJsonSetting = async (key, value) => {
  await database.execute(`
    INSERT INTO settings (key, value_json, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at
  `, [key, stringifyJson(value), nowIso()]);
};
