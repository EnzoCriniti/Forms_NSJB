import React from "react";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AppHeader } from "../../frontend/src/components/AppHeader.jsx";

vi.mock("../../frontend/src/features/auth/AuthPanel.jsx", () => ({
  AuthPanel: () => <div data-testid="auth-panel" />,
}));

describe("AppHeader", () => {
  it("abre o menu lateral no mobile e navega a partir dele", () => {
    const onNavigate = vi.fn();
    const onOpenSettings = vi.fn();

    render(
      <AppHeader
        nav={[
          { key: "dashboard", icon: "chart", label: "Dashboard" },
          { key: "list", icon: "list", label: "Formulários" },
        ]}
        screen="list"
        currentUser={{ id: 1, name: "Admin", role: "admin" }}
        theme="light"
        fontScale={1}
        onNavigate={onNavigate}
        onIncreaseFontScale={vi.fn()}
        onDecreaseFontScale={vi.fn()}
        onToggleTheme={vi.fn()}
        onOpenSettings={onOpenSettings}
        onLogin={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Diminuir fonte" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aumentar fonte" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));

    expect(screen.getByRole("dialog", { name: "Menu principal" })).toBeInTheDocument();
    expect(screen.getByText("Conta")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Configuracoes" }));

    expect(onOpenSettings).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));
    fireEvent.click(within(screen.getByRole("dialog", { name: "Menu principal" })).getByRole("button", { name: "Formulários" }));

    expect(onNavigate).toHaveBeenCalledWith("list");
  });

  it("mantem o hamburger disponivel para conta sem navegacao principal", () => {
    render(
      <AppHeader
        nav={[]}
        screen="list"
        currentUser={{ id: 2, name: "Viewer", role: "viewer" }}
        theme="light"
        fontScale={1}
        onNavigate={vi.fn()}
        onIncreaseFontScale={vi.fn()}
        onDecreaseFontScale={vi.fn()}
        onToggleTheme={vi.fn()}
        onOpenSettings={vi.fn()}
        onLogin={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Abrir menu" }));

    expect(screen.getByRole("dialog", { name: "Menu principal" })).toBeInTheDocument();
    expect(screen.getByText("Conta")).toBeInTheDocument();
    expect(screen.getByText("Viewer")).toBeInTheDocument();
  });

  it("exibe voltar na barra mobile quando esta em tela de detalhe", () => {
    const onNavigate = vi.fn();

    render(
      <AppHeader
        nav={[]}
        screen="results"
        currentUser={{ id: 3, name: "Editor", role: "admin" }}
        theme="light"
        fontScale={1}
        onNavigate={onNavigate}
        onIncreaseFontScale={vi.fn()}
        onDecreaseFontScale={vi.fn()}
        onToggleTheme={vi.fn()}
        onOpenSettings={vi.fn()}
        onLogin={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Voltar para listagem" }));

    expect(onNavigate).toHaveBeenCalledWith("list");

    onNavigate.mockClear();

    render(
      <AppHeader
        nav={[]}
        screen="respond"
        currentUser={{ id: 3, name: "Editor", role: "admin" }}
        theme="light"
        fontScale={1}
        onNavigate={onNavigate}
        onIncreaseFontScale={vi.fn()}
        onDecreaseFontScale={vi.fn()}
        onToggleTheme={vi.fn()}
        onOpenSettings={vi.fn()}
        onLogin={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Voltar para listagem" })[1]);

    expect(onNavigate).toHaveBeenCalledWith("list");
  });
});
