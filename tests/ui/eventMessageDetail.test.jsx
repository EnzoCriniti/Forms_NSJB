/**
 * @file tests/ui/eventMessageDetail.test.jsx
 * @summary Testa a tela de detalhe da mensagem.
 * @responsibility Render preview, acao de disparar (com confirmacao) e historico de logs.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventMessageDetailScreen } from "../../frontend/src/screens/EventMessageDetailScreen.jsx";

const event = { id: 10, title: "Evento Maio" };

const message = {
  id: 50,
  eventId: 10,
  type: "fill_reminder",
  status: "rascunho",
  body: "Ola {{person.name}}",
  scheduledFor: null,
  sentAt: null,
  autoDispatchEnabled: true,
  config: { formId: 1 },
};

const previewPayload = {
  preview: {
    kind: "dm",
    groupName: null,
    renderedBody: "Ola Maria",
    formLink: "https://app.example.com/#/formularios/1",
    recipients: [
      { key: "1", name: "Maria", grau: "QS", phone: "5511999990001", waLink: "https://wa.me/5511999990001?text=Ola%20Maria", skipped: false },
      { key: "2", name: "Joao", grau: "QM", phone: "", skipped: true, skipReason: "sem_telefone" },
    ],
  },
};

const detailPayload = {
  message: { ...message, status: "rascunho" },
  logs: [],
};

const jsonResponse = (payload, ok = true) => ({ ok, json: async () => payload });

describe("EventMessageDetailScreen", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mostra preview com destinatarios e link wa.me", async () => {
    const fetchMock = vi.fn(async url => {
      if (url === `/api/events/10/messages/50`) return jsonResponse(detailPayload);
      if (url === `/api/events/10/messages/50/preview`) return jsonResponse(previewPayload);
      return jsonResponse({}, false);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <EventMessageDetailScreen
        event={event}
        message={message}
        onMessageUpdated={vi.fn()}
        onMessageDeleted={vi.fn()}
        onEdit={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    await screen.findByText("Ola Maria");
    expect(screen.getByText("Maria")).toBeInTheDocument();
    expect(screen.getByText(/Joao/)).toBeInTheDocument();
    expect(screen.getAllByText("sem telefone").length).toBeGreaterThan(0);

    const link = screen.getByRole("link", { name: /wa.me/ });
    expect(link).toHaveAttribute("href", "https://wa.me/5511999990001?text=Ola%20Maria");
  });

  it("dispara mensagem apos confirmar, atualiza status e historico", async () => {
    const onMessageUpdated = vi.fn();
    let currentStatus = "rascunho";
    let currentLogs = [];

    const fetchMock = vi.fn(async (url, options = {}) => {
      if (url === `/api/events/10/messages/50` && (!options.method || options.method === "GET")) {
        return jsonResponse({ message: { ...message, status: currentStatus }, logs: currentLogs });
      }
      if (url === `/api/events/10/messages/50/preview`) {
        return jsonResponse(previewPayload);
      }
      if (url === `/api/events/10/messages/50/dispatch` && options.method === "POST") {
        currentStatus = "disparada";
        currentLogs = [{
          id: 1,
          dispatchedAt: "2026-05-17T07:00:00.000Z",
          mode: "manual",
          renderedBody: "Ola Maria",
          dispatcherVersion: "log-only-1",
          status: "logged_only",
          recipients: previewPayload.preview.recipients,
        }];
        return jsonResponse({
          message: { ...message, status: "disparada" },
          dispatch: { status: "logged_only", logId: 1, dispatcherVersion: "log-only-1" },
        });
      }
      return jsonResponse({}, false);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <EventMessageDetailScreen
        event={event}
        message={message}
        onMessageUpdated={onMessageUpdated}
        onMessageDeleted={vi.fn()}
        onEdit={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    await screen.findByText("Ola Maria");

    fireEvent.click(screen.getByRole("button", { name: /Disparar agora/ }));
    fireEvent.click(screen.getByRole("button", { name: "Disparar" }));

    await waitFor(() => expect(onMessageUpdated).toHaveBeenCalled());
    expect(onMessageUpdated.mock.calls[0][0]).toMatchObject({ status: "disparada" });

    await screen.findByText("Disparada");
    await screen.findByText(/log-only-1/);
  });

  it("oferece botao Excluir somente quando status cancelada", async () => {
    const canceledMessage = { ...message, status: "cancelada" };
    const fetchMock = vi.fn(async url => {
      if (url === `/api/events/10/messages/50`) return jsonResponse({ message: canceledMessage, logs: [] });
      if (url === `/api/events/10/messages/50/preview`) return jsonResponse(previewPayload);
      return jsonResponse({}, false);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <EventMessageDetailScreen
        event={event}
        message={canceledMessage}
        onMessageUpdated={vi.fn()}
        onMessageDeleted={vi.fn()}
        onEdit={vi.fn()}
        onBack={vi.fn()}
      />,
    );

    await screen.findByText("Cancelada");
    expect(screen.getByRole("button", { name: /Excluir/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Disparar agora/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Cancelar$/ })).not.toBeInTheDocument();
  });

  it("permite editar mensagem agendada e cancelar com confirmacao", async () => {
    const scheduledMessage = { ...message, status: "agendada", scheduledFor: "2026-05-17T07:00:00.000Z" };
    const onEdit = vi.fn();
    const onMessageUpdated = vi.fn();
    const fetchMock = vi.fn(async (url, options = {}) => {
      if (url === `/api/events/10/messages/50` && (!options.method || options.method === "GET")) {
        return jsonResponse({ message: scheduledMessage, logs: [] });
      }
      if (url === `/api/events/10/messages/50/preview`) return jsonResponse(previewPayload);
      if (url === `/api/events/10/messages/50/cancel` && options.method === "POST") {
        return jsonResponse({ message: { ...scheduledMessage, status: "cancelada" } });
      }
      return jsonResponse({}, false);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <EventMessageDetailScreen
        event={event}
        message={scheduledMessage}
        onMessageUpdated={onMessageUpdated}
        onMessageDeleted={vi.fn()}
        onEdit={onEdit}
        onBack={vi.fn()}
      />,
    );

    await screen.findByText("Agendada");
    fireEvent.click(screen.getByRole("button", { name: /Editar/ }));
    expect(onEdit).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: /^Cancelar$/ }));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar mensagem" }));

    await waitFor(() => expect(onMessageUpdated).toHaveBeenCalledWith(expect.objectContaining({ status: "cancelada" })));
  });
});
