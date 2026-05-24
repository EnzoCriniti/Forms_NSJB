/**
 * @file frontend/src/features/admin/AdminSettingsModal.jsx
 * @summary Central administrativa do frontend.
 * @responsibility Conectar props externas ao controller e ao conteudo visual da central administrativa.
 */

import React from "react";
import { AdminSettingsContent } from "./AdminSettingsContent";
import { useAdminSettingsController } from "./adminSettingsController";

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
  const controller = useAdminSettingsController({
    currentUser,
    onSaveUser,
    onSaveLabel,
    onSaveFieldCatalogItem,
    onSaveScaleTaskCatalogItem,
    onSaveExternalBase,
    onSyncExternalBase,
    formDeleteKeyConfigured,
    onSaveFormDeleteKey,
  });
  const isScreen = mode === "screen";

  const content = (
    <AdminSettingsContent
      isScreen={isScreen}
      onClose={onClose}
      users={users}
      labels={labels}
      presets={presets}
      fieldCatalog={fieldCatalog}
      scaleTaskCatalog={scaleTaskCatalog}
      membersConfig={membersConfig}
      externalBases={externalBases}
      people={people}
      currentUser={currentUser}
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
      {...controller}
      onConfirmDelete={controller.confirmDelete}
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
