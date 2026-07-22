/**
 * @file frontend/src/screens/PresenceResultsPanel.jsx
 * @summary Painel visual da planilha de resultados de presenca.
 */

import React from "react";
import { FeedbackBanner } from "../components/ui";
import { ResultsPresenceHeader } from "../components/ResultsPresenceHeader";
import { PresenceResultsTable } from "./PresenceResultsTable";
import { PresenceResultsToolbar } from "./PresenceResultsToolbar";
import { PresenceTotalsPanel } from "./PresenceTotalsPanel";

export const PresenceResultsPanel = ({
  publicFormHref,
  readingControls,
  publicView = false,
  formTitle,
  linkedPeople,
  grauOptions,
  selectedGrau,
  onSelectGrau,
  stats,
  feedback,
  totalsLayout,
  tableRows,
  sorted,
  showLinkedRows,
  columns,
  resultsConfig,
  tableMinWidth,
  tableZoom,
  onZoomChange,
  onResetZoom,
  onExportCsv,
  filterButtons,
  activeSearchCol,
  onToggleSearchCol,
  activeFilter,
  activeFilterLabel,
  activeFilterOptions,
  columnSearches,
  onChangeColumnSearch,
  onClearFilters,
  onClearColumnSearch,
  handleTableTouchStart,
  handleTableTouchMove,
  handleTableTouchEnd,
  headerCellStyle,
  sortIndicator,
  onSort,
  formatFieldValue,
  getFieldValue,
  NO_VALUES,
}) => (
  <div>
    <ResultsPresenceHeader
      publicActionHref={publicFormHref}
      readingControls={readingControls}
      grauOptions={!publicView && linkedPeople ? grauOptions : []}
      selectedGrau={selectedGrau}
      onSelectGrau={onSelectGrau}
      stats={stats}
    />
    {publicView && (
      <div className="public-results-intro" style={{ margin: "0 0 16px", padding: "18px 20px", borderRadius: 12, background: "var(--header-bg)", color: "var(--header-fg)" }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--header-fg-muted)" }}>Resultados públicos</div>
        <h1 style={{ margin: "5px 0 4px", fontSize: 22, lineHeight: 1.15 }}>{formTitle || "Lista de presença"}</h1>
        <p style={{ margin: 0, fontSize: 12, color: "var(--header-fg-muted)" }}>Confira os totais e as pessoas que já responderam.</p>
      </div>
    )}
    {feedback && <div style={{ marginBottom: 12 }}><FeedbackBanner tone={feedback.tone} message={feedback.message} fixed /></div>}
    <PresenceTotalsPanel totalsLayout={totalsLayout} />

    {!publicView && (
      <PresenceResultsToolbar
        resultsConfig={resultsConfig}
        filterButtons={filterButtons}
        activeSearchCol={activeSearchCol}
        onToggleSearchCol={onToggleSearchCol}
        columnSearches={columnSearches}
        activeFilter={activeFilter}
        activeFilterLabel={activeFilterLabel}
        activeFilterOptions={activeFilterOptions}
        onChangeColumnSearch={onChangeColumnSearch}
        onClearFilters={onClearFilters}
        onClearColumnSearch={onClearColumnSearch}
        tableZoom={tableZoom}
        onZoomChange={onZoomChange}
        onResetZoom={onResetZoom}
        onExportCsv={onExportCsv}
      />
    )}

    <PresenceResultsTable
      columns={columns}
      formatFieldValue={formatFieldValue}
      getFieldValue={getFieldValue}
      handleTableTouchEnd={handleTableTouchEnd}
      handleTableTouchMove={handleTableTouchMove}
      handleTableTouchStart={handleTableTouchStart}
      headerCellStyle={headerCellStyle}
      NO_VALUES={NO_VALUES}
      onSort={onSort}
      showLinkedRows={showLinkedRows}
      sortIndicator={sortIndicator}
      sorted={sorted}
      tableMinWidth={tableMinWidth}
      tableRows={tableRows}
      tableZoom={tableZoom}
    />
  </div>
);
