import { deleteAppListResult, saveAppListResult } from "./appAdminListActions";

export const buildAppAdminCatalogListHandlers = ({
  deleteFieldCatalogItem,
  deleteLabel,
  deletePreset,
  deleteScaleTaskCatalogItem,
  saveFieldCatalogItem,
  saveLabel,
  savePreset,
  saveScaleTaskCatalogItem,
  applyBootstrapListResult,
}) => ({
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
});
