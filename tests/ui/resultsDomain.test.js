/**
 * @file tests/ui/resultsDomain.test.js
 * @summary Testes do dominio da tela de resultados.
 * @responsibility Validar ordenacao, filtros ativos e formatacao da planilha.
 */

import { describe, expect, it } from "vitest";
import { addEscalaSlot, assignEscalaSlotPerson, attachPresenceTotalsSummary, buildActiveFilterOptions, buildEscalaCsv, buildEscalaMetrics, buildEscalaNames, buildPresenceBaseResponses, buildPresenceCsv, buildPresenceFilterButtons, buildPresenceGrauOptions, buildPresenceHeaderCellStyle, buildPresenceStats, buildPresenceTableMinWidth, buildPresenceTableRows, buildPresenceTotals, buildPresenceTotalsLayout, clearEscalaSlotPerson, compareGrauOptions, filterPresenceResponses, filterPresenceRows, formatResultFieldValue, getPresenceSortIconName, getPresenceTouchDistance, patchEscalaSlot, resolvePresenceSortState, sortPresenceRows } from "../../frontend/src/screens/resultsDomain";

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

    const statsWithoutExpected = buildPresenceStats({
      hasExpectedTotal: false,
      filteredResponsesLength: 2,
      selectedGrau: "todos",
      expectedTotal: 0,
      filteredRowsLength: 4,
      totalsLayoutLength: 1,
      linkedPeople: true,
      peopleLength: 4,
    });

    expect(statsWithoutExpected).toHaveLength(1);
    expect(statsWithoutExpected[0].l).toBe("Respostas");
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

  it("cruza base e respostas por identidade ignorando acento e espacos", () => {
    const responses = [
      { id: 7, respondentGrau: "CI", respondentName: "ANA   PESSOA", personKey: "ana pessoa" },
    ];
    const rows = buildPresenceTableRows({
      responses,
      people: [{ grau: "CI", name: "Ana Pessôa" }],
      showLinkedRows: true,
    });
    expect(rows[0].status).toBe("Respondido");
    expect(rows[0].response).toBe(responses[0]);

    const legacy = buildPresenceTableRows({
      responses: [{ id: 8, respondentName: "José da Silva" }],
      people: [{ name: "JOSE DA SILVA" }],
      showLinkedRows: true,
    });
    expect(legacy[0].status).toBe("Respondido");
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

  it("soma acompanhantes apenas nas refeicoes confirmadas pela pessoa", () => {
    const columns = [
      { id: 2, type: "yes_no", label: "12h - Almoço" },
      { id: 3, type: "yes_no", label: "18h - Jantar" },
      { id: 4, type: "yes_no", label: "20h - Sessão" },
      { id: 5, type: "number", label: "Crianças (1-11 anos)" },
      { id: 6, type: "number", label: "Jovens (12-17 anos)" },
      { id: 7, type: "number", label: "Visitantes adultos" },
    ];
    const responses = [
      { 2: "Sim", 3: "Nao", 4: "Sim", 5: 2, 6: 1, 7: 1 },
      { 2: "Sim", 3: "Sim", 4: "Nao", 5: 1, 6: 0, 7: 2 },
      { 2: "Nao", 3: "Sim", 4: "Sim", 5: 3, 6: 2, 7: 0 },
    ];

    const totals = buildPresenceTotals({
      columns,
      responses,
      getFieldValue: (response, fieldId) => response[fieldId],
    });

    expect(totals[2].mealAttendance).toEqual({ respondents: 2, children: 3, youths: 1, adultVisitors: 3, total: 9 });
    expect(totals[3].mealAttendance).toEqual({ respondents: 2, children: 4, youths: 2, adultVisitors: 2, total: 10 });
    expect(totals[4].mealAttendance).toBeUndefined();
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

  it("mantem helpers puros de interacao da planilha de presenca", () => {
    expect(resolvePresenceSortState({ sortCol: null, sortDir: "asc", nextCol: "name" })).toEqual({
      sortCol: "name",
      sortDir: "asc",
    });
    expect(resolvePresenceSortState({ sortCol: "name", sortDir: "asc", nextCol: "name" })).toEqual({
      sortCol: "name",
      sortDir: "desc",
    });
    expect(resolvePresenceSortState({ sortCol: "name", sortDir: "desc", nextCol: "name" })).toEqual({
      sortCol: null,
      sortDir: "asc",
    });
    expect(getPresenceSortIconName({ sortCol: "name", sortDir: "desc", col: "name" })).toBe("sortDesc");
    expect(getPresenceSortIconName({ sortCol: "name", sortDir: "asc", col: "grau" })).toBe("sortNone");
    expect(getPresenceTouchDistance([
      { clientX: 0, clientY: 0 },
      { clientX: 3, clientY: 4 },
    ])).toBe(5);
    expect(buildPresenceHeaderCellStyle({
      col: "name",
      sortCol: "name",
      colors: { primary: "#111", surface: "#fff", textMuted: "#888", borderLight: "#eee" },
    })).toMatchObject({ textAlign: "left", background: "#fff", color: "#111", minWidth: 160 });
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

    expect(csv).toBe('"Seção";"Função";"Pessoa";"Status"\n"Sala";"Responsavel";"Maria";"Preenchida"\n"Sala";"Auxiliar";"";"Pendente"');
  });

  it("monta metricas e mutacoes puras da escala", () => {
    const sections = [
      { title: "Sala", slots: [{ role: "Responsavel", person: "Maria" }, { role: "Auxiliar", person: "" }] },
      { title: "Entrada", slots: [{ role: "Apoio", person: "" }] },
    ];

    expect(buildEscalaMetrics(sections)).toEqual({ total: 3, filled: 1 });
    expect(buildEscalaNames([{ name: "Maria" }, { name: "Joao" }])).toEqual(["Maria", "Joao"]);
    expect(assignEscalaSlotPerson(sections, 0, 1, "Joao")[0].slots[1].person).toBe("Joao");
    expect(clearEscalaSlotPerson(sections, 0, 0)[0].slots[0].person).toBe("");
    expect(patchEscalaSlot(sections, 1, 0, { role: "Recepcao" })[1].slots[0].role).toBe("Recepcao");
    expect(addEscalaSlot(sections, 1)[1].slots).toHaveLength(2);
  });
});
