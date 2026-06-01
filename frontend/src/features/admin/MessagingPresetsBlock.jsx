import React, { useMemo, useState } from "react";
import { ConfirmModal, FeedbackBanner } from "../../components/ui";
import { runMessagingSettingsAction } from "./messagingSettingsActions";
import { emptyPersonPresetDraft, personKeyOf } from "./messagingSettingsShared";
import { MessagingPresetsList } from "./MessagingPresetsList";
import { MessagingPresetsEditorPanel } from "./MessagingPresetsEditorPanel";

export const MessagingPresetsBlock = ({ presets, people, onSave, onDelete }) => {
  const [draft, setDraft] = useState(emptyPersonPresetDraft);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [search, setSearch] = useState("");

  const sortedPeople = useMemo(() => [...people].sort((a, b) => String(a.name).localeCompare(String(b.name), "pt-BR")), [people]);
  const filteredPeople = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return sortedPeople;
    return sortedPeople.filter(person => String(person.name || "").toLowerCase().includes(needle));
  }, [sortedPeople, search]);

  const selectedSet = useMemo(() => new Set(draft.personKeys.map(String)), [draft.personKeys]);

  const togglePerson = key => {
    setDraft(current => {
      const set = new Set(current.personKeys.map(String));
      if (set.has(key)) set.delete(key); else set.add(key);
      return { ...current, personKeys: Array.from(set) };
    });
  };

  const submit = async () => {
    if (!draft.name.trim()) return;
    await runMessagingSettingsAction({
      loadingMessage: draft.id ? "Salvando preset..." : "Criando preset...",
      successMessage: "Preset salvo.",
      setBusy,
      setFeedback,
      execute: () => onSave({ id: draft.id || undefined, name: draft.name.trim(), personKeys: draft.personKeys }),
      onSuccess: () => setDraft(emptyPersonPresetDraft),
    });
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await runMessagingSettingsAction({
      successMessage: "Preset removido.",
      setFeedback,
      execute: () => onDelete(pendingDelete.id),
      onSuccess: () => setPendingDelete(null),
    });
    setPendingDelete(null);
  };

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
