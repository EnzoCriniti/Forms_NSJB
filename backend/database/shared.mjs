/**
 * @file backend/database/shared.mjs
 * @summary Helpers compartilhados de banco.
 * @responsibility Centralizar utilitarios de data e serializacao JSON.
 */

export const nowIso = () => new Date().toISOString();

export const parseJson = (value, fallback) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const stringifyJson = value => JSON.stringify(value ?? null);
