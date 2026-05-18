/**
 * @file frontend/src/features/admin/messagingSettingsPanels.jsx
 * @summary Blocos reutilizaveis do painel de mensagens administrativas.
 * @responsibility Separar configuracao global, modelos e presets de pessoas.
 */

import React, { useMemo, useState } from "react";
import { Btn, COLORS, ConfirmModal, FeedbackBanner, resolveActionErrorMessage } from "../../components/ui";

const TYPE_LABELS = {
  new_scale: "Anuncio (grupo)",
  fill_reminder: "Lembrete de presenca (DM)",
  open_slots: "Vagas em aberto (DM)",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  background: COLORS.surface,
  color: COLORS.text,
  fontSize: 13,
  boxSizing: "border-box",
};

const emptyTemplate = { id: null, name: "", type: "new_scale", body: "" };
const emptyPreset = { id: null, name: "", personKeys: [] };

const personKeyOf = person => String(person.id);

export const MessagingConfigBlock = ({ messagingConfig, onSave }) => {
  const [draft, setDraft] = useState(() => ({
    whatsappGroupName: messagingConfig.whatsappGroupName || "",
    autoDispatchEnabled: messagingConfig.autoDispatchEnabled !== false,
    publicBaseUrl: messagingConfig.publicBaseUrl || "",
  }));
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const submit = async () => {
    setBusy(true);
    setFeedback({ tone: "loading", message: "Salvando configuracao..." });
    try {
      await onSave(draft);
      setFeedback({ tone: "success", message: "Configuracao salva." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h4 style={{ margin: "0 0 10px" }}>Configuracao global</h4>
      <div style={{ display: "grid", gap: 12 }}>
        <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
          Nome do grupo do WhatsApp
          <input
            value={draft.whatsappGroupName}
            onChange={event => setDraft(current => ({ ...current, whatsappGroupName: event.target.value }))}
            placeholder="Ex.: Irmandade NSJB"
            style={inputStyle}
          />
        </label>
        <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
          URL publica do app
          <input
            value={draft.publicBaseUrl}
            onChange={event => setDraft(current => ({ ...current, publicBaseUrl: event.target.value }))}
            placeholder="https://app.exemplo.com"
            style={inputStyle}
          />
          <span style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 400 }}>
            Usada para gerar os links publicos dos formularios nas mensagens.
          </span>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: COLORS.text }}>
          <input
            type="checkbox"
            checked={draft.autoDispatchEnabled}
            onChange={event => setDraft(current => ({ ...current, autoDispatchEnabled: event.target.checked }))}
          />
          Disparo automatico de mensagens agendadas
        </label>
        {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} />}
        <div>
          <Btn onClick={submit} loading={busy} disabled={busy}>Salvar configuracao</Btn>
        </div>
      </div>
    </div>
  );
};

export const MessagingTemplatesBlock = ({ templates, onSave, onDelete }) => {
  const [draft, setDraft] = useState(emptyTemplate);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const submit = async () => {
    if (!draft.name.trim() || !draft.body.trim()) return;
    setBusy(true);
    setFeedback({ tone: "loading", message: draft.id ? "Salvando modelo..." : "Criando modelo..." });
    try {
      await onSave({
        id: draft.id || undefined,
        name: draft.name.trim(),
        type: draft.type,
        body: draft.body,
      });
      setDraft(emptyTemplate);
      setFeedback({ tone: "success", message: "Modelo salvo." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await onDelete(pendingDelete.id);
      setFeedback({ tone: "success", message: "Modelo removido." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setPendingDelete(null);
    }
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
              style={inputStyle}
            >
              <option value="new_scale">{TYPE_LABELS.new_scale}</option>
              <option value="fill_reminder">{TYPE_LABELS.fill_reminder}</option>
              <option value="open_slots">{TYPE_LABELS.open_slots}</option>
            </select>
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
            Nome do modelo
            <input value={draft.name} onChange={event => setDraft(current => ({ ...current, name: event.target.value }))} placeholder="Ex.: Lembrete manha" style={inputStyle} />
          </label>
          <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
            Corpo
            <textarea
              value={draft.body}
              onChange={event => setDraft(current => ({ ...current, body: event.target.value }))}
              rows={6}
              placeholder="Ola {{person.name}}..."
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
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
            {draft.id && <Btn v="ghost" onClick={() => setDraft(emptyTemplate)}>Cancelar</Btn>}
          </div>
        </div>
      </div>
      <div>
        <h4 style={{ margin: "0 0 10px" }}>Modelos existentes</h4>
        {templates.length === 0 ? (
          <div style={{ border: `1px dashed ${COLORS.border}`, borderRadius: 8, padding: 18, color: COLORS.textSecondary, fontSize: 13 }}>
            Nenhum modelo cadastrado.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {templates.map(template => (
              <div key={template.id} className="settings-row">
                <div style={{ minWidth: 0, flex: 1 }}>
                  <strong>{template.name}</strong>
                  <div>{TYPE_LABELS[template.type] || template.type}</div>
                </div>
                <Btn v="secondary" sz="sm" onClick={() => setDraft({ id: template.id, name: template.name, type: template.type, body: template.body })}>Editar</Btn>
                <Btn v="danger" sz="sm" onClick={() => setPendingDelete(template)}>Remover</Btn>
              </div>
            ))}
          </div>
        )}
      </div>
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

export const MessagingPresetsBlock = ({ presets, people, onSave, onDelete }) => {
  const [draft, setDraft] = useState(emptyPreset);
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
    setBusy(true);
    setFeedback({ tone: "loading", message: draft.id ? "Salvando preset..." : "Criando preset..." });
    try {
      await onSave({ id: draft.id || undefined, name: draft.name.trim(), personKeys: draft.personKeys });
      setDraft(emptyPreset);
      setFeedback({ tone: "success", message: "Preset salvo." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    try {
      await onDelete(pendingDelete.id);
      setFeedback({ tone: "success", message: "Preset removido." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <section className="settings-grid" style={{ marginTop: 24 }}>
      <div>
        <h4 style={{ margin: "0 0 10px" }}>{draft.id ? "Editar preset" : "Novo preset de pessoas"}</h4>
        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
            Nome do preset
            <input value={draft.name} onChange={event => setDraft(current => ({ ...current, name: event.target.value }))} placeholder="Ex.: Coordenadores" style={inputStyle} />
          </label>
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar pessoas..." style={inputStyle} />
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
            {draft.id && <Btn v="ghost" onClick={() => setDraft(emptyPreset)}>Cancelar</Btn>}
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
