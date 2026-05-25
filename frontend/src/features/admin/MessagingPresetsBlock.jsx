import React, { useMemo, useState } from "react";
import { Btn, COLORS, ConfirmModal, FeedbackBanner } from "../../components/ui";
import { runMessagingSettingsAction } from "./messagingSettingsActions";
import { emptyPersonPresetDraft, messagingInputStyle, personKeyOf } from "./messagingSettingsShared";

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
      <div>
        <h4 style={{ margin: "0 0 10px" }}>{draft.id ? "Editar preset" : "Novo preset de pessoas"}</h4>
        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
            Nome do preset
            <input value={draft.name} onChange={event => setDraft(current => ({ ...current, name: event.target.value }))} placeholder="Ex.: Coordenadores" style={messagingInputStyle} />
          </label>
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar pessoas..." style={messagingInputStyle} />
          <div style={{ maxHeight: 260, overflowY: "auto", border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 8, background: COLORS.surface }}>
            {filteredPeople.length === 0 ? (
              <div style={{ padding: 12, fontSize: 12, color: COLORS.textMuted }}>Nenhuma pessoa encontrada.</div>
            ) : filteredPeople.map(person => {
              const key = personKeyOf(person);
              return (
                <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 4px", fontSize: 13, cursor: "pointer" }}>
                  <input type="checkbox" checked={selectedSet.has(key)} onChange={() => togglePerson(key)} />
                  <span style={{ flex: 1 }}>{person.name}{person.grau ? ` (${person.grau})` : ""}</span>
                  {!person.phone && <span style={{ fontSize: 10, color: COLORS.warning }}>sem telefone</span>}
                </label>
              );
            })}
          </div>
          <div style={{ fontSize: 11, color: COLORS.textMuted }}>{draft.personKeys.length} pessoa(s) selecionada(s)</div>
          {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} />}
          <div style={{ display: "flex", gap: 8 }}>
            <Btn onClick={submit} loading={busy} disabled={!draft.name.trim()}>{draft.id ? "Salvar preset" : "Criar preset"}</Btn>
            {draft.id && <Btn v="ghost" onClick={() => setDraft(emptyPersonPresetDraft)}>Cancelar</Btn>}
          </div>
        </div>
      </div>
      <div>
        <h4 style={{ margin: "0 0 10px" }}>Presets existentes</h4>
        {presets.length === 0 ? (
          <div style={{ border: `1px dashed ${COLORS.border}`, borderRadius: 8, padding: 18, color: COLORS.textSecondary, fontSize: 13 }}>
            Nenhum preset cadastrado.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {presets.map(preset => (
              <div key={preset.id} className="settings-row">
                <div style={{ minWidth: 0, flex: 1 }}>
                  <strong>{preset.name}</strong>
                  <div>{preset.personKeys.length} pessoa(s)</div>
                </div>
                <Btn v="secondary" sz="sm" onClick={() => setDraft({ id: preset.id, name: preset.name, personKeys: preset.personKeys || [] })}>Editar</Btn>
                <Btn v="danger" sz="sm" onClick={() => setPendingDelete(preset)}>Remover</Btn>
              </div>
            ))}
          </div>
        )}
      </div>
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
