/**
 * @file frontend/src/screens/SettingsScreen.jsx
 * @summary Tela dedicada para configuracoes administrativas.
 * @responsibility Exibir a central administrativa como pagina do app.
 */

import React from "react";
import { Btn, ScreenHeader } from "../components/ui";
import { AdminSettingsModal } from "../features/admin/AdminSettingsModal";

export const SettingsScreen = ({ onNavigate, ...props }) => (
  <div>
    <ScreenHeader
      className="settings-top-card"
      leading={<Btn v="ghost" icon="back" onClick={() => onNavigate("list")} aria-label="Voltar" />}
      title="Configurações"
      subtitle="Gerencie usuários, segurança, bases e catálogos do sistema"
    />
    <AdminSettingsModal
      {...props}
      mode="screen"
      onClose={() => onNavigate("list")}
    />
  </div>
);
