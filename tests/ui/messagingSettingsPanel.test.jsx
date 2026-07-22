/**
 * @file tests/ui/messagingSettingsPanel.test.jsx
 * @summary Teste do painel administrativo de mensagens.
 * @responsibility Garantir que a composicao dos blocos continue visivel e navegavel.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MessagingSettingsPanel } from "../../frontend/src/features/admin/MessagingSettingsPanel.jsx";
import { MessagingSettingsScreen } from "../../frontend/src/screens/MessagingSettingsScreen.jsx";

const baseProps = {
  messagingConfig: { whatsappGroupName: "Grupo", autoDispatchEnabled: true, publicBaseUrl: "https://app.example.com" },
  messageTemplates: [{ id: 1, name: "Aviso", type: "new_scale", body: "Oi" }],
  personPresets: [{ id: 1, name: "Coord", personKeys: ["1"] }],
  people: [{ id: 1, name: "Maria", grau: "QM" }],
  onSaveMessagingConfig: vi.fn(),
  onSaveMessageTemplate: vi.fn(),
  onDeleteMessageTemplate: vi.fn(),
  onSavePersonPreset: vi.fn(),
  onDeletePersonPreset: vi.fn(),
};

describe("MessagingSettingsPanel", () => {
  it("renderiza configuracao, modelos e presets", () => {
    render(<MessagingSettingsPanel {...baseProps} />);

    expect(screen.getByText("Configuração global")).toBeInTheDocument();
    expect(screen.getByText("Modelos existentes")).toBeInTheDocument();
    expect(screen.getByText("Presets existentes")).toBeInTheDocument();
  });

  it("renderiza o painel na tela dedicada", () => {
    render(<MessagingSettingsScreen {...baseProps} onNavigate={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Mensagens" })).toBeInTheDocument();
    expect(screen.getByText("Gerencie a configuracao global, os modelos e os presets de destinatarios")).toBeInTheDocument();
    expect(screen.getByText("Modelos existentes")).toBeInTheDocument();
  });
});
