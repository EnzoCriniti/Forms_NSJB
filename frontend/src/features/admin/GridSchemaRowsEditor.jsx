import React from "react";
import { Btn, COLORS } from "../../components/ui";
import { DEFAULT_GRID_COLS, DEFAULT_GRID_ROWS } from "../../lib/gridDefaults";

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

export const GridSchemaRowsEditor = ({ value, onChange }) => {
  const rows = value?.rows?.length ? value.rows : DEFAULT_GRID_ROWS;
  const cols = value?.cols?.length ? value.cols : DEFAULT_GRID_COLS;
  const updateRow = (index, nextValue) => onChange({ rows: rows.map((row, rowIndex) => rowIndex === index ? nextValue : row), cols });

  return (
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
  );
};
