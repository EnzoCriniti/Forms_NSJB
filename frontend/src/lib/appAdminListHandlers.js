import { buildAppAdminCatalogListHandlers } from "./appAdminCatalogListHandlers";
import { buildAppAdminPeopleExternalHandlers } from "./appAdminPeopleExternalHandlers";

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
    ...buildAppAdminCatalogListHandlers({
      deleteFieldCatalogItem,
      deleteLabel,
      deletePreset,
      deleteScaleTaskCatalogItem,
      saveFieldCatalogItem,
      saveLabel,
      savePreset,
      saveScaleTaskCatalogItem,
      applyBootstrapListResult,
    }),
    ...buildAppAdminPeopleExternalHandlers({
      deleteExternalBase,
      saveExternalBase,
      savePeople,
      syncExternalBase,
      applyBootstrapListResult,
    }),
  };
};
