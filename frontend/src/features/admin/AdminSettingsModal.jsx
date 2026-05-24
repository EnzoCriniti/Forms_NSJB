/**
 * @file frontend/src/features/admin/AdminSettingsModal.jsx
 * @summary Central administrativa do frontend.
 * @responsibility Gerenciar usuarios, socios, catalogos, classificacoes e templates.
 */

import React, { useState } from "react";
import { Btn, ConfirmModal, FeedbackBanner } from "../../components/ui";
import { MemberListConfigModalContent } from "../members/MemberListConfigModal";
import { MessagingSettingsPanel } from "./MessagingSettingsPanel";
import { CatalogManagementPanel } from "./adminCatalogPanels";
import { ExternalBasesPanel, UsersManagementPanel } from "./adminAccessPanels";
import { LabelsPanel, TemplatesPanel } from "./adminOrganizationPanels";
import { SecurityPanel } from "./adminSecurityPanels";
import { AdminSettingsHeader } from "./adminShellPanels";
import { AuditLogsPanel } from "./adminSettingsShared";
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

  const content = (
      <div
        className={isScreen ? "settings-screen-card admin-settings-shell" : "modal-card modal-card-wide admin-settings-shell"}
        style={isScreen ? { width: "100%", maxWidth: "100%", margin: 0 } : undefined}
      >
        {!isScreen && (
          <div className="settings-modal-header" style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
            <Btn v="ghost" onClick={onClose}>Fechar</Btn>
          </div>
        )}

        <AdminSettingsHeader tabs={tabs} tab={tab} setTab={setTab} activeTab={activeTab} />

        {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} fixed />}

        {tab === "users" && (
          <UsersManagementPanel
            userDraft={userDraft}
            setUserDraft={setUserDraft}
            submitUser={submitUser}
            busyAction={busyAction}
            users={users}
            requestDelete={requestDelete}
            onDeleteUser={onDeleteUser}
            currentUser={currentUser}
          />
        )}

        {tab === "members" && <MemberListConfigModalContent config={membersConfig} people={people} onSave={onSaveMembersConfig} onSync={onSyncMembersConfig} />}

        {tab === "external-bases" && (
          <ExternalBasesPanel
            externalBaseDraft={externalBaseDraft}
            setExternalBaseDraft={setExternalBaseDraft}
            submitExternalBase={submitExternalBase}
            submitExternalBaseSync={submitExternalBaseSync}
            busyAction={busyAction}
            externalBases={externalBases}
            requestDelete={requestDelete}
            onDeleteExternalBase={onDeleteExternalBase}
          />
        )}

        {tab === "security" && (
          <SecurityPanel
            formDeleteKeyConfigured={formDeleteKeyConfigured}
            securityDraft={securityDraft}
            setSecurityDraft={setSecurityDraft}
            submitSecurity={submitSecurity}
            busyAction={busyAction}
            onCancelSecurity={() => setSecurityDraft(emptySecurityDraft)}
          />
        )}
        {tab === "catalog" && (
          <CatalogManagementPanel
            catalogMode={catalogMode}
            setCatalogMode={setCatalogMode}
            fieldCatalogDraft={fieldCatalogDraft}
            setFieldCatalogDraft={setFieldCatalogDraft}
            externalBases={externalBases}
            fieldCatalog={fieldCatalog}
            submitFieldCatalog={submitFieldCatalog}
            busyAction={busyAction}
            onDeleteFieldCatalogItem={onDeleteFieldCatalogItem}
            requestDelete={requestDelete}
            onCancelFieldCatalog={() => setFieldCatalogDraft(emptyFieldCatalogDraft)}
            scaleTaskDraft={scaleTaskDraft}
            setScaleTaskDraft={setScaleTaskDraft}
            scaleTaskCatalog={scaleTaskCatalog}
            submitScaleTask={submitScaleTask}
            onDeleteScaleTaskCatalogItem={onDeleteScaleTaskCatalogItem}
            onCancelScaleTask={() => setScaleTaskDraft(emptyScaleTaskCatalogDraft)}
          />
        )}

        {tab === "labels" && (
          <LabelsPanel
            labelDraft={labelDraft}
            setLabelDraft={setLabelDraft}
            submitLabel={submitLabel}
            busyAction={busyAction}
            labels={labels}
            requestDelete={requestDelete}
            onDeleteLabel={onDeleteLabel}
          />
        )}
        {tab === "presets" && (
          <TemplatesPanel
            presets={presets}
            requestDelete={requestDelete}
            onDeletePreset={onDeletePreset}
          />
        )}

        {tab === "messages" && (
          <MessagingSettingsPanel
            messagingConfig={messagingConfig}
            messageTemplates={messageTemplates}
            personPresets={personPresets}
            people={people}
            onSaveMessagingConfig={onSaveMessagingConfig}
            onSaveMessageTemplate={onSaveMessageTemplate}
            onDeleteMessageTemplate={onDeleteMessageTemplate}
            onSavePersonPreset={onSavePersonPreset}
            onDeletePersonPreset={onDeletePersonPreset}
          />
        )}

        {tab === "audit" && currentUser?.role === "admin" && <AuditLogsPanel currentUser={currentUser} />}
        <ConfirmModal
          open={Boolean(pendingDelete)}
          title={pendingDelete?.title || "Confirmar exclusão"}
          message={pendingDelete?.message || "Tem certeza que deseja continuar?"}
          confirmLabel={pendingDelete?.confirmLabel || "Excluir"}
          tone="danger"
          busy={busyAction === "delete"}
          onCancel={() => setPendingDelete(null)}
          onConfirm={async () => {
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
          }}
        />
      </div>
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



