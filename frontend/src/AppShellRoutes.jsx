/**
 * @file frontend/src/AppShellRoutes.jsx
 * @summary Rotas visuais do shell autenticado.
 * @responsibility Escolher e montar os fluxos internos a partir do objeto `app`.
 */

import React from "react";
import { EventMessageDetailFlow, EventMessageEditorFlow } from "./AppShellEventMessageFlows";
import { InternalRespondFlow, InternalResultsFlow } from "./AppShellFormFlows";
import { CreateFormFlow, DashboardFlow, EventsFlow, FormListFlow, SettingsFlow } from "./AppShellMainFlows";

export const AppShellRoutes = ({ app }) => {
  const { screen, currentUser, activeEvent, activeMessageId, activeForm } = app;

  return (
    <>
      {screen === "dashboard" && <DashboardFlow app={app} />}
      {screen === "events" && currentUser && <EventsFlow app={app} />}
      {screen === "eventMessageEditor" && currentUser && activeEvent && (
        <EventMessageEditorFlow app={app} />
      )}
      {screen === "eventMessageDetail" && currentUser && activeEvent && activeMessageId && (
        <EventMessageDetailFlow app={app} />
      )}
      {screen === "list" && <FormListFlow app={app} />}
      {screen === "create" && <CreateFormFlow app={app} />}
      {screen === "settings" && <SettingsFlow app={app} />}
      {screen === "results" && activeForm && <InternalResultsFlow app={app} />}
      {screen === "respond" && activeForm && <InternalRespondFlow app={app} />}
    </>
  );
};
