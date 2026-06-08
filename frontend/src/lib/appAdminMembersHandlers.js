import { saveAppMembersConfig, syncAppMembersConfig } from "./appAdminMembersActions";

export const buildAppAdminMembersHandlers = ({
  replaceBootstrapList,
  replaceBootstrapListFromResult,
  saveMembersConfig,
  setBootstrap,
  syncMembersConfig,
}) => ({
  handleSaveMembersConfig: async nextConfig => saveAppMembersConfig({ nextConfig, saveMembersConfig, setBootstrap, replaceBootstrapListFromResult }),
  handleSyncMembersConfig: async () => syncAppMembersConfig({ syncMembersConfig, setBootstrap, replaceBootstrapList }),
});
