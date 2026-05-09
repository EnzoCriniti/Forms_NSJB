/**
 * @file tests/ui/appHeader.test.jsx
 * @summary Testes do cabecalho global do frontend.
 * @responsibility Garantir que a tela ativa chega ao header para regras responsivas.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AppHeader } from "../../frontend/src/components/AppHeader.jsx";

describe("AppHeader", () => {
  it("expõe a tela atual no atributo data-screen", () => {
    render(
      <AppHeader
        nav={[]}
        screen="create"
        currentUser={{ name: "Admin", role: "admin" }}
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

    expect(screen.getByRole("banner")).toHaveAttribute("data-screen", "create");
  });
});
