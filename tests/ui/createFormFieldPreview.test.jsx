import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CreateFormFieldPreview } from "../../frontend/src/components/CreateFormFieldPreview.jsx";

describe("CreateFormFieldPreview", () => {
  it("mostra placeholder da base de pessoas", () => {
    render(
      <CreateFormFieldPreview
        fieldLabel="Nome"
        fieldType="person_select"
        required
        people={[{ name: "Maria" }]}
      />,
    );

    expect(screen.getByText("Prévia do campo")).toBeInTheDocument();
    expect(screen.getByText("Nome")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Selecione uma pessoa...")).toBeDisabled();
  });

  it("mostra grade quando o tipo e grid", () => {
    render(
      <CreateFormFieldPreview
        fieldLabel="Avaliacao"
        fieldType="grid"
        gridRows={["Audio", ""]}
        gridCols={["Bom", ""]}
      />,
    );

    expect(screen.getByText("Avaliacao")).toBeInTheDocument();
    expect(screen.getByText("Audio")).toBeInTheDocument();
    expect(screen.getByText("Bom")).toBeInTheDocument();
  });
});
