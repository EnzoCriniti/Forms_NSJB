import { deleteAppListResult, saveAppListResult } from "./appAdminListActions";

export const buildAppAdminListHandlers = ({
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
}) => {
  const applyBootstrapListResult = (key, result, resultKey = key) => {
    setBootstrap(prev => replaceBootstrapListFromResult(prev, key, result, resultKey));
  };

  return {
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
  };
};
