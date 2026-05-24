/**
 * @file frontend/src/features/admin/AdminSettingsModal.jsx
 * @summary Central administrativa do frontend.
 * @responsibility Gerenciar usuarios, socios, catalogos, classificacoes e templates.
 */

import React, { useState } from "react";
import { AdminSettingsContent } from "./AdminSettingsContent";
import {
  buildAdminSettingsTabs,
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

export const AdminSettingsModal = ({
  users,
  labels,
  presets,
  fieldCatalog = [],
  scaleTaskCatalog = [],
  membersConfig,
  externalBases = [],
  people,
  currentUser,
  onSaveUser,
  onDeleteUser,
  onSaveLabel,
  onDeleteLabel,
  onDeletePreset,
  onSaveFieldCatalogItem,
  onDeleteFieldCatalogItem,
  onSaveScaleTaskCatalogItem,
  onDeleteScaleTaskCatalogItem,
  onSaveMembersConfig,
  onSaveExternalBase,
  onDeleteExternalBase,
  onSyncExternalBase,
  onSavePeople,
  onSyncMembersConfig,
  formDeleteKeyConfigured = null,
  onSaveFormDeleteKey,
  messagingConfig,
  messageTemplates = [],
  personPresets = [],
  onSaveMessagingConfig,
  onSaveMessageTemplate,
  onDeleteMessageTemplate,
  onSavePersonPreset,
  onDeletePersonPreset,
  onClose,
  mode = "modal",
}) => {
  const [tab, setTab] = useState("users");
  const [userDraft, setUserDraft] = useState(emptyUserDraft);
  const [labelDraft, setLabelDraft] = useState(emptyLabelDraft);
  const [fieldCatalogDraft, setFieldCatalogDraft] = useState(emptyFieldCatalogDraft);
  const [scaleTaskDraft, setScaleTaskDraft] = useState(emptyScaleTaskCatalogDraft);
  const [externalBaseDraft, setExternalBaseDraft] = useState(emptyExternalBaseDraft);
  const [securityDraft, setSecurityDraft] = useState(emptySecurityDraft);
  const [catalogMode, setCatalogMode] = useState("fields");
  const [feedback, setFeedback] = useState(null);
  const [busyAction, setBusyAction] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const tabs = buildAdminSettingsTabs(currentUser);
  const activeTab = tabs.find(item => item.key === tab) || tabs[0];

  const requestDelete = (title, message, confirmLabel, onConfirm) => {
    setPendingDelete({ title, message, confirmLabel, onConfirm });
  };

  const submitUser = async () => {
    if (!userDraft.username.trim() || (!userDraft.id && !userDraft.password.trim())) return;
    const isEdit = Boolean(userDraft.id);
    await runAdminSubmitAction({
      actionKey: "user",
      loadingMessage: isEdit ? "Salvando usuario..." : "Criando usuario...",
      successMessage: isEdit ? "Alterações salvas." : "Criado com sucesso.",
      setBusyAction,
      setFeedback,
      execute: () => onSaveUser(buildAdminUserPayload(userDraft)),
      onSuccess: () => setUserDraft(emptyUserDraft),
    });
  };

  const submitLabel = async () => {
    if (!labelDraft.name.trim()) return;
    const isEdit = Boolean(labelDraft.id);
    await runAdminSubmitAction({
      actionKey: "label",
      loadingMessage: isEdit ? "Salvando classificacao..." : "Criando classificacao...",
      successMessage: isEdit ? "Alterações salvas." : "Criado com sucesso.",
      setBusyAction,
      setFeedback,
      execute: () => onSaveLabel(buildAdminLabelPayload(labelDraft, currentUser)),
      onSuccess: () => setLabelDraft(emptyLabelDraft),
    });
  };

  const submitExternalBase = async () => {
    if (!externalBaseDraft.name.trim()) return;
    const isEdit = Boolean(externalBaseDraft.id);
    await runAdminSubmitAction({
      actionKey: "externalBase",
      loadingMessage: isEdit ? "Salvando base externa..." : "Criando base externa...",
      successMessage: isEdit ? "Alteracoes salvas." : "Criado com sucesso.",
      setBusyAction,
      setFeedback,
      execute: () => onSaveExternalBase(buildExternalBasePayload(externalBaseDraft)),
      onSuccess: () => setExternalBaseDraft(emptyExternalBaseDraft),
    });
  };

  const submitExternalBaseSync = async id => {
    if (!id) return;
    await runAdminSubmitAction({
      actionKey: `externalBaseSync:${id}`,
      loadingMessage: "Sincronizando base externa...",
      successMessage: result => `${result.importedCount} opcao(oes) sincronizadas.`,
      setBusyAction,
      setFeedback,
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
    await runAdminSubmitAction({
      actionKey: "fieldCatalog",
      loadingMessage: isEdit ? "Salvando campo base..." : "Criando campo base...",
      successMessage: isEdit ? "Alterações salvas." : "Criado com sucesso.",
      setBusyAction,
      setFeedback,
      execute: () => onSaveFieldCatalogItem(payload),
      onSuccess: () => setFieldCatalogDraft(emptyFieldCatalogDraft),
    });
  };

  const submitScaleTask = async () => {
    const { payload, key: resolvedKey } = buildScaleTaskCatalogPayload(scaleTaskDraft);
    if (!resolvedKey || !scaleTaskDraft.name.trim() || !scaleTaskDraft.defaultLabel.trim()) return;
    const isEdit = Boolean(scaleTaskDraft.id);
    await runAdminSubmitAction({
      actionKey: "scaleTask",
      loadingMessage: isEdit ? "Salvando tarefa base..." : "Criando tarefa base...",
      successMessage: isEdit ? "Alterações salvas." : "Criado com sucesso.",
      setBusyAction,
      setFeedback,
      execute: () => onSaveScaleTaskCatalogItem(payload),
      onSuccess: () => setScaleTaskDraft(emptyScaleTaskCatalogDraft),
    });
  };

  const submitSecurity = async () => {
    if (!securityDraft.newMasterKey.trim()) return;
    await runAdminSubmitAction({
      actionKey: "security",
      loadingMessage: formDeleteKeyConfigured ? "Atualizando chave mestra..." : "Configurando chave mestra...",
      successMessage: formDeleteKeyConfigured ? "Alteracoes salvas." : "Chave mestra configurada.",
      setBusyAction,
      setFeedback,
      execute: () => onSaveFormDeleteKey(buildSecurityPayload({ securityDraft, formDeleteKeyConfigured })),
      onSuccess: () => setSecurityDraft(emptySecurityDraft),
    });
  };

  const isScreen = mode === "screen";

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await runAdminSubmitAction({
      actionKey: "delete",
      loadingMessage: "Excluindo...",
      successMessage: "Excluído com sucesso.",
      setBusyAction,
      setFeedback,
      execute: pendingDelete.onConfirm,
      onSuccess: () => setPendingDelete(null),
    });
  };

  const content = (
    <AdminSettingsContent
      isScreen={isScreen}
      onClose={onClose}
      tabs={tabs}
      tab={tab}
      setTab={setTab}
      activeTab={activeTab}
      feedback={feedback}
      users={users}
      labels={labels}
      presets={presets}
      fieldCatalog={fieldCatalog}
      scaleTaskCatalog={scaleTaskCatalog}
      membersConfig={membersConfig}
      externalBases={externalBases}
      people={people}
      currentUser={currentUser}
      userDraft={userDraft}
      setUserDraft={setUserDraft}
      labelDraft={labelDraft}
      setLabelDraft={setLabelDraft}
      fieldCatalogDraft={fieldCatalogDraft}
      setFieldCatalogDraft={setFieldCatalogDraft}
      scaleTaskDraft={scaleTaskDraft}
      setScaleTaskDraft={setScaleTaskDraft}
      externalBaseDraft={externalBaseDraft}
      setExternalBaseDraft={setExternalBaseDraft}
      securityDraft={securityDraft}
      setSecurityDraft={setSecurityDraft}
      catalogMode={catalogMode}
      setCatalogMode={setCatalogMode}
      busyAction={busyAction}
      pendingDelete={pendingDelete}
      requestDelete={requestDelete}
      onDeleteUser={onDeleteUser}
      onDeleteLabel={onDeleteLabel}
      onDeletePreset={onDeletePreset}
      onDeleteFieldCatalogItem={onDeleteFieldCatalogItem}
      onDeleteScaleTaskCatalogItem={onDeleteScaleTaskCatalogItem}
      onSaveMembersConfig={onSaveMembersConfig}
      onDeleteExternalBase={onDeleteExternalBase}
      onSyncMembersConfig={onSyncMembersConfig}
      formDeleteKeyConfigured={formDeleteKeyConfigured}
      messagingConfig={messagingConfig}
      messageTemplates={messageTemplates}
      personPresets={personPresets}
      onSaveMessagingConfig={onSaveMessagingConfig}
      onSaveMessageTemplate={onSaveMessageTemplate}
      onDeleteMessageTemplate={onDeleteMessageTemplate}
      onSavePersonPreset={onSavePersonPreset}
      onDeletePersonPreset={onDeletePersonPreset}
      submitUser={submitUser}
      submitLabel={submitLabel}
      submitExternalBase={submitExternalBase}
      submitExternalBaseSync={submitExternalBaseSync}
      submitFieldCatalog={submitFieldCatalog}
      submitScaleTask={submitScaleTask}
      submitSecurity={submitSecurity}
      onCancelSecurity={() => setSecurityDraft(emptySecurityDraft)}
      onCancelFieldCatalog={() => setFieldCatalogDraft(emptyFieldCatalogDraft)}
      onCancelScaleTask={() => setScaleTaskDraft(emptyScaleTaskCatalogDraft)}
      onCancelDelete={() => setPendingDelete(null)}
      onConfirmDelete={confirmDelete}
    />
  );

  if (isScreen) {
    return content;
  }

  return (
    <div className="modal-backdrop">
      {content}
    </div>
  );
};



