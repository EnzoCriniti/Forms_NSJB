/**
 * @file tests/ui/publicTopCompact.test.jsx
 * @summary Testes do topo publico compacto.
 * @responsibility Cobrir titulo, descricao, acoes e rota de resultados apos extracao de publicUi.jsx.
 */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PublicTopCompact } from "../../frontend/src/components/PublicTopCompact.jsx";

const form = {
  id: 1,
  title: "Formulario Publico",
  date: "2026-05-10",
  type: "presenca",
};

describe("PublicTopCompact", () => {
  afterEach(() => {
    window.location.hash = "";
  });

  it("renderiza titulo, tipo, descricao e botao de voltar", () => {
    const onBack = vi.fn();

    render(<PublicTopCompact form={form} description="Descricao curta" onBack={onBack} />);

    expect(screen.getByRole("heading", { name: "Formulario Publico - 10/05/2026" })).toBeInTheDocument();
    expect(screen.getByText("Formulário de Presença")).toBeInTheDocument();
    expect(screen.getByText("Descricao curta")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("navega para a actionHref normalizada", () => {
    render(<PublicTopCompact form={form} actionHref="/formularios/1/resultados" actionLabel="Resultados" />);

    fireEvent.click(screen.getByRole("button", { name: "Resultados" }));

    expect(window.location.hash).toBe("#/formularios/1/resultados");
  });
});
