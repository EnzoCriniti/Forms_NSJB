import { describe, expect, it } from "vitest";
import { FORM_MODES, buildFormSearchIndex, formatDate, formatDateTime, getExpectedResponses, getFieldSelectionSource, getFormMode, getResultsConfig, getVisibleFields, normalizeSearchText, resolvePersonBySelectionValue, summarizeFieldValidation } from "../../frontend/src/lib/forms";

describe("forms lib helpers", () => {
  it("formata datas e normaliza busca textual", () => {
    expect(formatDate("2026-05-25T10:30")).toBe("25/05/2026");
    expect(formatDateTime("2026-05-25T10:30")).toBe("25/05/2026 10:30");
    expect(normalizeSearchText("  Núcleo São João  ")).toBe("nucleo sao joao");
  });

  it("monta indice de busca com labels e modo do formulario", () => {
    const index = buildFormSearchIndex(
      {
        title: "Escala Maio",
        description: "Celebração",
        status: "aberto",
        type: "presenca",
        labels: [1],
        resultsConfig: { formMode: FORM_MODES.NUCLEO },
      },
      [{ id: 1, name: "Liturgia" }],
    );

    expect(index).toContain("escala maio");
    expect(index).toContain("celebracao");
    expect(index).toContain("liturgia");
    expect(index).toContain("presenca do nucleo");
  });

  it("resolve campos visiveis, validacao e origem de selecao", () => {
    const form = {
      fieldDefinitions: [
        { id: 1, type: "text", validation: { minLength: 2 }, show: true },
        { id: 2, type: "number", validation: { min: 1, max: 5 }, show: false },
        { id: 3, type: "person_select", selectionSource: { kind: "external_base", externalBaseId: 9 } },
      ],
    };

    expect(getVisibleFields(form).map(field => field.id)).toEqual([1, 3]);
    expect(summarizeFieldValidation(form.fieldDefinitions[0])).toBe("min 2 caracteres");
    expect(summarizeFieldValidation(form.fieldDefinitions[1])).toBe("min 1 | max 5");
    expect(getFieldSelectionSource(form.fieldDefinitions[2])).toEqual({ kind: "external_base", externalBaseId: 9 });
  });

  it("resolve modo, resultados esperados e leitura de pessoas", () => {
    const form = {
      type: "presenca",
      fieldDefinitions: [{ id: 1, type: "person_select", selectionSource: { kind: "members" } }],
      resultsConfig: { searchEnabled: false },
    };

    expect(getFormMode(form)).toBe(FORM_MODES.NUCLEO);
    expect(getExpectedResponses(form, [{ name: "Ana" }, { name: "Bia" }])).toBe(2);
    expect(getResultsConfig(form)).toMatchObject({ searchEnabled: false, showLinkedRoster: true });
    expect(resolvePersonBySelectionValue([{ name: "Ana", grau: "Jovem" }], "jovem - ana")).toEqual({ name: "Ana", grau: "Jovem" });
  });
});
