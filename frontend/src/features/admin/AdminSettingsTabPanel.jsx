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
  access,
  catalog,
  members,
  organization,
  security,
  messaging,
  audit,
  shared,
}) => {
  if (tab === "users") {
    return (
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
  }

  if (tab === "members") {
    return <MemberListConfigModalContent config={members.membersConfig} people={members.people} onSave={members.onSaveMembersConfig} onSync={members.onSyncMembersConfig} />;
  }

  if (tab === "external-bases") {
    return (
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
  }

  if (tab === "security") {
    return (
      <SecurityPanel
        formDeleteKeyConfigured={security.formDeleteKeyConfigured}
        securityDraft={security.securityDraft}
        setSecurityDraft={security.setSecurityDraft}
        submitSecurity={security.submitSecurity}
        busyAction={shared.busyAction}
        onCancelSecurity={security.onCancelSecurity}
      />
    );
  }

  if (tab === "catalog") {
    return (
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
  }

  if (tab === "labels") {
    return (
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
  }

  if (tab === "presets") {
    return (
      <TemplatesPanel
        presets={organization.presets}
        requestDelete={shared.requestDelete}
        onDeletePreset={organization.onDeletePreset}
      />
    );
  }

  if (tab === "messages") {
    return (
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
  }

  if (tab === "audit" && audit.currentUser?.role === "admin") {
    return <AuditLogsPanel />;
  }

  return null;
};
