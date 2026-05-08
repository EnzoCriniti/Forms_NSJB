/**
 * @file server/repositories/settingsRepository.mjs
 * @summary Acesso a configuracoes simples do sistema.
 * @responsibility Ler e gravar pares chave-valor em JSON.
 */

import { db, nowIso, parseJson, stringifyJson } from "../db.mjs";

export const getJsonSetting = (key, fallback = {}) => {
  const row = db.prepare("SELECT value_json FROM settings WHERE key = ?").get(key);
  return parseJson(row?.value_json, fallback);
};

export const saveJsonSetting = (key, value) => {
  db.prepare(`
    INSERT INTO settings (key, value_json, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at
  `).run(key, stringifyJson(value), nowIso());
};
