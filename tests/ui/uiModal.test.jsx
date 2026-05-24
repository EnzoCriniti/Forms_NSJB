/**
 * @file tests/ui/uiModal.test.jsx
 * @summary Testes do modal compartilhado da UI.
 * @responsibility Cobrir renderizacao, acoes e estados de bloqueio apos extracao de ui.jsx.
 */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmModal } from "../../frontend/src/components/uiModal";

describe("uiModal", () => {
  it("nao renderiza quando fechado", () => {
    const { container } = render(<ConfirmModal open={false} title="Excluir" message="Confirma?" />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renderiza conteudo e dispara acoes", () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ConfirmModal
        open
        title="Excluir item"
        message="Essa acao nao pode ser desfeita."
        confirmLabel="Excluir"
        cancelLabel="Voltar"
        onCancel={onCancel}
        onConfirm={onConfirm}
      >
        <span>Detalhe adicional</span>
      </ConfirmModal>,
    );

    expect(screen.getByText("Excluir item")).toBeInTheDocument();
    expect(screen.getByText("Essa acao nao pode ser desfeita.")).toBeInTheDocument();
    expect(screen.getByText("Detalhe adicional")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("bloqueia acoes durante carregamento ou quando confirmacao esta desabilitada", () => {
    const { rerender } = render(<ConfirmModal open busy title="Salvando" message="Aguarde." />);

    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Confirmar" })).toHaveAttribute("aria-busy", "true");

    rerender(<ConfirmModal open confirmDisabled title="Confirmar" message="Revise antes." />);

    expect(screen.getByRole("button", { name: "Cancelar" })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeDisabled();
  });
});
