/**
 * @file tests/ui/appGuide.test.jsx
 * @summary Cobertura da busca e navegacao do Guia da Aplicacao.
 */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppGuideScreen } from "../../frontend/src/screens/AppGuideScreen.jsx";
import { GUIDE_ARTICLES, rankGuideArticles } from "../../frontend/src/screens/appGuideContent.js";

describe("appGuide search", () => {
  it("encontra a planilha da Organ mesmo com termo aproximado", () => {
    const results = rankGuideArticles(GUIDE_ARTICLES, "planulha da organ");
    expect(results[0].article.id).toBe("planilha-organ");
  });

  it("relaciona sinonimos aos assuntos documentados", () => {
    const results = rankGuideArticles(GUIDE_ARTICLES, "relatorio de vagas");
    expect(results.slice(0, 3).some(result => result.article.id === "planilha-organ")).toBe(true);
  });

  it("documenta a arquitetura em camadas", () => {
    const architecture = GUIDE_ARTICLES.find(article => article.id === "arquitetura");
    expect(architecture.architectureLayers.map(layer => layer.name)).toEqual([
      "Interface",
      "Controllers e dominio",
      "API",
      "Servicos",
      "Persistencia",
      "Execucao",
    ]);
  });
});

describe("AppGuideScreen", () => {
  it("navega pelo indice e abre um resultado da busca", () => {
    render(<AppGuideScreen />);
    expect(screen.getByRole("heading", { name: "Visao geral da aplicacao" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Planilha da Organ" }));
    expect(screen.getByRole("heading", { name: "Planilha da Organ" })).toBeInTheDocument();
    expect(screen.getByText(/visao operacional da escala/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Buscar no guia"), { target: { value: "lembrete whatsapp" } });
    fireEvent.click(screen.getByRole("button", { name: /Mensagens e lembretes/i }));
    expect(screen.getByRole("heading", { name: "Mensagens e lembretes" })).toBeInTheDocument();
  });
});
