/**
 * @file tests/ui/eventMessageEditor.test.jsx
 * @summary Testa o editor de mensagens de evento.
 * @responsibility Filtragem de tipos, aplicacao de modelo, agendamento e payload do save.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { EventMessageEditorScreen } from "../../frontend/src/screens/EventMessageEditorScreen.jsx";

const presenca = {
  id: 1,
  type: "presenca",
  title: "Presenca Maio",
  closing: "2026-05-18T18:00",
};

const escala = {
  id: 2,
  type: "escala_organ",
  title: "Escala Maio",
  closing: "2026-05-18T18:00",
};

const event = {
  id: 10,
  title: "Evento Maio",
  date: "2026-05-20",
  formIds: [1, 2],
};

const baseMessagingConfig = { whatsappGroupName: "Irmandade", publicBaseUrl: "https://app.example.com", autoDispatchEnabled: true };

const baseProps = {
  event,
  messageTemplates: [],
  personPresets: [],
  people: [],
  membersConfig: { phoneColumn: "C" },
  messagingConfig: baseMessagingConfig,
};

describe("EventMessageEditorScreen", () => {
  it("filtra tipos pelos forms do evento e usa o primeiro como padrao", () => {
    render(<EventMessageEditorScreen {...baseProps} eventForms={[presenca]} onSave={vi.fn()} onCancel={vi.fn()} />);

    const typeSelect = screen.getByLabelText("Tipo da mensagem");
    const options = Array.from(typeSelect.querySelectorAll("option")).map(opt => opt.value);
    expect(options).toEqual(["new_scale", "fill_reminder"]);
    expect(options).not.toContain("open_slots");
  });

  it("mostra mensagem de fallback quando evento nao tem form elegivel", () => {
    render(<EventMessageEditorScreen {...baseProps} eventForms={[]} onSave={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByText(/Vincule um formulário antes de criar mensagens/)).toBeInTheDocument();
  });

  it("aplica corpo do modelo selecionado", () => {
    const templates = [
      { id: 5, type: "new_scale", name: "Padrao", body: "Anuncio: {{event.title}}" },
    ];
    render(<EventMessageEditorScreen {...baseProps} eventForms={[presenca]} messageTemplates={templates} onSave={vi.fn()} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/Modelo \(opcional\)/), { target: { value: "5" } });

    expect(screen.getByDisplayValue("Anuncio: {{event.title}}")).toBeInTheDocument();
  });

  it("salva tipo 1 com payload minimo correto", async () => {
    const onSave = vi.fn(async () => ({ id: 99 }));
    const onCancel = vi.fn();
    render(<EventMessageEditorScreen {...baseProps} eventForms={[presenca]} onSave={onSave} onCancel={onCancel} />);

    fireEvent.change(screen.getByRole("textbox", { name: /Corpo/ }), { target: { value: "Bom dia!" } });
    fireEvent.click(screen.getByRole("button", { name: /Criar mensagem/ }));

    await waitFor(() => expect(onSave).toHaveBeenCalledTimes(1));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      type: "new_scale",
      body: "Bom dia!",
      config: {},
      autoDispatchEnabled: true,
    }));
  });

  it("oferece janelas fixas no tipo 2 e envia as janelas ao salvar", async () => {
    const onSave = vi.fn(async () => ({ id: 1 }));
    render(<EventMessageEditorScreen {...baseProps} eventForms={[presenca]} onSave={onSave} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Tipo da mensagem"), { target: { value: "fill_reminder" } });
    fireEvent.change(screen.getByRole("textbox", { name: /Corpo/ }), { target: { value: "Lembrete" } });

    expect(screen.getByRole("checkbox", { name: /Manhã do fechamento/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: /Manhã do fechamento/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /12h antes/ }));

    fireEvent.click(screen.getByRole("button", { name: /Criar mensagem/ }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      type: "fill_reminder",
      config: expect.objectContaining({
        formId: 1,
        recipients: { mode: "auto", graus: [] },
        windowOptions: ["morning_of_closing", "12h_before"],
      }),
    }));
  });

  it("avisa quando tipo DM nao tem coluna de telefone configurada", () => {
    render(
      <EventMessageEditorScreen
        {...baseProps}
        eventForms={[presenca]}
        membersConfig={{ phoneColumn: "" }}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Tipo da mensagem"), { target: { value: "fill_reminder" } });

    expect(screen.getByText(/Coluna de telefone não configurada/)).toBeInTheDocument();
  });

  it("usa preset de pessoas no tipo 2 quando selecionado", async () => {
    const onSave = vi.fn(async () => ({ id: 1 }));
    render(
      <EventMessageEditorScreen
        {...baseProps}
        eventForms={[presenca]}
        personPresets={[{ id: 7, name: "Coords", personKeys: ["1", "2"] }]}
        onSave={onSave}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Tipo da mensagem"), { target: { value: "fill_reminder" } });
    fireEvent.change(screen.getByRole("textbox", { name: /Corpo/ }), { target: { value: "Lembrete" } });
    fireEvent.click(screen.getByLabelText("Usar preset de pessoas"));
    fireEvent.change(screen.getByRole("combobox", { name: "" }), { target: { value: "7" } });
    fireEvent.click(screen.getByRole("button", { name: /Criar mensagem/ }));

    await waitFor(() => expect(onSave).toHaveBeenCalled());
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      config: expect.objectContaining({ recipients: { mode: "preset", presetId: 7, graus: [] } }),
    }));
  });
});
