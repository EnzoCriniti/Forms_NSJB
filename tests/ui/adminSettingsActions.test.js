/**
 * @file tests/ui/adminSettingsActions.test.js
 * @summary Testes das acoes auxiliares da central administrativa.
 * @responsibility Validar fluxo padrao de busy, feedback, sucesso e erro.
 */

import { describe, expect, it, vi } from "vitest";
import { runAdminSubmitAction } from "../../frontend/src/features/admin/adminSettingsActions";

describe("adminSettingsActions", () => {
  it("executa submit com busy, sucesso e callback final", async () => {
    const setBusyAction = vi.fn();
    const setFeedback = vi.fn();
    const onSuccess = vi.fn();
    const execute = vi.fn(async () => ({ importedCount: 3 }));

    const result = await runAdminSubmitAction({
      actionKey: "sync",
      loadingMessage: "Sincronizando...",
      successMessage: payload => `${payload.importedCount} itens.`,
      setBusyAction,
      setFeedback,
      execute,
      onSuccess,
    });

    expect(result).toEqual({ importedCount: 3 });
    expect(setBusyAction.mock.calls).toEqual([["sync"], [null]]);
    expect(setFeedback).toHaveBeenNthCalledWith(1, { tone: "loading", message: "Sincronizando..." });
    expect(setFeedback).toHaveBeenLastCalledWith({ tone: "success", message: "3 itens." });
    expect(onSuccess).toHaveBeenCalledWith({ importedCount: 3 });
  });

  it("converte erro em feedback e limpa busy", async () => {
    const setBusyAction = vi.fn();
    const setFeedback = vi.fn();

    const result = await runAdminSubmitAction({
      actionKey: "save",
      loadingMessage: "Salvando...",
      successMessage: "Salvo.",
      setBusyAction,
      setFeedback,
      execute: async () => {
        throw new Error("falhou");
      },
    });

    expect(result).toBeNull();
    expect(setBusyAction.mock.calls).toEqual([["save"], [null]]);
    expect(setFeedback).toHaveBeenLastCalledWith({ tone: "error", message: "falhou" });
  });
});
