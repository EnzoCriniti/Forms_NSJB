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

/**
 * Foco de cada socio na escala da Organ: entre quem ja assumiu vaga, mede se a
 * pessoa se concentra sempre na mesma secao ou circula por varias.
 * - `single`: assumiu uma unica vaga no total.
 * - `mono`: 2+ vagas, mas todas na mesma secao ("faz sempre a mesma escala").
 * - `varied`: circula por 2+ secoes distintas.
 * `concentration` = % das vagas da pessoa que caem na secao mais repetida.
 */
export const escalaFocusByPerson = (assignments = []) => {
  const { people } = personSectionRecurrence(assignments);
  return people.map(person => {
    const [topSection, topCount] = Object.entries(person.bySection)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"))[0] || [null, 0];
    const distinctSections = Object.keys(person.bySection).length;
    const profile = person.total <= 1 ? "single" : distinctSections === 1 ? "mono" : "varied";
    return {
      personKey: person.personKey,
      personName: person.personName,
      total: person.total,
      distinctSections,
      topSection,
      topCount,
      concentration: person.total > 0 ? Math.round((topCount / person.total) * 1000) / 10 : 0,
      profile,
    };
  });
};

/**
 * Panorama agregado do foco: quantos socios so pegaram uma vaga, quantos repetem
 * sempre a mesma secao e quantos circulam, alem da media de secoes distintas.
 */
export const escalaFocusSummary = (assignments = []) => {
  const rows = escalaFocusByPerson(assignments);
  const active = rows.length;
  const count = profile => rows.filter(row => row.profile === profile).length;
  const avgDistinct = active
    ? Math.round((rows.reduce((sum, row) => sum + row.distinctSections, 0) / active) * 10) / 10
    : 0;
  return { active, single: count("single"), mono: count("mono"), varied: count("varied"), avgDistinct };
};
