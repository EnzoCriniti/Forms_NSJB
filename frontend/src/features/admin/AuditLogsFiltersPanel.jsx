import React from "react";
import { AuditLogsFilterFields } from "./AuditLogsFilterFields";
import { AuditLogsFiltersActions } from "./AuditLogsFiltersActions";

export const AuditLogsFiltersPanel = ({
  draftFilters,
  updateFilter,
  clearFilters,
  applyFilters,
}) => (
  <>
    <AuditLogsFilterFields draftFilters={draftFilters} updateFilter={updateFilter} />
    <AuditLogsFiltersActions clearFilters={clearFilters} applyFilters={applyFilters} />
  </>
);
