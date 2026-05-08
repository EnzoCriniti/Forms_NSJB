/**
 * @file tests/ui/dashboardPanels.test.jsx
 * @summary Testes dos blocos da dashboard.
 * @responsibility Cobrir os novos componentes reutilizaveis da dashboard.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardEmptyState, DashboardStatsGrid } from "../../frontend/src/components/DashboardPanels.jsx";

describe("DashboardPanels", () => {
  it("renderiza os cards da dashboard", () => {
    render(
      <DashboardStatsGrid
        cards={[
          { label: "Formularios", value: 3, note: "2 presenca | 1 escala", color: "var(--primary)" },
          { label: "Abertos", value: 1, note: "em operacao", color: "var(--accent)" },
        ]}
      />,
    );

    expect(screen.getByText("Formularios")).toBeInTheDocument();
    expect(screen.getByText("2 presenca | 1 escala")).toBeInTheDocument();
    expect(screen.getByText("Abertos")).toBeInTheDocument();
  });

  it("mostra o estado vazio com acao", () => {
    const onNavigate = vi.fn();

    render(<DashboardEmptyState onNavigate={onNavigate} user={{ role: "admin" }} />);

    expect(screen.getByText("Nenhum formulario cadastrado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Criar formulario" })).toBeInTheDocument();
  });
});
