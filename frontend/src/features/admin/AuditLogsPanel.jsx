import React from "react";
import { FeedbackBanner } from "../../components/ui";
import { AUDIT_LOGS_PAGE_SIZE, useAuditLogsController } from "./adminAuditLogsState";
import { AuditLogsFiltersPanel } from "./AuditLogsFiltersPanel";
import { AuditLogsPaginationBar } from "./AuditLogsPaginationBar";
import { AuditLogsSummaryBar } from "./AuditLogsSummaryBar";
import { AuditLogsTable } from "./AuditLogsTable";

export const AuditLogsPanel = () => {
  const {
    draftFilters,
    state,
    setPage,
    updateFilter,
    applyFilters,
    clearFilters,
    pagination: { totalPages, safePage, fromIndex, toIndex },
  } = useAuditLogsController();

  return (
    <section style={{ display: "grid", gap: 14 }}>
      <AuditLogsFiltersPanel
        draftFilters={draftFilters}
        updateFilter={updateFilter}
        clearFilters={clearFilters}
        applyFilters={applyFilters}
      />

      <AuditLogsSummaryBar
        total={state.total}
      />

      {state.loading && <FeedbackBanner tone="loading" message="Carregando auditoria..." />}
      {state.error && <FeedbackBanner tone="error" message={state.error} />}
      {!state.loading && !state.error && state.items.length === 0 && (
        <div style={{ color: "var(--text-muted)", fontSize: 12, padding: "12px 0" }}>Nenhum log encontrado para os filtros atuais.</div>
      )}

      {!state.loading && !state.error && state.items.length > 0 && <AuditLogsTable items={state.items} />}

      {!state.loading && !state.error && state.total > AUDIT_LOGS_PAGE_SIZE && (
        <AuditLogsPaginationBar
          total={state.total}
          fromIndex={fromIndex}
          toIndex={toIndex}
          safePage={safePage}
          totalPages={totalPages}
          setPage={setPage}
        />
      )}
    </section>
  );
};
