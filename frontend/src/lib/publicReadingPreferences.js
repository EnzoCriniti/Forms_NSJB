/**
 * @file frontend/src/lib/publicReadingPreferences.js
 * @summary Preferencias locais dos controles publicos de leitura.
 * @responsibility Ler, aplicar e notificar tema/fonte usados por PublicReadingToolbar.
 */

import { STORAGE_KEYS } from "./appConstants";
import { clampFontScale } from "./appFontScale";

const PREFERENCES_CHANGE_EVENT = "nsjb-preferences-change";

const parseStoredValue = value => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

export const resolveInitialPublicReadingTheme = theme => {
  if (theme === "light" || theme === "dark") return theme;
  if (typeof document !== "undefined") {
    const documentTheme = document.documentElement.dataset.theme;
    if (documentTheme === "light" || documentTheme === "dark") return documentTheme;
  }
  if (typeof window !== "undefined") {
    const storedTheme = parseStoredValue(window.localStorage?.getItem(STORAGE_KEYS.theme));
    if (storedTheme === "light" || storedTheme === "dark") return storedTheme;
  }
  return "light";
};

export const resolveInitialPublicReadingFontScale = fontScale => {
  const propScale = Number(fontScale);
  if (!Number.isNaN(propScale) && propScale > 0) return clampFontScale(propScale);
  if (typeof window !== "undefined") {
    const storedScale = Number(parseStoredValue(window.localStorage?.getItem(STORAGE_KEYS.fontScale)));
    if (!Number.isNaN(storedScale) && storedScale > 0) return clampFontScale(storedScale);
  }
  return 1;
};

export const applyPublicReadingThemePreference = nextTheme => {
  const normalizedTheme = nextTheme === "dark" ? "dark" : "light";
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = normalizedTheme;
  }
  if (typeof window !== "undefined") {
    window.localStorage?.setItem(STORAGE_KEYS.theme, normalizedTheme);
    window.dispatchEvent(new CustomEvent(PREFERENCES_CHANGE_EVENT, { detail: { theme: normalizedTheme } }));
  }
  return normalizedTheme;
};

export const applyPublicReadingFontScalePreference = nextScale => {
  const normalizedScale = clampFontScale(Number(nextScale) || 1);
  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty("--app-font-scale", String(normalizedScale));
    document.documentElement.dataset.fontScale = normalizedScale > 1 ? "large" : "normal";
  }
  if (typeof window !== "undefined") {
    window.localStorage?.setItem(STORAGE_KEYS.fontScale, String(normalizedScale));
    window.dispatchEvent(new CustomEvent(PREFERENCES_CHANGE_EVENT, { detail: { fontScale: normalizedScale } }));
  }
  return normalizedScale;
};
