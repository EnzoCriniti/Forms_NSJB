import React from "react";
import { MessagingSettingsPanel } from "./MessagingSettingsPanel";

export const renderAdminMessagesTab = ({ members, messaging }) => (
  <MessagingSettingsPanel
    messagingConfig={messaging.messagingConfig}
    messageTemplates={messaging.messageTemplates}
    personPresets={messaging.personPresets}
    people={members.people}
    onSaveMessagingConfig={messaging.onSaveMessagingConfig}
    onSaveMessageTemplate={messaging.onSaveMessageTemplate}
    onDeleteMessageTemplate={messaging.onDeleteMessageTemplate}
    onSavePersonPreset={messaging.onSavePersonPreset}
    onDeletePersonPreset={messaging.onDeletePersonPreset}
  />
);
