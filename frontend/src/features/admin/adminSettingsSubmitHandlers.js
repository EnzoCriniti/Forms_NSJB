import {
  emptyExternalBaseDraft,
  emptyFieldCatalogDraft,
  emptyLabelDraft,
  emptyScaleTaskCatalogDraft,
  emptySecurityDraft,
  emptyUserDraft,
} from "./adminSettingsDefaults";
import {
  buildAdminLabelPayload,
  buildAdminUserPayload,
  buildExternalBasePayload,
  buildFieldCatalogPayload,
  buildScaleTaskCatalogPayload,
  buildSecurityPayload,
} from "./adminSettingsPayloads";
import { runAdminSubmitAction } from "./adminSettingsActions";

export const buildAdminSettingsSubmitHandlers = ({
  currentUser,
  drafts,
  formDeleteKeyConfigured,
  pendingDelete,
  setters,
  actions,
}) => {
  const {
    externalBaseDraft,
    fieldCatalogDraft,
    labelDraft,
    scaleTaskDraft,
    securityDraft,
    userDraft,
  } = drafts;

  const {
    setBusyAction,
    setExternalBaseDraft,
    setFeedback,
    setFieldCatalogDraft,
    setLabelDraft,
    setPendingDelete,
    setScaleTaskDraft,
    setSecurityDraft,
    setUserDraft,
  } = setters;

  const {
    onSaveExternalBase,
    onSaveFieldCatalogItem,
    onSaveFormDeleteKey,
    onSaveLabel,
    onSaveScaleTaskCatalogItem,
    onSaveUser,
    onSyncExternalBase,
  } = actions;

  const runSubmit = config => runAdminSubmitAction({
    ...config,
    setBusyAction,
    setFeedback,
  });

  const submitUser = async () => {
    if (!userDraft.username.trim() || (!userDraft.id && !userDraft.password.trim())) return;
    const isEdit = Boolean(userDraft.id);
    await runSubmit({
      actionKey: "user",
      loadingMessage: isEdit ? "Salvando usuario..." : "Criando usuario...",
      successMessage: isEdit ? "AlteraÃ§Ãµes salvas." : "Criado com sucesso.",
      execute: () => onSaveUser(buildAdminUserPayload(userDraft)),
      onSuccess: () => setUserDraft(emptyUserDraft),
    });
  };

  const submitLabel = async () => {
    if (!labelDraft.name.trim()) return;
    const isEdit = Boolean(labelDraft.id);
    await runSubmit({
      actionKey: "label",
      loadingMessage: isEdit ? "Salvando classificacao..." : "Criando classificacao...",
      successMessage: isEdit ? "AlteraÃ§Ãµes salvas." : "Criado com sucesso.",
      execute: () => onSaveLabel(buildAdminLabelPayload(labelDraft, currentUser)),
      onSuccess: () => setLabelDraft(emptyLabelDraft),
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

  const submitFieldCatalog = async () => {
    const { payload, key: resolvedKey, selectionSource } = buildFieldCatalogPayload(fieldCatalogDraft);
    if (!resolvedKey || !fieldCatalogDraft.name.trim() || !fieldCatalogDraft.defaultLabel.trim()) return;
    const isEdit = Boolean(fieldCatalogDraft.id);
    if (fieldCatalogDraft.type === "person_select" && selectionSource?.kind === "external_base" && !selectionSource.externalBaseId) return;
    await runSubmit({
      actionKey: "fieldCatalog",
      loadingMessage: isEdit ? "Salvando campo base..." : "Criando campo base...",
      successMessage: isEdit ? "AlteraÃ§Ãµes salvas." : "Criado com sucesso.",
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
      successMessage: isEdit ? "AlteraÃ§Ãµes salvas." : "Criado com sucesso.",
      execute: () => onSaveScaleTaskCatalogItem(payload),
      onSuccess: () => setScaleTaskDraft(emptyScaleTaskCatalogDraft),
    });
  };

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

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await runSubmit({
      actionKey: "delete",
      loadingMessage: "Excluindo...",
      successMessage: "ExcluÃ­do com sucesso.",
      execute: pendingDelete.onConfirm,
      onSuccess: () => setPendingDelete(null),
    });
  };

  return {
    confirmDelete,
    submitExternalBase,
    submitExternalBaseSync,
    submitFieldCatalog,
    submitLabel,
    submitScaleTask,
    submitSecurity,
    submitUser,
  };
};
