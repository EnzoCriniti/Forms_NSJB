import { deleteAppListResult, saveAppListResult } from "./appAdminListActions";

export const buildAppAdminPeopleExternalHandlers = ({
  deleteExternalBase,
  saveExternalBase,
  savePeople,
  syncExternalBase,
  applyBootstrapListResult,
}) => ({
  handleSavePeople: async nextPeople => {
    await saveAppListResult({ payload: nextPeople, key: "people", saveFn: savePeople, applyBootstrapListResult });
  },
  handleSaveExternalBase: async base => saveAppListResult({ payload: base, key: "externalBases", saveFn: saveExternalBase, applyBootstrapListResult }),
  handleDeleteExternalBase: async id => deleteAppListResult({ id, key: "externalBases", deleteFn: deleteExternalBase, applyBootstrapListResult }),
  handleSyncExternalBase: async id => saveAppListResult({ payload: id, key: "externalBases", saveFn: syncExternalBase, applyBootstrapListResult }),
});
