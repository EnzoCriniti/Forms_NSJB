import React from "react";
import { Btn } from "../../components/ui";
import { MESSAGE_TYPE_LABELS } from "./messagingSettingsShared";

export const MessagingTemplatesEditorPanel = ({
  draft,
  setDraft,
  feedback,
  busy,
  onSubmit,
  onCancel,
}) => (
  <div>
    <h4 className="msg-subtitle">{draft.id ? "Editar modelo" : "Novo modelo de mensagem"}</h4>
    <div className="msg-form">
      <label className="msg-field">
        <span className="msg-label">Tipo</span>
        <select
          className="msg-input"
          value={draft.type}
          onChange={event => setDraft(current => ({ ...current, type: event.target.value }))}
        >
          <option value="new_scale">{MESSAGE_TYPE_LABELS.new_scale}</option>
          <option value="fill_reminder">{MESSAGE_TYPE_LABELS.fill_reminder}</option>
          <option value="open_slots">{MESSAGE_TYPE_LABELS.open_slots}</option>
        </select>
      </label>
      <label className="msg-field">
        <span className="msg-label">Nome do modelo</span>
        <input
          className="msg-input"
          value={draft.name}
          onChange={event => setDraft(current => ({ ...current, name: event.target.value }))}
          placeholder="Ex.: Lembrete da manhã"
        />
      </label>
      <label className="msg-field">
        <span className="msg-label">Corpo</span>
        <textarea
          className="msg-input"
          value={draft.body}
          onChange={event => setDraft(current => ({ ...current, body: event.target.value }))}
          rows={6}
          placeholder="Olá {{person.name}}..."
        />
        <span className="msg-hint">
          Placeholders disponíveis: <code>{"{{event.title}}"}</code>, <code>{"{{event.date}}"}</code>, <code>{"{{event.closing}}"}</code>, <code>{"{{form.title}}"}</code>, <code>{"{{form.publicLink}}"}</code>, <code>{"{{forms.list}}"}</code>, <code>{"{{person.name}}"}</code>, <code>{"{{group.name}}"}</code>.
        </span>
      </label>
      {feedback}
      <div className="msg-actions">
        <Btn onClick={onSubmit} loading={busy} disabled={!draft.name.trim() || !draft.body.trim()}>
          {draft.id ? "Salvar modelo" : "Criar modelo"}
        </Btn>
        {draft.id && <Btn v="ghost" onClick={onCancel}>Cancelar</Btn>}
      </div>
    </div>
  </div>
);
