/**
 * @file frontend/src/screens/MessagingSettingsScreen.jsx
 * @summary Tela dedicada para configuracoes de mensagens.
 * @responsibility Exibir configuracao global, modelos e presets fora da central administrativa.
 */

import React from "react";
import { ScreenHeader } from "../components/ui";
import { MessagingSettingsPanel } from "../features/admin/MessagingSettingsPanel";

export const MessagingSettingsScreen = ({ onNavigate: _onNavigate, ...props }) => (
  <div>
    <ScreenHeader
      className="settings-top-card"
      subtitle="Configure o envio, os modelos de mensagem e os grupos de destinatários"
    />
    <MessagingSettingsPanel {...props} />
  </div>
);
