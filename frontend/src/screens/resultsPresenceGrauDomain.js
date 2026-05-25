/**
 * @file frontend/src/screens/resultsPresenceGrauDomain.js
 * @summary Ordenacao canonica dos graus na planilha de presenca.
 */

export const normalizeGrauToken = value => String(value || "")
  .trim()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toUpperCase();

export const getGrauPriority = grau => {
  const normalized = normalizeGrauToken(grau);
  if (normalized === "QM") return 0;
  if (normalized === "CDC") return 1;
  if (normalized === "CI") return 2;
  if (normalized === "QS") return 3;
  return 4;
};

export const compareGrauOptions = (left, right) => {
  const leftPriority = getGrauPriority(left);
  const rightPriority = getGrauPriority(right);
  if (leftPriority !== rightPriority) {
    return leftPriority - rightPriority;
  }
  return String(left || "").localeCompare(String(right || ""), "pt-BR");
};

export const buildPresenceGrauOptions = ({ tableRows = [] }) => {
  const values = [...new Set(tableRows.map(row => String(row.grau || "").trim()).filter(Boolean))];
  return values.sort(compareGrauOptions);
};
