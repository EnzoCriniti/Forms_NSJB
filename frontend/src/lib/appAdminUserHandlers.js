import { deleteAppUser, saveAppUser } from "./appAdminUserActions";

export const buildAppAdminUserHandlers = ({
  currentUser,
  deleteUser,
  logout,
  saveUser,
  sanitizeUser,
  setBootstrap,
  setSession,
  replaceBootstrapListFromResult,
}) => {
  const applyBootstrapListResult = (key, result, resultKey = key) => {
    setBootstrap(prev => replaceBootstrapListFromResult(prev, key, result, resultKey));
  };

  return {
    handleSaveUser: async user => saveAppUser({ user, currentUser, saveUser, applyBootstrapListResult, sanitizeUser, setSession }),
    handleDeleteUser: async id => {
      await deleteAppUser({ id, currentUser, deleteUser, applyBootstrapListResult, logout });
    },
  };
};
