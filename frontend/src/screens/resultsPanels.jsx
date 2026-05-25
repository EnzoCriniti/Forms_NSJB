/**
 * @file frontend/src/screens/resultsPanels.jsx
 * @summary Paineis reutilizaveis da tela de resultados.
 * @responsibility Concentrar a renderizacao visual da planilha de presenca.
 */

import React from "react";
import { FeedbackBanner, ConfirmModal } from "../components/ui";
import { EscalaResultsOverview } from "./EscalaResultsOverview";
import { EscalaSectionsPanel } from "./EscalaSectionsPanel";
import { EscalaSignupModal } from "./EscalaSignupModal";
import { ResultsPresenceHeader } from "../components/ResultsPresenceHeader";
import { PresenceResultsTable } from "./PresenceResultsTable";
import { PresenceResultsToolbar } from "./PresenceResultsToolbar";
import { PresenceTotalsPanel } from "./PresenceTotalsPanel";

export const PresenceResultsPanel = ({
  publicFormHref,
  readingControls,
  linkedPeople,
  grauOptions,
  selectedGrau,
  onSelectGrau,
  stats,
  feedback,
  totalsLayout,
  filteredResponses,
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
      grauOptions={linkedPeople ? grauOptions : []}
      selectedGrau={selectedGrau}
      onSelectGrau={onSelectGrau}
      stats={stats}
    />
    {feedback && <div style={{ marginBottom: 12 }}><FeedbackBanner tone={feedback.tone} message={feedback.message} fixed /></div>}
    <PresenceTotalsPanel filteredResponses={filteredResponses} totalsLayout={totalsLayout} />

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

export const EscalaResultsPanel = ({
  canEdit,
  feedback,
  filled,
  total,
  sections,
  people,
  busyAction,
  showSignup,
  selSlot,
  signName,
  names,
  onOpenSignup,
  onCloseSignup,
  onSetSignName,
  onConfirmSignup,
  onUpdateSlot,
  onRemoveSlot,
  onConfirmRemoval,
  onAddSlot,
  onExportCsv,
  onCancelRemoval,
  pendingRemoval,
}) => (
  <div>
    <EscalaResultsOverview
      canEdit={canEdit}
      feedback={feedback}
      filled={filled}
      onExportCsv={onExportCsv}
      total={total}
    />
    <EscalaSectionsPanel
      busyAction={busyAction}
      canEdit={canEdit}
      onAddSlot={onAddSlot}
      onOpenSignup={onOpenSignup}
      onRemoveSlot={onRemoveSlot}
      onUpdateSlot={onUpdateSlot}
      people={people}
      sections={sections}
    />
    {showSignup && selSlot && canEdit && (
      <EscalaSignupModal
        busy={busyAction === "signup"}
        names={names}
        onClose={onCloseSignup}
        onConfirm={onConfirmSignup}
        onSetSignName={onSetSignName}
        sectionTitle={sections[selSlot.sectionIndex].title}
        signName={signName}
        slotRole={sections[selSlot.sectionIndex].slots[selSlot.slotIndex].role}
      />
    )}
    <ConfirmModal
      open={Boolean(pendingRemoval)}
      title="Remover vaga"
      message="Tem certeza que deseja remover a pessoa desta vaga? A alteração será salva imediatamente."
      confirmLabel="Remover"
      tone="danger"
      busy={busyAction === "remove"}
      onCancel={onCancelRemoval}
      onConfirm={onConfirmRemoval}
    />
  </div>
);
