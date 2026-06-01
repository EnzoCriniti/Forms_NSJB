import { emptyExternalBaseDraft, emptyUserDraft } from "./adminSettingsDefaults";
import { buildAdminUserPayload, buildExternalBasePayload } from "./adminSettingsPayloads";

export const buildAdminSettingsAccessSubmitHandlers = ({
  drafts,
  setters,
  actions,
  runSubmit,
}) => {
  const { externalBaseDraft, userDraft } = drafts;
  const { setExternalBaseDraft, setUserDraft } = setters;
  const { onSaveExternalBase, onSaveUser, onSyncExternalBase } = actions;

  const submitUser = async () => {
    if (!userDraft.username.trim() || (!userDraft.id && !userDraft.password.trim())) return;
    const isEdit = Boolean(userDraft.id);
    await runSubmit({
      actionKey: "user",
      loadingMessage: isEdit ? "Salvando usuario..." : "Criando usuario...",
      successMessage: isEdit ? "AlteraÃƒÂ§ÃƒÂµes salvas." : "Criado com sucesso.",
      execute: () => onSaveUser(buildAdminUserPayload(userDraft)),
      onSuccess: () => setUserDraft(emptyUserDraft),
    });
  };

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
    submitUser,
  };
};
