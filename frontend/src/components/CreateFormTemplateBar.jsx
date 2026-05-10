/**
 * @file frontend/src/components/CreateFormTemplateBar.jsx
 * @summary Barra de selecao de template na criacao de formulario.
 * @responsibility Expor troca e limpeza de template sem acoplar a tela principal.
 */

import React from "react";
import { COLORS, Icon, Btn } from "./ui";
import { getFormMode } from "../lib/forms";

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

export const CreateFormTemplateBar = ({
  format,
  formMode,
  preset,
  presets = [],
  onApplyTemplate,
  onClearTemplate,
}) => {
  const visiblePresets = presets.filter(item => {
    if (item.type !== format) return false;
    if (format !== "presenca") return true;
    return getFormMode(item) === formMode;
  });

  return (
  <div className="create-form-template-bar" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, padding: "10px 14px", background: COLORS.surfaceAlt, borderRadius: 10, border: `1px solid ${COLORS.borderLight}` }}>
    <Icon name="clipboard" size={14} />
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, whiteSpace: "nowrap" }}>Templates de formulario</div>
      <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>Escolha um modelo inicial para o formulario atual.</div>
    </div>
    <select value={preset || ""} onChange={event => onApplyTemplate(event.target.value || null)} style={{ ...inputStyle, flex: 1, maxWidth: 320 }}>
      <option value="">Template vazio</option>
      {visiblePresets.map(item => <option key={item.id} value={item.id}>{item.name} ({item.type === "escala_organ" ? "Escala" : "Presenca"})</option>)}
    </select>
    {preset && <span style={{ fontSize: 11, color: COLORS.accent, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}><Icon name="check" size={12} /> Aplicado</span>}
    {preset && <Btn v="ghost" sz="sm" onClick={onClearTemplate}>Limpar</Btn>}
  </div>
  );
};
