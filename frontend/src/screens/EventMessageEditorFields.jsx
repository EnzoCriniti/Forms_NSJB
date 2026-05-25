/**
 * @file frontend/src/screens/EventMessageEditorFields.jsx
 * @summary Campos visuais do editor de mensagens de evento.
 */

import React from "react";
import { COLORS, FeedbackBanner } from "../components/ui";
import { MESSAGE_TYPE_LABELS } from "../components/MessageStatusBadge";
import { MessageRecipientsPanel, MessageSchedulePanel } from "../features/events/components/eventMessagesPanels";

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
    <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
      Tipo da mensagem
      <select value={draft.type} onChange={event => onSwitchType(event.target.value)} style={inputStyle} disabled={Boolean(draft.id)}>
        {eligibleTypes.map(type => (
          <option key={type} value={type}>{MESSAGE_TYPE_LABELS[type]}</option>
        ))}
      </select>
      {draft.id && <span style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 400 }}>O tipo nao pode ser alterado depois de criado.</span>}
    </label>

    {isDmType && !messagingConfig?.publicBaseUrl && (
      <FeedbackBanner tone="info" message="URL publica do app nao configurada - os links wa.me geraram caminhos relativos. Defina em Configuracoes > Mensagens." />
    )}

    {isDmType && !phoneColumnConfigured && (
      <FeedbackBanner tone="info" message="Coluna de telefone nao configurada. Defina em Configuracoes > Membros antes de criar lembretes por mensagem direta." />
    )}

    {draft.type !== "new_scale" && (
      <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
        Formulario alvo
        <select value={draft.formId || ""} onChange={event => onChange({ formId: event.target.value })} style={inputStyle}>
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
        <select value={draft.templateId || ""} onChange={event => onApplyTemplate(event.target.value)} style={inputStyle}>
          <option value="">Sem modelo</option>
          {compatibleTemplates.map(template => (
            <option key={template.id} value={template.id}>{template.name}</option>
          ))}
        </select>
        <span style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 400 }}>Selecionar substitui o corpo abaixo. Edite como quiser depois.</span>
      </label>
    )}

    <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
      Corpo
      <textarea value={draft.body} onChange={event => onChange({ body: event.target.value })} rows={8} placeholder="Ola {{person.name}}..." style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
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
