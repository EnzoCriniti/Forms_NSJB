/**
 * @file tests/ui/biDomain.test.js
 * @summary Testes da logica pura de BI no frontend.
 */

import { describe, it, expect } from "vitest";
import {
  escalaFilledBySection,
  filterByGrau,
  formatDuration,
  presencaByGrau,
  presencaFillDistribution,
  rate,
  sortGrauOptions,
  topLeastEscala,
  topLeastPresenca,
} from "../../frontend/src/features/bi/biDomain.js";

const members = [
  { personKey: "ana", personName: "Ana", grau: "QM", presencaExpected: 4, presencaFilled: 4, escalaCount: 5 },
  { personKey: "bruno", personName: "Bruno", grau: "CDC", presencaExpected: 4, presencaFilled: 1, escalaCount: 0 },
  { personKey: "caio", personName: "Caio", grau: "QM", presencaExpected: 0, presencaFilled: 0, escalaCount: 2 },
];

describe("biDomain", () => {
  it("rate protege divisao por zero", () => {
    expect(rate(1, 4)).toBe(25);
    expect(rate(0, 0)).toBe(0);
  });

  it("formata duracao em min/h", () => {
    expect(formatDuration(30)).toBe("30min");
    expect(formatDuration(60)).toBe("1h");
    expect(formatDuration(90)).toBe("1h 30min");
    expect(formatDuration(null)).toBe("—");
  });

  it("filtra por grau ignorando acento/caixa e ordena graus canonicamente", () => {
    expect(filterByGrau(members, "todos")).toHaveLength(3);
    expect(filterByGrau(members, "qm").map(m => m.personName)).toEqual(["Ana", "Caio"]);
    expect(sortGrauOptions(["QS", "QM", "CDC"])).toEqual(["QM", "CDC", "QS"]);
  });

  it("top menos presenca ignora quem nunca foi esperado e ordena pela menor taxa", () => {
    const result = topLeastPresenca(members);
    expect(result.map(m => m.personName)).toEqual(["Bruno", "Ana"]); // Caio tem expected 0
    expect(result[0].fillRate).toBe(25);
  });

  it("top menos escala ordena pelo menor numero de vagas", () => {
    expect(topLeastEscala(members).map(m => m.personName)).toEqual(["Bruno", "Caio", "Ana"]);
  });

  it("agrupa presenca por grau (canonico) ignorando graus sem esperados", () => {
    const result = presencaByGrau(members); // QM: (4+0)/(4+0)=100 (Caio expected 0 nao soma), CDC: 1/4=25
    expect(result.map(g => g.grau)).toEqual(["QM", "CDC"]);
    expect(result.find(g => g.grau === "QM").rate).toBe(100);
    expect(result.find(g => g.grau === "CDC").rate).toBe(25);
  });

  it("distribui socios por faixa de preenchimento (ignora quem nao foi esperado)", () => {
    const dist = presencaFillDistribution(members); // Ana 100%, Bruno 25%, Caio sem esperados
    const byLabel = Object.fromEntries(dist.map(band => [band.label, band.value]));
    expect(byLabel["100%"]).toBe(1); // Ana
    expect(byLabel["1–49%"]).toBe(1); // Bruno (25%)
    expect(byLabel["0%"]).toBe(0);
    expect(dist.reduce((sum, band) => sum + band.value, 0)).toBe(2); // Caio nao entra
  });

  it("ordena secoes por vagas assumidas e ignora as vazias", () => {
    const sections = escalaFilledBySection([
      { title: "Jantar", totalSlots: 5, filledSlots: 4 },
      { title: "Recepção", totalSlots: 3, filledSlots: 0 },
      { title: "Lixo", totalSlots: 2, filledSlots: 2 },
    ]);
    expect(sections.map(s => s.label)).toEqual(["Jantar", "Lixo"]); // Recepção (0) removida
    expect(sections[0].value).toBe(4);
  });
});
