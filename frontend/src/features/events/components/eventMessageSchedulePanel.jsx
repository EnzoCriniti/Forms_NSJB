/**
 * @file frontend/src/features/events/components/eventMessageSchedulePanel.jsx
 * @summary Painel de agendamento do editor de mensagens de evento.
 */

import React from "react";
import { COLORS } from "../../../components/ui";

const panelStyle = {
  border: `1px solid ${COLORS.borderLight}`,
  borderRadius: 8,
  padding: 12,
  display: "grid",
  gap: 10,
};

export const MessageSchedulePanel = ({ draft, selectedForm, inputStyle, onChange }) => (
  <fieldset style={panelStyle}>
    <legend style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, padding: "0 6px" }}>Agendamento</legend>
    {draft.type === "fill_reminder" ? (
      <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
        Janela
        <select value={draft.windowOption || ""} onChange={event => onChange({ windowOption: event.target.value, scheduledFor: "" })} style={inputStyle}>
          <option value="">Sem agendamento (rascunho)</option>
          <option value="morning_of_closing">Manha do fechamento (07h)</option>
          <option value="12h_before">12h antes do fechamento</option>
          <option value="1h_before">1h antes do fechamento</option>
        </select>
        {selectedForm?.closing && draft.windowOption && (
          <span style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 400 }}>
            Fechamento do form: {new Date(selectedForm.closing).toLocaleString("pt-BR")}
          </span>
        )}
      </label>
    ) : (
      <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
        Data e hora (opcional)
        <input type="datetime-local" value={toLocalDateTime(draft.scheduledFor)} onChange={event => onChange({ scheduledFor: event.target.value })} style={inputStyle} />
      </label>
    )}
    <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
      <input type="checkbox" checked={draft.autoDispatchEnabled} onChange={event => onChange({ autoDispatchEnabled: event.target.checked })} />
      Permitir disparo automatico no horario agendado
    </label>
    <span style={{ fontSize: 11, color: COLORS.textMuted }}>
      Se desabilitado, no horario agendado a mensagem fica como "pronta" aguardando disparo manual.
    </span>
  </fieldset>
);

const toLocalDateTime = isoValue => {
  if (!isoValue) return "";
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return "";
  const pad = value => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};
