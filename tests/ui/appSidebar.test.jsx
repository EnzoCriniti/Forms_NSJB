import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AppSidebar } from "../../frontend/src/components/AppSidebar.jsx";

describe("AppSidebar", () => {
  const nav = [
    { key: "dashboard", icon: "chart", label: "Dashboard" },
    { key: "events", icon: "calendar", label: "Eventos" },
    { key: "teams", icon: "users", label: "Equipes" },
  ];

  it("renderiza a navegação, marca o item ativo e navega ao clicar", () => {
    const onNavigate = vi.fn();
    render(<AppSidebar nav={nav} screen="events" onNavigate={onNavigate} />);

    const ativo = screen.getByRole("button", { name: "Eventos" });
    expect(ativo).toHaveAttribute("data-active", "true");
    expect(ativo).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Dashboard" })).toHaveAttribute("data-active", "false");
    expect(screen.getByText(/^v0\.1\.0\+g/)).toHaveAttribute("title", expect.stringContaining("commit"));

    fireEvent.click(screen.getByRole("button", { name: "Equipes" }));
    expect(onNavigate).toHaveBeenCalledWith("teams");
  });

  it("expõe o botão de recolher e dispara o toggle", () => {
    const onToggle = vi.fn();
    const { rerender } = render(<AppSidebar nav={nav} screen="events" onNavigate={vi.fn()} collapsed={false} onToggle={onToggle} />);

    fireEvent.click(screen.getByRole("button", { name: "Recolher menu" }));
    expect(onToggle).toHaveBeenCalledTimes(1);

    rerender(<AppSidebar nav={nav} screen="events" onNavigate={vi.fn()} collapsed onToggle={onToggle} />);
    expect(screen.getByRole("button", { name: "Expandir menu" })).toBeInTheDocument();
  });
});
