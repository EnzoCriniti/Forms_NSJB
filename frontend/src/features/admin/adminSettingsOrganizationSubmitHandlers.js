import { emptyLabelDraft } from "./adminSettingsDefaults";
import { buildAdminLabelPayload } from "./adminSettingsPayloads";

export const buildAdminSettingsOrganizationSubmitHandlers = ({
  currentUser,
  drafts,
  setters,
  actions,
  runSubmit,
}) => {
  const { labelDraft } = drafts;
  const { setLabelDraft } = setters;
  const { onSaveLabel } = actions;

  const submitLabel = async () => {
    if (!labelDraft.name.trim()) return;
    const isEdit = Boolean(labelDraft.id);
    await runSubmit({
      actionKey: "label",
      loadingMessage: isEdit ? "Salvando classificacao..." : "Criando classificacao...",
      successMessage: isEdit ? "AlteraÃƒÂ§ÃƒÂµes salvas." : "Criado com sucesso.",
      execute: () => onSaveLabel(buildAdminLabelPayload(labelDraft, currentUser)),
      onSuccess: () => setLabelDraft(emptyLabelDraft),
    });
  };

  return {
    submitLabel,
  };
};
