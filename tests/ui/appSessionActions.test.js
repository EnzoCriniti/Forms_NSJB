/**
 * @file tests/ui/appSessionActions.test.js
 * @summary Testes das acoes de sessao e navegacao do shell.
 * @responsibility Validar login, logout, invalidacao, navegacao e escala de fonte extraidos de App.jsx.
 */

import { describe, expect, it, vi } from "vitest";
import {
  invalidateAppSession,
  loginAppSession,
  logoutAppSession,
  navigateAppScreen,
  updateAppFontScale,
} from "../../frontend/src/lib/appSessionActions";

describe("appSessionActions", () => {
  it("invalida sessao e limpa selecoes do app", () => {
    const setters = buildSetters();
    const persistSession = vi.fn();

    invalidateAppSession({ persistSession, ...setters });

    expect(setters.setSession).toHaveBeenCalledWith(null);
    expect(setters.setAuthToken).toHaveBeenCalledWith(null);
    expect(persistSession).toHaveBeenCalledWith(null);
    expect(setters.setActiveFormId).toHaveBeenCalledWith(null);
    expect(setters.setEditingFormId).toHaveBeenCalledWith(null);
    expect(setters.setDraftForm).toHaveBeenCalledWith(null);
    expect(setters.setScreen).toHaveBeenCalledWith("list");
  });

  it("realiza login e salva sessao normalizada", async () => {
    const setSession = vi.fn();
    const user = { id: 1, name: "Admin" };

    const result = await loginAppSession({
      username: "admin",
      password: "secret",
      loginWithCredentials: vi.fn().mockResolvedValue({ user, token: "token" }),
      setSession,
    });

    expect(result).toBe(user);
    expect(setSession).toHaveBeenCalledWith({ user, token: "token", expiresAt: null });
  });

  it("mantem logout local mesmo quando logout remoto falha", async () => {
    const invalidateSession = vi.fn();

    await logoutAppSession({
      logoutAuth: vi.fn().mockRejectedValue(new Error("offline")),
      invalidateSession,
    });

    expect(invalidateSession).toHaveBeenCalled();
  });

  it("aplica decisao de navegacao no estado do app", () => {
    const setters = buildSetters();

    navigateAppScreen({
      nextScreen: "create",
      form: { id: 4 },
      activeForm: null,
      currentUser: { role: "admin" },
      canCreateForms: () => true,
      canViewForm: () => true,
      resolveAppNavigation: () => ({
        screen: "create",
        clearDraft: true,
        editingFormId: 4,
        activeFormId: 4,
      }),
      ...setters,
    });

    expect(setters.setDraftForm).toHaveBeenCalledWith(null);
    expect(setters.setEditingFormId).toHaveBeenCalledWith(4);
    expect(setters.setActiveFormId).toHaveBeenCalledWith(4);
    expect(setters.setScreen).toHaveBeenCalledWith("create");
  });

  it("altera escala de fonte respeitando clamp", () => {
    const setFontScale = vi.fn(updater => {
      expect(updater(1)).toBe(1.1);
    });

    updateAppFontScale({
      direction: "increase",
      setFontScale,
      clampFontScale: value => Math.min(1.1, value),
      fontScaleStep: 0.2,
    });
  });
});

const buildSetters = () => ({
  setActiveFormId: vi.fn(),
  setAuthToken: vi.fn(),
  setDraftForm: vi.fn(),
  setEditingFormId: vi.fn(),
  setScreen: vi.fn(),
  setSession: vi.fn(),
});
