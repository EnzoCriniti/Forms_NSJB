/**
 * @file frontend/src/features/bi/biDomain.js
 * @summary Logica pura do BI no frontend (KPIs, rankings, filtros e formatacao).
 * @responsibility Derivar metricas do panorama sem acoplar com as telas.
 */

import { normalizeGrauToken } from "../../../../shared/grauEligibility.mjs";
import { compareGrauOptions } from "../../screens/resultsPresenceGrauDomain";

export const ALL_GRAUS = "todos";

export const rate = (part, total) => (total > 0 ? Math.round((part / total) * 1000) / 10 : 0);

export const formatPercent = value => `${Number(value || 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

export const formatDuration = minutes => {
  if (minutes === null || minutes === undefined) return "—";
  const total = Math.max(0, Math.round(minutes));
  if (total < 60) return `${total}min`;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}min`;
};

export const formatDate = iso => {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("pt-BR");
};

export const sortGrauOptions = (graus = []) => [...new Set(graus.filter(Boolean))].sort(compareGrauOptions);

export const filterByGrau = (members = [], grau) => {
  if (!grau || grau === ALL_GRAUS) return members;
  const token = normalizeGrauToken(grau);
  return members.filter(member => normalizeGrauToken(member.grau) === token);
};

export const computePresencaKpi = (members = []) => {
  const totals = members.reduce(
    (acc, member) => ({ expected: acc.expected + (member.presencaExpected || 0), filled: acc.filled + (member.presencaFilled || 0) }),
    { expected: 0, filled: 0 },
  );
  return { ...totals, rate: rate(totals.filled, totals.expected) };
};

/**
 * Socios que menos preenchem a presenca: considera apenas quem ja foi esperado
 * em algum evento encerrado, ordenando pela menor taxa (e mais faltas no empate).
 */
export const topLeastPresenca = (members = [], limit = 10) => members
  .filter(member => (member.presencaExpected || 0) > 0)
  .map(member => ({
    ...member,
    missed: Math.max((member.presencaExpected || 0) - (member.presencaFilled || 0), 0),
    fillRate: rate(member.presencaFilled || 0, member.presencaExpected || 0),
  }))
  .sort((a, b) => (a.fillRate - b.fillRate) || (b.missed - a.missed) || a.personName.localeCompare(b.personName, "pt-BR"))
  .slice(0, limit);

/**
 * Socios que menos fazem escala de trabalho: menor numero de slots assumidos.
 */
export const topLeastEscala = (members = [], limit = 10) => [...members]
  .sort((a, b) => ((a.escalaCount || 0) - (b.escalaCount || 0)) || a.personName.localeCompare(b.personName, "pt-BR"))
  .slice(0, limit);
