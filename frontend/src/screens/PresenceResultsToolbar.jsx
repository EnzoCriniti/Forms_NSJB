/**
 * @file frontend/src/screens/PresenceResultsToolbar.jsx
 * @summary Toolbar de filtros, zoom e exportacao da planilha de presenca.
 */

import React from "react";
import { COLORS, Btn } from "../components/ui";

export const PresenceResultsToolbar = ({
  activeFilter,
  activeFilterLabel,
  activeFilterOptions,
  activeSearchCol,
  columnSearches,
  filterButtons,
  onChangeColumnSearch,
  onClearColumnSearch,
  onClearFilters,
  onExportCsv,
  onResetZoom,
  onToggleSearchCol,
  onZoomChange,
  resultsConfig,
  tableZoom,
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
