import React from "react";
import { Btn } from "../../components/ui";

export const AuditLogsFiltersActions = ({ clearFilters, applyFilters }) => (
  <div className="msg-actions" style={{ justifyContent: "flex-end", flexWrap: "wrap" }}>
    <Btn v="secondary" sz="sm" onClick={clearFilters}>Limpar filtros</Btn>
    <Btn sz="sm" onClick={applyFilters}>Aplicar filtros</Btn>
  </div>
);
