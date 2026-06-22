/**
 * @file shared/grauEligibility.mjs
 * @summary Elegibilidade de grau compartilhada entre backend e frontend.
 * @responsibility Normalizar tokens de grau e filtrar pessoas pelos graus elegiveis de um evento.
 */

export const normalizeGrauToken = value => String(value || "")
  .trim()
  .normalize("NFD")
  .replace(/[̀-ͯ]/g, "")
  .toUpperCase();

const toEligibleSet = eligibleGraus => new Set(
  (Array.isArray(eligibleGraus) ? eligibleGraus : [])
    .map(normalizeGrauToken)
    .filter(Boolean),
);

/**
 * Conjunto vazio significa "todos os graus sao esperados" (retrocompatibilidade).
 */
export const isGrauEligible = (grau, eligibleGraus) => {
  const eligibleSet = toEligibleSet(eligibleGraus);
  if (eligibleSet.size === 0) return true;
  return eligibleSet.has(normalizeGrauToken(grau));
};

export const filterByEligibleGraus = (people = [], eligibleGraus) => {
  const eligibleSet = toEligibleSet(eligibleGraus);
  if (eligibleSet.size === 0) return people;
  return people.filter(person => eligibleSet.has(normalizeGrauToken(person?.grau)));
};
