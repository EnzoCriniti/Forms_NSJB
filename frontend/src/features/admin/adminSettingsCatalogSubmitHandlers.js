import { emptyFieldCatalogDraft, emptyScaleTaskCatalogDraft } from "./adminSettingsDefaults";
import { buildFieldCatalogPayload, buildScaleTaskCatalogPayload } from "./adminSettingsPayloads";

export const buildAdminSettingsCatalogSubmitHandlers = ({
  drafts,
  setters,
  actions,
  runSubmit,
}) => {
  const { fieldCatalogDraft, scaleTaskDraft } = drafts;
  const { setFieldCatalogDraft, setScaleTaskDraft } = setters;
  const { onSaveFieldCatalogItem, onSaveScaleTaskCatalogItem } = actions;

  const submitFieldCatalog = async () => {
    const { payload, key: resolvedKey, selectionSource } = buildFieldCatalogPayload(fieldCatalogDraft);
    if (!resolvedKey || !fieldCatalogDraft.name.trim() || !fieldCatalogDraft.defaultLabel.trim()) return;
    const isEdit = Boolean(fieldCatalogDraft.id);
    if (fieldCatalogDraft.type === "person_select" && selectionSource?.kind === "external_base" && !selectionSource.externalBaseId) return;
    await runSubmit({
      actionKey: "fieldCatalog",
      loadingMessage: isEdit ? "Salvando campo base..." : "Criando campo base...",
      successMessage: isEdit ? "AlteraÃƒÂ§ÃƒÂµes salvas." : "Criado com sucesso.",
      execute: () => onSaveFieldCatalogItem(payload),
      onSuccess: () => setFieldCatalogDraft(emptyFieldCatalogDraft),
    });
  };

  const submitScaleTask = async () => {
    const { payload, key: resolvedKey } = buildScaleTaskCatalogPayload(scaleTaskDraft);
    if (!resolvedKey || !scaleTaskDraft.name.trim() || !scaleTaskDraft.defaultLabel.trim()) return;
    const isEdit = Boolean(scaleTaskDraft.id);
    await runSubmit({
      actionKey: "scaleTask",
      loadingMessage: isEdit ? "Salvando tarefa base..." : "Criando tarefa base...",
      successMessage: isEdit ? "AlteraÃƒÂ§ÃƒÂµes salvas." : "Criado com sucesso.",
      execute: () => onSaveScaleTaskCatalogItem(payload),
      onSuccess: () => setScaleTaskDraft(emptyScaleTaskCatalogDraft),
    });
  };

  return {
    submitFieldCatalog,
    submitScaleTask,
  };
};
