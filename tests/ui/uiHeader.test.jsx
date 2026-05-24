/**
 * @file tests/ui/uiHeader.test.jsx
 * @summary Testes do header interno compartilhado da UI.
 * @responsibility Cobrir titulo, subtitulo, acoes e conteudo customizado apos extracao de ui.jsx.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ScreenHeader } from "../../frontend/src/components/uiHeader";

describe("uiHeader", () => {
  it("renderiza titulo, subtitulo, leading e acoes", () => {
    render(
      <ScreenHeader
        leading={<span>Voltar</span>}
        title="Formulario"
        subtitle="Configurar campos"
        actions={<button type="button">Salvar</button>}
      />,
    );

    expect(screen.getByText("Voltar")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Formulario" })).toBeInTheDocument();
    expect(screen.getByText("Configurar campos")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
  });

  it("prioriza titleContent quando informado", () => {
    render(<ScreenHeader title="Ignorado" titleContent={<strong>Conteudo customizado</strong>} />);

    expect(screen.getByText("Conteudo customizado")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Ignorado" })).not.toBeInTheDocument();
  });
});
