import { emptyUserDraft } from "./adminSettingsDefaults";
import { buildAdminUserPayload } from "./adminSettingsPayloads";

export const buildAdminSettingsUserSubmitHandlers = ({
  drafts,
  setters,
  actions,
  runSubmit,
}) => {
  const { userDraft } = drafts;
  const { setUserDraft } = setters;
  const { onSaveUser } = actions;

  const submitUser = async () => {
    if (!userDraft.username.trim() || (!userDraft.id && !userDraft.password.trim())) return;
    const isEdit = Boolean(userDraft.id);
    await runSubmit({
      actionKey: "user",
      loadingMessage: isEdit ? "Salvando usuario..." : "Criando usuario...",
      successMessage: isEdit ? "AlteraÃƒÆ’Ã‚Â§ÃƒÆ’Ã‚Âµes salvas." : "Criado com sucesso.",
      execute: () => onSaveUser(buildAdminUserPayload(userDraft)),
      onSuccess: () => setUserDraft(emptyUserDraft),
    });
  };

  return { submitUser };
};
