import React from "react";
import { Btn, COLORS } from "../../components/ui";

export const AuditLogsFiltersActions = ({ clearFilters, applyFilters }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
    <div style={{ color: COLORS.textMuted, fontSize: 12 }} />
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Btn v="secondary" sz="sm" onClick={clearFilters}>Limpar filtros</Btn>
      <Btn sz="sm" onClick={applyFilters}>Aplicar filtros</Btn>
    </div>
  </div>
);
