/**
 * @file frontend/src/AppShellEventMessageFlows.jsx
 * @summary Adapters dos fluxos de mensagens de evento no shell autenticado.
 * @responsibility Montar editor e detalhe de mensagens sem inflar AppShellContent.
 */

import React from "react";
import { selectEventForms, selectEventMessage } from "./lib/appShellContentSelectors";
import { EventMessageDetailScreen } from "./screens/EventMessageDetailScreen";
import { EventMessageEditorScreen } from "./screens/EventMessageEditorScreen";

export const EventMessageEditorFlow = ({ app }) => {
  const {
    activeEvent,
    activeMessageId,
    forms,
    membersConfig,
    messageTemplates,
    messagingConfig,
    people,
    personPresets,
    handleSaveEventMessage,
  } = app;

  if (!activeEvent) return null;

  return (
    <EventMessageEditorScreen
      event={activeEvent}
      eventForms={selectEventForms(forms, activeEvent)}
      message={selectEventMessage(activeEvent, activeMessageId)}
      messageTemplates={messageTemplates}
      personPresets={personPresets}
      people={people}
      membersConfig={membersConfig}
      messagingConfig={messagingConfig}
      onSave={payload => handleSaveEventMessage(activeEvent.id, payload)}
      onCancel={saved => {
        if (saved?.id) {
          app.setActiveMessageId(saved.id);
          app.setScreen("eventMessageDetail");
        } else {
          app.setActiveMessageId(null);
          app.setScreen("events");
        }
      }}
    />
  );
};

export const EventMessageDetailFlow = ({ app }) => {
  const { activeEvent, activeMessageId, applyMessageDeletion, applyMessageUpdate } = app;

  if (!activeEvent || !activeMessageId) return null;

  return (
    <EventMessageDetailScreen
      event={activeEvent}
      message={selectEventMessage(activeEvent, activeMessageId)}
      onMessageUpdated={applyMessageUpdate}
      onMessageDeleted={id => {
        applyMessageDeletion(id);
        app.setActiveMessageId(null);
        app.setScreen("events");
      }}
      onEdit={() => app.setScreen("eventMessageEditor")}
      onBack={() => {
        app.setActiveMessageId(null);
        app.setScreen("events");
      }}
    />
  );
};
