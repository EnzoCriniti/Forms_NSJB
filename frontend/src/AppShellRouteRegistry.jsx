/**
 * @file frontend/src/AppShellRouteRegistry.jsx
 * @summary Registro das rotas visuais do shell autenticado.
 */

import { EventMessageDetailFlow, EventMessageEditorFlow } from "./AppShellEventMessageFlows";
import { InternalRespondFlow, InternalResultsFlow } from "./AppShellFormFlows";
import { CreateFormFlow, DashboardFlow, EventsFlow, FormListFlow, ReportsFlow, SettingsFlow } from "./AppShellMainFlows";
import { getShellState } from "./lib/appShellObject";

export const APP_SHELL_ROUTES = [
  {
    screen: "dashboard",
    component: DashboardFlow,
  },
  {
    screen: "events",
    component: EventsFlow,
    canRender: app => Boolean(getShellState(app).currentUser),
  },
  {
    screen: "eventMessageEditor",
    component: EventMessageEditorFlow,
    canRender: app => {
      const state = getShellState(app);
      return Boolean(state.currentUser && state.activeEvent);
    },
  },
  {
    screen: "eventMessageDetail",
    component: EventMessageDetailFlow,
    canRender: app => {
      const state = getShellState(app);
      return Boolean(state.currentUser && state.activeEvent && state.activeMessageId);
    },
  },
  {
    screen: "reports",
    component: ReportsFlow,
    canRender: app => Boolean(getShellState(app).currentUser),
  },
  {
    screen: "list",
    component: FormListFlow,
  },
  {
    screen: "create",
    component: CreateFormFlow,
  },
  {
    screen: "settings",
    component: SettingsFlow,
  },
  {
    screen: "results",
    component: InternalResultsFlow,
    canRender: app => Boolean(getShellState(app).activeForm),
  },
  {
    screen: "respond",
    component: InternalRespondFlow,
    canRender: app => Boolean(getShellState(app).activeForm),
  },
];

export const resolveAppShellRoute = app => APP_SHELL_ROUTES.find(route => (
  route.screen === getShellState(app).screen && (!route.canRender || route.canRender(app))
)) || null;
