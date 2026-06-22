/**
 * @file frontend/src/features/admin/adminShellPanels.jsx
 * @summary Chrome compartilhado da central administrativa.
 * @responsibility Conter a barra de abas da central administrativa.
 */

import React from "react";
import { Btn, COLORS } from "../../components/ui";

export const AdminSettingsHeader = ({ tabs, tab, setTab }) => (
  <>
    <div className="settings-tabs" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
      {tabs.map(item => (
        <Btn
          key={item.key}
          v={tab === item.key ? "primary" : "secondary"}
          sz="sm"
          className="settings-tab"
          onClick={() => setTab(item.key)}
          style={{
            alignItems: "flex-start",
            border: tab === item.key ? "1px solid rgba(var(--primary-rgb), 0.28)" : `1px solid ${COLORS.borderLight}`,
            borderRadius: 12,
            boxShadow: tab === item.key ? "0 10px 24px rgba(var(--primary-rgb), 0.14)" : "none",
            flexDirection: "column",
            gap: 2,
            minHeight: 54,
            padding: "9px 12px",
            textAlign: "left",
          }}
        >
          <span className="settings-tab__label">{item.label}</span>
          <span className="settings-tab__description" aria-hidden="true">{item.description}</span>
        </Btn>
      ))}
    </div>
  </>
);
