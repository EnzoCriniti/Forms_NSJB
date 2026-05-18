/**
 * @file tests/ui/resultsDomain.test.js
 * @summary Testes do dominio da tela de resultados.
 * @responsibility Validar ordenacao, filtros ativos e formatacao da planilha.
 */

import { describe, expect, it } from "vitest";
import { buildActiveFilterOptions, buildPresenceStats, compareGrauOptions, formatResultFieldValue } from "../../frontend/src/screens/resultsDomain";

describe("resultsDomain", () => {
  it("ordena grau por prioridade canonica", () => {
    expect(["QS", "CDC", "QM", "CI"].sort(compareGrauOptions)).toEqual(["QM", "CDC", "CI", "QS"]);
  });

  it("formata valor de grade", () => {
    expect(formatResultFieldValue({ manha: "Sim", tarde: "Nao" }, "grid")).toBe("manha: Sim | tarde: Nao");
  });

  it("gera opcoes do filtro ativo com base nas demais colunas", () => {
    const options = buildActiveFilterOptions({
      activeFilter: { id: "status", type: "select" },
      columnSearches: { grau: "QM" },
      columns: [{ id: 2, type: "yes_no", label: "Vai?" }],
      selectedGrau: "todos",
      tableRows: [
        { grau: "QM", name: "Maria", status: "Respondido", response: { 2: "Sim" } },
        { grau: "CDC", name: "Joao", status: "Pendente", response: { 2: "Nao" } },
      ],
      formatFieldValue: formatResultFieldValue,
      getFieldValue: (response, fieldId) => response[fieldId],
    });

    expect(options).toEqual(["Respondido"]);
  });

  it("monta estatisticas com e sem total esperado", () => {
    expect(buildPresenceStats({
      hasExpectedTotal: true,
      filteredResponsesLength: 2,
      selectedGrau: "todos",
      expectedTotal: 4,
      filteredRowsLength: 4,
      totalsLayoutLength: 1,
      linkedPeople: true,
      peopleLength: 4,
    })[1].l).toBe("Faltam");

    expect(buildPresenceStats({
      hasExpectedTotal: false,
      filteredResponsesLength: 2,
      selectedGrau: "todos",
      expectedTotal: 0,
      filteredRowsLength: 4,
      totalsLayoutLength: 1,
      linkedPeople: true,
      peopleLength: 4,
    })[1].l).toBe("Campos totalizaveis");
  });
});
