/**
 * @file frontend/src/screens/eventGrauDomain.js
 * @summary Regras puras do limitador de grau por evento.
 * @responsibility Montar opcoes de grau elegiveis e filtrar a base de socios esperados.
 */

import { compareGrauOptions, normalizeGrauToken } from "./resultsPresenceGrauDomain";

export const CANONICAL_GRAU_OPTIONS = ["QM", "CDC", "CI", "QS"];

const normalizeEligibleSet = eligibleGraus => new Set(
  (Array.isArray(eligibleGraus) ? eligibleGraus : [])
    .map(normalizeGrauToken)
    .filter(Boolean),
);

/**
 * Opcoes de grau marcaveis no editor de evento: graus reais da base de socios
 * (ordenados de forma canonica), com fallback para a lista padrao do nucleo.
 */
export const buildEligibleGrauOptions = (people = []) => {
  const fromPeople = [...new Set(people
    .map(person => String(person?.grau || "").trim())
    .filter(Boolean))]
    .sort(compareGrauOptions);
  return fromPeople.length > 0 ? fromPeople : [...CANONICAL_GRAU_OPTIONS];
};

export const isPersonGrauEligible = (person, eligibleGraus) => {
  const eligibleSet = normalizeEligibleSet(eligibleGraus);
  if (eligibleSet.size === 0) return true;
  return eligibleSet.has(normalizeGrauToken(person?.grau));
};

/**
 * Filtra a base de socios pelos graus elegiveis do evento. Conjunto vazio
 * significa "todos os graus sao esperados" (retrocompatibilidade).
 */
export const filterPeopleByEligibleGraus = (people = [], eligibleGraus) => {
  const eligibleSet = normalizeEligibleSet(eligibleGraus);
  if (eligibleSet.size === 0) return people;
  return people.filter(person => eligibleSet.has(normalizeGrauToken(person?.grau)));
};

export const toggleEligibleGrau = (eligibleGraus, grau) => {
  const current = Array.isArray(eligibleGraus) ? eligibleGraus : [];
  const token = normalizeGrauToken(grau);
  const exists = current.some(item => normalizeGrauToken(item) === token);
  return exists
    ? current.filter(item => normalizeGrauToken(item) !== token)
    : [...current, grau];
};

export const isGrauSelected = (eligibleGraus, grau) => {
  const token = normalizeGrauToken(grau);
  return (Array.isArray(eligibleGraus) ? eligibleGraus : []).some(item => normalizeGrauToken(item) === token);
};
