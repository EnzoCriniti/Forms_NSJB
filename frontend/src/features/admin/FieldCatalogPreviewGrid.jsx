import React from "react";
import { COLORS } from "../../components/ui";

export const FieldCatalogPreviewGrid = ({ gridRows, gridCols }) => (
  <div style={{ overflowX: "auto" }}>
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
      <thead>
        <tr>
          <th style={{ padding: 6, textAlign: "left", borderBottom: `2px solid ${COLORS.borderLight}` }} />
          {gridCols.map((col, index) => <th key={index} style={{ padding: 6, textAlign: "center", borderBottom: `2px solid ${COLORS.borderLight}`, color: COLORS.textSecondary }}>{col}</th>)}
        </tr>
      </thead>
      <tbody>
        {gridRows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            <td style={{ padding: 6, color: COLORS.text, borderBottom: `1px solid ${COLORS.borderLight}` }}>{row}</td>
            {gridCols.map((_, colIndex) => <td key={colIndex} style={{ padding: 6, textAlign: "center", borderBottom: `1px solid ${COLORS.borderLight}` }}><input disabled type="radio" /></td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
