import React from "react";
import { ConfirmModal, FeedbackBanner } from "../../components/ui";
import { useMessagingPresetsController } from "./useMessagingPresetsController";
import { MessagingPresetsList } from "./MessagingPresetsList";
import { MessagingPresetsEditorPanel } from "./MessagingPresetsEditorPanel";

export const MessagingPresetsBlock = ({ presets, people, onSave, onDelete }) => {
  const {
    draft,
    setDraft,
    busy,
    feedback,
    pendingDelete,
    setPendingDelete,
    search,
    setSearch,
    filteredPeople,
    selectedSet,
    togglePerson,
    submit,
    confirmDelete,
  } = useMessagingPresetsController({ people, onSave, onDelete });

  return (
    <section className="settings-grid" style={{ marginTop: 24 }}>
      <MessagingPresetsEditorPanel
        draft={draft}
        setDraft={setDraft}
        search={search}
        setSearch={setSearch}
        filteredPeople={filteredPeople}
        selectedSet={selectedSet}
        togglePerson={togglePerson}
        feedback={feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} />}
        busy={busy}
        onSubmit={submit}
        onCancel={() => setDraft(emptyPersonPresetDraft)}
      />
      <MessagingPresetsList
        presets={presets}
        onEdit={preset => setDraft({ id: preset.id, name: preset.name, personKeys: preset.personKeys || [] })}
        onRequestDelete={setPendingDelete}
      />
      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Remover preset"
        message={`Remover o preset "${pendingDelete?.name || ""}"?`}
        confirmLabel="Remover"
        tone="danger"
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </section>
  );
};
