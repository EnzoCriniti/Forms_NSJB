/**
 * @file frontend/src/lib/appViewportNavigation.js
 * @summary Navegacao auxiliar do viewport principal.
 * @responsibility Centralizar efeitos de saida das rotas publicas.
 */

export const resetPublicRouteNavigation = ({
  currentUser = null,
  setPublicRoute,
  setScreen,
  windowRef = window,
}) => {
  if (windowRef.location.pathname.startsWith("/formularios/")) {
    windowRef.history.pushState(null, "", "/");
  }
  windowRef.location.hash = "";
  setPublicRoute(null);
  setScreen(currentUser?.id ? "events" : "list");
};
