/**
 * @file tests/ui/uiFeedback.test.jsx
 * @summary Testes do feedback compartilhado da UI.
 * @responsibility Cobrir tons, roles e casos sem renderizacao apos extracao de ui.jsx.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FeedbackBanner } from "../../frontend/src/components/uiFeedback";

describe("uiFeedback", () => {
  it("renderiza feedback de sucesso como status", () => {
    render(<FeedbackBanner tone="success" message="Alteracoes salvas." />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Sucesso")).toBeInTheDocument();
    expect(screen.getByText("Alteracoes salvas.")).toBeInTheDocument();
  });

  it("renderiza erro como alerta e respeita titulo customizado", () => {
    render(<FeedbackBanner tone="error" title="Falha no envio" message="Tente novamente." fixed />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("ui-feedback--fixed");
    expect(screen.getByText("Falha no envio")).toBeInTheDocument();
    expect(screen.getByText("Tente novamente.")).toBeInTheDocument();
  });

  it("renderiza aviso dourado como alerta acessivel", () => {
    render(<FeedbackBanner tone="warning" message="Revise a escala." />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Revise a escala.");
    expect(alert).toHaveStyle({ color: "var(--type-scale-text)" });
  });

  it("nao renderiza sem mensagem ou com tone desconhecido", () => {
    const { container, rerender } = render(<FeedbackBanner message="" />);
    expect(container).toBeEmptyDOMElement();

    rerender(<FeedbackBanner tone="custom" message="Mensagem" />);
    expect(container).toBeEmptyDOMElement();
  });
});
