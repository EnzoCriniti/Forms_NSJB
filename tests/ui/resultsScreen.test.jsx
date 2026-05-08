/**
 * @file tests/ui/resultsScreen.test.jsx
 * @summary Testes de UI da tela de resultados.
 * @responsibility Validar grade unica, filtros e renderizacao da totalizacao configurada.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { ResultsScreen } from "../../frontend/src/screens/ResultsScreen.jsx";

const form = {
  id: 1,
  slug: "presenca-completa",
  type: "presenca",
  status: "aberto",
  title: "Presenca Completa",
  labels: [],
  closing: "2026-05-05T20:00",
  totalExpected: 2,
  fieldDefinitions: [
    { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
    { id: 2, type: "yes_no", label: "Vai?", required: true, show: true, total: true },
  ],
  resultsConfig: {
    searchEnabled: true,
    showLinkedRoster: true,
    totalsLayout: [{ fieldId: 2, style: "bar" }],
  },
};

const people = [
  { name: "Maria", grau: "QS" },
  { name: "Joao", grau: "QM" },
];

const responses = [
  { id: 10, respondentName: "Maria", respondentGrau: "QS", values: { "1": "QS - Maria", "2": "Sim" } },
];

const responsesWithExtra = [
  ...responses,
  { id: 11, respondentName: "Pedro", respondentGrau: "KJ", values: { "1": "KJ - Pedro", "2": "Nao" } },
];

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("ResultsScreen", () => {
  it("mostra faltantes na mesma planilha", () => {
    render(
      <ResultsScreen
        onNavigate={vi.fn()}
        responses={responses}
        form={form}
        sections={[]}
        people={people}
        user={{ role: "admin" }}
        labels={[]}
        onSaveSections={vi.fn()}
      />,
    );

    expect(screen.getByText("Maria")).toBeInTheDocument();
    expect(screen.getByText("Joao")).toBeInTheDocument();
    expect(screen.getByText("Pendente")).toBeInTheDocument();
    expect(screen.queryByText("Preenchimento")).not.toBeInTheDocument();
  });

  it("remove nomes fora da base quando a planilha e vinculada", () => {
    render(
      <ResultsScreen
        onNavigate={vi.fn()}
        responses={responsesWithExtra}
        form={form}
        sections={[]}
        people={people}
        user={{ role: "admin" }}
        labels={[]}
        onSaveSections={vi.fn()}
      />,
    );

    expect(screen.queryByText("Pedro")).not.toBeInTheDocument();
    expect(screen.getByText("Maria")).toBeInTheDocument();
    expect(screen.getByText("Joao")).toBeInTheDocument();
    expect(screen.getByText("Respostas").parentElement).toHaveTextContent("1");
  });

  it("filtra a planilha por grau com os botões de filtro", () => {
    render(
      <ResultsScreen
        onNavigate={vi.fn()}
        responses={responses}
        form={form}
        sections={[]}
        people={people}
        user={{ role: "admin" }}
        labels={[]}
        onSaveSections={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "QM" }));

    expect(screen.getByText("Joao")).toBeInTheDocument();
    expect(screen.queryByText("Maria")).not.toBeInTheDocument();
  });

  it("aplica o filtro de grau tambem nas metricas de resumo", () => {
    render(
      <ResultsScreen
        onNavigate={vi.fn()}
        responses={responses}
        form={form}
        sections={[]}
        people={people}
        user={{ role: "admin" }}
        labels={[]}
        onSaveSections={vi.fn()}
      />,
    );

    const respostasCard = screen.getByText("Respostas").parentElement;
    expect(respostasCard).toHaveTextContent("1");

    fireEvent.click(screen.getByRole("button", { name: "QM" }));

    expect(respostasCard).toHaveTextContent("0");
  });

  it("filtra usando o cabecalho de filtros da planilha", () => {
    render(
      <ResultsScreen
        onNavigate={vi.fn()}
        responses={responses}
        form={form}
        sections={[]}
        people={people}
        user={{ role: "admin" }}
        labels={[]}
        onSaveSections={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Nome" }));
    fireEvent.change(screen.getByPlaceholderText("Filtrar nome..."), {
      target: { value: "Joao" },
    });

    expect(screen.getByText("Joao")).toBeInTheDocument();
    expect(screen.queryByText("Maria")).not.toBeInTheDocument();
  });

  it("renderiza totalizacao configurada", () => {
    render(
      <ResultsScreen
        onNavigate={vi.fn()}
        responses={responses}
        form={form}
        sections={[]}
        people={people}
        user={{ role: "admin" }}
        labels={[]}
        onSaveSections={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Vai?" })).toBeInTheDocument();
    expect(screen.getByText("Totalizacao")).toBeInTheDocument();
    expect(screen.getAllByText("1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Sim").length).toBeGreaterThan(0);
    expect(screen.getByText("Nao")).toBeInTheDocument();
  });

  it("nao mostra filtro por grau sem campo principal vinculado a base", () => {
    render(
      <ResultsScreen
        onNavigate={vi.fn()}
        responses={[
          { id: 20, respondentName: "Visitante", respondentGrau: "", values: { "2": "Sim" } },
        ]}
        form={{
          ...form,
          totalExpected: 0,
          fieldDefinitions: [
            { id: 2, type: "yes_no", label: "Vai?", required: true, show: true, total: true },
          ],
          resultsConfig: {
            searchEnabled: true,
            showLinkedRoster: true,
            totalsLayout: [{ fieldId: 2, style: "bar" }],
          },
        }}
        sections={[]}
        people={people}
        user={{ role: "admin" }}
        labels={[]}
        onSaveSections={vi.fn()}
      />,
    );

    expect(screen.queryByText("Filtrar por grau")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "QS" })).not.toBeInTheDocument();
  });

  it("usa valores distintos para filtrar campo de opcoes", () => {
    render(
      <ResultsScreen
        onNavigate={vi.fn()}
        responses={responses}
        form={form}
        sections={[]}
        people={people}
        user={{ role: "admin" }}
        labels={[]}
        onSaveSections={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Vai?" }));
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Sim" },
    });

    expect(screen.getByText("Maria")).toBeInTheDocument();
    expect(screen.queryByText("Joao")).not.toBeInTheDocument();
  });

  it("mantem campo de base externa como coluna visivel nos resultados", () => {
    render(
      <ResultsScreen
        onNavigate={vi.fn()}
        responses={[
          { id: 10, respondentName: "Maria", respondentGrau: "QS", values: { "1": "QS - Maria", "2": "Sim", "3": "JARDINS" } },
        ]}
        form={{
          ...form,
          fieldDefinitions: [
            { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false, selectionSource: { kind: "members" }, memberBinding: { source: "members", role: "primary" } },
            { id: 3, type: "person_select", label: "Congregacao", required: false, show: true, total: false, selectionSource: { kind: "external_base", externalBaseId: 9 } },
            { id: 2, type: "yes_no", label: "Vai?", required: true, show: true, total: true },
          ],
        }}
        sections={[]}
        people={people}
        user={{ role: "admin" }}
        labels={[]}
        onSaveSections={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Congregacao" })).toBeInTheDocument();
    expect(screen.getByText("JARDINS")).toBeInTheDocument();
  });

  it("exporta csv com colunas esperadas", async () => {
    const csvForm = {
      ...form,
      totalExpected: 1,
      fieldDefinitions: [
        { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
        { id: 2, type: "yes_no", label: "Vai?", required: true, show: true, total: true },
        { id: 3, type: "number", label: "Convidados", required: false, show: true, total: true },
        { id: 4, type: "text", label: "Observacao", required: false, show: true, total: false },
        { id: 5, type: "grid", label: "Avaliacao", required: false, show: true, total: false },
      ],
      resultsConfig: {
        searchEnabled: true,
        showLinkedRoster: true,
        totalsLayout: [{ fieldId: 2, style: "bar" }, { fieldId: 3, style: "metric" }],
      },
    };

    const csvResponses = [
      {
        id: 10,
        respondentName: "Maria",
        respondentGrau: "QS",
        values: {
          "1": "QS - Maria",
          "2": "Sim",
          "3": 4,
          "4": "Observacao livre",
          "5": { "Linha A": "Coluna 1", "Linha B": "Coluna 2" },
        },
      },
    ];

    const createObjectUrl = vi.fn(() => "blob:csv");
    const revokeObjectUrl = vi.fn();
    const click = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    const anchor = vi.spyOn(document, "createElement").mockImplementation(tag => {
      if (tag === "a") {
        const element = originalCreateElement(tag);
        element.click = click;
        element.remove = vi.fn();
        return element;
      }
      return originalCreateElement(tag);
    });

    vi.stubGlobal("URL", { ...URL, createObjectURL: createObjectUrl, revokeObjectURL: revokeObjectUrl });

    render(
      <ResultsScreen
        onNavigate={vi.fn()}
        responses={csvResponses}
        form={csvForm}
        sections={[]}
        people={people}
        user={{ role: "admin" }}
        labels={[]}
        onSaveSections={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Exportar" }));

    expect(createObjectUrl).toHaveBeenCalledTimes(1);
    const blob = createObjectUrl.mock.calls[0][0];
    const text = await blob.text();
    const csv = text.startsWith("\uFEFF") ? text.slice(1) : text;

    expect(csv).toContain('"Grau";"Nome";"Status";"Vai?";"Convidados";"Observacao";"Avaliacao"');
    expect(csv).toContain('"QS";"Maria";"Respondido";"Sim";"4";"Observacao livre";"Linha A: Coluna 1 | Linha B: Coluna 2"');
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectUrl).toHaveBeenCalledWith("blob:csv");

    anchor.mockRestore();
  });

  it("confirma antes de remover vaga preenchida na escala", () => {
    const onSaveSections = vi.fn().mockResolvedValue(undefined);

    render(
      <ResultsScreen
        onNavigate={vi.fn()}
        responses={responses}
        form={{
          id: 2,
          slug: "escala-editavel",
          type: "escala_organ",
          status: "aberto",
          title: "Escala Editavel",
          labels: [],
          closing: "2026-05-05T20:00",
        }}
        sections={[
          {
            title: "Sala",
            color: "#ffcdd2",
            slots: [{ role: "Responsavel", person: "Maria" }],
          },
        ]}
        people={people}
        user={{ role: "admin" }}
        labels={[]}
        onSaveSections={onSaveSections}
      />,
    );

    fireEvent.click(screen.getByLabelText("Remover vaga Sala Responsavel"));
    expect(screen.getByRole("heading", { name: "Remover vaga" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remover" }));

    expect(onSaveSections).toHaveBeenCalledWith([
      {
        title: "Sala",
        color: "#ffcdd2",
        slots: [{ role: "Responsavel", person: "" }],
      },
    ]);
  });
});
