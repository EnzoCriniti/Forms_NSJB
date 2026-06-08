import { useEffect } from "react";

export const useAppLifecycleNavigationEffects = ({
  currentUser,
  screen,
  setScreen,
  setPublicRoute,
  getPublicRouteFromLocation,
}) => {
  useEffect(() => {
    if (currentUser && screen === "list") {
      setScreen("events");
    }
  }, [currentUser?.id, currentUser?.role, screen]);

  useEffect(() => {
    const syncPublicRoute = () => setPublicRoute(getPublicRouteFromLocation());
    window.addEventListener("hashchange", syncPublicRoute);
    window.addEventListener("popstate", syncPublicRoute);
    return () => {
      window.removeEventListener("hashchange", syncPublicRoute);
      window.removeEventListener("popstate", syncPublicRoute);
    };
  }, []);
};
