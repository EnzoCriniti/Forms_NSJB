/**
 * @file frontend/src/features/events/components/eventMessagesPanels.jsx
 * @summary Paineis reutilizaveis das mensagens de evento.
 * @responsibility Conter a UI comum de destinatarios do editor de mensagens.
 */

import React from "react";
import { COLORS } from "../../../components/ui";
import { ManualPersonPicker } from "./eventMessageManualPersonPicker";

export { MessageSchedulePanel } from "./eventMessageSchedulePanel";

const panelStyle = {
  border: `1px solid ${COLORS.borderLight}`,
  borderRadius: 8,
  padding: 12,
  display: "grid",
  gap: 10,
};

export const MessageRecipientsPanel = ({
  draft,
  personPresets,
  people,
  inputStyle,
  messagingConfig,
  selectedForm,
  onChange,
}) => (
  <fieldset style={panelStyle}>
    <legend style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, padding: "0 6px" }}>Destinatários</legend>
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
      <input type="radio" checked={draft.recipientsMode === "auto"} onChange={() => onChange({ recipientsMode: "auto" })} />
      Quem ainda não respondeu (automático)
    </label>
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
      <input type="radio" checked={draft.recipientsMode === "preset"} onChange={() => onChange({ recipientsMode: "preset" })} disabled={personPresets.length === 0} />
      Usar preset de pessoas
    </label>
    {draft.recipientsMode === "preset" && (
      <select value={draft.recipientsPresetId || ""} onChange={event => onChange({ recipientsPresetId: event.target.value })} style={inputStyle}>
        <option value="">Selecione um preset...</option>
        {personPresets.map(preset => (
          <option key={preset.id} value={preset.id}>{preset.name} ({preset.personKeys.length})</option>
        ))}
      </select>
    )}
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
      <input type="radio" checked={draft.recipientsMode === "manual"} onChange={() => onChange({ recipientsMode: "manual" })} />
      Seleção manual
    </label>
    {draft.recipientsMode === "manual" && (
      <ManualPersonPicker people={people} selected={draft.recipientsPersonKeys} onChange={keys => onChange({ recipientsPersonKeys: keys })} inputStyle={inputStyle} />
    )}
    {(() => {
      const graus = [...new Set((people || []).map(person => person.grau).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
      if (graus.length === 0) return null;
      const selected = draft.recipientsGraus || [];
      const toggle = grau => onChange({ recipientsGraus: selected.includes(grau) ? selected.filter(item => item !== grau) : [...selected, grau] });
      return (
        <div style={{ display: "grid", gap: 6 }}>
          <span style={{ fontSize: 12, color: COLORS.textSecondary }}>Filtrar por grau {selected.length === 0 ? "(todos)" : `(${selected.length})`}</span>
          <div className="msg-var-chips">
            {graus.map(grau => (
              <button
                type="button"
                key={grau}
                className="msg-var-chip"
                aria-pressed={selected.includes(grau)}
                style={selected.includes(grau) ? { background: COLORS.primary, color: "#fff", borderColor: COLORS.primary } : undefined}
                onClick={() => toggle(grau)}
              >
                {grau}
              </button>
            ))}
          </div>
        </div>
      );
    })()}
    {draft.type === "fill_reminder" && (
      <div style={{ fontSize: 11, color: COLORS.textMuted }}>
        Base pública: {messagingConfig?.publicBaseUrl ? "configurada" : "ausente"}{selectedForm?.closing ? ` - fechamento: ${new Date(selectedForm.closing).toLocaleString("pt-BR")}` : ""}
      </div>
    )}
  </fieldset>
);
