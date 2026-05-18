import { describe, expect, it } from "vitest";
import { buildPublicPersonSelectOptions, findExistingPublicResponse } from "../../frontend/src/screens/publicFormDomain.js";

describe("publicFormDomain", () => {
  it("monta opcoes para base central e base externa", () => {
    const people = [{ name: "Maria", grau: "QS" }];
    const externalBases = [{ id: 9, items: [{ value: "CENTRAL", label: "Central", active: true }, { value: "OCULTA", label: "Oculta", active: false }] }];

    const members = buildPublicPersonSelectOptions({
      field: { id: 1, type: "person_select", selectionSource: { kind: "members" }, memberBinding: { source: "members", role: "primary" } },
      form: { fieldDefinitions: [] },
      people,
      externalBases,
    });
    const external = buildPublicPersonSelectOptions({
      field: { id: 2, type: "person_select", selectionSource: { kind: "external_base", externalBaseId: 9 } },
      form: { fieldDefinitions: [] },
      people,
      externalBases,
    });

    expect(members.placeholder).toBe("Selecione seu nome...");
    expect(members.options).toEqual([{ value: "Maria", label: "Maria" }]);
    expect(external.placeholder).toBe("Selecione uma opcao...");
    expect(external.options).toEqual([{ value: "CENTRAL", label: "Central", active: true }]);
  });

  it("encontra resposta existente pelo nome normalizado", () => {
    const response = findExistingPublicResponse({
      responses: [{ respondentName: "Maria" }, { respondentName: "Joao" }],
      personName: " maria ",
    });

    expect(response).toEqual({ respondentName: "Maria" });
  });
});
