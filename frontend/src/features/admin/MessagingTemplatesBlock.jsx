import React from "react";
import { ConfirmModal, FeedbackBanner } from "../../components/ui";
import { MessagingTemplatesList } from "./MessagingTemplatesList";
import { MessagingTemplatesEditorPanel } from "./MessagingTemplatesEditorPanel";
import { useMessagingTemplatesController } from "./useMessagingTemplatesController";

export const MessagingTemplatesBlock = ({ templates, onSave, onDelete }) => {
  const {
    draft,
    setDraft,
    busy,
    feedback,
    pendingDelete,
    setPendingDelete,
    submit,
    confirmDelete,
  } = useMessagingTemplatesController({ onSave, onDelete });

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
