/**
 * @file tests/ui/publicReadingToolbar.test.jsx
 * @summary Testes da barra publica de leitura.
 * @responsibility Cobrir controles visuais, callbacks controlados e navegacao de voltar.
 */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PublicReadingToolbar } from "../../frontend/src/components/PublicReadingToolbar.jsx";

describe("PublicReadingToolbar", () => {
  afterEach(() => {
    window.location.hash = "";
    window.localStorage.clear();
    document.documentElement.dataset.theme = "";
    document.documentElement.style.removeProperty("--app-font-scale");
  });

  it("renderiza escala e usa callbacks controlados", () => {
    const onToggleTheme = vi.fn();
    const onIncreaseFontScale = vi.fn();
    const onDecreaseFontScale = vi.fn();

    render(
      <PublicReadingToolbar
        theme="dark"
        fontScale={1.2}
        onToggleTheme={onToggleTheme}
        onIncreaseFontScale={onIncreaseFontScale}
        onDecreaseFontScale={onDecreaseFontScale}
      />,
    );

    expect(screen.getByText("120%")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Diminuir fonte" }));
    fireEvent.click(screen.getByRole("button", { name: "Aumentar fonte" }));
    fireEvent.click(screen.getByRole("button", { name: "Mudar para modo claro" }));

    expect(onDecreaseFontScale).toHaveBeenCalledTimes(1);
    expect(onIncreaseFontScale).toHaveBeenCalledTimes(1);
    expect(onToggleTheme).toHaveBeenCalledTimes(1);
  });

  it("aplica preferencias locais quando nao recebe callbacks", () => {
    render(<PublicReadingToolbar theme="light" fontScale={1} />);

    fireEvent.click(screen.getByRole("button", { name: "Aumentar fonte" }));
    expect(screen.getByText("110%")).toBeInTheDocument();
    expect(document.documentElement.style.getPropertyValue("--app-font-scale")).toBe("1.1");

    fireEvent.click(screen.getByRole("button", { name: "Mudar para modo escuro" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("navega para backHref quando nao recebe onBack", () => {
    render(<PublicReadingToolbar backHref="#/formularios/1" />);

    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));

    expect(window.location.hash).toBe("#/formularios/1");
  });
});
