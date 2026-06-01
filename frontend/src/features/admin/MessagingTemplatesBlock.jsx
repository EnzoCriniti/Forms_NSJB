import React, { useState } from "react";
import { Btn, COLORS, ConfirmModal, FeedbackBanner } from "../../components/ui";
import { runMessagingSettingsAction } from "./messagingSettingsActions";
import { MessagingTemplatesList } from "./MessagingTemplatesList";
import { MESSAGE_TYPE_LABELS, emptyMessageTemplateDraft, messagingInputStyle } from "./messagingSettingsShared";

export const MessagingTemplatesBlock = ({ templates, onSave, onDelete }) => {
  const [draft, setDraft] = useState(emptyMessageTemplateDraft);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const submit = async () => {
    if (!draft.name.trim() || !draft.body.trim()) return;
    await runMessagingSettingsAction({
      loadingMessage: draft.id ? "Salvando modelo..." : "Criando modelo...",
      successMessage: "Modelo salvo.",
      setBusy,
      setFeedback,
      execute: () => onSave({
        id: draft.id || undefined,
        name: draft.name.trim(),
        type: draft.type,
        body: draft.body,
      }),
      onSuccess: () => setDraft(emptyMessageTemplateDraft),
    });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await runMessagingSettingsAction({
      successMessage: "Modelo removido.",
      setFeedback,
      execute: () => onDelete(pendingDelete.id),
      onSuccess: () => setPendingDelete(null),
    });
    setPendingDelete(null);
  };

  return (
    <section className="settings-grid" style={{ marginTop: 24 }}>
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
          {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} />}
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={submit} loading={busy} disabled={!draft.name.trim() || !draft.body.trim()}>
              {draft.id ? "Salvar modelo" : "Criar modelo"}
            </Btn>
            {draft.id && <Btn v="ghost" onClick={() => setDraft(emptyMessageTemplateDraft)}>Cancelar</Btn>}
          </div>
        </div>
      </div>
      <MessagingTemplatesList
        templates={templates}
        onEdit={template => setDraft({ id: template.id, name: template.name, type: template.type, body: template.body })}
        onRequestDelete={setPendingDelete}
      />
      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Remover modelo"
        message={`Remover o modelo "${pendingDelete?.name || ""}"?`}
        confirmLabel="Remover"
        tone="danger"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
};
