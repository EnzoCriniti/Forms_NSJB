/**
 * @file tests/ui/publicFormScreen.test.jsx
 * @summary Testes de UI do formulario publico.
 * @responsibility Validar renderizacao dinamica e fluxo basico de envio/edicao.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
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

describe("PublicFormScreen", () => {
  it("renderiza campos dinamicos do formulario", () => {
    render(<PublicFormScreen form={form} responses={[]} onSaveResponse={vi.fn()} onBack={vi.fn()} people={people} />);

    expect(screen.getByText("Link publico")).toBeInTheDocument();
    expect(screen.getByText("Formulario Publico - 10/05/2026")).toBeInTheDocument();
    expect(screen.getByText("Data do evento")).toBeInTheDocument();
    expect(screen.getByText("Nome *")).toBeInTheDocument();
    expect(screen.getByText("Vai comparecer? *")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar Resposta" })).toBeInTheDocument();
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
      target: { value: "QS - Maria" },
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
      target: { value: "QS - Maria" },
    });

    expect(screen.getByText("Esta pessoa ja respondeu e novas respostas estao bloqueadas para este formulario.")).toBeInTheDocument();
    expect(screen.queryByText("Resposta ja enviada")).not.toBeInTheDocument();
  });

  it("nao oferece enviar outra resposta apos concluir", async () => {
    const onSaveResponse = vi.fn().mockResolvedValue(undefined);
    render(<PublicFormScreen form={form} responses={[]} onSaveResponse={onSaveResponse} onBack={vi.fn()} people={people} />);

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "QS - Maria" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Sim" }));
    fireEvent.click(screen.getByRole("button", { name: "Enviar Resposta" }));

    expect(await screen.findByText("Resposta enviada!")).toBeInTheDocument();
    expect(screen.queryByText(/outra resposta/i)).not.toBeInTheDocument();
  });

  it("bloqueia envio quando campos obrigatorios nao foram preenchidos", () => {
    const onSaveResponse = vi.fn();
    render(<PublicFormScreen form={form} responses={[]} onSaveResponse={onSaveResponse} onBack={vi.fn()} people={people} />);

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "QS - Maria" },
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
