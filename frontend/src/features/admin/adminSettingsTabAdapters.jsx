import React from "react";
import { MemberListConfigModalContent } from "../members/MemberListConfigModal";
import { MessagingSettingsPanel } from "./MessagingSettingsPanel";
import { CatalogManagementPanel } from "./adminCatalogPanels";
import { ExternalBasesPanel, UsersManagementPanel } from "./adminAccessPanels";
import { LabelsPanel, TemplatesPanel } from "./adminOrganizationPanels";
import { SecurityPanel } from "./adminSecurityPanels";
import { AuditLogsPanel } from "./adminAuditLogsPanel";

export const renderAdminUsersTab = ({ access, audit, shared }) => (
  <UsersManagementPanel
    userDraft={access.userDraft}
    setUserDraft={access.setUserDraft}
    submitUser={access.submitUser}
    busyAction={shared.busyAction}
    users={access.users}
    requestDelete={shared.requestDelete}
    onDeleteUser={access.onDeleteUser}
    currentUser={audit.currentUser}
  />
);

export const renderAdminMembersTab = ({ members }) => (
  <MemberListConfigModalContent
    config={members.membersConfig}
    people={members.people}
    onSave={members.onSaveMembersConfig}
    onSync={members.onSyncMembersConfig}
  />
);

export const renderAdminExternalBasesTab = ({ access, shared }) => (
  <ExternalBasesPanel
    externalBaseDraft={access.externalBaseDraft}
    setExternalBaseDraft={access.setExternalBaseDraft}
    submitExternalBase={access.submitExternalBase}
    submitExternalBaseSync={access.submitExternalBaseSync}
    busyAction={shared.busyAction}
    externalBases={access.externalBases}
    requestDelete={shared.requestDelete}
    onDeleteExternalBase={access.onDeleteExternalBase}
  />
);

export const renderAdminSecurityTab = ({ security, shared }) => (
  <SecurityPanel
    formDeleteKeyConfigured={security.formDeleteKeyConfigured}
    securityDraft={security.securityDraft}
    setSecurityDraft={security.setSecurityDraft}
    submitSecurity={security.submitSecurity}
    busyAction={shared.busyAction}
    onCancelSecurity={security.onCancelSecurity}
  />
);

export const renderAdminCatalogTab = ({ access, catalog, shared }) => (
  <CatalogManagementPanel
    catalogMode={catalog.catalogMode}
    setCatalogMode={catalog.setCatalogMode}
    fieldCatalogDraft={catalog.fieldCatalogDraft}
    setFieldCatalogDraft={catalog.setFieldCatalogDraft}
    externalBases={access.externalBases}
    fieldCatalog={catalog.fieldCatalog}
    submitFieldCatalog={catalog.submitFieldCatalog}
    busyAction={shared.busyAction}
    onDeleteFieldCatalogItem={catalog.onDeleteFieldCatalogItem}
    requestDelete={shared.requestDelete}
    onCancelFieldCatalog={catalog.onCancelFieldCatalog}
    scaleTaskDraft={catalog.scaleTaskDraft}
    setScaleTaskDraft={catalog.setScaleTaskDraft}
    scaleTaskCatalog={catalog.scaleTaskCatalog}
    submitScaleTask={catalog.submitScaleTask}
    onDeleteScaleTaskCatalogItem={catalog.onDeleteScaleTaskCatalogItem}
    onCancelScaleTask={catalog.onCancelScaleTask}
  />
);

export const renderAdminLabelsTab = ({ organization, shared }) => (
  <LabelsPanel
    labelDraft={organization.labelDraft}
    setLabelDraft={organization.setLabelDraft}
    submitLabel={organization.submitLabel}
    busyAction={shared.busyAction}
    labels={organization.labels}
    requestDelete={shared.requestDelete}
    onDeleteLabel={organization.onDeleteLabel}
  />
);

export const renderAdminPresetsTab = ({ organization, shared }) => (
  <TemplatesPanel
    presets={organization.presets}
    requestDelete={shared.requestDelete}
    onDeletePreset={organization.onDeletePreset}
  />
);

export const renderAdminMessagesTab = ({ members, messaging }) => (
  <MessagingSettingsPanel
    messagingConfig={messaging.messagingConfig}
    messageTemplates={messaging.messageTemplates}
    personPresets={messaging.personPresets}
    people={members.people}
    onSaveMessagingConfig={messaging.onSaveMessagingConfig}
    onSaveMessageTemplate={messaging.onSaveMessageTemplate}
    onDeleteMessageTemplate={messaging.onDeleteMessageTemplate}
    onSavePersonPreset={messaging.onSavePersonPreset}
    onDeletePersonPreset={messaging.onDeletePersonPreset}
  />
);

export const renderAdminAuditTab = ({ audit }) => {
  if (audit.currentUser?.role !== "admin") return null;
  return <AuditLogsPanel />;
};

export const ADMIN_SETTINGS_TAB_RENDERERS = {
  users: renderAdminUsersTab,
  members: renderAdminMembersTab,
  "external-bases": renderAdminExternalBasesTab,
  security: renderAdminSecurityTab,
  catalog: renderAdminCatalogTab,
  labels: renderAdminLabelsTab,
  presets: renderAdminPresetsTab,
  messages: renderAdminMessagesTab,
  audit: renderAdminAuditTab,
};
