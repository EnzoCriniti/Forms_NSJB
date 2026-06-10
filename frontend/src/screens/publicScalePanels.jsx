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

export const PublicScaleMetricsPanel = ({ filled, pending, total, scaleLimit }) => (
  <>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
      <div className="public-scale-metric" style={{ background: COLORS.primaryLight, borderRadius: 10, padding: 12 }}>
        <div style={{ fontSize: 11, color: COLORS.textSecondary }}>Preenchidas</div>
        <strong style={{ fontSize: 24, color: COLORS.primary }}>{filled}</strong>
      </div>
      <div className="public-scale-metric" style={{ background: COLORS.dangerLight, borderRadius: 10, padding: 12 }}>
        <div style={{ fontSize: 11, color: COLORS.textSecondary }}>Pendentes</div>
        <strong style={{ fontSize: 24, color: COLORS.danger }}>{pending}</strong>
      </div>
      <div className="public-scale-metric" style={{ background: COLORS.surfaceAlt, borderRadius: 10, padding: 12 }}>
        <div style={{ fontSize: 11, color: COLORS.textSecondary }}>Total</div>
        <strong style={{ fontSize: 24, color: COLORS.textSecondary }}>{total}</strong>
      </div>
    </div>
    <p style={{ margin: "0 0 14px", color: COLORS.textSecondary, fontSize: 13 }}>
      Escolha uma vaga pendente para preencher seu nome. Cada nome pode ocupar até {scaleLimit} vaga{scaleLimit !== 1 ? "s" : ""} nesta escala.
    </p>
  </>
);

export const PublicScaleSectionsPanel = ({ sections, onPickSlot }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {sections.map((section, sectionIndex) => (
      <div key={sectionIndex} className="public-scale-section" style={{ border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ background: section.color, padding: "9px 14px", fontWeight: 800, fontSize: 13 }}>{section.title}</div>
        {section.slots.map((slot, slotIndex) => (
          <button
            key={slotIndex}
            disabled={!!slot.person}
            onClick={() => onPickSlot(sectionIndex, slotIndex)}
            style={{ width: "100%", border: "none", borderBottom: `1px solid ${COLORS.borderLight}`, background: slot.person ? COLORS.surfaceAlt : COLORS.surface, padding: "10px 14px", display: "flex", justifyContent: "space-between", gap: 10, cursor: slot.person ? "not-allowed" : "pointer", color: COLORS.text, textAlign: "left" }}
          >
            <strong style={{ minWidth: 100 }}>{slot.role}</strong>
            <span style={{ color: slot.person ? COLORS.textSecondary : COLORS.primary, fontWeight: slot.person ? 500 : 800 }}>{slot.person || "Pendente"}</span>
          </button>
        ))}
      </div>
    ))}
  </div>
);
