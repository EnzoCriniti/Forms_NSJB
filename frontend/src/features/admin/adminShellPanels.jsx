/**
 * @file frontend/src/features/admin/adminShellPanels.jsx
 * @summary Chrome compartilhado da central administrativa.
 * @responsibility Conter a barra de abas da central administrativa.
 */

import React from "react";
import { Btn } from "../../components/ui";

export const AdminSettingsHeader = ({ tabs, tab, setTab }) => (
  <>
    <div className="settings-tabs" style={{ display: "inline-flex", gap: 4, flexWrap: "wrap", marginBottom: 24 }}>
      {tabs.map(item => (
        <Btn
          key={item.key}
          v={tab === item.key ? "primary" : "secondary"}
          sz="sm"
          className="settings-tab"
          onClick={() => setTab(item.key)}
          title={item.description || item.label}
          style={{
            alignItems: "center",
            border: "none",
            borderRadius: 9,
            boxShadow: "none",
            minHeight: 0,
            padding: "8px 18px",
            textAlign: "center",
          }}
        >
          <span className="settings-tab__label">{item.label}</span>
          <span className="settings-tab__description" aria-hidden="true">{item.description}</span>
        </Btn>
      ))}
    </div>
  </>
);
