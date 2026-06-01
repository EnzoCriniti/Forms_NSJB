/**
 * @file frontend/src/AppShellEventMessageFlows.jsx
 * @summary Adapters dos fluxos de mensagens de evento no shell autenticado.
 * @responsibility Montar editor e detalhe de mensagens sem inflar AppShellContent.
 */

import React from "react";
import { selectEventForms, selectEventMessage } from "./lib/appShellContentSelectors";
import { EventMessageDetailScreen } from "./screens/EventMessageDetailScreen";
import { EventMessageEditorScreen } from "./screens/EventMessageEditorScreen";
import { getShellActions, getShellData, getShellSetters, getShellState } from "./lib/appShellObject";

export const EventMessageEditorFlow = ({ app }) => {
  const state = getShellState(app);
  const data = getShellData(app);
  const actions = getShellActions(app);
  const setters = getShellSetters(app);
  const {
    activeEvent,
    activeMessageId,
  } = state;
  const {
    forms,
    membersConfig,
    messageTemplates,
    messagingConfig,
    people,
    personPresets,
  } = data;
  const {
    handleSaveEventMessage,
  } = actions;
  const {
    setActiveMessageId,
    setScreen,
  } = setters;

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
          setActiveMessageId(saved.id);
          setScreen("eventMessageDetail");
        } else {
          setActiveMessageId(null);
          setScreen("events");
        }
      }}
    />
  );
};

export const EventMessageDetailFlow = ({ app }) => {
  const state = getShellState(app);
  const actions = getShellActions(app);
  const setters = getShellSetters(app);
  const { activeEvent, activeMessageId } = state;
  const { applyMessageDeletion, applyMessageUpdate } = actions;
  const { setActiveMessageId, setScreen } = setters;

  if (!activeEvent || !activeMessageId) return null;

  return (
    <EventMessageDetailScreen
      event={activeEvent}
      message={selectEventMessage(activeEvent, activeMessageId)}
      onMessageUpdated={applyMessageUpdate}
      onMessageDeleted={id => {
        applyMessageDeletion(id);
        setActiveMessageId(null);
        setScreen("events");
      }}
      onEdit={() => setScreen("eventMessageEditor")}
      onBack={() => {
        setActiveMessageId(null);
        setScreen("events");
      }}
    />
  );
};
