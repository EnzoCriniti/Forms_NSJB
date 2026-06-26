/**
 * @file frontend/src/screens/EventMessageEditorScreen.jsx
 * @summary Editor de mensagens vinculadas a eventos.
 * @responsibility Criar e editar mensagens de tipos disponiveis no evento, com agendamento.
 */

import React, { useEffect, useMemo, useState } from "react";
import { Btn, FeedbackBanner, ScreenHeader, resolveActionErrorMessage } from "../components/ui";
import { EventMessageEditorFields } from "./EventMessageEditorFields";
import { saveMessageTemplate } from "../lib/api";
import { DM_TYPES, TYPE_TO_FORM_TYPE, applyTemplateDraftPatch, buildEventMessageSavePayload, buildEventMessageTypePatch, buildInitialEventMessageDraft, buildMessageTemplateFromDraft, eligibleTypesForEvent } from "./eventMessageDomain";

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
    updateDraft(applyTemplateDraftPatch(template));
  };

  const saveAsTemplate = async () => {
    if (!draft.body.trim()) {
      setFeedback({ tone: "error", message: "Escreva o corpo antes de salvar o modelo." });
      return;
    }
    const name = typeof window !== "undefined" ? window.prompt("Nome do modelo:") : "";
    if (!name || !name.trim()) return;
    try {
      await saveMessageTemplate(buildMessageTemplateFromDraft(draft, name));
      setFeedback({ tone: "success", message: "Modelo salvo — já aparece na lista de modelos no próximo carregamento." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    }
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
          onBack={() => onCancel && onCancel(null)}
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
        onBack={() => onCancel && onCancel(null)}
        title={draft.id ? "Editar mensagem" : "Nova mensagem"}
        subtitle={event?.title}
        titleSize={20}
      />

      <section className="msg-card msg-form">
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

        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <Btn v="ghost" icon="save" onClick={saveAsTemplate} disabled={saving || !draft.body.trim()}>Salvar como modelo</Btn>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn v="secondary" onClick={() => onCancel && onCancel(null)}>Cancelar</Btn>
            <Btn icon="save" onClick={submit} loading={saving} disabled={saving || !draft.body.trim()}>{draft.id ? "Salvar" : "Criar mensagem"}</Btn>
          </div>
        </div>
      </section>
    </div>
  );
};
