/**
 * @file frontend/src/features/admin/AdminSettingsContent.jsx
 * @summary Conteudo visual da central administrativa.
 * @responsibility Compor abas, paineis e confirmacao da central administrativa.
 */

import React from "react";
import { Btn, ConfirmModal, FeedbackBanner } from "../../components/ui";
import { AdminSettingsHeader } from "./adminShellPanels";
import { AdminSettingsTabPanel } from "./AdminSettingsTabPanel";

export const AdminSettingsContent = ({
  isScreen,
  onClose,
  tabs,
  tab,
  setTab,
  activeTab,
  feedback,
  users,
  labels,
  presets,
  fieldCatalog,
  scaleTaskCatalog,
  membersConfig,
  externalBases,
  people,
  currentUser,
  userDraft,
  setUserDraft,
  labelDraft,
  setLabelDraft,
  fieldCatalogDraft,
  setFieldCatalogDraft,
  scaleTaskDraft,
  setScaleTaskDraft,
  externalBaseDraft,
  setExternalBaseDraft,
  securityDraft,
  setSecurityDraft,
  catalogMode,
  setCatalogMode,
  busyAction,
  pendingDelete,
  requestDelete,
  onDeleteUser,
  onDeleteLabel,
  onDeletePreset,
  onDeleteFieldCatalogItem,
  onDeleteScaleTaskCatalogItem,
  onSaveMembersConfig,
  onDeleteExternalBase,
  onSyncMembersConfig,
  formDeleteKeyConfigured,
  messagingConfig,
  messageTemplates,
  personPresets,
  onSaveMessagingConfig,
  onSaveMessageTemplate,
  onDeleteMessageTemplate,
  onSavePersonPreset,
  onDeletePersonPreset,
  submitUser,
  submitLabel,
  submitExternalBase,
  submitExternalBaseSync,
  submitFieldCatalog,
  submitScaleTask,
  submitSecurity,
  onCancelSecurity,
  onCancelFieldCatalog,
  onCancelScaleTask,
  onCancelDelete,
  onConfirmDelete,
}) => (
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

    <AdminSettingsTabPanel
      tab={tab}
      shared={{ busyAction, requestDelete }}
      audit={{ currentUser }}
      access={{
        users,
        userDraft,
        setUserDraft,
        externalBases,
        externalBaseDraft,
        setExternalBaseDraft,
        submitUser,
        submitExternalBase,
        submitExternalBaseSync,
        onDeleteUser,
        onDeleteExternalBase,
      }}
      members={{
        membersConfig,
        people,
        onSaveMembersConfig,
        onSyncMembersConfig,
      }}
      security={{
        formDeleteKeyConfigured,
        securityDraft,
        setSecurityDraft,
        submitSecurity,
        onCancelSecurity,
      }}
      catalog={{
        catalogMode,
        setCatalogMode,
        fieldCatalogDraft,
        setFieldCatalogDraft,
        fieldCatalog,
        submitFieldCatalog,
        onDeleteFieldCatalogItem,
        onCancelFieldCatalog,
        scaleTaskDraft,
        setScaleTaskDraft,
        scaleTaskCatalog,
        submitScaleTask,
        onDeleteScaleTaskCatalogItem,
        onCancelScaleTask,
      }}
      organization={{
        labels,
        labelDraft,
        setLabelDraft,
        submitLabel,
        onDeleteLabel,
        presets,
        onDeletePreset,
      }}
      messaging={{
        messagingConfig,
        messageTemplates,
        personPresets,
        onSaveMessagingConfig,
        onSaveMessageTemplate,
        onDeleteMessageTemplate,
        onSavePersonPreset,
        onDeletePersonPreset,
      }}
    />

    <ConfirmModal
      open={Boolean(pendingDelete)}
      title={pendingDelete?.title || "Confirmar exclusão"}
      message={pendingDelete?.message || "Tem certeza que deseja continuar?"}
      confirmLabel={pendingDelete?.confirmLabel || "Excluir"}
      tone="danger"
      busy={busyAction === "delete"}
      onCancel={onCancelDelete}
      onConfirm={onConfirmDelete}
    />
  </div>
);
