/**
 * @file shared/biEscala.mjs
 * @summary Analitica pura da escala da Organ (recorrencia, vacancia, carga).
 * @responsibility Derivar padroes "quem sempre faz a secao X", "qual secao mais
 * fica vazia" e "carga por socio" a partir das atribuicoes de escala.
 */

import { normalizePersonKey } from "./personIdentity.mjs";

const slotName = slot => String(slot?.person || "").trim();

/**
 * Vacancia por titulo de secao, somada entre todos os formularios de escala.
 * @param {{sections:{title:string,slots:{person:string}[]}[]}[]} assignments
 * @returns {{title:string,totalSlots:number,filledSlots:number,vacancy:number}[]}
 */
export const sectionVacancy = (assignments = []) => {
  const byTitle = new Map();
  for (const assignment of assignments) {
    for (const section of assignment?.sections || []) {
      const title = String(section?.title || "—").trim() || "—";
      const current = byTitle.get(title) || { title, totalSlots: 0, filledSlots: 0 };
      for (const slot of section?.slots || []) {
        current.totalSlots += 1;
        if (slotName(slot)) current.filledSlots += 1;
      }
      byTitle.set(title, current);
    }
  }
  return [...byTitle.values()]
    .map(item => ({
      ...item,
      vacancy: item.totalSlots > 0 ? Math.round(((item.totalSlots - item.filledSlots) / item.totalSlots) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.vacancy - a.vacancy || a.title.localeCompare(b.title, "pt-BR"));
};

/**
 * Recorrencia pessoa × titulo de secao: quantas vezes cada socio assumiu cada
 * secao. Devolve tambem a lista canonica de titulos para montar a matriz.
 */
export const personSectionRecurrence = (assignments = []) => {
  const titles = new Set();
  const byPerson = new Map();
  for (const assignment of assignments) {
    for (const section of assignment?.sections || []) {
      const title = String(section?.title || "—").trim() || "—";
      titles.add(title);
      for (const slot of section?.slots || []) {
        const name = slotName(slot);
        if (!name) continue;
        const key = normalizePersonKey(name);
        const person = byPerson.get(key) || { personKey: key, personName: name, total: 0, bySection: {} };
        person.bySection[title] = (person.bySection[title] || 0) + 1;
        person.total += 1;
        byPerson.set(key, person);
      }
    }
  }
  const people = [...byPerson.values()].sort((a, b) => b.total - a.total || a.personName.localeCompare(b.personName, "pt-BR"));
  return { titles: [...titles], people };
};

/**
 * Carga por socio: total de vagas de escala assumidas, ordenado.
 */
export const escalaLoadByPerson = (assignments = []) => {
  const { people } = personSectionRecurrence(assignments);
  return people.map(person => ({ personKey: person.personKey, personName: person.personName, total: person.total }));
};
