import { useState } from "react";
import { loadInitialFontScale, loadInitialPinnedEventsByUser, loadInitialPinnedFormsByUser, loadInitialSession, loadInitialTheme } from "./appPreferences";

export const useAppControllerPreferenceState = () => {
  const [session, setSession] = useState(loadInitialSession);
  const [theme, setTheme] = useState(loadInitialTheme);
  const [fontScale, setFontScale] = useState(loadInitialFontScale);
  const [pinnedFormsByUser, setPinnedFormsByUser] = useState(loadInitialPinnedFormsByUser);
  const [pinnedEventsByUser, setPinnedEventsByUser] = useState(loadInitialPinnedEventsByUser);

  return {
    values: {
      fontScale,
      pinnedEventsByUser,
      pinnedFormsByUser,
      session,
      theme,
    },
    setters: {
      setFontScale,
      setPinnedEventsByUser,
      setPinnedFormsByUser,
      setSession,
      setTheme,
    },
  };
};
