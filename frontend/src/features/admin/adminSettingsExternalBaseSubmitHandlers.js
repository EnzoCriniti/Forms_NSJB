import { emptyExternalBaseDraft } from "./adminSettingsDefaults";
import { buildExternalBasePayload } from "./adminSettingsPayloads";

export const buildAdminSettingsExternalBaseSubmitHandlers = ({
  drafts,
  setters,
  actions,
  runSubmit,
}) => {
  const { externalBaseDraft } = drafts;
  const { setExternalBaseDraft } = setters;
  const { onSaveExternalBase, onSyncExternalBase } = actions;

  const submitExternalBase = async () => {
    if (!externalBaseDraft.name.trim()) return;
    const isEdit = Boolean(externalBaseDraft.id);
    await runSubmit({
      actionKey: "externalBase",
      loadingMessage: isEdit ? "Salvando base externa..." : "Criando base externa...",
      successMessage: isEdit ? "Alteracoes salvas." : "Criado com sucesso.",
      execute: () => onSaveExternalBase(buildExternalBasePayload(externalBaseDraft)),
      onSuccess: () => setExternalBaseDraft(emptyExternalBaseDraft),
    });
  };

  const submitExternalBaseSync = async id => {
    if (!id) return;
    await runSubmit({
      actionKey: `externalBaseSync:${id}`,
      loadingMessage: "Sincronizando base externa...",
      successMessage: result => `${result.importedCount} opcao(oes) sincronizadas.`,
      execute: () => onSyncExternalBase(id),
      onSuccess: result => {
        setExternalBaseDraft({ ...emptyExternalBaseDraft, ...(result.externalBase || externalBaseDraft) });
      },
    });
  };

  return {
    submitExternalBase,
    submitExternalBaseSync,
  };
};
