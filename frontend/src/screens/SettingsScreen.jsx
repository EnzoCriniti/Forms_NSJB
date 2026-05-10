/**
 * @file frontend/src/screens/SettingsScreen.jsx
 * @summary Tela dedicada para configuracoes administrativas.
 * @responsibility Exibir a central administrativa como pagina do app.
 */

import React from "react";
import { Btn, COLORS } from "../components/ui";
import { AdminSettingsModal } from "../features/admin/AdminSettingsModal";

export const SettingsScreen = ({ onNavigate, ...props }) => (
  <div>
    <div className="create-form-header screen-top-card settings-top-card" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
      <Btn v="ghost" icon="back" onClick={() => onNavigate("list")} />
      <div>
        <h2 style={{ margin: 0, fontSize: 22 }}>Configuracoes</h2>
        <p style={{ margin: "2px 0 0", fontSize: 13, color: COLORS.textMuted }}>Gerencie usuarios, seguranca, bases e catalogos do sistema</p>
      </div>
    </div>
    <AdminSettingsModal
      {...props}
      mode="screen"
      onClose={() => onNavigate("list")}
    />
  </div>
);
