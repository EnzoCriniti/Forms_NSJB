/**
 * @file frontend/src/screens/MessagingSettingsScreen.jsx
 * @summary Tela dedicada para configuracoes de mensagens.
 * @responsibility Exibir configuracao global, modelos e presets fora da central administrativa.
 */

import React from "react";
import { ScreenHeader } from "../components/ui";
import { MessagingSettingsPanel } from "../features/admin/MessagingSettingsPanel";

export const MessagingSettingsScreen = ({ onNavigate, ...props }) => (
  <div>
    <ScreenHeader
      className="settings-top-card"
      onBack={() => onNavigate("list")}
      title="Mensagens"
      subtitle="Gerencie a configuracao global, os modelos e os presets de destinatarios"
    />
    <MessagingSettingsPanel {...props} />
  </div>
);
