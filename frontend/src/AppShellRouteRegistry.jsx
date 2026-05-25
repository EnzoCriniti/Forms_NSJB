/**
 * @file frontend/src/AppShellRouteRegistry.jsx
 * @summary Registro das rotas visuais do shell autenticado.
 */

import { EventMessageDetailFlow, EventMessageEditorFlow } from "./AppShellEventMessageFlows";
import { InternalRespondFlow, InternalResultsFlow } from "./AppShellFormFlows";
import { CreateFormFlow, DashboardFlow, EventsFlow, FormListFlow, SettingsFlow } from "./AppShellMainFlows";

export const APP_SHELL_ROUTES = [
  {
    screen: "dashboard",
    component: DashboardFlow,
  },
  {
    screen: "events",
    component: EventsFlow,
    canRender: app => Boolean(app.currentUser),
  },
  {
    screen: "eventMessageEditor",
    component: EventMessageEditorFlow,
    canRender: app => Boolean(app.currentUser && app.activeEvent),
  },
  {
    screen: "eventMessageDetail",
    component: EventMessageDetailFlow,
    canRender: app => Boolean(app.currentUser && app.activeEvent && app.activeMessageId),
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
    canRender: app => Boolean(app.activeForm),
  },
  {
    screen: "respond",
    component: InternalRespondFlow,
    canRender: app => Boolean(app.activeForm),
  },
];

export const resolveAppShellRoute = app => APP_SHELL_ROUTES.find(route => (
  route.screen === app.screen && (!route.canRender || route.canRender(app))
)) || null;
