/**
 * @file shared/sex.mjs
 * @summary Regras puras de sexo para sócios e escalas da Organ.
 * @responsibility Normalizar o sexo (vindo da planilha ou do formulário) para
 * valores canônicos e decidir a elegibilidade de uma pessoa a uma escala.
 *
 * - Sexo do sócio: `male` | `female` | `""` (desconhecido).
 * - Sexo da escala: `male` | `female` | `unisex` (padrão).
 *
 * Decisão de produto: sócio sem sexo definido NÃO é elegível a escala restrita
 * (só entra em `unisex`).
 */

export const PERSON_SEXES = ["male", "female"];
export const ESCALA_SEXES = ["male", "female", "unisex"];
export const DEFAULT_ESCALA_SEX = "unisex";

const MALE_TOKENS = new Set(["male", "m", "masculino", "masc", "homem", "h"]);
const FEMALE_TOKENS = new Set(["female", "f", "feminino", "fem", "mulher"]);

/** Normaliza o sexo de uma pessoa a partir de texto livre; "" quando não reconhece. */
export const normalizePersonSex = raw => {
  const value = String(raw ?? "").trim().toLowerCase();
  if (!value) return "";
  if (MALE_TOKENS.has(value)) return "male";
  if (FEMALE_TOKENS.has(value)) return "female";
  return "";
};

/** Normaliza o sexo de uma escala; cai em `unisex` quando inválido/ausente. */
export const normalizeEscalaSex = raw => {
  const value = String(raw ?? "").trim().toLowerCase();
  return ESCALA_SEXES.includes(value) ? value : DEFAULT_ESCALA_SEX;
};

/**
 * Decide se uma pessoa pode participar/receber a escala.
 * - `unisex`: todos.
 * - `male`/`female`: só quem tem o mesmo sexo definido (desconhecido = fora).
 */
export const isPersonEligibleForEscala = (personSex, escalaSex) => {
  const escala = normalizeEscalaSex(escalaSex);
  if (escala === "unisex") return true;
  return normalizePersonSex(personSex) === escala;
};
