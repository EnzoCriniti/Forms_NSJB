import { useEffect } from "react";

export const useAppLifecyclePreferenceEffects = ({
  applyExternalPreferenceChange,
  applyFontScalePreference,
  applyThemePreference,
  fontScale,
  pinnedEventsByUser,
  pinnedFormsByUser,
  setFontScale,
  setTheme,
  theme,
  persistPinnedEventsByUser,
  persistPinnedFormsByUser,
}) => {
  useEffect(() => {
    applyThemePreference(theme);
  }, [theme]);

  useEffect(() => {
    applyFontScalePreference(fontScale);
  }, [fontScale]);

  useEffect(() => {
    const syncPreferences = event => applyExternalPreferenceChange({ event, setTheme, setFontScale });

    window.addEventListener("nsjb-preferences-change", syncPreferences);
    return () => window.removeEventListener("nsjb-preferences-change", syncPreferences);
  }, []);

  useEffect(() => {
    persistPinnedFormsByUser(pinnedFormsByUser);
  }, [pinnedFormsByUser]);

  useEffect(() => {
    persistPinnedEventsByUser(pinnedEventsByUser);
  }, [pinnedEventsByUser]);
};
