import { COLORS } from "../../components/ui";

export const MESSAGE_TYPE_LABELS = {
  new_scale: "Anuncio (grupo)",
  fill_reminder: "Lembrete de presenca (DM)",
  open_slots: "Vagas em aberto (DM)",
};

export const messagingInputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  background: COLORS.surface,
  color: COLORS.text,
  fontSize: 13,
  boxSizing: "border-box",
};

export const emptyMessageTemplateDraft = { id: null, name: "", type: "new_scale", body: "" };
export const emptyPersonPresetDraft = { id: null, name: "", personKeys: [] };

export const personKeyOf = person => String(person.id);
