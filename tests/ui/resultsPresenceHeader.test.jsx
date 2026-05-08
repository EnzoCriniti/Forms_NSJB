import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ResultsPresenceHeader } from "../../frontend/src/components/ResultsPresenceHeader.jsx";

describe("ResultsPresenceHeader", () => {
  it("renderiza titulo, filtros de grau e exportacao", () => {
    const onNavigate = vi.fn();
    const onSelectGrau = vi.fn();
    const onExport = vi.fn();

    render(
      <ResultsPresenceHeader
        onNavigate={onNavigate}
        form={{
          title: "Presenca Completa",
          status: "aberto",
          closing: "2026-05-05T20:00",
          labels: [],
        }}
        labels={[]}
        grauOptions={["QS", "QM"]}
        selectedGrau="QS"
        onSelectGrau={onSelectGrau}
        stats={[
          { l: "Respostas", v: 2, s: "recebidas", c: "#000" },
          { l: "Faltam", v: 1, s: "pendentes", c: "#111" },
        ]}
        onExport={onExport}
      />,
    );

    expect(screen.getByRole("heading", { name: "Presenca Completa" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "QM" }));
    expect(onSelectGrau).toHaveBeenCalledWith("QM");
    fireEvent.click(screen.getByRole("button", { name: "Exportar" }));
    expect(onExport).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Respostas")).toBeInTheDocument();
    expect(screen.getByText("Faltam")).toBeInTheDocument();
  });
});
