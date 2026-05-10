/**
 * @file tests/ui/eventsScreen.test.jsx
 * @summary Testes da tela administrativa de eventos.
 * @responsibility Cobrir vinculo de formularios, publicacao manual e mensagem inicial.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { EventsScreen } from "../../frontend/src/screens/EventsScreen.jsx";

const forms = [
  {
    id: 1,
    slug: "presenca-maio",
    type: "presenca",
    status: "aberto",
    title: "Formulario tecnico de presenca",
    date: "2026-05-20",
    labels: [],
  },
  {
    id: 2,
    slug: "escala-maio",
    type: "escala_organ",
    status: "rascunho",
    title: "Formulario tecnico de escala",
    date: "2026-05-20",
    labels: [],
  },
];

describe("EventsScreen", () => {
  it("salva evento com abertura, fechamento, descricao e formularios vinculados", async () => {
    const onSaveEvent = vi.fn(async payload => ({ ...payload, id: 10, status: "pronto", publishedAt: null }));

    render(
      <EventsScreen
        events={[]}
        forms={forms}
        onSaveEvent={onSaveEvent}
        onPublishEvent={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Nome do evento"), { target: { value: "Evento Maio" } });
    fireEvent.change(screen.getByLabelText("Data"), { target: { value: "2026-05-20" } });
    fireEvent.change(screen.getByLabelText("Abertura"), { target: { value: "2026-05-10T08:00" } });
    fireEvent.change(screen.getByLabelText("Fechamento"), { target: { value: "2026-05-18T18:00" } });
    fireEvent.change(screen.getByLabelText("Descricao"), { target: { value: "Organizacao da reuniao" } });
    fireEvent.click(screen.getByLabelText(/Formulario tecnico de presenca/i));
    fireEvent.click(screen.getByLabelText(/Formulario tecnico de escala/i));
    fireEvent.click(screen.getByRole("button", { name: "Salvar evento" }));

    await waitFor(() => expect(onSaveEvent).toHaveBeenCalledTimes(1));
    expect(onSaveEvent).toHaveBeenCalledWith(expect.objectContaining({
      title: "Evento Maio",
      date: "2026-05-20",
      opening: "2026-05-10T08:00",
      closing: "2026-05-18T18:00",
      description: "Organizacao da reuniao",
      formIds: [1, 2],
    }));
  });

  it("usa nomes padronizados na mensagem de divulgacao", () => {
    render(
      <EventsScreen
        events={[]}
        forms={forms}
        onSaveEvent={vi.fn()}
        onPublishEvent={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Nome do evento"), { target: { value: "Evento Maio" } });
    fireEvent.change(screen.getByLabelText("Data"), { target: { value: "2026-05-20" } });
    fireEvent.click(screen.getByLabelText(/Formulario tecnico de presenca/i));
    fireEvent.click(screen.getByLabelText(/Formulario tecnico de escala/i));

    const message = screen.getByDisplayValue(/Evento: Evento Maio/i);
    expect(message.value).toContain("Presenca do nucleo");
    expect(message.value).toContain("Escala da organizacao");
    expect(message.value).toContain("#/eventos/Evento%20Maio/1");
    expect(message.value).toContain("#/eventos/Evento%20Maio/2");
    expect(message.value).not.toContain("- Formulario tecnico de presenca:");
  });

  it("lista evento com nome e data e publica somente depois de salvo", async () => {
    const onPublishEvent = vi.fn(async id => ({
      id,
      title: "Evento Maio",
      date: "2026-05-20",
      opening: "2026-05-10T08:00",
      closing: "2026-05-18T18:00",
      status: "publicado",
      formIds: [1],
      publishedAt: "2026-05-10T12:00:00.000Z",
    }));

    render(
      <EventsScreen
        events={[{
          id: 10,
          title: "Evento Maio",
          date: "2026-05-20",
          opening: "2026-05-10T08:00",
          closing: "2026-05-18T18:00",
          status: "pronto",
          formIds: [1],
          publishedAt: null,
        }]}
        forms={forms}
        onSaveEvent={vi.fn()}
        onPublishEvent={onPublishEvent}
        onNavigate={vi.fn()}
      />,
    );

    expect(screen.getByText(/Evento Maio - 20\/05\/2026/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Publicar" }));

    await waitFor(() => expect(onPublishEvent).toHaveBeenCalledWith(10));
    expect(await screen.findByText("Evento publicado. A mensagem ja pode ser copiada.")).toBeInTheDocument();
  });
});
