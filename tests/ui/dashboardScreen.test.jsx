/**
 * @file tests/ui/dashboardScreen.test.jsx
 * @summary Testes de UI do dashboard de BI (abas, filtro, perfil).
 * @responsibility Garantir KPIs, navegação por abas, rankings clicáveis e perfil.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { DashboardScreen } from "../../frontend/src/screens/DashboardScreen.jsx";
import { fetchBiDashboard, fetchMemberDetail } from "../../frontend/src/lib/api.js";

vi.mock("../../frontend/src/lib/api.js", () => ({
  fetchBiDashboard: vi.fn(),
  fetchMemberDetail: vi.fn(),
}));

const overview = {
  graus: ["CDC", "QM"],
  members: [
    { personKey: "ana", personName: "Ana", grau: "QM", presencaExpected: 4, presencaFilled: 4, escalaCount: 5, avgTimeToFillMinutes: 30, lastFilledAt: "2026-05-01" },
    { personKey: "bruno", personName: "Bruno", grau: "CDC", presencaExpected: 4, presencaFilled: 1, escalaCount: 0, avgTimeToFillMinutes: 600, lastFilledAt: "2026-05-01" },
  ],
  presenca: { expected: 8, filled: 5 },
  escala: { totalSlots: 10, filledSlots: 5 },
};

const forms = [
  { id: 2, title: "Escala da Organ", type: "escala_organ", status: "aberto", sessionName: "Sessao B", closing: "2026-05-08T18:00" },
];

const mockAll = (overrideOverview = overview) => {
  fetchBiDashboard.mockResolvedValue({
    overview: overrideOverview,
    timeline: [],
    escala: { vacancy: [], timing: [], recurrence: { titles: [], people: [] }, load: [] },
    matrix: { events: [], people: [] },
  });
};

describe("DashboardScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAll();
  });

  it("mostra KPIs e próximos fechamentos na visão geral", async () => {
    const onNavigate = vi.fn();
    render(<DashboardScreen onNavigate={onNavigate} forms={forms} user={{ role: "admin", name: "Admin" }} />);

    expect(await screen.findByText("50%")).toBeInTheDocument(); // escala 5/10
    expect(screen.getByText("Próximos fechamentos")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Abrir resultados" }));
    expect(onNavigate).toHaveBeenCalledWith("results", forms[0]);
  });

  it("mostra rankings ao trocar para a aba Presença", async () => {
    render(<DashboardScreen onNavigate={vi.fn()} forms={[]} user={{ role: "admin", name: "Admin" }} />);
    await screen.findByText("50%");

    fireEvent.click(screen.getByRole("tab", { name: /Presença/ }));
    expect(await screen.findByText("Top 10 — menos preenchem presença")).toBeInTheDocument();
    expect(screen.getAllByText("Bruno").length).toBeGreaterThan(0);
  });

  it("filtra os indicadores por grau", async () => {
    render(<DashboardScreen onNavigate={vi.fn()} forms={[]} user={{ role: "admin", name: "Admin" }} />);
    await screen.findByText("50%");
    fireEvent.click(screen.getByRole("tab", { name: /Presença/ }));
    await screen.findAllByText("Bruno");

    fireEvent.click(screen.getByRole("button", { name: "QM" }));
    await waitFor(() => expect(screen.queryAllByText("Bruno")).toHaveLength(0));
    expect(screen.getAllByText("Ana").length).toBeGreaterThan(0);
  });

  it("abre o perfil ao clicar num sócio do ranking", async () => {
    fetchMemberDetail.mockResolvedValue({
      personKey: "bruno",
      personName: "Bruno",
      grau: "CDC",
      summary: { expected: 4, filled: 1, rate: 25, lastFilledAt: "2026-05-01", escalaTotal: 0 },
      presenca: [{ eventId: 1, eventTitle: "Evento X", date: "2026-05-01", formId: 9, formTitle: "Presença", formType: "presenca", filled: false, respondedAt: null, timeToFillMinutes: null }],
      escala: [],
    });
    render(<DashboardScreen onNavigate={vi.fn()} forms={[]} user={{ role: "admin", name: "Admin" }} />);
    await screen.findByText("50%");
    fireEvent.click(screen.getByRole("tab", { name: /Presença/ }));
    const bruno = (await screen.findAllByText("Bruno"))[0];
    fireEvent.click(bruno);

    await waitFor(() => expect(fetchMemberDetail).toHaveBeenCalledWith("bruno"));
    expect(await screen.findByText("Presença por evento")).toBeInTheDocument();
    expect(screen.getByText("Evento X")).toBeInTheDocument();
  });

  it("filtra o ranking de escala por limiar", async () => {
    render(<DashboardScreen onNavigate={vi.fn()} forms={[]} user={{ role: "admin", name: "Admin" }} />);
    await screen.findByText("50%");
    fireEvent.click(screen.getByRole("tab", { name: /Escala/ }));

    expect(await screen.findByText("Top 10 — menos fazem escala")).toBeInTheDocument();
    expect(screen.getAllByText("Bruno").length).toBeGreaterThan(0); // escalaCount 0, >= 0

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "1" } });
    await waitFor(() => expect(screen.queryAllByText("Bruno")).toHaveLength(0)); // 0 < 1 some
    expect(screen.getAllByText("Ana").length).toBeGreaterThan(0);
  });

  it("trata ausencia de dados de BI", async () => {
    mockAll({ graus: [], members: [], presenca: { expected: 0, filled: 0 }, escala: { totalSlots: 0, filledSlots: 0 } });
    render(<DashboardScreen onNavigate={vi.fn()} forms={[]} user={{ role: "admin", name: "Admin" }} />);
    await screen.findByText("Visão geral");

    fireEvent.click(screen.getByRole("tab", { name: /Escala/ }));
    expect(await screen.findByText("Nenhuma escala registrada ainda.")).toBeInTheDocument();
  });
});
