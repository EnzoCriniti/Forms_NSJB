/**
 * @file frontend/src/features/admin/MessagingSettingsPanel.jsx
 * @summary Painel administrativo da feature de mensagens.
 * @responsibility Compor configuracao global, modelos e presets de pessoas.
 */

import React from "react";
import { MessagingConfigBlock, MessagingPresetsBlock, MessagingTemplatesBlock } from "./messagingSettingsPanels";

export const MessagingSettingsPanel = ({
  messagingConfig,
  messageTemplates = [],
  personPresets = [],
  people = [],
  onSaveMessagingConfig,
  onSaveMessageTemplate,
  onDeleteMessageTemplate,
  onSavePersonPreset,
  onDeletePersonPreset,
}) => (
  <section className="settings-grid">
    <MessagingConfigBlock messagingConfig={messagingConfig} onSave={onSaveMessagingConfig} />
    <div style={{ gridColumn: "1 / -1", borderTop: "1px solid var(--border-light)", marginTop: 8 }} />
    <div style={{ gridColumn: "1 / -1" }}>
      <MessagingTemplatesBlock templates={messageTemplates} onSave={onSaveMessageTemplate} onDelete={onDeleteMessageTemplate} />
    </div>
    <div style={{ gridColumn: "1 / -1", borderTop: "1px solid var(--border-light)", marginTop: 8 }} />
    <div style={{ gridColumn: "1 / -1" }}>
      <MessagingPresetsBlock presets={personPresets} people={people} onSave={onSavePersonPreset} onDelete={onDeletePersonPreset} />
    </div>
  </section>
);
