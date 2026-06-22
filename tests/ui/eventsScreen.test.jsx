/**
 * @file tests/ui/eventsScreen.test.jsx
 * @summary Testes da tela administrativa de eventos.
 * @responsibility Cobrir fluxo evento-primeiro e listagem de formularios vinculados.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { EventsScreen } from "../../frontend/src/screens/EventsScreen.jsx";
import { deleteEventMessage } from "../../frontend/src/lib/api.js";

vi.mock("../../frontend/src/lib/api.js", () => ({
  deleteEventMessage: vi.fn(async () => ({})),
}));

const admin = { role: "admin", name: "Admin" };

const forms = [
  {
    id: 1,
    slug: "presenca-maio",
    type: "presenca",
    status: "aberto",
    title: "Presenca Maio",
    date: "2026-05-20",
    closing: "2026-05-18T18:00",
    labels: [],
    fieldDefinitions: [],
    resultsConfig: { formMode: "nucleo" },
    metrics: { responses: 1, total: 5 },
  },
  {
    id: 2,
    slug: "escala-maio",
    type: "escala_organ",
    status: "rascunho",
    title: "Escala Maio",
    date: "2026-05-20",
    closing: "2026-05-18T18:00",
    labels: [],
    metrics: { responses: 0, total: 3 },
  },
];

const events = [
  {
    id: 10,
    title: "Evento Maio",
    date: "2026-05-20",
    opening: "2026-05-10T08:00",
    closing: "2026-05-18T18:00",
    status: "pronto",
    description: "Organizacao da reuniao",
    formIds: [1],
  },
];

const eventsWithMessages = [
  {
    ...events[0],
    messages: [
      { id: 5, type: "fill_reminder", status: "rascunho", body: "Ola pessoal" },
      { id: 6, type: "fill_reminder", status: "disparada", body: "Mensagem enviada" },
    ],
  },
];

describe("EventsScreen", () => {
  it("salva evento com abertura, fechamento e descricao", async () => {
    const onSaveEvent = vi.fn(async payload => ({ ...payload, id: 11, status: "rascunho", formIds: [] }));

    render(
      <EventsScreen
        events={[]}
        forms={forms}
        user={admin}
        onSaveEvent={onSaveEvent}
        onDeleteEvent={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Novo evento" }));
    fireEvent.change(screen.getByLabelText("Nome do evento"), { target: { value: "Evento Junho" } });
    fireEvent.change(screen.getByLabelText("Data"), { target: { value: "2026-06-20" } });
    fireEvent.change(screen.getByLabelText("Abertura"), { target: { value: "2026-06-10T08:00" } });
    fireEvent.change(screen.getByLabelText("Fechamento"), { target: { value: "2026-06-18T18:00" } });
    fireEvent.change(screen.getByLabelText("Descrição"), { target: { value: "Evento operacional" } });
    fireEvent.click(screen.getByRole("button", { name: "Salvar evento" }));

    await waitFor(() => expect(onSaveEvent).toHaveBeenCalledWith(expect.objectContaining({
      title: "Evento Junho",
      date: "2026-06-20",
      opening: "2026-06-10T08:00",
      closing: "2026-06-18T18:00",
      description: "Evento operacional",
      formIds: [],
    })));
  });

  it("abre o evento e lista apenas os formularios vinculados", () => {
    render(
      <EventsScreen
        events={events}
        forms={forms}
        user={admin}
        labels={[]}
        onSaveEvent={vi.fn()}
        onDeleteEvent={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Evento Maio - 20/05/2026"));

    expect(screen.getByText("Presenca Maio")).toBeInTheDocument();
    expect(screen.queryByText("Escala Maio")).not.toBeInTheDocument();
  });

  it("cria formulario a partir do evento selecionado", () => {
    const onCreateFormInEvent = vi.fn();

    render(
      <EventsScreen
        events={events}
        forms={forms}
        user={admin}
        labels={[]}
        onSaveEvent={vi.fn()}
        onDeleteEvent={vi.fn()}
        onCreateFormInEvent={onCreateFormInEvent}
        onNavigate={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Evento Maio - 20/05/2026"));
    fireEvent.click(screen.getByRole("button", { name: "Novo formulário" }));

    expect(onCreateFormInEvent).toHaveBeenCalledWith(events[0]);
  });

  it("permite fixar, editar e excluir eventos pela listagem", async () => {
    const onTogglePinnedEvent = vi.fn();
    const onDeleteEvent = vi.fn(async () => {});

    render(
      <EventsScreen
        events={events}
        forms={forms}
        user={admin}
        pinnedEventIds={[10]}
        onSaveEvent={vi.fn()}
        onDeleteEvent={onDeleteEvent}
        onTogglePinnedEvent={onTogglePinnedEvent}
        onNavigate={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Desfixar evento" }));
    expect(onTogglePinnedEvent).toHaveBeenCalledWith(10);

    fireEvent.click(screen.getByRole("button", { name: "Editar evento" }));
    expect(screen.getByRole("heading", { name: "Editar evento" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
    fireEvent.click(screen.getByRole("button", { name: "Excluir evento" }));
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

    await waitFor(() => expect(onDeleteEvent).toHaveBeenCalledWith(10));
  });

  it("marca graus elegiveis ao salvar o evento", async () => {
    const onSaveEvent = vi.fn(async payload => ({ ...payload, id: 12, status: "rascunho", formIds: [] }));

    render(
      <EventsScreen
        events={[]}
        forms={forms}
        user={admin}
        people={[{ name: "Ana", grau: "QM" }, { name: "Bruno", grau: "CDC" }]}
        onSaveEvent={onSaveEvent}
        onDeleteEvent={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Novo evento" }));
    fireEvent.change(screen.getByLabelText("Nome do evento"), { target: { value: "Evento Grau" } });
    fireEvent.click(screen.getByRole("button", { name: "QM" }));
    fireEvent.click(screen.getByRole("button", { name: "Salvar evento" }));

    await waitFor(() => expect(onSaveEvent).toHaveBeenCalledWith(expect.objectContaining({
      title: "Evento Grau",
      eligibleGraus: ["QM"],
    })));
  });

  it("edita mensagem editavel pela listagem do evento", () => {
    const onEditEventMessage = vi.fn();

    render(
      <EventsScreen
        events={eventsWithMessages}
        forms={forms}
        user={admin}
        labels={[]}
        onSaveEvent={vi.fn()}
        onDeleteEvent={vi.fn()}
        onEditEventMessage={onEditEventMessage}
        onDeleteEventMessage={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Evento Maio - 20/05/2026"));
    fireEvent.click(screen.getByRole("button", { name: "Mensagens (2)" }));

    const editButtons = screen.getAllByRole("button", { name: "Editar mensagem" });
    expect(editButtons).toHaveLength(1);

    fireEvent.click(editButtons[0]);
    expect(onEditEventMessage).toHaveBeenCalledWith(eventsWithMessages[0], eventsWithMessages[0].messages[0]);
  });

  it("exclui mensagem pela listagem do evento", async () => {
    deleteEventMessage.mockClear();
    const onDeleteEventMessage = vi.fn();

    render(
      <EventsScreen
        events={eventsWithMessages}
        forms={forms}
        user={admin}
        labels={[]}
        onSaveEvent={vi.fn()}
        onDeleteEvent={vi.fn()}
        onEditEventMessage={vi.fn()}
        onDeleteEventMessage={onDeleteEventMessage}
        onNavigate={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Evento Maio - 20/05/2026"));
    fireEvent.click(screen.getByRole("button", { name: "Mensagens (2)" }));

    const deleteButtons = screen.getAllByRole("button", { name: "Excluir mensagem" });
    expect(deleteButtons).toHaveLength(2);

    fireEvent.click(deleteButtons[0]);
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

    await waitFor(() => expect(deleteEventMessage).toHaveBeenCalledWith(10, 5));
    await waitFor(() => expect(onDeleteEventMessage).toHaveBeenCalledWith(5));
  });

  it("viewer acessa eventos e formularios sem acoes administrativas", () => {
    render(
      <EventsScreen
        events={events}
        forms={forms}
        user={{ role: "viewer", name: "Viewer" }}
        labels={[]}
        onSaveEvent={vi.fn()}
        onDeleteEvent={vi.fn()}
        onNavigate={vi.fn()}
      />,
    );

    expect(screen.getByText("Evento Maio - 20/05/2026")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Novo evento" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Editar evento" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Excluir evento" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Evento Maio - 20/05/2026"));

    expect(screen.getByText("Presenca Maio")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Novo formulário" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Editar formulário" })).not.toBeInTheDocument();
  });
});
