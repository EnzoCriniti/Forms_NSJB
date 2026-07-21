/**
 * @file frontend/src/features/bi/biDomain.js
 * @summary Logica pura do BI no frontend (KPIs, rankings, filtros e formatacao).
 * @responsibility Derivar metricas do panorama sem acoplar com as telas.
 */

import { normalizeGrauToken } from "../../../../shared/grauEligibility.mjs";
import { compareGrauOptions } from "../../screens/resultsPresenceGrauDomain";

export const ALL_GRAUS = "todos";

export const rate = (part, total) => (total > 0 ? Math.round((part / total) * 1000) / 10 : 0);

/** Data local em ISO "YYYY-MM-DD" (sem deslocar o dia por fuso, como toISOString faz). */
export const toIsoDate = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** Atalhos de periodo do dashboard. `months` ausente = "Tudo" (sem filtro). */
export const RANGE_PRESETS = [
  { id: "all", label: "Tudo" },
  { id: "2m", label: "2 meses", months: 2 },
  { id: "6m", label: "6 meses", months: 6 },
  { id: "12m", label: "12 meses", months: 12 },
];

/**
 * Converte um atalho em { from, to } (ISO). "Tudo" e atalhos desconhecidos
 * devolvem null (sem filtro). `to` = hoje; `from` = hoje - N meses.
 */
export const presetRange = (id, today = new Date()) => {
  const preset = RANGE_PRESETS.find(item => item.id === id);
  if (!preset?.months) return null;
  const from = new Date(today);
  from.setMonth(from.getMonth() - preset.months);
  return { from: toIsoDate(from), to: toIsoDate(today) };
};

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
/**
 * Distribuicao dos socios por faixa de preenchimento de presenca. Considera
 * apenas quem ja foi esperado em algum evento encerrado.
 */
const FILL_BANDS = [
  { label: "0%", min: 0, max: 0 },
  { label: "1–49%", min: 0.01, max: 49.99 },
  { label: "50–79%", min: 50, max: 79.99 },
  { label: "80–99%", min: 80, max: 99.99 },
  { label: "100%", min: 100, max: 100 },
];

export const presencaFillDistribution = (members = []) => {
  const counts = FILL_BANDS.map(band => ({ label: band.label, value: 0 }));
  for (const member of members) {
    const expected = member.presencaExpected || 0;
    if (expected <= 0) continue;
    const fillRate = rate(member.presencaFilled || 0, expected);
    const index = FILL_BANDS.findIndex(band => fillRate >= band.min && fillRate <= band.max);
    if (index >= 0) counts[index].value += 1;
  }
  return counts;
};

/**
 * Total de vagas de escala assumidas por secao (deriva da vacancia), do mais
 * assumido para o menos. Mostra quais secoes concentram mais gente.
 */
export const escalaFilledBySection = (vacancy = []) => vacancy
  .map(section => ({ label: section.title, value: section.filledSlots || 0 }))
  .filter(section => section.value > 0)
  .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, "pt-BR"));

/**
 * Taxa de presenca agregada por grau, para o grafico. So inclui graus que ja
 * foram esperados em algum evento, ordenados de forma canonica.
 */
export const presencaByGrau = (members = []) => {
  const byGrau = new Map();
  for (const member of members) {
    const grau = member.grau || "—";
    const current = byGrau.get(grau) || { grau, expected: 0, filled: 0 };
    current.expected += member.presencaExpected || 0;
    current.filled += member.presencaFilled || 0;
    byGrau.set(grau, current);
  }
  return [...byGrau.values()]
    .filter(item => item.expected > 0)
    .map(item => ({ ...item, rate: rate(item.filled, item.expected) }))
    .sort((a, b) => compareGrauOptions(a.grau, b.grau));
};

/**
 * Panorama do foco na escala (recalculado no front para respeitar o filtro de
 * grau): quantos sócios só pegaram uma vaga, quantos repetem sempre a mesma
 * seção e quantos circulam, além da média de seções distintas.
 */
export const summarizeEscalaFocus = (people = []) => {
  const active = people.length;
  const count = profile => people.filter(person => person.profile === profile).length;
  const avgDistinct = active
    ? Math.round((people.reduce((sum, person) => sum + (person.distinctSections || 0), 0) / active) * 10) / 10
    : 0;
  return { active, single: count("single"), mono: count("mono"), varied: count("varied"), avgDistinct };
};

/**
 * Ranking dos sócios que fazem sempre a mesma seção (perfil "mono"), do que mais
 * repete para o que menos repete.
 */
export const topEscalaMonoFocus = (people = [], limit = 10) => people
  .filter(person => person.profile === "mono")
  .sort((a, b) => (b.total - a.total) || a.personName.localeCompare(b.personName, "pt-BR"))
  .slice(0, limit);

export const topLeastEscala = (members = [], limit = 10, minCount = 0) => [...members]
  .filter(member => (member.escalaCount || 0) >= minCount)
  .sort((a, b) => ((a.escalaCount || 0) - (b.escalaCount || 0)) || a.personName.localeCompare(b.personName, "pt-BR"))
  .slice(0, limit);

/**
 * Vagas de escala assumidas por socios de um grau (a escala nao guarda grau por
 * vaga, entao "%" nao existe; usamos a contagem real por grau filtrado).
 */
export const escalaAssumedByGrau = (members = [], grau) => filterByGrau(members, grau)
  .reduce((total, member) => total + (member.escalaCount || 0), 0);

/**
 * Histograma do tempo de resposta (minutos) dos socios que ja preencheram.
 */
export const TIME_BUCKETS = [
  { label: "< 1h", max: 60 },
  { label: "1–6h", max: 360 },
  { label: "6–24h", max: 1440 },
  { label: "1–3d", max: 4320 },
  { label: "3d+", max: Infinity },
];

export const timeToFillHistogram = (members = []) => {
  const counts = TIME_BUCKETS.map(bucket => ({ label: bucket.label, value: 0 }));
  for (const member of members) {
    const minutes = member.avgTimeToFillMinutes;
    if (minutes === null || minutes === undefined) continue;
    const index = TIME_BUCKETS.findIndex(bucket => minutes < bucket.max);
    counts[index === -1 ? TIME_BUCKETS.length - 1 : index].value += 1;
  }
  return counts;
};

/**
 * Socios que mais demoram a responder (maior tempo medio), entre os que ja
 * preencheram ao menos um evento esperado.
 */
export const topSlowestResponders = (members = [], limit = 10) => members
  .filter(member => member.avgTimeToFillMinutes !== null && member.avgTimeToFillMinutes !== undefined && (member.presencaFilled || 0) > 0)
  .sort((a, b) => (b.avgTimeToFillMinutes - a.avgTimeToFillMinutes) || a.personName.localeCompare(b.personName, "pt-BR"))
  .slice(0, limit);
