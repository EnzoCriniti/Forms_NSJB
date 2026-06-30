/**
 * @file tests/ui/closedPublicScreen.test.jsx
 * @summary Testes da tela publica de formulario fechado.
 * @responsibility Cobrir mensagem padrao, texto customizado, fechamento e topo apos extracao de publicUi.jsx.
 */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ClosedPublicScreen } from "../../frontend/src/components/ClosedPublicScreen.jsx";

const form = {
  id: 1,
  title: "Formulario Publico",
  date: "2026-05-10",
  type: "presenca",
  closing: "2026-05-12T19:30",
};

describe("ClosedPublicScreen", () => {
  it("renderiza topo, titulo padrao, mensagem padrao e fechamento", () => {
    render(<ClosedPublicScreen form={form} />);

    expect(screen.getByRole("heading", { name: "Formulario Publico - 10/05/2026" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Formulário fechado" })).toBeInTheDocument();
    expect(screen.getByText("Este formulário não está mais aceitando respostas.")).toBeInTheDocument();
    expect(screen.getByText("Fechamento: 12/05/2026 19:30")).toBeInTheDocument();
  });

  it("usa titulo customizado e prioriza o texto de fechamento do formulario sobre mensagem generica", () => {
    render(
      <ClosedPublicScreen
        form={{ ...form, closingText: "Encerrado pela secretaria." }}
        title="Inscrições encerradas"
        message="Procure a organização."
      />,
    );

    expect(screen.getByRole("heading", { name: "Inscrições encerradas" })).toBeInTheDocument();
    // texto de fechamento do formulario tem prioridade; a mensagem generica nao aparece
    expect(screen.getByText("Encerrado pela secretaria.")).toBeInTheDocument();
    expect(screen.queryByText("Procure a organização.")).not.toBeInTheDocument();
  });

  it("mostra a mensagem quando ela referencia resultados (link de resultados no fechado)", () => {
    render(
      <ClosedPublicScreen
        form={{ ...form, closingText: "Encerrado pela secretaria." }}
        message="Veja os resultados publicados."
      />,
    );

    expect(screen.getByText("Veja os resultados publicados.")).toBeInTheDocument();
    expect(screen.queryByText("Encerrado pela secretaria.")).not.toBeInTheDocument();
  });

  it("mostra acao externa de resultados quando informada", () => {
    window.location.hash = "";

    render(
      <ClosedPublicScreen
        form={form}
        actionLabel="Ver resultados"
        actionHref="#/formularios/1/resultados"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Ver resultados/i }));

    expect(window.location.hash).toBe("#/formularios/1/resultados");
  });
});
