/**
 * @file shared/biEscalaTiming.mjs
 * @summary Tempo para preencher vagas de escala, por titulo de secao.
 * @responsibility Cruzar os claims (audit) com a abertura do evento para medir
 * "qual secao/escala demora mais para ser preenchida".
 */

import { minutesBetween } from "./eventParticipation.mjs";

const round = value => (value === null || value === undefined ? null : Math.round(value));

/**
 * @param {{formId:number, sectionIndex:number, createdAt:string}[]} claims
 * @param {Map<number,{opening:string, sectionTitles:string[]}>} formMeta
 * @returns {{title:string,count:number,avgMinutes:number|null,maxMinutes:number|null}[]}
 */
export const escalaTimingBySection = (claims = [], formMeta = new Map()) => {
  const byTitle = new Map();
  for (const claim of claims) {
    const meta = formMeta.get(Number(claim.formId));
    if (!meta) continue;
    const title = meta.sectionTitles?.[Number(claim.sectionIndex)];
    if (!title) continue;
    const minutes = minutesBetween(meta.opening, claim.createdAt);
    if (minutes === null) continue;
    const current = byTitle.get(title) || { title, count: 0, totalMinutes: 0, maxMinutes: 0 };
    current.count += 1;
    current.totalMinutes += minutes;
    current.maxMinutes = Math.max(current.maxMinutes, minutes);
    byTitle.set(title, current);
  }
  return [...byTitle.values()]
    .map(item => ({
      title: item.title,
      count: item.count,
      avgMinutes: item.count > 0 ? round(item.totalMinutes / item.count) : null,
      maxMinutes: item.count > 0 ? item.maxMinutes : null,
    }))
    .sort((a, b) => (b.avgMinutes || 0) - (a.avgMinutes || 0) || a.title.localeCompare(b.title, "pt-BR"));
};
