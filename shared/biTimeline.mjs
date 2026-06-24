/**
 * @file shared/biTimeline.mjs
 * @summary Composicao pura da serie temporal de presenca por evento.
 * @responsibility Transformar contagens por evento×grau em uma linha do tempo
 * ordenada, com totais e quebra por grau, para o grafico de evolucao.
 */

const rate = (filled, expected) => (expected > 0 ? Math.round((filled / expected) * 1000) / 10 : 0);

const dateValue = value => {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
};

/**
 * @param {{eventId:number, grau:string, expected:number, filled:number}[]} rows
 * @param {Map<number,{title:string,date:string}>} eventsById
 * @returns {{eventId:number,title:string,date:string,expected:number,filled:number,rate:number,byGrau:Record<string,{expected:number,filled:number,rate:number}>}[]}
 */
export const composeTimeline = (rows = [], eventsById = new Map()) => {
  const byEvent = new Map();
  for (const row of rows) {
    const current = byEvent.get(row.eventId) || { eventId: row.eventId, expected: 0, filled: 0, byGrau: {} };
    const expected = Number(row.expected) || 0;
    const filled = Number(row.filled) || 0;
    current.expected += expected;
    current.filled += filled;
    const grau = row.grau || "—";
    const grauEntry = current.byGrau[grau] || { expected: 0, filled: 0, rate: 0 };
    grauEntry.expected += expected;
    grauEntry.filled += filled;
    grauEntry.rate = rate(grauEntry.filled, grauEntry.expected);
    current.byGrau[grau] = grauEntry;
    byEvent.set(row.eventId, current);
  }

  return [...byEvent.values()]
    .map(entry => {
      const meta = eventsById.get(entry.eventId) || {};
      return {
        ...entry,
        title: meta.title || `Evento ${entry.eventId}`,
        date: meta.date || null,
        rate: rate(entry.filled, entry.expected),
      };
    })
    .sort((a, b) => dateValue(a.date) - dateValue(b.date) || (a.eventId - b.eventId));
};

/**
 * Reprojeta a serie para um grau especifico (ou todos), mantendo a ordem.
 */
export const timelineForGrau = (timeline = [], grau) => {
  if (!grau || grau === "todos") {
    return timeline.map(point => ({ eventId: point.eventId, title: point.title, date: point.date, expected: point.expected, filled: point.filled, rate: point.rate }));
  }
  return timeline.map(point => {
    const entry = point.byGrau?.[grau] || { expected: 0, filled: 0, rate: 0 };
    return { eventId: point.eventId, title: point.title, date: point.date, expected: entry.expected, filled: entry.filled, rate: entry.rate };
  });
};
