/**
 * @file frontend/src/features/admin/adminFieldPreview.jsx
 * @summary Preview de campo base administrativo.
 * @responsibility Renderizar uma previa visual do campo de catalogo em edicao.
 */

import React from "react";
import { COLORS } from "../../components/ui";
import { DEFAULT_GRID_COLS, DEFAULT_GRID_ROWS } from "../../lib/gridDefaults";
import { fieldTypeLabels } from "./adminSettingsConstants";

export const FieldCatalogPreview = ({ draft, externalBases }) => {
  const label = draft.defaultLabel.trim() || draft.name.trim() || "Rotulo do campo";
  const gridRows = draft.gridSchema?.rows?.filter(Boolean)?.length ? draft.gridSchema.rows.filter(Boolean) : DEFAULT_GRID_ROWS;
  const gridCols = draft.gridSchema?.cols?.filter(Boolean)?.length ? draft.gridSchema.cols.filter(Boolean) : DEFAULT_GRID_COLS;
  const externalBase = draft.selectionSource?.kind === "external_base"
    ? (externalBases || []).find(base => String(base.id) === String(draft.selectionSource.externalBaseId || ""))
    : null;
  return (
    <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginBottom: 10 }}>
        <strong style={{ fontSize: 12, color: COLORS.text }}>Previa do campo</strong>
        <span style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 800, textTransform: "uppercase" }}>{fieldTypeLabels[draft.type]}</span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>{label}</div>
      {draft.type === "person_select" && (
        <>
          <select disabled style={{ width: "100%", minHeight: 42, padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 10, background: COLORS.surface, color: COLORS.text, boxShadow: "var(--shadow-sm)" }}>
            <option>{draft.selectionSource?.kind === "external_base" ? "Selecione uma opcao..." : "Selecione uma pessoa..."}</option>
          </select>
          <div style={{ marginTop: 8, fontSize: 11, color: COLORS.textMuted, lineHeight: 1.45 }}>
            {draft.selectionSource?.kind === "external_base"
              ? `Vinculo configurado: ${externalBase?.name || "base externa"}`
              : "Vinculo configurado: base central de socios"}
          </div>
        </>
      )}
      {draft.type === "yes_no" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button disabled style={{ padding: 10, border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, background: COLORS.surface, color: COLORS.text, fontWeight: 800 }}>Sim</button>
          <button disabled style={{ padding: 10, border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, background: COLORS.surface, color: COLORS.text, fontWeight: 800 }}>Nao</button>
        </div>
      )}
      {draft.type === "number" && <input disabled type="number" placeholder="0" style={{ width: "100%", minHeight: 42, padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 10, background: COLORS.surface, color: COLORS.text, boxShadow: "var(--shadow-sm)" }} />}
      {draft.type === "text" && <input disabled placeholder="Resposta curta" style={{ width: "100%", minHeight: 42, padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 10, background: COLORS.surface, color: COLORS.text, boxShadow: "var(--shadow-sm)" }} />}
      {draft.type === "grid" && (
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
      )}
    </div>
  );
};
