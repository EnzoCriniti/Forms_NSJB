/**
 * @file tests/ui/uiLayout.test.jsx
 * @summary Testes dos wrappers compartilhados de layout da UI.
 * @responsibility Cobrir renderizacao e props principais apos extracao de ui.jsx.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FieldControl, MetricCard, NotePanel, SplitSection, SurfacePanel } from "../../frontend/src/components/uiLayout";

describe("uiLayout", () => {
  it("renderiza SurfacePanel com elemento customizado", () => {
    render(<SurfacePanel as="section" className="custom-panel">Conteudo</SurfacePanel>);

    expect(screen.getByText("Conteudo").closest("section")).toHaveClass("custom-panel");
  });

  it("renderiza MetricCard com valor e label", () => {
    render(<MetricCard value="12" label="Respostas" />);

    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Respostas")).toBeInTheDocument();
  });

  it("renderiza FieldControl com label obrigatorio, hint, acao e controle", () => {
    render(
      <FieldControl label="Nome" hint="Informe o nome completo." required htmlFor="name" actions={<button type="button">Limpar</button>}>
        <input id="name" />
      </FieldControl>,
    );

    expect(screen.getByText("Nome *")).toBeInTheDocument();
    expect(screen.getByLabelText("Nome *")).toBeInTheDocument();
    expect(screen.getByText("Informe o nome completo.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Limpar" })).toBeInTheDocument();
  });

  it("renderiza NotePanel e SplitSection", () => {
    render(
      <>
        <NotePanel tone="warning">Aviso importante</NotePanel>
        <SplitSection leftTitle="Editor" rightTitle="Lista" left={<span>Formulario</span>} right={<span>Itens</span>} />
      </>,
    );

    expect(screen.getByText("Aviso importante")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Editor" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Lista" })).toBeInTheDocument();
    expect(screen.getByText("Formulario")).toBeInTheDocument();
    expect(screen.getByText("Itens")).toBeInTheDocument();
  });
});
