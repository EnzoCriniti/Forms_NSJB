import React, { useState } from "react";
import { ConfirmModal, FeedbackBanner } from "../../components/ui";
import { runMessagingSettingsAction } from "./messagingSettingsActions";
import { MessagingTemplatesList } from "./MessagingTemplatesList";
import { emptyMessageTemplateDraft } from "./messagingSettingsShared";
import { MessagingTemplatesEditorPanel } from "./MessagingTemplatesEditorPanel";

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
      <MessagingTemplatesEditorPanel
        draft={draft}
        setDraft={setDraft}
        feedback={feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} />}
        busy={busy}
        onSubmit={submit}
        onCancel={() => setDraft(emptyMessageTemplateDraft)}
      />
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
