import { useEffect } from "react";
import { fetchAuthMe as apiFetchAuthMe, setAuthToken as apiSetAuthToken } from "./api";

export const useAppLifecycleBootstrapEffects = ({
  authToken,
  fetchAuthMe = apiFetchAuthMe,
  persistSession,
  refreshBootstrap,
  refreshFormDeleteKeyStatus,
  session,
  setAuthToken = apiSetAuthToken,
  setSession,
}) => {
  useEffect(() => {
    setAuthToken(authToken);
    persistSession(session);
  }, [authToken, session]);

  useEffect(() => {
    const restoreSession = async () => {
      if (!session) return;
      try {
        const result = await fetchAuthMe();
        setSession({
          user: result.user || session.user,
          token: session.token,
          expiresAt: result.expiresAt || session.expiresAt || null,
        });
      } catch {
        setSession(null);
        setAuthToken(null);
        persistSession(null);
      }
    };

    refreshBootstrap({ preserveSelection: false });
    refreshFormDeleteKeyStatus();
    restoreSession();
  }, []);
};
