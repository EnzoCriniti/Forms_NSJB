/**
 * @file tests/ui/appPreferences.test.js
 * @summary Testes das preferencias locais do shell.
 * @responsibility Cobrir leitura e aplicacao de tema, fonte, sessao e pins.
 */

import { describe, it, expect, afterEach, vi } from "vitest";
import { STORAGE_KEYS } from "../../frontend/src/lib/appConstants.js";
import {
  applyExternalPreferenceChange,
  applyFontScalePreference,
  applyThemePreference,
  loadInitialFontScale,
  loadInitialPinnedFormsByUser,
  loadInitialSession,
  loadInitialTheme,
  persistPinnedEventsByUser,
} from "../../frontend/src/lib/appPreferences.js";

describe("appPreferences", () => {
  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.dataset.theme = "";
    document.documentElement.dataset.fontScale = "";
    document.documentElement.style.removeProperty("--app-font-scale");
  });

  it("normaliza sessao inicial salva", () => {
    window.localStorage.setItem(STORAGE_KEYS.session, JSON.stringify({
      token: "abc",
      user: { id: 1, name: "Admin", username: "admin", role: "admin", password: "secret" },
    }));

    expect(loadInitialSession()).toEqual({
      token: "abc",
      expiresAt: null,
      user: { id: 1, name: "Admin", username: "admin", role: "admin", layerId: null, layerName: null, permissions: [] },
    });
  });

  it("aplica e persiste tema e escala de fonte", () => {
    applyThemePreference("dark");
    applyFontScalePreference(1.2);

    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem(STORAGE_KEYS.theme)).toBe("\"dark\"");
    expect(document.documentElement.style.getPropertyValue("--app-font-scale")).toBe("1.2");
    expect(document.documentElement.dataset.fontScale).toBe("large");
    expect(loadInitialFontScale()).toBe(1.2);
  });

  it("le pins e aplica eventos externos de preferencia", () => {
    window.localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify("light"));
    window.localStorage.setItem(STORAGE_KEYS.pinnedForms, JSON.stringify({ 2: [9] }));
    persistPinnedEventsByUser({ 3: [10] });

    const setTheme = vi.fn();
    const setFontScale = vi.fn();
    applyExternalPreferenceChange({
      event: { detail: { theme: "dark", fontScale: 5 } },
      setTheme,
      setFontScale,
    });

    expect(loadInitialTheme()).toBe("light");
    expect(loadInitialPinnedFormsByUser()).toEqual({ 2: [9] });
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.pinnedEvents))).toEqual({ 3: [10] });
    expect(setTheme).toHaveBeenCalledWith("dark");
    expect(setFontScale).toHaveBeenCalledWith(1.3);
  });
});
