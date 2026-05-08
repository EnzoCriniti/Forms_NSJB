/**
 * @file tests/ui/authPanel.test.jsx
 * @summary Testes de UI do painel de autenticacao.
 * @responsibility Garantir mensagens padronizadas de login no feedback visual.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AuthPanel } from "../../src/features/auth/AuthPanel.jsx";

describe("AuthPanel", () => {
  it("mostra erro padronizado quando o login falha", async () => {
    const onLogin = vi.fn().mockRejectedValue({ status: 401, code: "AUTH_INVALID_CREDENTIALS", message: "Usuario ou senha invalidos." });

    render(
      <AuthPanel
        user={null}
        onLogin={onLogin}
        onLogout={vi.fn()}
        theme="light"
        fontScale={1}
        onIncreaseTextSize={vi.fn()}
        onDecreaseTextSize={vi.fn()}
        onToggleTheme={vi.fn()}
        onOpenSettings={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Usuario"), { target: { value: "admin" } });
    fireEvent.change(screen.getByPlaceholderText("Senha"), { target: { value: "errada" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Usuário ou senha inválidos.");
    expect(alert.className).toContain("ui-feedback--fixed");
    await waitFor(() => expect(onLogin).toHaveBeenCalledWith("admin", "errada"));
  });

  it("mostra erro padronizado quando outro admin ja esta conectado", async () => {
    const onLogin = vi.fn().mockRejectedValue({
      status: 409,
      code: "AUTH_ADMIN_SESSION_ACTIVE",
      message: "Ja existe um administrador conectado em outro dispositivo. Aguarde o logout ou o timeout de inatividade.",
    });

    render(
      <AuthPanel
        user={null}
        onLogin={onLogin}
        onLogout={vi.fn()}
        theme="light"
        fontScale={1}
        onIncreaseTextSize={vi.fn()}
        onDecreaseTextSize={vi.fn()}
        onToggleTheme={vi.fn()}
        onOpenSettings={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Usuario"), { target: { value: "admin" } });
    fireEvent.change(screen.getByPlaceholderText("Senha"), { target: { value: "admin123" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Já existe um administrador conectado em outro dispositivo. Aguarde o logout ou o timeout de inatividade.");
  });
});
