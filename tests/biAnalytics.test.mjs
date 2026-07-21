/**
 * @file tests/biAnalytics.test.mjs
 * @summary Testes dos modulos puros de analitica de BI.
 * @responsibility Garantir timeline, recorrencia/vacancia de escala e tempo de claim.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { composeTimeline, timelineForGrau } from "../shared/biTimeline.mjs";
import { sectionVacancy, personSectionRecurrence, escalaLoadByPerson, escalaFocusByPerson, escalaFocusSummary } from "../shared/biEscala.mjs";
import { escalaTimingBySection } from "../shared/biEscalaTiming.mjs";

test("composeTimeline agrega por evento e ordena por data", () => {
  const rows = [
    { eventId: 2, grau: "QM", expected: 4, filled: 3 },
    { eventId: 2, grau: "CI", expected: 6, filled: 3 },
    { eventId: 1, grau: "QM", expected: 2, filled: 2 },
  ];
  const events = new Map([
    [1, { title: "Maio", date: "2026-05-01" }],
    [2, { title: "Junho", date: "2026-06-01" }],
  ]);
  const timeline = composeTimeline(rows, events);
  assert.deepEqual(timeline.map(t => t.eventId), [1, 2]);
  assert.equal(timeline[1].expected, 10);
  assert.equal(timeline[1].filled, 6);
  assert.equal(timeline[1].rate, 60);
  assert.equal(timeline[1].byGrau.QM.rate, 75);
});

test("timelineForGrau projeta a serie para um grau", () => {
  const timeline = composeTimeline(
    [{ eventId: 1, grau: "QM", expected: 4, filled: 2 }, { eventId: 1, grau: "CI", expected: 4, filled: 4 }],
    new Map([[1, { title: "X", date: "2026-01-01" }]]),
  );
  assert.equal(timelineForGrau(timeline, "QM")[0].rate, 50);
  assert.equal(timelineForGrau(timeline, "todos")[0].rate, 75);
});

const assignments = [
  { formId: 10, sections: [
    { title: "Jantar", slots: [{ person: "Ana" }, { person: "Bruno" }, { person: "" }] },
    { title: "Lixo", slots: [{ person: "Ana" }, { person: "" }] },
  ] },
  { formId: 11, sections: [
    { title: "Jantar", slots: [{ person: "Ana" }, { person: "" }] },
  ] },
];

test("sectionVacancy soma vagas e ordena por vacancia", () => {
  const vacancy = sectionVacancy(assignments);
  const jantar = vacancy.find(v => v.title === "Jantar");
  assert.equal(jantar.totalSlots, 5);
  assert.equal(jantar.filledSlots, 3);
  assert.equal(jantar.vacancy, 40);
});

test("personSectionRecurrence conta pessoa x secao", () => {
  const { titles, people } = personSectionRecurrence(assignments);
  assert.deepEqual(titles.sort(), ["Jantar", "Lixo"]);
  const ana = people.find(p => p.personKey === "ana");
  assert.equal(ana.total, 3);
  assert.equal(ana.bySection.Jantar, 2);
  assert.equal(ana.bySection.Lixo, 1);
  assert.equal(people[0].personKey, "ana");
});

test("escalaLoadByPerson devolve carga total ordenada", () => {
  const load = escalaLoadByPerson(assignments);
  assert.equal(load[0].personKey, "ana");
  assert.equal(load[0].total, 3);
});

test("escalaFocusByPerson classifica concentracao (single/mono/varied)", () => {
  const rows = escalaFocusByPerson([
    { sections: [
      { title: "Jantar", slots: [{ person: "Ana" }, { person: "Bruno" }, { person: "Duda" }] },
      { title: "Lixo", slots: [{ person: "Ana" }] },
    ] },
    { sections: [
      { title: "Jantar", slots: [{ person: "Ana" }, { person: "Duda" }] },
    ] },
  ]);
  const byKey = new Map(rows.map(row => [row.personKey, row]));
  // Ana: 2 Jantar + 1 Lixo -> circula por 2 secoes
  assert.equal(byKey.get("ana").profile, "varied");
  assert.equal(byKey.get("ana").distinctSections, 2);
  assert.equal(byKey.get("ana").topSection, "Jantar");
  assert.equal(byKey.get("ana").concentration, 66.7);
  // Duda: 2x Jantar, sempre a mesma secao
  assert.equal(byKey.get("duda").profile, "mono");
  assert.equal(byKey.get("duda").concentration, 100);
  // Bruno: uma unica vaga
  assert.equal(byKey.get("bruno").profile, "single");
});

test("escalaFocusSummary agrega os perfis e a media de secoes", () => {
  const summary = escalaFocusSummary([
    { sections: [
      { title: "Jantar", slots: [{ person: "Ana" }, { person: "Bruno" }, { person: "Duda" }] },
      { title: "Lixo", slots: [{ person: "Ana" }] },
    ] },
    { sections: [
      { title: "Jantar", slots: [{ person: "Ana" }, { person: "Duda" }] },
    ] },
  ]);
  assert.equal(summary.active, 3);
  assert.equal(summary.single, 1);
  assert.equal(summary.mono, 1);
  assert.equal(summary.varied, 1);
  assert.equal(summary.avgDistinct, 1.3); // (2 + 1 + 1) / 3
});

test("escalaTimingBySection mede minutos do opening ao claim", () => {
  const claims = [
    { formId: 10, sectionIndex: 0, createdAt: "2026-06-01T09:00:00.000Z" },
    { formId: 10, sectionIndex: 1, createdAt: "2026-06-01T11:00:00.000Z" },
  ];
  const formMeta = new Map([[10, { opening: "2026-06-01T08:00:00.000Z", sectionTitles: ["Jantar", "Lixo"] }]]);
  const timing = escalaTimingBySection(claims, formMeta);
  const lixo = timing.find(t => t.title === "Lixo");
  const jantar = timing.find(t => t.title === "Jantar");
  assert.equal(jantar.avgMinutes, 60);
  assert.equal(lixo.avgMinutes, 180);
  assert.equal(timing[0].title, "Lixo"); // ordenado por maior tempo medio
});
