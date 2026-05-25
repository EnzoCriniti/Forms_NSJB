/**
 * @file frontend/src/screens/EscalaSignupModal.jsx
 * @summary Modal visual de inscricao em vaga da escala de resultados.
 */

import React from "react";
import { Btn, COLORS } from "../components/ui";

export const EscalaSignupModal = ({
  busy,
  names,
  onClose,
  onConfirm,
  onSetSignName,
  sectionTitle,
  signName,
  slotRole,
}) => (
  <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
    <div style={{ background: COLORS.surface, borderRadius: 16, padding: 24, width: 400, maxWidth: "90vw" }}>
      <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>Inscrever-se na vaga</h3>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: COLORS.textSecondary }}><strong>{sectionTitle}</strong> - {slotRole}</p>
      <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, display: "block", marginBottom: 6 }}>Selecione seu nome</label>
      <select value={signName} onChange={event => onSetSignName(event.target.value)} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: COLORS.surface, boxSizing: "border-box", marginBottom: 16 }}>
        <option value="">Selecione...</option>
        {names.map(name => <option key={name} value={name}>{name}</option>)}
      </select>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
        <Btn v="secondary" onClick={onClose} disabled={busy}>Cancelar</Btn>
        <Btn icon="check" onClick={onConfirm} disabled={!signName} loading={busy}>Confirmar</Btn>
      </div>
    </div>
  </div>
);
