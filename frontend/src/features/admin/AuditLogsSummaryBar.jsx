import React from "react";
import { COLORS } from "../../components/ui";

export const AuditLogsSummaryBar = ({ total }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
    <div style={{ color: COLORS.textMuted, fontSize: 12 }}>
      {total} evento(s) encontrados
    </div>
  </div>
);
