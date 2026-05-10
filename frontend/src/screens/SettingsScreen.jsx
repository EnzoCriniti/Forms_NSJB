/**
 * @file frontend/src/screens/SettingsScreen.jsx
 * @summary Tela dedicada para configuracoes administrativas.
 * @responsibility Exibir a central administrativa como pagina do app.
 */

import React from "react";
import { Btn } from "../components/ui";
import { AdminSettingsModal } from "../features/admin/AdminSettingsModal";

export const SettingsScreen = ({ onNavigate, ...props }) => (
  <div>
    <div className="create-form-header screen-top-card settings-top-card" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
      <Btn v="ghost" icon="back" onClick={() => onNavigate("list")} />
    </div>
    <AdminSettingsModal
      {...props}
      mode="screen"
      onClose={() => onNavigate("list")}
    />
  </div>
);
