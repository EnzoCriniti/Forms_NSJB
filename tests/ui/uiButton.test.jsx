/**
 * @file tests/ui/uiButton.test.jsx
 * @summary Testes do botao compartilhado da UI.
 * @responsibility Cobrir variantes basicas, icone e estado de carregamento apos extracao de ui.jsx.
 */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Btn } from "../../frontend/src/components/uiButton";

describe("uiButton", () => {
  it("renderiza como button e dispara clique", () => {
    const onClick = vi.fn();
    render(<Btn icon="check" onClick={onClick}>Salvar</Btn>);

    fireEvent.click(screen.getByRole("button", { name: "Salvar" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("desabilita durante carregamento e marca aria-busy", () => {
    render(<Btn loading onClick={vi.fn()}>Enviando</Btn>);

    const button = screen.getByRole("button", { name: "Enviando" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });
});
