/**
 * @file frontend/src/features/admin/AdminSettingsContent.jsx
 * @summary Conteudo visual da central administrativa.
 * @responsibility Compor abas, paineis e confirmacao da central administrativa.
 */

import React from "react";
import { Btn, ConfirmModal, FeedbackBanner } from "../../components/ui";
import { MemberListConfigModalContent } from "../members/MemberListConfigModal";
import { MessagingSettingsPanel } from "./MessagingSettingsPanel";
import { CatalogManagementPanel } from "./adminCatalogPanels";
import { ExternalBasesPanel, UsersManagementPanel } from "./adminAccessPanels";
import { LabelsPanel, TemplatesPanel } from "./adminOrganizationPanels";
import { SecurityPanel } from "./adminSecurityPanels";
import { AdminSettingsHeader } from "./adminShellPanels";
import { AuditLogsPanel } from "./adminAuditLogsPanel";

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
        onCancelSecurity={onCancelSecurity}
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
        onCancelFieldCatalog={onCancelFieldCatalog}
        scaleTaskDraft={scaleTaskDraft}
        setScaleTaskDraft={setScaleTaskDraft}
        scaleTaskCatalog={scaleTaskCatalog}
        submitScaleTask={submitScaleTask}
        onDeleteScaleTaskCatalogItem={onDeleteScaleTaskCatalogItem}
        onCancelScaleTask={onCancelScaleTask}
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

    {tab === "audit" && currentUser?.role === "admin" && <AuditLogsPanel />}

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
