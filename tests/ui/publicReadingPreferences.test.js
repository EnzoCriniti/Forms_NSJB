/**
 * @file tests/ui/publicReadingPreferences.test.js
 * @summary Testes das preferencias publicas de leitura.
 * @responsibility Cobrir inicializacao, aplicacao e evento usados por PublicReadingToolbar.
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEYS } from "../../frontend/src/lib/appConstants.js";
import {
  applyPublicReadingFontScalePreference,
  applyPublicReadingThemePreference,
  resolveInitialPublicReadingFontScale,
  resolveInitialPublicReadingTheme,
} from "../../frontend/src/lib/publicReadingPreferences.js";

describe("publicReadingPreferences", () => {
  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.dataset.theme = "";
    document.documentElement.dataset.fontScale = "";
    document.documentElement.style.removeProperty("--app-font-scale");
  });

  it("resolve tema inicial por prop, documento, storage bruto ou storage json", () => {
    expect(resolveInitialPublicReadingTheme("dark")).toBe("dark");

    document.documentElement.dataset.theme = "light";
    expect(resolveInitialPublicReadingTheme()).toBe("light");

    document.documentElement.dataset.theme = "";
    window.localStorage.setItem(STORAGE_KEYS.theme, "dark");
    expect(resolveInitialPublicReadingTheme()).toBe("dark");

    window.localStorage.setItem(STORAGE_KEYS.theme, JSON.stringify("light"));
    expect(resolveInitialPublicReadingTheme()).toBe("light");
  });

  it("resolve escala inicial normalizada", () => {
    expect(resolveInitialPublicReadingFontScale(1.2)).toBe(1.2);
    expect(resolveInitialPublicReadingFontScale(9)).toBe(1.3);

    window.localStorage.setItem(STORAGE_KEYS.fontScale, JSON.stringify(0.1));
    expect(resolveInitialPublicReadingFontScale()).toBe(0.9);

    window.localStorage.setItem(STORAGE_KEYS.fontScale, "1.1");
    expect(resolveInitialPublicReadingFontScale()).toBe(1.1);
  });

  it("aplica preferencias no documento, storage legado e evento externo", () => {
    const listener = vi.fn();
    window.addEventListener("nsjb-preferences-change", listener);

    expect(applyPublicReadingThemePreference("dark")).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem(STORAGE_KEYS.theme)).toBe("dark");

    expect(applyPublicReadingFontScalePreference(2)).toBe(1.3);
    expect(document.documentElement.style.getPropertyValue("--app-font-scale")).toBe("1.3");
    expect(document.documentElement.dataset.fontScale).toBe("large");
    expect(window.localStorage.getItem(STORAGE_KEYS.fontScale)).toBe("1.3");
    expect(listener).toHaveBeenCalledTimes(2);

    window.removeEventListener("nsjb-preferences-change", listener);
  });
});
