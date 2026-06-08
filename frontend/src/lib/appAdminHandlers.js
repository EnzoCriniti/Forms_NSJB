/**
 * @file frontend/src/lib/appAdminHandlers.js
 * @summary Agregador historico dos handlers administrativos usados pelo App principal.
 * @responsibility Manter compatibilidade enquanto os handlers por dominio vivem em modulos menores.
 */

import {
  deleteExternalBase as apiDeleteExternalBase,
  deleteFieldCatalogItem as apiDeleteFieldCatalogItem,
  deleteLabel as apiDeleteLabel,
  deleteMessageTemplate as apiDeleteMessageTemplate,
  deletePersonPreset as apiDeletePersonPreset,
  deletePreset as apiDeletePreset,
  deleteScaleTaskCatalogItem as apiDeleteScaleTaskCatalogItem,
  deleteUser as apiDeleteUser,
  saveEventMessage as apiSaveEventMessage,
  saveExternalBase as apiSaveExternalBase,
  saveFieldCatalogItem as apiSaveFieldCatalogItem,
  saveFormDeleteKey as apiSaveFormDeleteKey,
  saveLabel as apiSaveLabel,
  saveMembersConfig as apiSaveMembersConfig,
  saveMessageTemplate as apiSaveMessageTemplate,
  saveMessagingConfig as apiSaveMessagingConfig,
  savePeople as apiSavePeople,
  savePersonPreset as apiSavePersonPreset,
  savePreset as apiSavePreset,
  saveScaleTaskCatalogItem as apiSaveScaleTaskCatalogItem,
  saveUser as apiSaveUser,
  syncExternalBase as apiSyncExternalBase,
  syncMembersConfig as apiSyncMembersConfig,
} from "./api";
import { buildAppAdminEventMessageHandlers } from "./appAdminEventMessageHandlers";
import { buildAppAdminListHandlers } from "./appAdminListHandlers";
import { buildAppAdminMembersHandlers } from "./appAdminMembersHandlers";
import { buildAppAdminMessagingHandlers } from "./appAdminMessagingHandlers";
import { buildAppAdminSecurityHandlers } from "./appAdminSecurityHandlers";
import { buildAppAdminUserHandlers } from "./appAdminUserHandlers";

export const buildAppAdminHandlers = ({
  currentUser,
  deleteExternalBase = apiDeleteExternalBase,
  deleteFieldCatalogItem = apiDeleteFieldCatalogItem,
  deleteLabel = apiDeleteLabel,
  deleteMessageTemplate = apiDeleteMessageTemplate,
  deletePersonPreset = apiDeletePersonPreset,
  deletePreset = apiDeletePreset,
  deleteScaleTaskCatalogItem = apiDeleteScaleTaskCatalogItem,
  deleteUser = apiDeleteUser,
  logout,
  removeBootstrapListItem,
  removeNestedBootstrapItem,
  replaceBootstrapList,
  replaceBootstrapListFromResult,
  sanitizeUser,
  saveEventMessage = apiSaveEventMessage,
  saveExternalBase = apiSaveExternalBase,
  saveFieldCatalogItem = apiSaveFieldCatalogItem,
  saveFormDeleteKey = apiSaveFormDeleteKey,
  saveLabel = apiSaveLabel,
  saveMembersConfig = apiSaveMembersConfig,
  saveMessageTemplate = apiSaveMessageTemplate,
  saveMessagingConfig = apiSaveMessagingConfig,
  savePeople = apiSavePeople,
  savePersonPreset = apiSavePersonPreset,
  savePreset = apiSavePreset,
  saveScaleTaskCatalogItem = apiSaveScaleTaskCatalogItem,
  saveUser = apiSaveUser,
  setActiveEventId,
  setActiveMessageId,
  setBootstrap,
  setFormDeleteKeyConfigured,
  setScreen,
  setSession,
  syncExternalBase = apiSyncExternalBase,
  syncMembersConfig = apiSyncMembersConfig,
  upsertBootstrapListItem,
  upsertNestedBootstrapItem,
}) => {
  const userHandlers = buildAppAdminUserHandlers({
    currentUser,
    deleteUser,
    logout,
    saveUser,
    sanitizeUser,
    setBootstrap,
    setSession,
    replaceBootstrapListFromResult,
  });

  const listHandlers = buildAppAdminListHandlers({
    deleteExternalBase,
    deleteFieldCatalogItem,
    deleteLabel,
    deletePreset,
    deleteScaleTaskCatalogItem,
    saveExternalBase,
    saveFieldCatalogItem,
    saveLabel,
    savePeople,
    savePreset,
    saveScaleTaskCatalogItem,
    syncExternalBase,
    replaceBootstrapListFromResult,
    setBootstrap,
  });

  const membersHandlers = buildAppAdminMembersHandlers({
    replaceBootstrapList,
    replaceBootstrapListFromResult,
    saveMembersConfig,
    setBootstrap,
    syncMembersConfig,
  });

  const messagingHandlers = buildAppAdminMessagingHandlers({
    deleteMessageTemplate,
    deletePersonPreset,
    removeBootstrapListItem,
    replaceBootstrapList,
    saveMessageTemplate,
    saveMessagingConfig,
    savePersonPreset,
    setBootstrap,
    upsertBootstrapListItem,
  });

  const eventMessageHandlers = buildAppAdminEventMessageHandlers({
    removeNestedBootstrapItem,
    saveEventMessage,
    setActiveEventId,
    setActiveMessageId,
    setBootstrap,
    setScreen,
    upsertNestedBootstrapItem,
  });

  const securityHandlers = buildAppAdminSecurityHandlers({
    saveFormDeleteKey,
    setFormDeleteKeyConfigured,
  });

  return {
    ...userHandlers,
    ...listHandlers,
    ...membersHandlers,
    ...messagingHandlers,
    ...eventMessageHandlers,
    ...securityHandlers,
  };
};
