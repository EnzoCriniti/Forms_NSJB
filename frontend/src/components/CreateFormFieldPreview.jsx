/**
 * @file frontend/src/components/CreateFormFieldPreview.jsx
 * @summary Previa isolada do campo em criacao/edicao de formulario.
 * @responsibility Exibir a renderizacao do campo sem acoplar a tela principal.
 */

import React from "react";
import { COLORS } from "./ui";

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  fontSize: 13,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
  background: COLORS.surface,
  color: COLORS.text,
};

const inputStyleSmall = {
  ...inputStyle,
  padding: "6px 10px",
  fontSize: 12,
};

export const CreateFormFieldPreview = ({
  fieldLabel,
  fieldType,
  required = false,
  people = [],
  gridRows = [],
  gridCols = [],
}) => {
  const activeRows = gridRows.filter(row => String(row || "").trim());
  const activeCols = gridCols.filter(col => String(col || "").trim());

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 10, padding: 14, height: "100%" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Previa do campo</div>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: COLORS.text }}>
        {fieldLabel}{required ? <span style={{ color: COLORS.danger }}> *</span> : ""}
      </div>
      {fieldType === "person_select" && (
        <select disabled style={{ ...inputStyle, color: COLORS.textMuted }}>
          <option>{people.length ? "Selecione uma pessoa..." : "Nenhuma pessoa configurada"}</option>
        </select>
      )}
      {fieldType === "yes_no" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button disabled style={{ padding: "10px", border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, background: COLORS.surface, fontWeight: 700, fontSize: 13, cursor: "default" }}>Sim</button>
          <button disabled style={{ padding: "10px", border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, background: COLORS.surface, fontWeight: 700, fontSize: 13, cursor: "default" }}>Nao</button>
        </div>
      )}
      {fieldType === "number" && <input disabled type="number" placeholder="0" style={inputStyle} />}
      {fieldType === "text" && <input disabled placeholder="Digite sua resposta..." style={inputStyle} />}
      {fieldType === "grid" && (
        activeRows.length === 0 || activeCols.length === 0
          ? <div style={{ fontSize: 12, color: COLORS.textMuted, fontStyle: "italic" }}>Adicione linhas e colunas para ver a previa</div>
          : <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr>
                    <th style={{ padding: "5px 8px", textAlign: "left", borderBottom: `2px solid ${COLORS.borderLight}`, color: COLORS.textMuted, fontWeight: 600, minWidth: 80 }} />
                    {activeCols.map((col, index) => (
                      <th key={index} style={{ padding: "5px 8px", textAlign: "center", borderBottom: `2px solid ${COLORS.borderLight}`, color: COLORS.textSecondary, fontWeight: 700, whiteSpace: "nowrap" }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeRows.map((row, rowIndex) => (
                    <tr key={rowIndex} style={{ borderBottom: rowIndex < activeRows.length - 1 ? `1px solid ${COLORS.borderLight}` : "none" }}>
                      <td style={{ padding: "7px 8px", fontWeight: 500, color: COLORS.text }}>{row}</td>
                      {activeCols.map((_, colIndex) => (
                        <td key={colIndex} style={{ padding: "7px 8px", textAlign: "center" }}>
                          <input type="radio" disabled style={{ cursor: "default" }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
      )}
    </div>
  );
};
