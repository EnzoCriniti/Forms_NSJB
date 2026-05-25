/**
 * @file frontend/src/screens/PresenceResultsTable.jsx
 * @summary Tabela da planilha de resultados de presenca.
 */

import React from "react";
import { COLORS } from "../components/ui";

const ColumnHeader = ({ label, sortIndicator }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
    <span>{label}</span>
    {sortIndicator}
  </div>
);

export const PresenceResultsTable = ({
  columns,
  formatFieldValue,
  getFieldValue,
  handleTableTouchEnd,
  handleTableTouchMove,
  handleTableTouchStart,
  headerCellStyle,
  NO_VALUES,
  onSort,
  showLinkedRows,
  sortIndicator,
  sorted,
  tableMinWidth,
  tableRows,
  tableZoom,
}) => (
  <>
    <div
      className="results-table-shell"
      onTouchStart={handleTableTouchStart}
      onTouchMove={handleTableTouchMove}
      onTouchEnd={handleTableTouchEnd}
      onTouchCancel={handleTableTouchEnd}
      style={{ width: "100%", maxWidth: "100%", display: "block", overflow: "auto", WebkitOverflowScrolling: "touch", touchAction: "auto", overscrollBehavior: "contain", borderRadius: 10, border: `1px solid ${COLORS.borderLight}` }}
    >
      <div className="results-table-stage" style={{ width: "max-content", minWidth: `${tableMinWidth}px`, zoom: tableZoom }}>
        <table className="results-table" style={{ width: "100%", minWidth: `${tableMinWidth}px`, borderCollapse: "collapse", fontSize: 12, tableLayout: "auto", userSelect: "text", WebkitUserSelect: "text" }}>
          <thead>
            <tr>
              <th className="results-sticky-col results-sticky-grau" onClick={() => onSort("grau")} style={{ ...headerCellStyle("grau"), position: "sticky", left: 0, zIndex: 2 }}>
                <ColumnHeader label="Grau" sortIndicator={sortIndicator("grau")} />
              </th>
              <th className="results-sticky-col results-sticky-name" onClick={() => onSort("name")} style={{ ...headerCellStyle("name"), position: "sticky", left: 42, zIndex: 2 }}>
                <ColumnHeader label="Nome" sortIndicator={sortIndicator("name")} />
              </th>
              {showLinkedRows && (
                <th onClick={() => onSort("status")} style={headerCellStyle("status")}>
                  <ColumnHeader label="Status" sortIndicator={sortIndicator("status")} />
                </th>
              )}
              {columns.map(col => (
                <th key={col.id} onClick={() => onSort(col.id)} style={headerCellStyle(col.id)}>
                  <ColumnHeader label={col.label} sortIndicator={sortIndicator(col.id)} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, index) => (
              <tr key={row.key} style={{ background: index % 2 ? COLORS.surfaceAlt : COLORS.surface }}>
                <td className="results-sticky-col results-sticky-grau" style={{ padding: "8px 12px", fontWeight: 600, color: COLORS.textSecondary, position: "sticky", left: 0, background: index % 2 ? COLORS.surfaceAlt : COLORS.surface, zIndex: 1, minWidth: 90, userSelect: "text", WebkitUserSelect: "text" }}>{row.grau}</td>
                <td className="results-sticky-col results-sticky-name" style={{ padding: "8px 12px", fontWeight: 500, whiteSpace: "nowrap", position: "sticky", left: 42, background: index % 2 ? COLORS.surfaceAlt : COLORS.surface, zIndex: 1, minWidth: 160, userSelect: "text", WebkitUserSelect: "text" }}>{row.name}</td>
                {showLinkedRows && (
                  <td style={{ padding: "8px 12px", fontWeight: 700, color: row.status === "Respondido" ? COLORS.accent : row.status === "Extra" ? COLORS.warning : COLORS.danger, minWidth: 110, userSelect: "text", WebkitUserSelect: "text" }}>
                    {row.status}
                  </td>
                )}
                {columns.map(col => {
                  const value = getFieldValue(row.response, col.id);
                  const bool = value === "Sim" || NO_VALUES.includes(value);
                  return <td key={col.id} style={{ padding: "8px 12px", textAlign: "center", fontWeight: 500, color: bool ? (value === "Sim" ? COLORS.accent : COLORS.danger) : COLORS.text, minWidth: 130, whiteSpace: "nowrap", userSelect: "text", WebkitUserSelect: "text" }}>{formatFieldValue(value, col.type)}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 8, textAlign: "right" }}>
      Exibindo {sorted.length} de {tableRows.length} linhas
    </div>
  </>
);
