/**
 * @file tests/ui/biDomain.test.js
 * @summary Testes da logica pura de BI no frontend.
 */

import { describe, it, expect } from "vitest";
import {
  filterByGrau,
  formatDuration,
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
});
