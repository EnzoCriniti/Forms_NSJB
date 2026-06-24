/**
 * @file shared/biOverview.mjs
 * @summary Composicao pura do panorama de BI (KPIs e diretorio de socios).
 * @responsibility Unir participacao de presenca (snapshots) com a escala de
 * trabalho (slots) e a base de socios em um unico conjunto consultavel.
 */

import { getPersonKey, normalizePersonKey } from "./personIdentity.mjs";

/**
 * Conta slots de escala preenchidos por socio e o total geral.
 * @param {{sections: object[]}[]} assignments
 */
export const countEscalaAssignments = (assignments = []) => {
  let totalSlots = 0;
  let filledSlots = 0;
  const byPersonKey = new Map();
  for (const assignment of assignments) {
    for (const section of assignment?.sections || []) {
      for (const slot of section?.slots || []) {
        totalSlots += 1;
        const name = String(slot?.person || "").trim();
        if (!name) continue;
        filledSlots += 1;
        const key = normalizePersonKey(name);
        byPersonKey.set(key, (byPersonKey.get(key) || 0) + 1);
      }
    }
  }
  return { totalSlots, filledSlots, byPersonKey };
};

const emptyMember = personKey => ({
  personKey,
  personName: "",
  grau: "",
  presencaExpected: 0,
  presencaFilled: 0,
  presencaExempted: 0,
  escalaCount: 0,
  avgTimeToFillMinutes: null,
  lastFilledAt: null,
});

/**
 * Monta o panorama unico consumido pelo dashboard.
 * @param {object[]} memberReport saida de summarizeMemberParticipation (presenca).
 * @param {{sections: object[]}[]} escalaAssignments slots de escala.
 * @param {object[]} people base de socios (para graus e socios sem atividade).
 */
export const buildOverview = ({ memberReport = [], escalaAssignments = [], people = [] } = {}) => {
  const escala = countEscalaAssignments(escalaAssignments);
  const byKey = new Map();
  const upsert = (key, patch) => byKey.set(key, { ...(byKey.get(key) || emptyMember(key)), ...patch });

  for (const member of memberReport) {
    upsert(member.personKey, {
      personName: member.personName,
      grau: member.grau,
      presencaExpected: member.expected,
      presencaFilled: member.filled,
      presencaExempted: member.exempted || 0,
      avgTimeToFillMinutes: member.avgTimeToFillMinutes ?? null,
      lastFilledAt: member.lastFilledAt ?? null,
    });
  }

  const peopleByKey = new Map(people.map(person => [getPersonKey(person), person]));
  for (const [key, count] of escala.byPersonKey) {
    const current = byKey.get(key);
    const person = peopleByKey.get(key);
    upsert(key, {
      escalaCount: count,
      personName: current?.personName || person?.name || "",
      grau: current?.grau || person?.grau || "",
    });
  }

  for (const person of people) {
    if (person?.active === false) continue;
    const key = getPersonKey(person);
    if (!key || byKey.has(key)) continue;
    upsert(key, { personName: person.name || "", grau: person.grau || "" });
  }

  const members = [...byKey.values()];
  const presenca = members.reduce(
    (acc, member) => ({
      expected: acc.expected + member.presencaExpected,
      filled: acc.filled + member.presencaFilled,
      exempted: acc.exempted + (member.presencaExempted || 0),
    }),
    { expected: 0, filled: 0, exempted: 0 },
  );
  const graus = [...new Set(members.map(member => member.grau).filter(Boolean))];

  return {
    graus,
    members,
    presenca,
    escala: { totalSlots: escala.totalSlots, filledSlots: escala.filledSlots },
  };
};
