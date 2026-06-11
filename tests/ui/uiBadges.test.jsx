/**
 * @file tests/ui/uiBadges.test.jsx
 * @summary Testes dos badges compartilhados da UI.
 * @responsibility Cobrir labels, status e tipo de formulario apos extracao de ui.jsx.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge, StatusBadge, TypeBadge } from "../../frontend/src/components/uiBadges";

describe("uiBadges", () => {
  it("renderiza label por objeto ou por lista de labels", () => {
    render(
      <>
        <Badge label={{ name: "Urgente", color: "#900" }} />
        <Badge label={2} labels={[{ id: 2, name: "Escala", color: "#090" }]} />
      </>,
    );

    expect(screen.getByText("Urgente")).toBeInTheDocument();
    expect(screen.getByText("Escala")).toBeInTheDocument();
  });

  it("renderiza status conhecido e fallback de rascunho", () => {
    render(
      <>
        <StatusBadge status="publicado" />
        <StatusBadge status="desconhecido" />
      </>,
    );

    expect(screen.getByText("Publicado")).toBeInTheDocument();
    expect(screen.getByText("Rascunho")).toBeInTheDocument();
  });

  it("renderiza tipo de formulario", () => {
    render(
      <>
        <TypeBadge type="escala_organ" />
        <TypeBadge type="presenca" />
      </>,
    );

    expect(screen.getByText("Escala da Organ")).toBeInTheDocument();
    expect(screen.getByText("Presen\u00e7a")).toBeInTheDocument();
  });
});
