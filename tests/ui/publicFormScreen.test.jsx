/**
 * @file tests/ui/publicFormScreen.test.jsx
 * @summary Testes de UI do formulario publico.
 * @responsibility Validar renderizacao dinamica e fluxo basico de envio/edicao.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import { PublicFormScreen } from "../../frontend/src/screens/PublicFormScreen.jsx";

const form = {
  id: 1,
  slug: "presenca-teste",
  type: "presenca",
  title: "Formulario Publico",
  date: "2026-05-10",
  description: "Descricao do formulario",
  fieldDefinitions: [
    { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false },
    { id: 2, type: "yes_no", label: "Vai comparecer?", required: true, show: true, total: true },
  ],
};

const people = [
  { name: "Maria", grau: "QS" },
  { name: "Joao", grau: "QM" },
];

afterEach(() => {
  window.localStorage.clear();
  document.documentElement.dataset.theme = "light";
  document.documentElement.style.removeProperty("--app-font-scale");
});

describe("PublicFormScreen", () => {
  it("renderiza campos dinamicos do formulario", () => {
    render(<PublicFormScreen form={form} responses={[]} onSaveResponse={vi.fn()} onBack={vi.fn()} people={people} resultsHref="#/formularios/1/resultados" />);

    expect(screen.getByText("Formulario Publico - 10/05/2026")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Voltar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Resultados" })).toBeInTheDocument();
    expect(screen.getByText("Nome *")).toBeInTheDocument();
    expect(screen.getByText("Vai comparecer? *")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar Resposta" })).toBeInTheDocument();
  });

  it("expõe controles de leitura e persiste as preferencias no navegador", () => {
    render(<PublicFormScreen form={form} responses={[]} onSaveResponse={vi.fn()} onBack={vi.fn()} people={people} resultsHref="#/formularios/1/resultados" />);

    fireEvent.click(screen.getByRole("button", { name: "Aumentar fonte" }));
    expect(document.documentElement.style.getPropertyValue("--app-font-scale")).toBe("1.1");

    fireEvent.click(screen.getByRole("button", { name: "Mudar para modo escuro" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem("nsjb_forms_mvp_theme")).toBe("dark");
  });

  it("abre a rota publica de resultados pelo header", () => {
    window.location.hash = "";
    render(<PublicFormScreen form={form} responses={[]} onSaveResponse={vi.fn()} onBack={vi.fn()} people={people} resultsHref="#/formularios/1/resultados" />);

    fireEvent.click(screen.getByRole("button", { name: "Resultados" }));

    expect(window.location.hash).toBe("#/formularios/1/resultados");
  });

  it("abre modal de edicao quando a pessoa ja respondeu", () => {
    render(
      <PublicFormScreen
        form={form}
        responses={[{ respondentName: "Maria", respondentGrau: "QS", values: { "1": "QS - Maria", "2": "Sim" } }]}
        onSaveResponse={vi.fn()}
        onBack={vi.fn()}
        people={people}
      />,
    );

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Maria" },
    });

    expect(screen.getByRole("heading", { name: /resposta/i })).toBeInTheDocument();
  });

  it("bloqueia a resposta existente quando a opcao de bloqueio esta ativa", () => {
    render(
      <PublicFormScreen
        form={{
          ...form,
          resultsConfig: { blockDuplicatePersonResponses: true },
        }}
        responses={[{ respondentName: "Maria", respondentGrau: "QS", values: { "1": "QS - Maria", "2": "Sim" } }]}
        onSaveResponse={vi.fn()}
        onBack={vi.fn()}
        people={people}
      />,
    );

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Maria" },
    });

    expect(screen.getByText("Esta pessoa ja respondeu e novas respostas estao bloqueadas para este formulario.")).toBeInTheDocument();
    expect(screen.queryByText("Resposta ja enviada")).not.toBeInTheDocument();
  });

  it("nao oferece enviar outra resposta apos concluir", async () => {
    const onSaveResponse = vi.fn().mockResolvedValue(undefined);
    render(<PublicFormScreen form={form} responses={[]} onSaveResponse={onSaveResponse} onBack={vi.fn()} people={people} />);

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Maria" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sim" }));
    fireEvent.click(screen.getByRole("button", { name: "Enviar Resposta" }));

    expect(await screen.findByText("Resposta enviada!")).toBeInTheDocument();
    expect(screen.queryByText(/outra resposta/i)).not.toBeInTheDocument();
  });

  it("mantem campo auxiliar da base sem afetar o respondente principal", async () => {
    const onSaveResponse = vi.fn().mockResolvedValue(undefined);
    render(
      <PublicFormScreen
        form={{
          ...form,
          fieldDefinitions: [
            { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false, memberBinding: { source: "members", role: "primary" } },
            { id: 3, type: "person_select", label: "Acompanhante", required: false, show: true, total: false, memberBinding: { source: "members", role: "secondary" } },
            { id: 2, type: "yes_no", label: "Vai comparecer?", required: true, show: true, total: true },
          ],
        }}
        responses={[]}
        onSaveResponse={onSaveResponse}
        onBack={vi.fn()}
        people={people}
      />,
    );

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "Maria" } });
    fireEvent.change(selects[1], { target: { value: "Joao" } });
    fireEvent.click(screen.getByRole("button", { name: "Sim" }));
    fireEvent.click(screen.getByRole("button", { name: "Enviar Resposta" }));

    expect(onSaveResponse).toHaveBeenCalledWith(expect.objectContaining({
      respondentName: "Maria",
      respondentGrau: "QS",
      values: expect.objectContaining({
        "1": "Maria",
        "3": "Joao",
      }),
    }));
  });

  it("renderiza opcoes de base externa em campo vinculado", async () => {
    const onSaveResponse = vi.fn().mockResolvedValue(undefined);
    render(
      <PublicFormScreen
        form={{
          ...form,
          fieldDefinitions: [
            { id: 1, type: "person_select", label: "Nome", required: true, show: true, total: false, selectionSource: { kind: "members" }, memberBinding: { source: "members", role: "primary" } },
            { id: 3, type: "person_select", label: "Congregacao", required: true, show: true, total: false, selectionSource: { kind: "external_base", externalBaseId: 9 } },
            { id: 2, type: "yes_no", label: "Vai comparecer?", required: true, show: true, total: true },
          ],
        }}
        responses={[]}
        onSaveResponse={onSaveResponse}
        onBack={vi.fn()}
        people={people}
        externalBases={[
          {
            id: 9,
            name: "Congregacoes",
            active: true,
            items: [
              { value: "CENTRAL", label: "Central", active: true },
              { value: "JARDINS", label: "Jardins", active: true },
            ],
          },
        ]}
      />,
    );

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "Maria" } });
    fireEvent.change(selects[1], { target: { value: "JARDINS" } });
    fireEvent.click(screen.getByRole("button", { name: "Sim" }));
    fireEvent.click(screen.getByRole("button", { name: "Enviar Resposta" }));

    expect(onSaveResponse).toHaveBeenCalledWith(expect.objectContaining({
      respondentName: "Maria",
      respondentGrau: "QS",
      values: expect.objectContaining({
        "1": "Maria",
        "3": "JARDINS",
      }),
    }));
  });

  it("bloqueia envio quando campos obrigatorios nao foram preenchidos", () => {
    const onSaveResponse = vi.fn();
    render(<PublicFormScreen form={form} responses={[]} onSaveResponse={onSaveResponse} onBack={vi.fn()} people={people} />);

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "Maria" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar Resposta" }));

    expect(onSaveResponse).not.toHaveBeenCalled();
    expect(screen.queryByText("Resposta enviada!")).not.toBeInTheDocument();
  });

  it("bloqueia envio quando a resposta nao respeita a validacao do campo", () => {
    const onSaveResponse = vi.fn();
    render(
      <PublicFormScreen
        form={{
          id: 2,
          slug: "texto-validado",
          type: "presenca",
          title: "Formulario Validado",
          date: "2026-05-10",
          description: "",
          fieldDefinitions: [
            { id: 10, type: "text", label: "Observacao", required: true, show: true, total: false, validation: { minLength: 3, maxLength: 5 } },
          ],
        }}
        responses={[]}
        onSaveResponse={onSaveResponse}
        onBack={vi.fn()}
        people={people}
      />,
    );

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "ab" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar Resposta" }));

    expect(onSaveResponse).not.toHaveBeenCalled();
    expect(screen.getByText("Observacao precisa ter pelo menos 3 caracteres.")).toBeInTheDocument();
  });
});
