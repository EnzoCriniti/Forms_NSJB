/**
 * @file frontend/src/screens/PublicEscalaScreen.jsx
 * @summary Fluxo publico da escala.
 * @responsibility Permitir inscricao em vagas pendentes da escala da Organ.
 */

import React, { useState } from "react";
import { COLORS, Btn, FeedbackBanner, PublicTopCompact, resolveActionErrorMessage } from "../components/ui";
import { getScalePersonLimit } from "../lib/forms";

export const PublicEscalaScreen = ({ onBack, form, people, sections = [], onSaveSections, onClaimSlot, readingControls }) => {
  const [selSlot, setSelSlot] = useState(null);
  const [signName, setSignName] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const names = people.map(person => person.name);
  const scaleLimit = getScalePersonLimit(form);
  const total = sections.reduce((sum, section) => sum + section.slots.length, 0);
  const filled = sections.reduce((sum, section) => sum + section.slots.filter(slot => slot.person).length, 0);

  const signup = async () => {
    setError("");
    if (!selSlot || !signName) return;

    const assignedCount = sections.reduce((sum, section) => sum + section.slots.filter(slot => String(slot.person || "").trim().toLowerCase() === signName.trim().toLowerCase()).length, 0);
    if (assignedCount >= scaleLimit) {
      setError(scaleLimit === 1 ? "Este nome ja esta em uma vaga desta escala." : "Este nome ja atingiu o limite de vagas desta escala.");
      return;
    }

    try {
      setSaving(true);
      if (onClaimSlot) {
        await onClaimSlot(selSlot.si, selSlot.sli, signName);
      } else if (onSaveSections) {
        const next = sections.map((section, sectionIndex) => sectionIndex === selSlot.si ? {
          ...section,
          slots: section.slots.map((slot, slotIndex) => slotIndex === selSlot.sli ? { ...slot, person: signName } : slot),
        } : section);
        await onSaveSections(next);
      }
      setSelSlot(null);
      setSignName("");
    } catch (saveError) {
      if (saveError?.status === 409 || saveError?.code === "ESCALA_CONFLICT" || saveError?.code === "ESCALA_LIMIT_REACHED") {
        setError(saveError.message || "A escala foi atualizada por outra pessoa. Recarregue a pagina e tente novamente.");
        return;
      }
      setError(resolveActionErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      <PublicTopCompact form={form} onBack={onBack} readingControls={readingControls} />
      <div className="public-response-card public-scale-card" style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderTop: "none", padding: 18 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
          <div className="public-scale-metric" style={{ background: COLORS.primaryLight, borderRadius: 10, padding: 12 }}><div style={{ fontSize: 11, color: COLORS.textSecondary }}>Preenchidas</div><strong style={{ fontSize: 24, color: COLORS.primary }}>{filled}</strong></div>
          <div className="public-scale-metric" style={{ background: COLORS.dangerLight, borderRadius: 10, padding: 12 }}><div style={{ fontSize: 11, color: COLORS.textSecondary }}>Pendentes</div><strong style={{ fontSize: 24, color: COLORS.danger }}>{total - filled}</strong></div>
          <div className="public-scale-metric" style={{ background: COLORS.surfaceAlt, borderRadius: 10, padding: 12 }}><div style={{ fontSize: 11, color: COLORS.textSecondary }}>Total</div><strong style={{ fontSize: 24, color: COLORS.textSecondary }}>{total}</strong></div>
        </div>
        <p style={{ margin: "0 0 14px", color: COLORS.textSecondary, fontSize: 13 }}>Escolha uma vaga pendente para preencher seu nome. Cada nome pode ocupar ate {scaleLimit} vaga{scaleLimit !== 1 ? "s" : ""} nesta escala.</p>
        {error && <div style={{ marginBottom: 14 }}><FeedbackBanner tone="error" message={error} /></div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="public-scale-section" style={{ border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ background: section.color, padding: "9px 14px", fontWeight: 800, fontSize: 13 }}>{section.title}</div>
              {section.slots.map((slot, slotIndex) => (
                <button key={slotIndex} disabled={!!slot.person} onClick={() => setSelSlot({ si: sectionIndex, sli: slotIndex })} style={{ width: "100%", border: "none", borderBottom: `1px solid ${COLORS.borderLight}`, background: slot.person ? COLORS.surfaceAlt : COLORS.surface, padding: "10px 14px", display: "flex", justifyContent: "space-between", gap: 10, cursor: slot.person ? "not-allowed" : "pointer", color: COLORS.text, textAlign: "left" }}>
                  <strong style={{ minWidth: 100 }}>{slot.role}</strong>
                  <span style={{ color: slot.person ? COLORS.textSecondary : COLORS.primary, fontWeight: slot.person ? 500 : 800 }}>{slot.person || "Pendente"}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      {selSlot && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
          <div style={{ background: COLORS.surface, borderRadius: 16, padding: 24, width: 420, maxWidth: "100%" }}>
            <h3 style={{ margin: "0 0 6px" }}>Preencher vaga</h3>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: COLORS.textSecondary }}><strong>{sections[selSlot.si].title}</strong> - {sections[selSlot.si].slots[selSlot.sli].role}</p>
            <select value={signName} onChange={event => setSignName(event.target.value)} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, marginBottom: 16 }}>
              <option value="">Selecione seu nome...</option>{names.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}><Btn v="secondary" onClick={() => setSelSlot(null)} disabled={saving}>Cancelar</Btn><Btn icon="check" disabled={!signName} onClick={signup} loading={saving}>Confirmar</Btn></div>
          </div>
        </div>
      )}
    </div>
  );
};
