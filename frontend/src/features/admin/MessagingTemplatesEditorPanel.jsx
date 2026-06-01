import React from "react";
import { Btn, COLORS } from "../../components/ui";
import { MESSAGE_TYPE_LABELS, messagingInputStyle } from "./messagingSettingsShared";

export const MessagingTemplatesEditorPanel = ({
  draft,
  setDraft,
  feedback,
  busy,
  onSubmit,
  onCancel,
}) => (
  <div>
    <h4 style={{ margin: "0 0 10px" }}>{draft.id ? "Editar modelo" : "Novo modelo de mensagem"}</h4>
    <div style={{ display: "grid", gap: 12 }}>
      <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
        Tipo
        <select
          value={draft.type}
          onChange={event => setDraft(current => ({ ...current, type: event.target.value }))}
          style={messagingInputStyle}
        >
          <option value="new_scale">{MESSAGE_TYPE_LABELS.new_scale}</option>
          <option value="fill_reminder">{MESSAGE_TYPE_LABELS.fill_reminder}</option>
          <option value="open_slots">{MESSAGE_TYPE_LABELS.open_slots}</option>
        </select>
      </label>
      <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
        Nome do modelo
        <input value={draft.name} onChange={event => setDraft(current => ({ ...current, name: event.target.value }))} placeholder="Ex.: Lembrete manha" style={messagingInputStyle} />
      </label>
      <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
        Corpo
        <textarea
          value={draft.body}
          onChange={event => setDraft(current => ({ ...current, body: event.target.value }))}
          rows={6}
          placeholder="Ola {{person.name}}..."
          style={{ ...messagingInputStyle, resize: "vertical", fontFamily: "inherit" }}
        />
        <span style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 400 }}>
          Placeholders disponiveis: <code>{"{{event.title}}"}</code>, <code>{"{{event.date}}"}</code>, <code>{"{{event.closing}}"}</code>, <code>{"{{form.title}}"}</code>, <code>{"{{form.publicLink}}"}</code>, <code>{"{{forms.list}}"}</code>, <code>{"{{person.name}}"}</code>, <code>{"{{group.name}}"}</code>.
        </span>
      </label>
      {feedback}
      <div style={{ display: "flex", gap: 8 }}>
        <Btn onClick={onSubmit} loading={busy} disabled={!draft.name.trim() || !draft.body.trim()}>
          {draft.id ? "Salvar modelo" : "Criar modelo"}
        </Btn>
        {draft.id && <Btn v="ghost" onClick={onCancel}>Cancelar</Btn>}
      </div>
    </div>
  </div>
);
