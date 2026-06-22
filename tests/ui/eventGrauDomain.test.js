/**
 * @file tests/ui/eventGrauDomain.test.js
 * @summary Testes do limitador de grau por evento.
 */

import { describe, it, expect } from "vitest";
import {
  CANONICAL_GRAU_OPTIONS,
  buildEligibleGrauOptions,
  filterPeopleByEligibleGraus,
  isGrauSelected,
  isPersonGrauEligible,
  toggleEligibleGrau,
} from "../../frontend/src/screens/eventGrauDomain.js";

const people = [
  { name: "Ana", grau: "QM" },
  { name: "Bruno", grau: "CDC" },
  { name: "Carla", grau: "CI" },
  { name: "Davi", grau: "QS" },
];

describe("eventGrauDomain", () => {
  it("monta opcoes a partir da base ordenadas de forma canonica", () => {
    const options = buildEligibleGrauOptions([
      { grau: "QS" },
      { grau: "QM" },
      { grau: "CI" },
      { grau: "CDC" },
      { grau: "QM" },
    ]);
    expect(options).toEqual(["QM", "CDC", "CI", "QS"]);
  });

  it("cai para a lista canonica quando a base esta vazia", () => {
    expect(buildEligibleGrauOptions([])).toEqual(CANONICAL_GRAU_OPTIONS);
  });

  it("conjunto vazio significa todos os graus esperados", () => {
    expect(filterPeopleByEligibleGraus(people, [])).toHaveLength(4);
    expect(isPersonGrauEligible({ grau: "QS" }, [])).toBe(true);
  });

  it("filtra a base apenas pelos graus marcados, ignorando acento e caixa", () => {
    const filtered = filterPeopleByEligibleGraus(people, ["qm", "ci"]);
    expect(filtered.map(person => person.name)).toEqual(["Ana", "Carla"]);
    expect(isPersonGrauEligible({ grau: "CDC" }, ["QM", "CI"])).toBe(false);
  });

  it("toggle adiciona e remove grau preservando o rotulo original", () => {
    const added = toggleEligibleGrau(["QM"], "CI");
    expect(added).toEqual(["QM", "CI"]);
    expect(isGrauSelected(added, "ci")).toBe(true);
    const removed = toggleEligibleGrau(added, "QM");
    expect(removed).toEqual(["CI"]);
    expect(isGrauSelected(removed, "QM")).toBe(false);
  });
});
