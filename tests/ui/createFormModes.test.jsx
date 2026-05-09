import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CreateFormScreen } from "../../frontend/src/screens/CreateFormScreen.jsx";

const baseProps = {
  onNavigate: vi.fn(),
  people: [{ name: "Maria", grau: "QS" }],
  membersConfig: { sheetUrl: "https://docs.google.com/spreadsheets/d/demo" },
  externalBases: [],
  labels: [],
  presets: [],
  fieldCatalog: [],
  scaleTaskCatalog: [],
  onSavePreset: vi.fn(),
  onSaveForm: vi.fn(),
};

describe("CreateFormScreen form modes", () => {
  it("destaca o resumo do modo nucleo por padrao", () => {
    render(<CreateFormScreen {...baseProps} />);

    expect(screen.getByText("Modo ativo: Presenca do nucleo")).toBeInTheDocument();
    expect(screen.getAllByText("Base central ativa").length).toBeGreaterThan(0);
    expect(screen.getByText("Nome da base central incluso")).toBeInTheDocument();
    expect(screen.getByText("1 campo(s) ligado(s) a base central")).toBeInTheDocument();
  });

  it("atualiza o resumo ao trocar para formulario geral", () => {
    render(<CreateFormScreen {...baseProps} />);

    fireEvent.click(screen.getByRole("button", { name: /Formulario geral/i }));

    expect(screen.getByText("Modo ativo: Formulario geral")).toBeInTheDocument();
    expect(screen.getAllByText("Fluxo livre").length).toBeGreaterThan(0);
    expect(screen.getByText("Base central desativada neste formulario")).toBeInTheDocument();
    expect(screen.getByText("Campos livres sem vinculo central")).toBeInTheDocument();
    expect(screen.getByRole("spinbutton")).toBeDisabled();
  });

  it("remove o seletor por base local no formulario geral", () => {
    render(<CreateFormScreen {...baseProps} />);

    fireEvent.click(screen.getByRole("button", { name: /Formulario geral/i }));
    fireEvent.click(screen.getByRole("button", { name: /Adicionar Campo/i }));

    const typeSelect = screen.getByDisplayValue("Sim / Nao");
    expect(screen.queryByRole("option", { name: "Seletor por base" })).not.toBeInTheDocument();
    expect(typeSelect).toBeInTheDocument();
    expect(screen.getByText("No formulario geral, campos locais nao usam a base central de socios.")).toBeInTheDocument();
  });

  it("filtra a biblioteca no formulario geral para manter apenas bases externas", () => {
    render(
      <CreateFormScreen
        {...baseProps}
        fieldCatalog={[
          {
            id: 10,
            key: "nome_socio",
            name: "Nome de socio",
            type: "person_select",
            category: "presenca",
            defaultLabel: "Nome",
            selectionSource: { kind: "members" },
            active: true,
          },
          {
            id: 11,
            key: "congregacao",
            name: "Congregacao",
            type: "person_select",
            category: "presenca",
            defaultLabel: "Congregacao",
            selectionSource: { kind: "external_base", externalBaseId: 7 },
            active: true,
          },
          {
            id: 12,
            key: "vai_jantar",
            name: "Vai ao jantar",
            type: "yes_no",
            category: "presenca",
            defaultLabel: "Vai ao jantar?",
            active: true,
          },
        ]}
        externalBases={[{ id: 7, name: "Congregacoes", active: true, items: [] }]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Formulario geral/i }));
    fireEvent.click(screen.getByRole("button", { name: /Adicionar Campo/i }));
    fireEvent.click(screen.getByRole("button", { name: "Da biblioteca" }));

    expect(screen.queryByRole("option", { name: "Nome de socio" })).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Congregacao" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Vai ao jantar" })).toBeInTheDocument();
  });
});
