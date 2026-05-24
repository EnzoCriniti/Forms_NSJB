import React from "react";
import { MemberListConfigModalContent } from "../members/MemberListConfigModal";
import { MessagingSettingsPanel } from "./MessagingSettingsPanel";
import { CatalogManagementPanel } from "./adminCatalogPanels";
import { ExternalBasesPanel, UsersManagementPanel } from "./adminAccessPanels";
import { LabelsPanel, TemplatesPanel } from "./adminOrganizationPanels";
import { SecurityPanel } from "./adminSecurityPanels";
import { AuditLogsPanel } from "./adminAuditLogsPanel";

export const AdminSettingsTabPanel = ({
  tab,
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
}) => {
  if (tab === "users") {
    return (
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
    );
  }

  if (tab === "members") {
    return <MemberListConfigModalContent config={membersConfig} people={people} onSave={onSaveMembersConfig} onSync={onSyncMembersConfig} />;
  }

  if (tab === "external-bases") {
    return (
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
    );
  }

  if (tab === "security") {
    return (
      <SecurityPanel
        formDeleteKeyConfigured={formDeleteKeyConfigured}
        securityDraft={securityDraft}
        setSecurityDraft={setSecurityDraft}
        submitSecurity={submitSecurity}
        busyAction={busyAction}
        onCancelSecurity={onCancelSecurity}
      />
    );
  }

  if (tab === "catalog") {
    return (
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
    );
  }

  if (tab === "labels") {
    return (
      <LabelsPanel
        labelDraft={labelDraft}
        setLabelDraft={setLabelDraft}
        submitLabel={submitLabel}
        busyAction={busyAction}
        labels={labels}
        requestDelete={requestDelete}
        onDeleteLabel={onDeleteLabel}
      />
    );
  }

  if (tab === "presets") {
    return (
      <TemplatesPanel
        presets={presets}
        requestDelete={requestDelete}
        onDeletePreset={onDeletePreset}
      />
    );
  }

  if (tab === "messages") {
    return (
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
    );
  }

  if (tab === "audit" && currentUser?.role === "admin") {
    return <AuditLogsPanel />;
  }

  return null;
};
