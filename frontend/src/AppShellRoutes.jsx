/**
 * @file frontend/src/AppShellRoutes.jsx
 * @summary Rotas visuais do shell autenticado.
 * @responsibility Escolher e montar os fluxos internos a partir do objeto `app`.
 */

import React from "react";
import { resolveAppShellRoute } from "./AppShellRouteRegistry";

export const AppShellRoutes = ({ app }) => {
  const route = resolveAppShellRoute(app);
  if (!route) return null;

  const Flow = route.component;
  return <Flow app={app} />;
};
