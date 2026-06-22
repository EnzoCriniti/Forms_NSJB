/**
 * @file tests/ui/dashboardScreen.test.jsx
 * @summary Testes de UI do dashboard de BI.
 * @responsibility Garantir KPIs, filtro por grau, rankings e proximos fechamentos.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { DashboardScreen } from "../../frontend/src/screens/DashboardScreen.jsx";
import { fetchBiOverview } from "../../frontend/src/lib/api.js";

vi.mock("../../frontend/src/lib/api.js", () => ({
  fetchBiOverview: vi.fn(),
}));

const overview = {
  graus: ["CDC", "QM"],
  members: [
    { personKey: "ana", personName: "Ana", grau: "QM", presencaExpected: 4, presencaFilled: 4, escalaCount: 5 },
    { personKey: "bruno", personName: "Bruno", grau: "CDC", presencaExpected: 4, presencaFilled: 1, escalaCount: 0 },
  ],
  presenca: { expected: 8, filled: 5 },
  escala: { totalSlots: 10, filledSlots: 5 },
};

const forms = [
  { id: 2, title: "Escala da Organ", type: "escala_organ", status: "aberto", sessionName: "Sessao B", closing: "2026-05-08T18:00" },
];

describe("DashboardScreen", () => {
  beforeEach(() => fetchBiOverview.mockReset());

  it("mostra KPIs, rankings e proximos fechamentos", async () => {
    const onNavigate = vi.fn();
    fetchBiOverview.mockResolvedValue(overview);

    render(<DashboardScreen onNavigate={onNavigate} forms={forms} user={{ role: "admin", name: "Admin" }} />);

    expect(await screen.findByText("50%")).toBeInTheDocument(); // escala 5/10
    expect(screen.getByText("Top 10 — menos preenchem presença")).toBeInTheDocument();
    expect(screen.getByText("Top 10 — menos fazem escala")).toBeInTheDocument();
    expect(screen.getAllByText("Bruno").length).toBeGreaterThan(0); // aparece nos dois rankings
    expect(screen.getByText("Próximos fechamentos")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Abrir resultados" }));
    expect(onNavigate).toHaveBeenCalledWith("results", forms[0]);
  });

  it("filtra os indicadores por grau", async () => {
    fetchBiOverview.mockResolvedValue(overview);
    render(<DashboardScreen onNavigate={vi.fn()} forms={[]} user={{ role: "admin", name: "Admin" }} />);

    await screen.findAllByText("Bruno");
    fireEvent.click(screen.getByRole("button", { name: "QM" }));

    await waitFor(() => expect(screen.queryAllByText("Bruno")).toHaveLength(0));
    expect(screen.getAllByText("Ana").length).toBeGreaterThan(0);
  });

  it("trata ausencia de dados de BI", async () => {
    fetchBiOverview.mockResolvedValue({ graus: [], members: [], presenca: { expected: 0, filled: 0 }, escala: { totalSlots: 0, filledSlots: 0 } });
    render(<DashboardScreen onNavigate={vi.fn()} forms={[]} user={{ role: "admin", name: "Admin" }} />);

    expect(await screen.findByText("Sem eventos encerrados ainda.")).toBeInTheDocument();
    expect(screen.getByText("Nenhuma escala registrada ainda.")).toBeInTheDocument();
  });
});
