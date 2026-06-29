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

const renderNewForm = (props = {}) => {
  const result = render(<CreateFormScreen {...baseProps} {...props} />);
  fireEvent.click(screen.getByRole("button", { name: "Continuar para o editor" }));
  return result;
};

describe("CreateFormScreen form modes", () => {
  it("destaca o resumo do modo nucleo por padrao", () => {
    renderNewForm();

    expect(screen.getByText("Modo ativo: Com base de socios")).toBeInTheDocument();
    expect(screen.getAllByText("Base central ativa").length).toBeGreaterThan(0);
    expect(screen.getByText("Campo principal da base central")).toBeInTheDocument();
    expect(screen.getByText("1 campo(s) ligado(s) à base central")).toBeInTheDocument();
  });

  it("atualiza o resumo ao trocar para formulario geral", () => {
    renderNewForm();

    fireEvent.click(screen.getByRole("button", { name: /Formulário geral/i }));

    expect(screen.getByText("Modo ativo: Formulário geral")).toBeInTheDocument();
    expect(screen.getAllByText("Fluxo livre").length).toBeGreaterThan(0);
    expect(screen.getByText("Base central desativada neste formulário")).toBeInTheDocument();
    expect(screen.queryByText("Total esperado")).not.toBeInTheDocument();
  });

  it("remove o seletor por base local no formulario geral", () => {
    renderNewForm();

    fireEvent.click(screen.getByRole("button", { name: /Formulário geral/i }));
    fireEvent.click(screen.getByRole("button", { name: /Adicionar Campo/i }));

    const typeSelect = screen.getByDisplayValue("Sim / Não");
    expect(screen.queryByRole("option", { name: "Seletor por base" })).not.toBeInTheDocument();
    expect(typeSelect).toBeInTheDocument();
    expect(screen.getByText("No formulário geral, campos locais não usam a base central de sócios.")).toBeInTheDocument();
  });

  it("filtra a biblioteca no formulario geral para manter apenas bases externas", () => {
    renderNewForm({
      fieldCatalog: [
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
      ],
      externalBases: [{ id: 7, name: "Congregacoes", active: true, items: [] }],
    });

    fireEvent.click(screen.getByRole("button", { name: /Formulário geral/i }));
    fireEvent.click(screen.getByRole("button", { name: /Adicionar Campo/i }));
    fireEvent.click(screen.getByRole("button", { name: "Da biblioteca" }));

    expect(screen.queryByRole("option", { name: "Nome de socio" })).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Congregacao" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Vai ao jantar" })).toBeInTheDocument();
  });

  it("mostra o editor de campo em etapas mais curtas", () => {
    renderNewForm();

    fireEvent.click(screen.getByRole("button", { name: /Adicionar Campo/i }));

    expect(screen.getByText("1. Origem do campo")).toBeInTheDocument();
    expect(screen.getByText("2. Definição principal")).toBeInTheDocument();
    expect(screen.getByText("3. Ajustes extras")).toBeInTheDocument();
    expect(screen.getByText("Campo local deste formulário")).toBeInTheDocument();
    expect(screen.getByText("Esse campo nao precisa de configuracao extra. Se o texto ja estiver certo, ele pode ser adicionado agora.")).toBeInTheDocument();
  });

  it("nao oferece outro seletor da base central quando o nome principal ja existe", () => {
    renderNewForm({
      fieldCatalog: [
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
      ],
      externalBases: [{ id: 7, name: "Congregacoes", active: true, items: [] }],
    });

    fireEvent.click(screen.getByRole("button", { name: /Adicionar Campo/i }));

    expect(screen.queryByRole("option", { name: "Seletor por base" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Da biblioteca" }));

    expect(screen.queryByRole("option", { name: "Nome de socio" })).not.toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Congregacao" })).toBeInTheDocument();
  });

  it("filtra templates de presenca pelo modo atual", () => {
    renderNewForm({
      presets: [
          {
            id: 1,
            type: "presenca",
            name: "Template Nucleo",
            fieldDefinitions: [{ id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false }],
            resultsConfig: { formMode: "nucleo" },
          },
          {
            id: 2,
            type: "presenca",
            name: "Template Geral",
            fieldDefinitions: [{ id: 2, type: "text", label: "Nome livre", required: true, show: true, total: false }],
            resultsConfig: { formMode: "geral" },
          },
      ],
    });

    expect(screen.getByRole("option", { name: "Template Nucleo (Presença)" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Template Geral (Presença)" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Formulário geral/i }));

    expect(screen.getByRole("option", { name: "Template Geral (Presença)" })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Template Nucleo (Presença)" })).not.toBeInTheDocument();
  });
});
