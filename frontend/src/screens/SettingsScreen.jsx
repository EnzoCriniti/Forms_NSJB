/**
 * @file frontend/src/screens/SettingsScreen.jsx
 * @summary Tela dedicada para configuracoes administrativas.
 * @responsibility Exibir a central administrativa como pagina do app.
 */

import React from "react";
import { AdminSettingsModal } from "../features/admin/AdminSettingsModal";

export const SettingsScreen = ({ onNavigate, ...props }) => (
  <div>
    <AdminSettingsModal
      {...props}
      mode="screen"
      onClose={() => onNavigate("list")}
    />
  </div>
);
