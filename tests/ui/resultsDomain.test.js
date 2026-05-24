/**
 * @file tests/ui/resultsDomain.test.js
 * @summary Testes do dominio da tela de resultados.
 * @responsibility Validar ordenacao, filtros ativos e formatacao da planilha.
 */

import { describe, expect, it } from "vitest";
import { attachPresenceTotalsSummary, buildActiveFilterOptions, buildEscalaCsv, buildPresenceBaseResponses, buildPresenceCsv, buildPresenceFilterButtons, buildPresenceGrauOptions, buildPresenceStats, buildPresenceTableMinWidth, buildPresenceTableRows, buildPresenceTotals, buildPresenceTotalsLayout, compareGrauOptions, filterPresenceResponses, filterPresenceRows, formatResultFieldValue, sortPresenceRows } from "../../frontend/src/screens/resultsDomain";

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

  it("monta linhas de tabela com ou sem base vinculada", () => {
    const responses = [{ id: 1, respondentGrau: "QM", respondentName: "Maria" }];
    expect(buildPresenceTableRows({ responses, showLinkedRows: false })).toEqual([
      { key: 1, grau: "QM", name: "Maria", status: "Respondido", response: responses[0] },
    ]);

    expect(buildPresenceTableRows({
      responses,
      people: [{ grau: "QM", name: "Maria" }, { grau: "CDC", name: "Joao" }],
      showLinkedRows: true,
    })).toEqual([
      { key: "QM-Maria", grau: "QM", name: "Maria", status: "Respondido", response: responses[0] },
      { key: "CDC-Joao", grau: "CDC", name: "Joao", status: "Pendente", response: null },
    ]);
  });

  it("filtra respostas base e totaliza colunas configuradas", () => {
    const responses = [
      { respondentName: "Maria", 2: "Sim", 3: 2 },
      { respondentName: "Extra", 2: "Nao", 3: 5 },
    ];

    expect(buildPresenceBaseResponses({
      responses,
      people: [{ name: "Maria" }],
      showLinkedRows: true,
    })).toEqual([responses[0]]);

    expect(buildPresenceTotals({
      columns: [{ id: 2, type: "yes_no" }, { id: 3, type: "number" }],
      responses,
      getFieldValue: (response, fieldId) => response[fieldId],
    })).toEqual({
      2: { sim: 1, nao: 1 },
      3: { sum: 7 },
    });
  });

  it("monta layout de totais, largura minima e filtros da presenca", () => {
    const columns = [
      { id: 2, label: "Vai?", type: "yes_no", total: true },
      { id: 3, label: "Obs", type: "text", total: false },
    ];

    expect(buildPresenceTotalsLayout({ columns, totalsLayout: [] })).toEqual([
      { fieldId: 2, style: "split", field: columns[0] },
    ]);
    expect(buildPresenceTotalsLayout({ columns, totalsLayout: [{ fieldId: 3, style: "metric" }] })).toEqual([
      { fieldId: 3, style: "metric", field: columns[1] },
    ]);
    expect(buildPresenceTableMinWidth({ columnsLength: 2, showLinkedRows: true })).toBe(960);
    expect(buildPresenceFilterButtons({ columns, linkedPeople: true, showLinkedRows: true })).toEqual([
      { id: "grau", label: "Grau", type: "select" },
      { id: "name", label: "Nome", type: "text" },
      { id: "status", label: "Status", type: "select" },
      { id: "2", label: "Vai?", type: "select" },
      { id: "3", label: "Obs", type: "text" },
    ]);
  });

  it("filtra e ordena linhas da presenca", () => {
    const rows = [
      { grau: "CDC", name: "Joao", status: "Pendente", response: { 2: "Nao", 3: 1 } },
      { grau: "QM", name: "Maria", status: "Respondido", response: { 2: "Sim", 3: 3 } },
    ];

    expect(buildPresenceGrauOptions({ tableRows: rows })).toEqual(["QM", "CDC"]);
    expect(filterPresenceRows({
      tableRows: rows,
      selectedGrau: "todos",
      columnSearches: { status: "respond" },
      columns: [{ id: 2, type: "yes_no" }],
      searchEnabled: true,
      getFieldValue: (response, fieldId) => response[fieldId],
      formatFieldValue: formatResultFieldValue,
    })).toEqual([rows[1]]);
    expect(sortPresenceRows({
      rows,
      sortCol: 3,
      sortDir: "desc",
      getFieldValue: (response, fieldId) => response[fieldId],
    })).toEqual([rows[1], rows[0]]);
  });

  it("filtra respostas por grau e anexa resumo dos totais", () => {
    const baseResponses = [
      { respondentName: "Maria", grau: "QM" },
      { respondentName: "Joao", personName: "Joao" },
    ];
    const tableRows = [
      { grau: "QM", name: "Maria" },
      { grau: "CDC", name: "Joao" },
    ];

    expect(filterPresenceResponses({ baseResponses, selectedGrau: "CDC", tableRows })).toEqual([baseResponses[1]]);
    expect(attachPresenceTotalsSummary({
      totalsLayout: [{ field: { id: 2 }, fieldId: 2 }],
      totals: { 2: { sim: 1, nao: 0 } },
    })).toEqual([{ field: { id: 2 }, fieldId: 2, summary: { sim: 1, nao: 0 } }]);
  });

  it("monta csv de presenca com valores formatados", () => {
    const csv = buildPresenceCsv({
      columns: [{ id: 2, type: "grid", label: "Grade" }],
      rows: [{ grau: "QM", name: "Maria", status: "Respondido", response: { 2: { manha: "Sim" } } }],
      showLinkedRows: true,
      getFieldValue: (response, fieldId) => response[fieldId],
      formatFieldValue: formatResultFieldValue,
    });

    expect(csv).toBe('"Grau";"Nome";"Status";"Grade"\n"QM";"Maria";"Respondido";"manha: Sim"');
  });

  it("monta csv de escala com status das vagas", () => {
    const csv = buildEscalaCsv([
      { title: "Sala", slots: [{ role: "Responsavel", person: "Maria" }, { role: "Auxiliar", person: "" }] },
    ]);

    expect(csv).toBe('"Secao";"Funcao";"Pessoa";"Status"\n"Sala";"Responsavel";"Maria";"Preenchida"\n"Sala";"Auxiliar";"";"Pendente"');
  });
});
