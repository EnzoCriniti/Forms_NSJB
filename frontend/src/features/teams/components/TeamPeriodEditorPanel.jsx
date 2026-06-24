/**
 * @file frontend/src/features/teams/components/TeamPeriodEditorPanel.jsx
 * @summary Editor visual de periodo de equipes.
 */

import React from "react";
import { Btn, COLORS } from "../../../components/ui";
import { findPersonName, togglePersonId } from "../../../screens/teamsDomain";

const inputStyle = {
  padding: "10px 12px",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  background: COLORS.surface,
  color: COLORS.text,
  width: "100%",
};

const labelStyle = {
  display: "grid",
  gap: 6,
  fontSize: 12,
  fontWeight: 800,
  color: COLORS.textSecondary,
};

const PersonMultiSelect = ({ label, people, selectedIds, onToggle }) => (
  <div style={labelStyle}>
    {label}
    <select
      value=""
      onChange={event => {
        onToggle(event.target.value);
        event.target.value = "";
      }}
      style={inputStyle}
    >
      <option value="">Adicionar pessoa...</option>
      {people.map(person => (
        <option key={person.id} value={person.id}>{person.name}</option>
      ))}
    </select>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
      {(selectedIds || []).map(id => (
        <button
          key={id}
          type="button"
          onClick={() => onToggle(id)}
          style={{
            border: `1px solid ${COLORS.border}`,
            borderRadius: 999,
            background: COLORS.surfaceAlt,
            color: COLORS.text,
            padding: "5px 9px",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {findPersonName(people, id)} x
        </button>
      ))}
    </div>
  </div>
);

export const TeamPeriodEditorPanel = ({ draft, people = [], onChangeDraft, onCancel, onSave, saving }) => (
  <section style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 18 }}>
    <div style={{ display: "grid", gap: 14 }}>
      <div className="teams-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 160px 160px", gap: 12 }}>
        <label style={labelStyle}>
          Nome do periodo
          <input
            value={draft.title}
            onChange={event => onChangeDraft(current => ({ ...current, title: event.target.value }))}
            placeholder="Ex: Equipes Maio/Junho"
            style={inputStyle}
          />
        </label>
        <label style={labelStyle}>
          Inicio
          <input type="date" value={draft.startDate} onChange={event => onChangeDraft(current => ({ ...current, startDate: event.target.value }))} style={inputStyle} />
        </label>
        <label style={labelStyle}>
          Conclusao
          <input type="date" value={draft.endDate} onChange={event => onChangeDraft(current => ({ ...current, endDate: event.target.value }))} style={inputStyle} />
        </label>
      </div>
      <div className="teams-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <label style={labelStyle}>
          Mestre Assistente
          <select value={draft.assistantMasterPersonId} onChange={event => onChangeDraft(current => ({ ...current, assistantMasterPersonId: event.target.value }))} style={inputStyle}>
            <option value="">Selecione...</option>
            {people.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}
          </select>
        </label>
        <label style={labelStyle}>
          Auxiliar Direto
          <select value={draft.directAssistantPersonId} onChange={event => onChangeDraft(current => ({ ...current, directAssistantPersonId: event.target.value }))} style={inputStyle}>
            <option value="">Selecione...</option>
            {people.map(person => <option key={person.id} value={person.id}>{person.name}</option>)}
          </select>
        </label>
      </div>
      <div className="teams-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <PersonMultiSelect
          label="Membros da equipe do Mestre Assistente"
          people={people}
          selectedIds={draft.assistantMemberIds}
          onToggle={id => onChangeDraft(current => ({ ...current, assistantMemberIds: togglePersonId(current.assistantMemberIds, id) }))}
        />
        <PersonMultiSelect
          label="Membros da equipe da Organ"
          people={people}
          selectedIds={draft.organMemberIds}
          onToggle={id => onChangeDraft(current => ({ ...current, organMemberIds: togglePersonId(current.organMemberIds, id) }))}
        />
      </div>
      <label style={labelStyle}>
        Observacoes
        <textarea value={draft.notes} onChange={event => onChangeDraft(current => ({ ...current, notes: event.target.value }))} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
      </label>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, flexWrap: "wrap" }}>
        <Btn v="secondary" onClick={onCancel}>Cancelar</Btn>
        <Btn icon="save" onClick={onSave} loading={saving} disabled={!draft.startDate || !draft.endDate || !draft.assistantMasterPersonId || !draft.directAssistantPersonId}>Salvar periodo</Btn>
      </div>
    </div>
  </section>
);
