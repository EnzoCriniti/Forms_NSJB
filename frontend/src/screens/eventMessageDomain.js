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
      scheduledFor: message.scheduledFor || "",
      windowOption: message.windowOption || "",
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
    scheduledFor: "",
    windowOption: "",
    autoDispatchEnabled: true,
  };
};

export const buildEventMessageTypePatch = ({ nextType, currentDraft, eventForms }) => {
  const candidate = eventForms.find(form => TYPE_TO_FORM_TYPE[nextType]?.includes(form.type));
  return {
    type: nextType,
    templateId: "",
    formId: nextType !== "new_scale" ? (candidate?.id || "") : "",
    windowOption: nextType === "fill_reminder" ? currentDraft.windowOption : "",
    recipientsMode: nextType === "fill_reminder" ? "auto" : currentDraft.recipientsMode,
  };
};

export const buildEventMessageSavePayload = draft => {
  const config = {};
  if (draft.type !== "new_scale") {
    config.formId = Number(draft.formId);
  }
  if (draft.type === "fill_reminder") {
    if (draft.recipientsMode === "preset") {
      config.recipients = { mode: "preset", presetId: Number(draft.recipientsPresetId) };
    } else if (draft.recipientsMode === "manual") {
      config.recipients = { mode: "manual", personKeys: draft.recipientsPersonKeys };
    } else {
      config.recipients = { mode: "auto" };
    }
  }

  const payload = {
    id: draft.id || undefined,
    type: draft.type,
    templateId: draft.templateId ? Number(draft.templateId) : undefined,
    body: draft.body,
    config,
    autoDispatchEnabled: draft.autoDispatchEnabled,
  };

  if (draft.type === "fill_reminder" && draft.windowOption) {
    payload.windowOption = draft.windowOption;
  } else if (draft.scheduledFor) {
    payload.scheduledFor = new Date(draft.scheduledFor).toISOString();
  }

  return payload;
};
