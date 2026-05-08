/**
 * @file tests/ui/formsFlow.test.jsx
 * @summary Suite de fluxo de formularios.
 * @responsibility Cobrir criacao de formulario completo e exibicao dos resultados.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CreateFormScreen } from "../../frontend/src/screens/CreateFormScreen.jsx";
import { ResultsScreen } from "../../frontend/src/screens/ResultsScreen.jsx";

const baseProps = {
  onNavigate: vi.fn(),
  people: [{ name: "Maria", grau: "QS" }, { name: "Joao", grau: "QM" }],
  membersConfig: { sheetUrl: "https://docs.google.com/spreadsheets/d/demo" },
  labels: [],
  presets: [],
  onSavePreset: vi.fn(),
  onSaveForm: vi.fn(),
};

describe("Forms flow", () => {
  it("monta um formulario com todos os tipos principais e envia o payload", async () => {
    const onSaveForm = vi.fn().mockResolvedValue({ ok: true });

    render(<CreateFormScreen {...baseProps} onSaveForm={onSaveForm} />);

    fireEvent.change(screen.getByPlaceholderText("Ex: Presenca Sessao de Escala - 02/05/2026"), {
      target: { value: "Formulario Completo" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Adicionar Campo/i }));
    fireEvent.change(screen.getByDisplayValue("Sim / Nao"), { target: { value: "number" } });
    fireEvent.change(screen.getByPlaceholderText("Ex: Vai ao Jantar?"), { target: { value: "Convidados" } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    fireEvent.click(screen.getByRole("button", { name: /Adicionar Campo/i }));
    fireEvent.change(screen.getByDisplayValue("Sim / Nao"), { target: { value: "text" } });
    fireEvent.change(screen.getByPlaceholderText("Ex: Vai ao Jantar?"), { target: { value: "Observacao" } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    fireEvent.click(screen.getByRole("button", { name: /Adicionar Campo/i }));
    fireEvent.change(screen.getByDisplayValue("Sim / Nao"), { target: { value: "grid" } });
    fireEvent.change(screen.getByPlaceholderText("Ex: Vai ao Jantar?"), { target: { value: "Avaliacao" } });
    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));

    fireEvent.click(screen.getByRole("button", { name: "Publicar Formulario" }));

    await waitFor(() => expect(onSaveForm).toHaveBeenCalledTimes(1));
    const payload = onSaveForm.mock.calls[0][0];

    expect(payload.fieldDefinitions.map(field => field.type)).toEqual([
      "number",
      "text",
      "grid",
    ]);
    expect(payload.resultsConfig.totalsLayout).toEqual([]);
  }, 10000);

  it("exibe respostas com campos variados na tela de resultados", () => {
    render(
      <ResultsScreen
        onNavigate={vi.fn()}
        user={{ role: "admin" }}
        labels={[]}
        people={[{ name: "Maria", grau: "QS" }]}
        sections={[]}
        onSaveSections={vi.fn()}
        form={{
          id: 21,
          slug: "formulario-completo",
          type: "presenca",
          status: "aberto",
          title: "Formulario Completo",
          labels: [],
          closing: "2026-05-05T20:00",
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
            totalsLayout: [
              { fieldId: 2, style: "bar" },
              { fieldId: 3, style: "metric" },
            ],
          },
        }}
        responses={[
          {
            id: 88,
            respondentName: "Maria",
            respondentGrau: "QS",
            values: {
              "1": "QS - Maria",
              "2": "Sim",
              "3": 4,
              "4": "Observacao livre",
              "5": { "Opcao 1": "2", "Opcao 2": "3" },
            },
          },
        ]}
      />,
    );

    expect(screen.getByText("Observacao livre")).toBeInTheDocument();
    expect(screen.getByText("Opcao 1: 2 | Opcao 2: 3")).toBeInTheDocument();
    expect(screen.getAllByText("4").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Convidados").length).toBeGreaterThan(0);
  });
});
