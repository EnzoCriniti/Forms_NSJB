/**
 * @file frontend/src/screens/EventMessageEditorFields.jsx
 * @summary Campos visuais do editor de mensagens de evento.
 */

import React from "react";
import { COLORS, FeedbackBanner } from "../components/ui";
import { MESSAGE_TYPE_LABELS } from "../components/MessageStatusBadge";
import { MessageRecipientsPanel, MessageSchedulePanel } from "../features/events/components/eventMessagesPanels";
import { MessageBodyEditor } from "../features/events/components/MessageBodyEditor";

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

export const EventMessageEditorFields = ({
  compatibleTemplates,
  draft,
  eligibleTypes,
  isDmType,
  messagingConfig,
  onApplyTemplate,
  onChange,
  onSwitchType,
  people,
  personPresets,
  phoneColumnConfigured,
  selectedForm,
  targetForms,
}) => (
  <>
    <label className="msg-field">
      <span className="msg-label">Tipo da mensagem</span>
      <select className="msg-input" value={draft.type} onChange={event => onSwitchType(event.target.value)} disabled={Boolean(draft.id)}>
        {eligibleTypes.map(type => (
          <option key={type} value={type}>{MESSAGE_TYPE_LABELS[type]}</option>
        ))}
      </select>
      {draft.id && <span className="msg-hint">O tipo não pode ser alterado depois de criado.</span>}
    </label>

    {isDmType && !messagingConfig?.publicBaseUrl && (
      <FeedbackBanner tone="info" message="URL pública do app não configurada - os links wa.me gerarão caminhos relativos. Defina em Configurações > Mensagens." />
    )}

    {isDmType && !phoneColumnConfigured && (
      <FeedbackBanner tone="info" message="Coluna de telefone não configurada. Defina em Configurações > Membros antes de criar lembretes por mensagem direta." />
    )}

    {draft.type !== "new_scale" && (
      <label className="msg-field">
        <span className="msg-label">Formulário alvo</span>
        <select className="msg-input" value={draft.formId || ""} onChange={event => onChange({ formId: event.target.value })}>
          <option value="">Selecione...</option>
          {targetForms.map(form => (
            <option key={form.id} value={form.id}>{form.title}</option>
          ))}
        </select>
        {targetForms.length === 0 && <span className="msg-hint" style={{ color: COLORS.warning }}>Nenhum formulário compatível vinculado a este evento.</span>}
      </label>
    )}

    {compatibleTemplates.length > 0 && (
      <label className="msg-field">
        <span className="msg-label">Modelo (opcional)</span>
        <select className="msg-input" value={draft.templateId || ""} onChange={event => onApplyTemplate(event.target.value)}>
          <option value="">Sem modelo</option>
          {compatibleTemplates.map(template => (
            <option key={template.id} value={template.id}>{template.name}</option>
          ))}
        </select>
        <span className="msg-hint">Selecionar substitui o corpo abaixo. Edite como quiser depois.</span>
      </label>
    )}

    <MessageBodyEditor type={draft.type} body={draft.body} onChange={value => onChange({ body: value })} />

    {draft.type === "fill_reminder" && (
      <MessageRecipientsPanel
        draft={draft}
        personPresets={personPresets}
        people={people}
        inputStyle={inputStyle}
        messagingConfig={messagingConfig}
        selectedForm={selectedForm}
        onChange={onChange}
      />
    )}

    <MessageSchedulePanel
      draft={draft}
      selectedForm={selectedForm}
      inputStyle={inputStyle}
      onChange={onChange}
    />
  </>
);
