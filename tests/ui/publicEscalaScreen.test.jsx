/**
 * @file tests/ui/publicEscalaScreen.test.jsx
 * @summary Testes da tela publica de escala.
 * @responsibility Validar preenchimento e tratamento amigavel de conflito.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PublicEscalaScreen } from "../../frontend/src/screens/PublicEscalaScreen.jsx";

const form = {
  id: 10,
  slug: "escala-publica",
  type: "escala_organ",
  status: "aberto",
  title: "Escala Publica",
  closing: "2026-05-05T20:00",
  labels: [],
};

const sections = [
  {
    title: "Sala",
    color: "#ffcdd2",
    slots: [
      { role: "Responsavel", person: "" },
      { role: "Auxiliar", person: "" },
    ],
  },
];

describe("PublicEscalaScreen", () => {
  it("mostra mensagem amigavel quando o backend rejeita conflito", async () => {
    const conflict = Object.assign(new Error("Esta vaga ja foi preenchida por outra pessoa. Recarregue a pagina e tente novamente."), {
      status: 409,
      code: "ESCALA_CONFLICT",
    });
    const onClaimSlot = vi.fn().mockRejectedValue(conflict);

    render(
      <PublicEscalaScreen
        onBack={vi.fn()}
        form={form}
        people={[{ name: "Maria" }, { name: "Joao" }]}
        sections={sections}
        onClaimSlot={onClaimSlot}
      />,
    );

    const slotButton = screen.getAllByRole("button").find(button => button.textContent.includes("Pendente"));
    fireEvent.click(slotButton);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Maria" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    await waitFor(() => expect(onClaimSlot).toHaveBeenCalledWith(0, 0, "Maria"));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/recarregue a pagina/i));
  });

  it("bloqueia quando a pessoa ja atingiu o limite configurado na escala", async () => {
    const onClaimSlot = vi.fn();

    render(
      <PublicEscalaScreen
        onBack={vi.fn()}
        form={{
          ...form,
          resultsConfig: { maxAssignmentsPerPerson: 2 },
        }}
        people={[{ name: "Maria" }]}
        sections={[
          {
            title: "Sala",
            color: "#ffcdd2",
            slots: [
              { role: "Responsavel", person: "Maria" },
              { role: "Auxiliar", person: "Maria" },
              { role: "Apoio", person: "" },
            ],
          },
        ]}
        onClaimSlot={onClaimSlot}
      />,
    );

    const slotButton = screen.getAllByRole("button").find(button => button.textContent.includes("Pendente"));
    fireEvent.click(slotButton);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Maria" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));

    await waitFor(() => expect(onClaimSlot).not.toHaveBeenCalled());
    expect(screen.getByRole("alert")).toHaveTextContent(/limite de vagas/i);
  });

  it("deixa vagas pendentes bloqueadas quando esta em modo consulta", () => {
    const onClaimSlot = vi.fn();

    render(
      <PublicEscalaScreen
        onBack={vi.fn()}
        form={form}
        people={[{ name: "Maria" }]}
        sections={sections}
        onClaimSlot={onClaimSlot}
        readOnly
        readOnlyMessage="Evento encerrado. A escala esta disponivel apenas para consulta."
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(/consulta/i);
    const slotButton = screen.getAllByRole("button").find(button => button.textContent.includes("Pendente"));
    expect(slotButton).toBeDisabled();

    fireEvent.click(slotButton);

    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(onClaimSlot).not.toHaveBeenCalled();
  });
});
