import React from "react";
import { COLORS, Btn } from "../components/ui";

export const PublicScaleSignupModal = ({
  sectionTitle,
  slotRole,
  names,
  signName,
  onChangeSignName,
  onCancel,
  onConfirm,
  saving,
}) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
    <div style={{ background: COLORS.surface, borderRadius: 16, padding: 24, width: 420, maxWidth: "100%" }}>
      <h3 style={{ margin: "0 0 6px" }}>Preencher vaga</h3>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: COLORS.textSecondary }}><strong>{sectionTitle}</strong> - {slotRole}</p>
      <select value={signName} onChange={event => onChangeSignName(event.target.value)} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, marginBottom: 16 }}>
        <option value="">Selecione seu nome...</option>
        {names.map(name => <option key={name} value={name}>{name}</option>)}
      </select>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Btn v="secondary" onClick={onCancel} disabled={saving}>Cancelar</Btn>
        <Btn icon="check" disabled={!signName} onClick={onConfirm} loading={saving}>Confirmar</Btn>
      </div>
    </div>
  </div>
);
