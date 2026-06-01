import { emptySecurityDraft } from "./adminSettingsDefaults";
import { buildSecurityPayload } from "./adminSettingsPayloads";

export const buildAdminSettingsSecuritySubmitHandlers = ({
  drafts,
  formDeleteKeyConfigured,
  setters,
  actions,
  runSubmit,
}) => {
  const { securityDraft } = drafts;
  const { setSecurityDraft } = setters;
  const { onSaveFormDeleteKey } = actions;

  const submitSecurity = async () => {
    if (!securityDraft.newMasterKey.trim()) return;
    await runSubmit({
      actionKey: "security",
      loadingMessage: formDeleteKeyConfigured ? "Atualizando chave mestra..." : "Configurando chave mestra...",
      successMessage: formDeleteKeyConfigured ? "Alteracoes salvas." : "Chave mestra configurada.",
      execute: () => onSaveFormDeleteKey(buildSecurityPayload({ securityDraft, formDeleteKeyConfigured })),
      onSuccess: () => setSecurityDraft(emptySecurityDraft),
    });
  };

  return {
    submitSecurity,
  };
};
