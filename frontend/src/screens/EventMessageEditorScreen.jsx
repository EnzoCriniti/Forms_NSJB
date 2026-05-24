/**
 * @file frontend/src/screens/EventMessageEditorScreen.jsx
 * @summary Editor de mensagens vinculadas a eventos.
 * @responsibility Criar e editar mensagens de tipos disponiveis no evento, com agendamento.
 */

import React, { useEffect, useMemo, useState } from "react";
import { Btn, COLORS, FeedbackBanner, ScreenHeader, resolveActionErrorMessage } from "../components/ui";
import { MESSAGE_TYPE_LABELS } from "../components/MessageStatusBadge";
import { MessageRecipientsPanel, MessageSchedulePanel } from "../features/events/components/eventMessagesPanels";
import { DM_TYPES, TYPE_TO_FORM_TYPE, buildEventMessageSavePayload, buildEventMessageTypePatch, buildInitialEventMessageDraft, eligibleTypesForEvent } from "./eventMessageDomain";

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

export const EventMessageEditorScreen = ({
  event,
  eventForms,
  message,
  messageTemplates = [],
  personPresets = [],
  people = [],
  membersConfig = {},
  messagingConfig,
  onSave,
  onCancel,
}) => {
  const eligibleTypes = useMemo(() => eligibleTypesForEvent(eventForms), [eventForms]);
  const [draft, setDraft] = useState(() => buildInitialEventMessageDraft(message, eligibleTypes, eventForms));
  const [feedback, setFeedback] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(buildInitialEventMessageDraft(message, eligibleTypes, eventForms));
  }, [message?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const phoneColumnConfigured = Boolean(membersConfig?.phoneColumn);
  const targetForms = useMemo(() => eventForms.filter(form => TYPE_TO_FORM_TYPE[draft.type]?.includes(form.type)), [eventForms, draft.type]);
  const compatibleTemplates = useMemo(() => messageTemplates.filter(template => template.type === draft.type), [messageTemplates, draft.type]);
  const isDmType = DM_TYPES.includes(draft.type);
  const selectedForm = targetForms.find(form => Number(form.id) === Number(draft.formId)) || null;

  const updateDraft = changes => setDraft(current => ({ ...current, ...changes }));

  const applyTemplate = templateId => {
    const numericId = templateId ? Number(templateId) : null;
    if (!numericId) {
      updateDraft({ templateId: "" });
      return;
    }
    const template = compatibleTemplates.find(item => item.id === numericId);
    if (!template) return;
    updateDraft({ templateId: numericId, body: template.body });
  };

  const switchType = nextType => {
    updateDraft(buildEventMessageTypePatch({ nextType, currentDraft: draft, eventForms }));
  };

  const submit = async () => {
    if (!draft.body.trim()) {
      setFeedback({ tone: "error", message: "Corpo da mensagem e obrigatorio." });
      return;
    }
    if (draft.type !== "new_scale" && !draft.formId) {
      setFeedback({ tone: "error", message: "Selecione o formulario alvo." });
      return;
    }
    setSaving(true);
    setFeedback({ tone: "loading", message: draft.id ? "Salvando mensagem..." : "Criando mensagem..." });
    try {
      const saved = await onSave(buildEventMessageSavePayload(draft));
      setFeedback({ tone: "success", message: "Mensagem salva." });
      if (onCancel) onCancel(saved);
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  if (eligibleTypes.length === 0) {
    return (
      <div>
        <ScreenHeader
          className="settings-top-card"
          leading={<Btn v="ghost" icon="back" onClick={() => onCancel && onCancel(null)} aria-label="Voltar" />}
          title="Nova mensagem"
        />
        <FeedbackBanner tone="info" message="Este evento nao possui formulario de presenca ou escala vinculado. Vincule um formulario antes de criar mensagens." />
      </div>
    );
  }

  return (
    <div>
      <ScreenHeader
        className="settings-top-card"
        leading={<Btn v="ghost" icon="back" onClick={() => onCancel && onCancel(null)} aria-label="Voltar" />}
        title={draft.id ? "Editar mensagem" : "Nova mensagem"}
        subtitle={event?.title}
        titleSize={20}
      />

      <section style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 18, display: "grid", gap: 16 }}>
        <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
          Tipo da mensagem
          <select value={draft.type} onChange={event => switchType(event.target.value)} style={inputStyle} disabled={Boolean(draft.id)}>
            {eligibleTypes.map(type => (
              <option key={type} value={type}>{MESSAGE_TYPE_LABELS[type]}</option>
            ))}
          </select>
          {draft.id && <span style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 400 }}>O tipo nao pode ser alterado depois de criado.</span>}
        </label>

        {isDmType && !messagingConfig?.publicBaseUrl && (
          <FeedbackBanner tone="info" message="URL publica do app nao configurada — os links wa.me geraram caminhos relativos. Defina em Configuracoes > Mensagens." />
        )}

        {isDmType && !phoneColumnConfigured && (
          <FeedbackBanner tone="info" message="Coluna de telefone nao configurada. Defina em Configuracoes > Membros antes de criar lembretes por mensagem direta." />
        )}

        {draft.type !== "new_scale" && (
          <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
            Formulario alvo
            <select value={draft.formId || ""} onChange={event => updateDraft({ formId: event.target.value })} style={inputStyle}>
              <option value="">Selecione...</option>
              {targetForms.map(form => (
                <option key={form.id} value={form.id}>{form.title}</option>
              ))}
            </select>
            {targetForms.length === 0 && <span style={{ fontSize: 11, color: COLORS.warning }}>Nenhum formulario compativel vinculado a este evento.</span>}
          </label>
        )}

        {compatibleTemplates.length > 0 && (
          <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
            Modelo (opcional)
            <select value={draft.templateId || ""} onChange={event => applyTemplate(event.target.value)} style={inputStyle}>
              <option value="">Sem modelo</option>
              {compatibleTemplates.map(template => (
                <option key={template.id} value={template.id}>{template.name}</option>
              ))}
            </select>
            <span style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 400 }}>Selecionar substitui o corpo abaixo. Edites como quiser depois.</span>
          </label>
        )}

        <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
          Corpo
          <textarea value={draft.body} onChange={event => updateDraft({ body: event.target.value })} rows={8} placeholder="Ola {{person.name}}..." style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
          <span style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 400 }}>
            Placeholders: <code>{"{{event.title}}"}</code>, <code>{"{{event.date}}"}</code>, <code>{"{{event.closing}}"}</code>, <code>{"{{form.title}}"}</code>, <code>{"{{form.publicLink}}"}</code>, <code>{"{{forms.list}}"}</code>, <code>{"{{person.name}}"}</code>, <code>{"{{group.name}}"}</code>.
          </span>
        </label>

        {draft.type === "fill_reminder" && (
          <MessageRecipientsPanel
            draft={draft}
            personPresets={personPresets}
            people={people}
            inputStyle={inputStyle}
            messagingConfig={messagingConfig}
            selectedForm={selectedForm}
            onChange={updateDraft}
          />
        )}

        <MessageSchedulePanel
          draft={draft}
          selectedForm={selectedForm}
          inputStyle={inputStyle}
          onChange={updateDraft}
        />

        {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} />}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Btn v="secondary" onClick={() => onCancel && onCancel(null)}>Cancelar</Btn>
          <Btn icon="save" onClick={submit} loading={saving} disabled={saving || !draft.body.trim()}>{draft.id ? "Salvar" : "Criar mensagem"}</Btn>
        </div>
      </section>
    </div>
  );
};


