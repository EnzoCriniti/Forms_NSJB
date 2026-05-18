import { describe, expect, it } from "vitest";
import { buildPublicScaleLimitMessage, buildPublicScaleNextSections, countPublicScaleAssignments, resolvePublicScaleLimit } from "../../frontend/src/screens/publicScaleDomain.js";

describe("publicScaleDomain", () => {
  it("resolve o limite da escala e monta a proxima versao das secoes", () => {
    expect(resolvePublicScaleLimit({ resultsConfig: { maxAssignmentsPerPerson: 3 } })).toBe(3);
    expect(buildPublicScaleLimitMessage(1)).toBe("Este nome ja esta em uma vaga desta escala.");
    expect(buildPublicScaleLimitMessage(2)).toBe("Este nome ja atingiu o limite de vagas desta escala.");
  });

  it("conta atribuicoes do mesmo nome e monta as secoes atualizadas", () => {
    const sections = [
      { title: "Sala", slots: [{ role: "A", person: "Maria" }, { role: "B", person: "" }] },
      { title: "Outro", slots: [{ role: "C", person: "Maria" }] },
    ];

    expect(countPublicScaleAssignments(sections, " maria ")).toBe(2);
    expect(buildPublicScaleNextSections(sections, 0, 1, "Joao")).toEqual([
      { title: "Sala", slots: [{ role: "A", person: "Maria" }, { role: "B", person: "Joao" }] },
      { title: "Outro", slots: [{ role: "C", person: "Maria" }] },
    ]);
  });
});
