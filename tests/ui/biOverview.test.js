/**
 * @file tests/ui/biOverview.test.js
 * @summary Testes da composicao pura do panorama de BI.
 */

import { describe, it, expect } from "vitest";
import { buildOverview, countEscalaAssignments } from "../../shared/biOverview.mjs";

describe("countEscalaAssignments", () => {
  it("conta slots totais, preenchidos e por socio", () => {
    const result = countEscalaAssignments([
      { sections: [{ slots: [{ person: "Ana" }, { person: "" }, { person: "Ana" }] }] },
      { sections: [{ slots: [{ person: "Bruno" }] }] },
    ]);
    expect(result.totalSlots).toBe(4);
    expect(result.filledSlots).toBe(3);
    expect(result.byPersonKey.get("ana")).toBe(2);
    expect(result.byPersonKey.get("bruno")).toBe(1);
  });
});

describe("buildOverview", () => {
  it("une presenca, escala e base num panorama unico", () => {
    const overview = buildOverview({
      memberReport: [
        { personKey: "ana", personName: "Ana", grau: "QM", expected: 2, filled: 2 },
        { personKey: "bruno", personName: "Bruno", grau: "CDC", expected: 2, filled: 0 },
      ],
      escalaAssignments: [
        { sections: [{ slots: [{ person: "Ana" }, { person: "Carla" }] }] },
      ],
      people: [
        { name: "Ana", grau: "QM", active: true },
        { name: "Bruno", grau: "CDC", active: true },
        { name: "Carla", grau: "CI", active: true },
        { name: "Davi", grau: "QS", active: false },
      ],
    });

    expect(overview.presenca).toEqual({ expected: 4, filled: 2, exempted: 0 });
    expect(overview.escala).toEqual({ totalSlots: 2, filledSlots: 2 });

    const carla = overview.members.find(m => m.personKey === "carla");
    expect(carla).toMatchObject({ grau: "CI", escalaCount: 1, presencaExpected: 0 });

    // Davi inativo nao entra; Carla (escala) e os 3 ativos entram.
    expect(overview.members.map(m => m.personName).sort()).toEqual(["Ana", "Bruno", "Carla"]);
    expect(overview.graus.sort()).toEqual(["CDC", "CI", "QM"]);
  });
});
