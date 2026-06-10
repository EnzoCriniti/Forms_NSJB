/**
 * @file frontend/src/screens/EventMessageEditorScreen.jsx
 * @summary Editor de mensagens vinculadas a eventos.
 * @responsibility Criar e editar mensagens de tipos disponiveis no evento, com agendamento.
 */

import React, { useEffect, useMemo, useState } from "react";
import { Btn, COLORS, FeedbackBanner, ScreenHeader, resolveActionErrorMessage } from "../components/ui";
import { EventMessageEditorFields } from "./EventMessageEditorFields";
import { DM_TYPES, TYPE_TO_FORM_TYPE, buildEventMessageSavePayload, buildEventMessageTypePatch, buildInitialEventMessageDraft, eligibleTypesForEvent } from "./eventMessageDomain";

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
      setFeedback({ tone: "error", message: "Corpo da mensagem é obrigatório." });
      return;
    }
    if (draft.type !== "new_scale" && !draft.formId) {
      setFeedback({ tone: "error", message: "Selecione o formulário alvo." });
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
        <FeedbackBanner tone="info" message="Este evento não possui formulário de presença ou escala vinculado. Vincule um formulário antes de criar mensagens." />
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
        <EventMessageEditorFields
          compatibleTemplates={compatibleTemplates}
          draft={draft}
          eligibleTypes={eligibleTypes}
          isDmType={isDmType}
          messagingConfig={messagingConfig}
          onApplyTemplate={applyTemplate}
          onChange={updateDraft}
          onSwitchType={switchType}
          people={people}
          personPresets={personPresets}
          phoneColumnConfigured={phoneColumnConfigured}
          selectedForm={selectedForm}
          targetForms={targetForms}
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
