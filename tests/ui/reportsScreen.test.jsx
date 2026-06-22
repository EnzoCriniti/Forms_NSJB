/**
 * @file tests/ui/reportsScreen.test.jsx
 * @summary Testes da aba de relatorios/BI.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReportsScreen } from "../../frontend/src/screens/ReportsScreen.jsx";
import { fetchMemberParticipationReport } from "../../frontend/src/lib/api.js";

vi.mock("../../frontend/src/lib/api.js", () => ({
  fetchMemberParticipationReport: vi.fn(),
}));

const members = [
  { personKey: "ana", personName: "Ana", grau: "QM", expected: 4, filled: 4, missed: 0, fillRate: 100, avgTimeToFillMinutes: 30, lastFilledAt: "2026-05-01T09:00:00.000Z" },
  { personKey: "bruno", personName: "Bruno", grau: "CDC", expected: 4, filled: 1, missed: 3, fillRate: 25, avgTimeToFillMinutes: null, lastFilledAt: null },
];

describe("ReportsScreen", () => {
  beforeEach(() => fetchMemberParticipationReport.mockReset());

  it("lista a participacao por socio com metricas derivadas", async () => {
    fetchMemberParticipationReport.mockResolvedValue({ members });
    render(<ReportsScreen />);

    expect(await screen.findByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("Bruno")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
  });

  it("ordena por faltas por padrao (maior primeiro)", async () => {
    fetchMemberParticipationReport.mockResolvedValue({ members });
    render(<ReportsScreen />);

    await screen.findByText("Ana");
    const rows = screen.getAllByRole("row");
    // rows[0] e o cabecalho; primeira linha de dados deve ser quem mais faltou.
    expect(rows[1]).toHaveTextContent("Bruno");
  });

  it("mostra estado vazio quando nao ha eventos encerrados", async () => {
    fetchMemberParticipationReport.mockResolvedValue({ members: [] });
    render(<ReportsScreen />);

    await waitFor(() => expect(screen.getByText(/Nenhum evento encerrado ainda/)).toBeInTheDocument());
  });
});
