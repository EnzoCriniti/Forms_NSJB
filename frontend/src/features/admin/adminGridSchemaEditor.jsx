/**
 * @file frontend/src/features/admin/adminGridSchemaEditor.jsx
 * @summary Editor de schema de grade administrativo.
 * @responsibility Editar linhas, colunas e presets dos campos de grade.
 */

import React from "react";
import { Btn, COLORS } from "../../components/ui";
import { DEFAULT_GRID_COLS, DEFAULT_GRID_ROWS, SCALE_PRESETS } from "../../lib/gridDefaults";

const MATRIX_INPUT_STYLE = {
  width: "100%",
  minHeight: 42,
  padding: "10px 12px",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 10,
  background: COLORS.surface,
  color: COLORS.text,
  boxShadow: "var(--shadow-sm)",
  flex: 1,
};

export const GridSchemaEditor = ({ value, onChange }) => {
  const rows = value?.rows?.length ? value.rows : DEFAULT_GRID_ROWS;
  const cols = value?.cols?.length ? value.cols : DEFAULT_GRID_COLS;
  const updateRow = (index, nextValue) => onChange({ rows: rows.map((row, rowIndex) => rowIndex === index ? nextValue : row), cols });
  const updateCol = (index, nextValue) => onChange({ rows, cols: cols.map((col, colIndex) => colIndex === index ? nextValue : col) });

  return (
    <div style={{ display: "grid", gap: 10, background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 10 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, color: COLORS.textSecondary, marginBottom: 6 }}>Linhas da matriz</div>
        {rows.map((row, index) => (
          <div key={index} style={{ display: "flex", gap: 6, marginBottom: 5 }}>
            <input value={row} onChange={e => updateRow(index, e.target.value)} placeholder={`Linha ${index + 1}`} style={MATRIX_INPUT_STYLE} />
            <button onClick={() => onChange({ rows: rows.filter((_, rowIndex) => rowIndex !== index), cols })} style={{ border: 0, background: "transparent", color: COLORS.danger, cursor: "pointer" }}>Remover</button>
          </div>
        ))}
        <Btn v="secondary" sz="sm" onClick={() => onChange({ rows: [...rows, ""], cols })}>Adicionar linha</Btn>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, color: COLORS.textSecondary, marginBottom: 6 }}>Colunas da matriz</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
          {SCALE_PRESETS.map(preset => <Btn key={preset.label} v="ghost" sz="sm" onClick={() => onChange({ rows, cols: preset.cols })}>{preset.label}</Btn>)}
        </div>
        {cols.map((col, index) => (
          <div key={index} style={{ display: "flex", gap: 6, marginBottom: 5 }}>
            <input value={col} onChange={e => updateCol(index, e.target.value)} placeholder={`Coluna ${index + 1}`} style={MATRIX_INPUT_STYLE} />
            <button onClick={() => onChange({ rows, cols: cols.filter((_, colIndex) => colIndex !== index) })} style={{ border: 0, background: "transparent", color: COLORS.danger, cursor: "pointer" }}>Remover</button>
          </div>
        ))}
        <Btn v="secondary" sz="sm" onClick={() => onChange({ rows, cols: [...cols, ""] })}>Adicionar coluna</Btn>
      </div>
    </div>
  );
};
