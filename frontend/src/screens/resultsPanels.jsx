/**
 * @file frontend/src/screens/resultsPanels.jsx
 * @summary Paineis reutilizaveis da tela de resultados.
 * @responsibility Concentrar a renderizacao visual da planilha de presenca.
 */

import React from "react";
import { COLORS, Btn, FeedbackBanner, ConfirmModal, MetricCard } from "../components/ui";
import { EscalaSectionsPanel } from "./EscalaSectionsPanel";
import { ResultsPresenceHeader } from "../components/ResultsPresenceHeader";
import { PresenceResultsTable } from "./PresenceResultsTable";
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

export const PresenceResultsToolbar = ({
  resultsConfig,
  filterButtons,
  activeSearchCol,
  onToggleSearchCol,
  columnSearches,
  activeFilter,
  activeFilterLabel,
  activeFilterOptions,
  onChangeColumnSearch,
  onClearFilters,
  onClearColumnSearch,
  tableZoom,
  onZoomChange,
  onResetZoom,
  onExportCsv,
}) => (
  <>
    {resultsConfig.searchEnabled && (
      <div
        className="results-filter-toolbar"
        style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.borderLight}`,
          borderRadius: 12,
          padding: 14,
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, marginBottom: 10 }}>Filtros da planilha</div>
        <div className="results-filter-toolbar-row" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {filterButtons.map(item => (
            <Btn
              key={item.id}
              v={activeSearchCol === item.id ? "primary" : "secondary"}
              sz="sm"
              onClick={() => onToggleSearchCol(item.id)}
            >
              {item.label}
            </Btn>
          ))}
          {Object.values(columnSearches).some(value => String(value || "").trim()) && (
            <Btn v="ghost" sz="sm" onClick={onClearFilters}>
              Limpar filtros
            </Btn>
          )}
        </div>
        {activeSearchCol && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
            {activeFilter?.type === "select"
              ? (
                <select
                  value={columnSearches[activeSearchCol] || ""}
                  onChange={event => onChangeColumnSearch(activeSearchCol, event.target.value)}
                  style={{
                    flex: "1 1 240px",
                    minWidth: 0,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: `1px solid ${COLORS.border}`,
                    background: COLORS.surfaceAlt,
                    color: COLORS.text,
                    fontFamily: "inherit",
                  }}
                >
                  <option value="">Todos os valores de {activeFilterLabel.toLowerCase()}</option>
                  {activeFilterOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              )
              : (
                <input
                  value={columnSearches[activeSearchCol] || ""}
                  onChange={event => onChangeColumnSearch(activeSearchCol, event.target.value)}
                  placeholder={`Filtrar ${activeFilterLabel.toLowerCase()}...`}
                  style={{
                    flex: "1 1 240px",
                    minWidth: 0,
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: `1px solid ${COLORS.border}`,
                    background: COLORS.surfaceAlt,
                    color: COLORS.text,
                    fontFamily: "inherit",
                  }}
                />
              )}
            <Btn
              v="secondary"
              sz="sm"
              onClick={() => onClearColumnSearch(activeSearchCol)}
            >
              Limpar
            </Btn>
          </div>
        )}
      </div>
    )}

    <div className="results-sheet-toolbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
      <div className="results-zoom-controls" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <Btn v="secondary" sz="sm" onClick={() => onZoomChange(-1)} disabled={tableZoom <= 0.4} aria-label="Diminuir zoom da planilha">A-</Btn>
        <Btn v="secondary" sz="sm" onClick={() => onZoomChange(1)} disabled={tableZoom >= 2.5} aria-label="Aumentar zoom da planilha">A+</Btn>
        <Btn v="ghost" sz="sm" onClick={onResetZoom} disabled={tableZoom === 1}>100%</Btn>
      </div>
      <Btn v="secondary" sz="sm" icon="download" onClick={onExportCsv}>Exportar</Btn>
    </div>
  </>
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
    <div className="results-sheet-toolbar" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
      <Btn v="secondary" icon="download" sz="sm" onClick={onExportCsv}>Exportar</Btn>
    </div>
    {feedback && <div style={{ marginBottom: 12 }}><FeedbackBanner tone={feedback.tone} message={feedback.message} fixed /></div>}
    {!canEdit && (
      <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 10, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: "#795548", display: "flex", alignItems: "center", gap: 8 }}>
        <span>Voce nao tem permissao para editar esta escala. Apenas administradores podem fazer alteracoes.</span>
      </div>
    )}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
      <MetricCard value={filled} label="Preenchidas" tone={COLORS.primary} style={{ padding: "12px 16px" }} />
      <MetricCard value={total - filled} label="Pendentes" tone={COLORS.danger} style={{ padding: "12px 16px" }} />
      <MetricCard value={total} label="Total" tone={COLORS.textSecondary} style={{ padding: "12px 16px" }} />
    </div>
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
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
        <div style={{ background: COLORS.surface, borderRadius: 16, padding: 24, width: 400, maxWidth: "90vw" }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>Inscrever-se na vaga</h3>
          <p style={{ margin: "0 0 16px", fontSize: 13, color: COLORS.textSecondary }}><strong>{sections[selSlot.sectionIndex].title}</strong> - {sections[selSlot.sectionIndex].slots[selSlot.slotIndex].role}</p>
          <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, display: "block", marginBottom: 6 }}>Selecione seu nome</label>
          <select value={signName} onChange={event => onSetSignName(event.target.value)} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: COLORS.surface, boxSizing: "border-box", marginBottom: 16 }}>
            <option value="">Selecione...</option>{names.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}><Btn v="secondary" onClick={onCloseSignup} disabled={busyAction === "signup"}>Cancelar</Btn><Btn icon="check" onClick={onConfirmSignup} disabled={!signName} loading={busyAction === "signup"}>Confirmar</Btn></div>
        </div>
      </div>
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
