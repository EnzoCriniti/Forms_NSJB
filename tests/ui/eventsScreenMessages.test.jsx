/**
 * @file tests/ui/eventsScreenMessages.test.jsx
 * @summary Cobre a aba Mensagens no detalhe do evento.
 * @responsibility Validar elegibilidade, listagem, navegacao e callbacks.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { EventsScreen } from "../../frontend/src/screens/EventsScreen.jsx";

const admin = { role: "admin", name: "Admin" };

const presenca = {
  id: 1,
  slug: "presenca-maio",
  type: "presenca",
  status: "aberto",
  title: "Presenca Maio",
  date: "2026-05-20",
  closing: "2026-05-18T18:00",
  labels: [],
  metrics: { responses: 1, total: 5 },
};

const simples = {
  id: 2,
  slug: "form-simples",
  type: "formulario_simples",
  status: "aberto",
  title: "Form Simples",
  date: "2026-05-20",
  labels: [],
  metrics: { responses: 0, total: 0 },
};

const eventWithEligibleForm = {
  id: 10,
  title: "Evento Maio",
  date: "2026-05-20",
  status: "pronto",
  formIds: [1],
  messages: [
    { id: 100, type: "new_scale", status: "rascunho", body: "Confira em ...", scheduledFor: null, sentAt: null },
    { id: 101, type: "fill_reminder", status: "agendada", body: "Lembrete", scheduledFor: "2026-05-17T07:00:00.000Z", sentAt: null },
  ],
};

const eventWithoutEligibleForm = {
  id: 11,
  title: "Evento Vazio",
  date: "2026-05-21",
  status: "rascunho",
  formIds: [2],
  messages: [],
};

describe("EventsScreen — aba Mensagens", () => {
  it("nao mostra aba quando evento nao tem form elegivel", () => {
    render(
      <EventsScreen
        events={[eventWithoutEligibleForm]}
        forms={[simples]}
        user={admin}
        onSaveEvent={vi.fn()}
        onDeleteEvent={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Evento Vazio - 21/05/2026"));

    expect(screen.getByRole("button", { name: /Formulários/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Mensagens/ })).not.toBeInTheDocument();
  });

  it("mostra aba e lista mensagens com badge quando elegivel", () => {
    render(
      <EventsScreen
        events={[eventWithEligibleForm]}
        forms={[presenca]}
        user={admin}
        onSaveEvent={vi.fn()}
        onDeleteEvent={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Evento Maio - 20/05/2026"));
    fireEvent.click(screen.getByRole("button", { name: /Mensagens \(2\)/ }));

    expect(screen.getByText("Anuncio (grupo)")).toBeInTheDocument();
    expect(screen.getByText("Lembrete de presença")).toBeInTheDocument();
    expect(screen.getByText("Rascunho")).toBeInTheDocument();
    expect(screen.getByText("Agendada")).toBeInTheDocument();
  });

  it("chama onCreateEventMessage ao clicar em Nova mensagem", () => {
    const onCreateEventMessage = vi.fn();
    render(
      <EventsScreen
        events={[eventWithEligibleForm]}
        forms={[presenca]}
        user={admin}
        onSaveEvent={vi.fn()}
        onDeleteEvent={vi.fn()}
        onCreateEventMessage={onCreateEventMessage}
        onNavigate={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Evento Maio - 20/05/2026"));
    fireEvent.click(screen.getByRole("button", { name: /Mensagens/ }));
    fireEvent.click(screen.getByRole("button", { name: "Nova mensagem" }));

    expect(onCreateEventMessage).toHaveBeenCalledWith(eventWithEligibleForm);
  });

  it("chama onOpenEventMessage ao clicar em uma mensagem", () => {
    const onOpenEventMessage = vi.fn();
    render(
      <EventsScreen
        events={[eventWithEligibleForm]}
        forms={[presenca]}
        user={admin}
        onSaveEvent={vi.fn()}
        onDeleteEvent={vi.fn()}
        onOpenEventMessage={onOpenEventMessage}
        onNavigate={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Evento Maio - 20/05/2026"));
    fireEvent.click(screen.getByRole("button", { name: /Mensagens/ }));
    fireEvent.click(screen.getByText("Anuncio (grupo)"));

    expect(onOpenEventMessage).toHaveBeenCalledWith(eventWithEligibleForm, eventWithEligibleForm.messages[0]);
  });

  it("aba mensagens com lista vazia mostra acao de criar quando admin", () => {
    const event = { ...eventWithEligibleForm, messages: [] };
    const onCreateEventMessage = vi.fn();
    render(
      <EventsScreen
        events={[event]}
        forms={[presenca]}
        user={admin}
        onSaveEvent={vi.fn()}
        onDeleteEvent={vi.fn()}
        onCreateEventMessage={onCreateEventMessage}
        onNavigate={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Evento Maio - 20/05/2026"));
    fireEvent.click(screen.getByRole("button", { name: /Mensagens/ }));

    expect(screen.getByText("Nenhuma mensagem cadastrada neste evento.")).toBeInTheDocument();
  });
});
