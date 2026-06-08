import { useState } from "react";
import { runMessagingSettingsAction } from "./messagingSettingsActions";
import { emptyMessageTemplateDraft } from "./messagingSettingsShared";

export const useMessagingTemplatesController = ({ onSave, onDelete }) => {
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

  return {
    draft,
    setDraft,
    busy,
    feedback,
    pendingDelete,
    setPendingDelete,
    submit,
    confirmDelete,
  };
};
