/**
 * @file frontend/src/features/events/components/eventEditorFieldsPanel.jsx
 * @summary Campos visuais do editor de evento.
 */

import React from "react";
import { Btn, COLORS } from "../../../components/ui";
import { buildEligibleGrauOptions, isGrauSelected, toggleEligibleGrau } from "../../../screens/eventGrauDomain";

const inputStyle = {
  padding: "10px 12px",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  background: COLORS.surface,
  color: COLORS.text,
};

const labelStyle = {
  display: "grid",
  gap: 6,
  fontSize: 12,
  fontWeight: 700,
  color: COLORS.textSecondary,
};

export const EventEditorFieldsPanel = ({ draft, onChangeDraft, onCancel, onSave, saving, people = [] }) => {
  const grauOptions = buildEligibleGrauOptions(people);
  const eligibleGraus = Array.isArray(draft.eligibleGraus) ? draft.eligibleGraus : [];

  return (
  <section style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 18 }}>
    <div style={{ display: "grid", gap: 14 }}>
      <div className="events-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: 12 }}>
        <label style={labelStyle}>
          Nome do evento
          <input value={draft.title} onChange={event => onChangeDraft(current => ({ ...current, title: event.target.value }))} placeholder="Ex: Reuniao mensal - Maio" style={inputStyle} />
        </label>
        <label style={labelStyle}>
          Data
          <input type="date" value={draft.date || ""} onChange={event => onChangeDraft(current => ({ ...current, date: event.target.value }))} style={inputStyle} />
        </label>
      </div>
      <div className="events-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label style={labelStyle}>
          Abertura
          <input type="datetime-local" value={draft.opening || ""} onChange={event => onChangeDraft(current => ({ ...current, opening: event.target.value }))} style={inputStyle} />
        </label>
        <label style={labelStyle}>
          Fechamento
          <input type="datetime-local" value={draft.closing || ""} onChange={event => onChangeDraft(current => ({ ...current, closing: event.target.value }))} style={inputStyle} />
        </label>
      </div>
      <label style={labelStyle}>
        Descrição
        <textarea value={draft.description || ""} onChange={event => onChangeDraft(current => ({ ...current, description: event.target.value }))} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
      </label>
      <div style={labelStyle}>
        Graus que devem preencher
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {grauOptions.map(grau => {
            const selected = isGrauSelected(eligibleGraus, grau);
            return (
              <button
                key={grau}
                type="button"
                onClick={() => onChangeDraft(current => ({ ...current, eligibleGraus: toggleEligibleGrau(current.eligibleGraus, grau) }))}
                aria-pressed={selected}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 999,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  border: `1px solid ${selected ? COLORS.primary : COLORS.border}`,
                  background: selected ? COLORS.primaryLight : COLORS.surface,
                  color: selected ? COLORS.primary : COLORS.textSecondary,
                }}
              >
                {selected ? "✓ " : ""}{grau}
              </button>
            );
          })}
        </div>
        <span style={{ fontWeight: 400, color: COLORS.textMuted, fontSize: 11 }}>
          Deixe sem marcar para cobrar todos os graus. Marcando, só os graus selecionados entram na conta de quem faltou.
        </span>
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <Btn v="secondary" onClick={onCancel}>Cancelar</Btn>
        <Btn icon="save" onClick={onSave} loading={saving} disabled={!draft.title.trim()}>Salvar evento</Btn>
      </div>
    </div>
  </section>
  );
};
