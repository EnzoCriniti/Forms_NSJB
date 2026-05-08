/**
 * @file tests/ui/dashboardScreen.test.jsx
 * @summary Testes de UI do dashboard inicial.
 * @responsibility Garantir resumo operacional, atalhos e navegacao principal.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DashboardScreen } from "../../frontend/src/screens/DashboardScreen.jsx";

const forms = [
  {
    id: 1,
    title: "Presenca da Semana",
    type: "presenca",
    status: "aberto",
    sessionName: "Sessao A",
    closing: "2026-05-10T20:00",
    metrics: { responses: 3, total: 5 },
  },
  {
    id: 2,
    title: "Escala da Organ",
    type: "escala_organ",
    status: "aberto",
    sessionName: "Sessao B",
    closing: "2026-05-08T18:00",
    metrics: { responses: 4, total: 6, filled: 4, pending: 2 },
  },
  {
    id: 3,
    title: "Arquivo",
    type: "presenca",
    status: "arquivado",
    sessionName: "Sessao C",
    metrics: { responses: 0, total: 0 },
  },
];

describe("DashboardScreen", () => {
  it("mostra resumo operacional e permite abrir resultados", () => {
    const onNavigate = vi.fn();

    render(
      <DashboardScreen
        onNavigate={onNavigate}
        forms={forms}
        labels={[{ id: 1, name: "Evento", color: "#1565c0" }]}
        people={[{ name: "Maria", grau: "QS" }]}
        presets={[{ id: 1 }]}
        fieldCatalog={[{ id: 1 }]}
        scaleTaskCatalog={[{ id: 1 }, { id: 2 }]}
        user={{ id: 1, role: "admin", name: "Admin" }}
      />,
    );

    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Proximos fechamentos")).toBeInTheDocument();
    expect(screen.getByText("Presenca da Semana")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Novo Formulario" })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Abrir resultados" })[0]);
    expect(onNavigate).toHaveBeenCalledWith("results", forms[1] ? forms[1] : forms[0]);
  });

  it("mostra vazio quando nao ha formularios", () => {
    render(
      <DashboardScreen
        onNavigate={vi.fn()}
        forms={[]}
        labels={[]}
        people={[]}
        presets={[]}
        fieldCatalog={[]}
        scaleTaskCatalog={[]}
        user={{ id: 1, role: "admin", name: "Admin" }}
      />,
    );

    expect(screen.getByText("Nenhum formulario cadastrado")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Criar formulario" })).toBeInTheDocument();
  });
});
