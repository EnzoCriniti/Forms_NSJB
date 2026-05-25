/**
 * @file frontend/src/lib/appAdminHandlers.js
 * @summary Montagem dos handlers administrativos usados pelo App principal.
 * @responsibility Agrupar wrappers de usuarios, catalogos, bases, membros e mensagens fora de App.jsx.
 */

import {
  applyAppMessageDeletion,
  applyAppMessageUpdate,
  deleteAppListResult,
  deleteAppMessageTemplate,
  deleteAppPersonPreset,
  deleteAppUser,
  openAppEventMessageDetail,
  openAppEventMessageEditor,
  saveAppEventMessage,
  saveAppListResult,
  saveAppMembersConfig,
  saveAppMessageTemplate,
  saveAppMessagingConfig,
  saveAppPersonPreset,
  saveAppUser,
  syncAppMembersConfig,
} from "./appAdminActions";

export const buildAppAdminHandlers = ({
  applyBootstrapListResult,
  currentUser,
  deleteExternalBase,
  deleteFieldCatalogItem,
  deleteLabel,
  deleteMessageTemplate,
  deletePersonPreset,
  deletePreset,
  deleteScaleTaskCatalogItem,
  deleteUser,
  logout,
  removeBootstrapListItem,
  removeNestedBootstrapItem,
  replaceBootstrapList,
  replaceBootstrapListFromResult,
  sanitizeUser,
  saveEventMessage,
  saveExternalBase,
  saveFieldCatalogItem,
  saveLabel,
  saveMembersConfig,
  saveMessageTemplate,
  saveMessagingConfig,
  savePeople,
  savePersonPreset,
  savePreset,
  saveScaleTaskCatalogItem,
  saveUser,
  setActiveEventId,
  setActiveMessageId,
  setBootstrap,
  setScreen,
  setSession,
  syncExternalBase,
  syncMembersConfig,
  upsertBootstrapListItem,
  upsertNestedBootstrapItem,
}) => ({
  handleSaveUser: async user => saveAppUser({ user, currentUser, saveUser, applyBootstrapListResult, sanitizeUser, setSession }),
  handleDeleteUser: async id => {
    await deleteAppUser({ id, currentUser, deleteUser, applyBootstrapListResult, logout });
  },
  handleSaveLabel: async label => {
    await saveAppListResult({ payload: label, key: "labels", saveFn: saveLabel, applyBootstrapListResult });
  },
  handleDeleteLabel: async id => {
    await deleteAppListResult({ id, key: "labels", deleteFn: deleteLabel, applyBootstrapListResult });
  },
  handleSavePreset: async preset => {
    await saveAppListResult({ payload: preset, key: "presets", saveFn: savePreset, applyBootstrapListResult });
  },
  handleDeletePreset: async id => {
    await deleteAppListResult({ id, key: "presets", deleteFn: deletePreset, applyBootstrapListResult });
  },
  handleSavePeople: async nextPeople => {
    await saveAppListResult({ payload: nextPeople, key: "people", saveFn: savePeople, applyBootstrapListResult });
  },
  handleSaveMembersConfig: async nextConfig => saveAppMembersConfig({ nextConfig, saveMembersConfig, setBootstrap, replaceBootstrapListFromResult }),
  handleSyncMembersConfig: async () => syncAppMembersConfig({ syncMembersConfig, setBootstrap, replaceBootstrapList }),
  handleSaveExternalBase: async base => saveAppListResult({ payload: base, key: "externalBases", saveFn: saveExternalBase, applyBootstrapListResult }),
  handleDeleteExternalBase: async id => deleteAppListResult({ id, key: "externalBases", deleteFn: deleteExternalBase, applyBootstrapListResult }),
  handleSyncExternalBase: async id => saveAppListResult({ payload: id, key: "externalBases", saveFn: syncExternalBase, applyBootstrapListResult }),
  handleSaveFieldCatalogItem: async item => {
    await saveAppListResult({ payload: item, key: "fieldCatalog", saveFn: saveFieldCatalogItem, applyBootstrapListResult });
  },
  handleDeleteFieldCatalogItem: async id => {
    await deleteAppListResult({ id, key: "fieldCatalog", deleteFn: deleteFieldCatalogItem, applyBootstrapListResult });
  },
  handleSaveScaleTaskCatalogItem: async item => {
    await saveAppListResult({ payload: item, key: "scaleTaskCatalog", saveFn: saveScaleTaskCatalogItem, applyBootstrapListResult });
  },
  handleDeleteScaleTaskCatalogItem: async id => {
    await deleteAppListResult({ id, key: "scaleTaskCatalog", deleteFn: deleteScaleTaskCatalogItem, applyBootstrapListResult });
  },
  handleSaveMessagingConfig: async nextConfig => saveAppMessagingConfig({ nextConfig, saveMessagingConfig, setBootstrap, replaceBootstrapList }),
  handleSaveMessageTemplate: async template => saveAppMessageTemplate({ template, saveMessageTemplate, setBootstrap, upsertBootstrapListItem }),
  handleDeleteMessageTemplate: async id => {
    await deleteAppMessageTemplate({ id, deleteMessageTemplate, setBootstrap, removeBootstrapListItem });
  },
  handleSavePersonPreset: async preset => saveAppPersonPreset({ preset, savePersonPreset, setBootstrap, upsertBootstrapListItem }),
  handleDeletePersonPreset: async id => {
    await deleteAppPersonPreset({ id, deletePersonPreset, setBootstrap, removeBootstrapListItem });
  },
  handleSaveEventMessage: async (eventId, payload) => saveAppEventMessage({ eventId, payload, saveEventMessage, setBootstrap, upsertNestedBootstrapItem }),
  openEventMessageEditor: (event, message = null) => {
    openAppEventMessageEditor({ event, message, setActiveEventId, setActiveMessageId, setScreen });
  },
  openEventMessageDetail: (event, message) => {
    openAppEventMessageDetail({ event, message, setActiveEventId, setActiveMessageId, setScreen });
  },
  applyMessageUpdate: updated => {
    applyAppMessageUpdate({ updated, setBootstrap, upsertNestedBootstrapItem });
  },
  applyMessageDeletion: messageId => {
    applyAppMessageDeletion({ messageId, setBootstrap, removeNestedBootstrapItem });
  },
});
