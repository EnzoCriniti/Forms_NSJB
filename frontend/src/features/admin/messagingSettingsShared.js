export const MESSAGE_TYPE_LABELS = {
  new_scale: "Anúncio (grupo)",
  fill_reminder: "Lembrete de presença (DM)",
  open_slots: "Vagas em aberto (DM)",
};

export const emptyMessageTemplateDraft = { id: null, name: "", type: "new_scale", body: "" };
export const emptyPersonPresetDraft = { id: null, name: "", personKeys: [] };

export const personKeyOf = person => String(person.id);
