/**
 * @file frontend/src/lib/appPreferences.js
 * @summary Preferencias e persistencia local do shell do app.
 * @responsibility Ler e aplicar sessao, tema, fonte e itens fixados fora de App.jsx.
 */

import { STORAGE_KEYS } from "./appConstants";
import { clampFontScale, normalizeStoredSession } from "./appShell";
import { loadStored, persist } from "./storage";

export const loadInitialSession = () => normalizeStoredSession(loadStored(STORAGE_KEYS.session, null));

export const persistSession = session => persist(STORAGE_KEYS.session, session);

export const loadInitialTheme = () => loadStored(STORAGE_KEYS.theme, "light");

export const applyThemePreference = theme => {
  document.documentElement.dataset.theme = theme;
  persist(STORAGE_KEYS.theme, theme);
};

export const loadInitialFontScale = () => Number(loadStored(STORAGE_KEYS.fontScale, 1)) || 1;

export const applyFontScalePreference = fontScale => {
  const scaleValue = String(fontScale);
  document.documentElement.style.setProperty("--app-font-scale", scaleValue);
  document.documentElement.dataset.fontScale = fontScale > 1 ? "large" : "normal";
  persist(STORAGE_KEYS.fontScale, fontScale);
};

export const loadInitialPinnedFormsByUser = () => loadStored(STORAGE_KEYS.pinnedForms, {});

export const loadInitialPinnedEventsByUser = () => loadStored(STORAGE_KEYS.pinnedEvents, {});

export const persistPinnedFormsByUser = pinnedFormsByUser => persist(STORAGE_KEYS.pinnedForms, pinnedFormsByUser);

export const persistPinnedEventsByUser = pinnedEventsByUser => persist(STORAGE_KEYS.pinnedEvents, pinnedEventsByUser);

export const applyExternalPreferenceChange = ({ event, setTheme, setFontScale }) => {
  const nextTheme = event?.detail?.theme;
  const nextFontScale = event?.detail?.fontScale;
  if (nextTheme === "light" || nextTheme === "dark") {
    setTheme(nextTheme);
  }
  if (typeof nextFontScale === "number" && !Number.isNaN(nextFontScale)) {
    setFontScale(clampFontScale(nextFontScale));
  }
};
