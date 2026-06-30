/**
 * @file frontend/src/screens/eventMessageDomain.js
 * @summary Helpers puros do editor de mensagens de evento.
 * @responsibility Centralizar tipos elegiveis, draft inicial e classificacao de mensagens.
 */

export const ELIGIBLE_FORM_TYPES = ["presenca", "escala_organ"];

export const TYPE_TO_FORM_TYPE = {
  new_scale: ["presenca", "escala_organ"],
  fill_reminder: ["presenca"],
  open_slots: ["escala_organ"],
};

export const DM_TYPES = ["fill_reminder", "open_slots"];

export const isEventMessageEditable = status => ["rascunho", "agendada"].includes(status);

export const isEventMessageCancellable = status => ["rascunho", "agendada", "pronta"].includes(status);

export const isEventMessageDispatchable = status => ["rascunho", "agendada", "pronta"].includes(status);

export const eligibleTypesForEvent = forms => {
  const types = new Set(forms.filter(form => ELIGIBLE_FORM_TYPES.includes(form.type)).map(form => form.type));
  return Object.keys(TYPE_TO_FORM_TYPE).filter(type => TYPE_TO_FORM_TYPE[type].some(formType => types.has(formType)));
};

export const buildInitialEventMessageDraft = (message, eligibleTypes, eventForms) => {
  if (message) {
    return {
      id: message.id,
      type: message.type,
      templateId: message.templateId || "",
      body: message.body || "",
      formId: message.config?.formId || "",
      recipientsMode: message.config?.recipients?.mode || "auto",
      recipientsPresetId: message.config?.recipients?.presetId || "",
      recipientsPersonKeys: message.config?.recipients?.personKeys || [],
      recipientsGraus: message.config?.recipients?.graus || [],
      recipientsExcludedKeys: message.config?.recipients?.excludedKeys || [],
      scheduledFor: message.scheduledFor || "",
      windowOptions: message.config?.windowOptions || (message.windowOption ? [message.windowOption] : []),
      autoDispatchEnabled: message.autoDispatchEnabled !== false,
    };
  }

  const defaultType = eligibleTypes[0] || "new_scale";
  const candidate = eventForms.find(form => TYPE_TO_FORM_TYPE[defaultType]?.includes(form.type));
  return {
    id: null,
    type: defaultType,
    templateId: "",
    body: "",
    formId: defaultType !== "new_scale" ? (candidate?.id || "") : "",
    recipientsMode: "auto",
    recipientsPresetId: "",
    recipientsPersonKeys: [],
    recipientsGraus: [],
    recipientsExcludedKeys: [],
    scheduledFor: "",
    windowOptions: [],
    autoDispatchEnabled: true,
  };
};

export const buildEventMessageTypePatch = ({ nextType, currentDraft, eventForms }) => {
  const candidate = eventForms.find(form => TYPE_TO_FORM_TYPE[nextType]?.includes(form.type));
  return {
    type: nextType,
    templateId: "",
    formId: nextType !== "new_scale" ? (candidate?.id || "") : "",
    windowOptions: nextType === "fill_reminder" ? (currentDraft.windowOptions || []) : [],
    recipientsMode: nextType === "fill_reminder" ? "auto" : currentDraft.recipientsMode,
  };
};

export const buildEventMessageSavePayload = draft => {
  const config = {};
  if (draft.type !== "new_scale") {
    config.formId = Number(draft.formId);
  }
  const graus = Array.isArray(draft.recipientsGraus) ? draft.recipientsGraus : [];
  const excludedKeys = Array.isArray(draft.recipientsExcludedKeys) ? draft.recipientsExcludedKeys : [];
  if (draft.type === "fill_reminder") {
    if (draft.recipientsMode === "preset") {
      config.recipients = { mode: "preset", presetId: Number(draft.recipientsPresetId), graus };
    } else if (draft.recipientsMode === "manual") {
      config.recipients = { mode: "manual", personKeys: draft.recipientsPersonKeys, graus };
    } else {
      config.recipients = { mode: "auto", graus };
    }
    if (excludedKeys.length) config.recipients.excludedKeys = excludedKeys;
    const windowOptions = Array.isArray(draft.windowOptions) ? draft.windowOptions : [];
    if (windowOptions.length) config.windowOptions = windowOptions;
  } else if (draft.type === "open_slots") {
    // open_slots: destinatários derivam da escala; só grau e exclusão são configuráveis
    config.recipients = { mode: "auto", graus };
    if (excludedKeys.length) config.recipients.excludedKeys = excludedKeys;
  }

  const payload = {
    id: draft.id || undefined,
    type: draft.type,
    templateId: draft.templateId ? Number(draft.templateId) : undefined,
    body: draft.body,
    config,
    autoDispatchEnabled: draft.autoDispatchEnabled,
  };

  if (draft.type !== "fill_reminder" && draft.scheduledFor) {
    payload.scheduledFor = new Date(draft.scheduledFor).toISOString();
  }

  return payload;
};

/** Patch para o draft ao aplicar um modelo (corpo + destinatários + janelas). */
export const applyTemplateDraftPatch = template => {
  const patch = { templateId: template.id, body: template.body || "" };
  const recipients = template.config?.recipients;
  if (recipients) {
    patch.recipientsMode = recipients.mode || "auto";
    patch.recipientsGraus = Array.isArray(recipients.graus) ? recipients.graus : [];
    if (recipients.presetId) patch.recipientsPresetId = recipients.presetId;
  }
  if (Array.isArray(template.config?.windowOptions)) patch.windowOptions = template.config.windowOptions;
  return patch;
};

/** Monta o payload de um modelo a partir do preenchimento atual da tela. */
export const buildMessageTemplateFromDraft = (draft, name) => {
  const config = {};
  if (draft.type === "fill_reminder") {
    const graus = Array.isArray(draft.recipientsGraus) ? draft.recipientsGraus : [];
    config.recipients = draft.recipientsMode === "preset"
      ? { mode: "preset", presetId: Number(draft.recipientsPresetId), graus }
      : draft.recipientsMode === "manual"
        ? { mode: "manual", graus }
        : { mode: "auto", graus };
    const windowOptions = Array.isArray(draft.windowOptions) ? draft.windowOptions : [];
    if (windowOptions.length) config.windowOptions = windowOptions;
  }
  return { name: String(name || "").trim(), type: draft.type, body: draft.body, config };
};

export const splitPreviewRecipients = preview => {
  const recipients = preview?.recipients || [];
  return {
    recipientsActive: recipients.filter(item => !item.skipped),
    recipientsSkipped: recipients.filter(item => item.skipped),
  };
};

export const getEventMessageConfirmProps = action => ({
  title: action === "dispatch" ? "Disparar mensagem" : action === "cancel" ? "Cancelar mensagem" : "Excluir mensagem",
  message: action === "dispatch"
    ? "No modo log-only nada e enviado de fato — apenas o disparo e registrado no historico e o status passa a 'disparada'. Confirma?"
    : action === "cancel"
      ? "Cancelar move a mensagem para o estado 'cancelada' e impede edicoes e disparos futuros. Continuar?"
      : "Excluir remove a mensagem e o historico de logs associado. Continuar?",
  confirmLabel: action === "delete" ? "Excluir" : action === "cancel" ? "Cancelar mensagem" : "Disparar",
  tone: action === "delete" ? "danger" : action === "cancel" ? "warning" : "primary",
});
