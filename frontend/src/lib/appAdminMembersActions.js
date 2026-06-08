export const saveAppMembersConfig = async ({
  nextConfig,
  saveMembersConfig,
  setBootstrap,
  replaceBootstrapListFromResult,
}) => {
  const result = await saveMembersConfig(nextConfig);
  setBootstrap(prev => replaceBootstrapListFromResult(prev, "membersConfig", result));
  return result;
};

export const syncAppMembersConfig = async ({
  syncMembersConfig,
  setBootstrap,
  replaceBootstrapList,
}) => {
  const result = await syncMembersConfig();
  setBootstrap(prev => replaceBootstrapList(replaceBootstrapList(prev, "people", result.people), "membersConfig", result.membersConfig));
  return result;
};
