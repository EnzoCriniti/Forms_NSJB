/**
 * @file frontend/src/features/admin/MessagingSettingsPanel.jsx
 * @summary Painel administrativo da feature de mensagens.
 * @responsibility Compor configuracao global, modelos e presets de pessoas.
 */

import React from "react";
import { MessagingConfigBlock } from "./MessagingConfigBlock";
import { MessagingPresetsBlock } from "./MessagingPresetsBlock";
import { MessagingTemplatesBlock } from "./MessagingTemplatesBlock";

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
  <div className="msg-settings">
    <section className="msg-card">
      <header className="msg-card__head">
        <h3 className="msg-card__title">Configuração global</h3>
        <p className="msg-card__hint">
          Define o grupo do WhatsApp, o link público usado nas mensagens e o disparo automático dos agendamentos.
        </p>
      </header>
      <MessagingConfigBlock messagingConfig={messagingConfig} onSave={onSaveMessagingConfig} />
    </section>

    <section className="msg-card">
      <header className="msg-card__head">
        <h3 className="msg-card__title">Modelos de mensagem</h3>
        <p className="msg-card__hint">
          Crie textos reaproveitáveis com placeholders para anúncios, lembretes de presença e vagas em aberto.
        </p>
      </header>
      <MessagingTemplatesBlock
        templates={messageTemplates}
        onSave={onSaveMessageTemplate}
        onDelete={onDeleteMessageTemplate}
      />
    </section>

    <section className="msg-card">
      <header className="msg-card__head">
        <h3 className="msg-card__title">Presets de pessoas</h3>
        <p className="msg-card__hint">
          Agrupe destinatários frequentes para escolher rapidamente quem recebe cada disparo.
        </p>
      </header>
      <MessagingPresetsBlock
        presets={personPresets}
        people={people}
        onSave={onSavePersonPreset}
        onDelete={onDeletePersonPreset}
      />
    </section>
  </div>
);
