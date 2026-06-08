export const saveAppMessagingConfig = async ({
  nextConfig,
  saveMessagingConfig,
  setBootstrap,
  replaceBootstrapList,
}) => {
  const result = await saveMessagingConfig(nextConfig);
  setBootstrap(prev => replaceBootstrapList(prev, "messagingConfig", result.config));
  return result.config;
};

export const saveAppMessageTemplate = async ({
  template,
  saveMessageTemplate,
  setBootstrap,
  upsertBootstrapListItem,
}) => {
  const result = await saveMessageTemplate(template);
  setBootstrap(prev => upsertBootstrapListItem(prev, "messageTemplates", result.template));
  return result.template;
};

export const deleteAppMessageTemplate = async ({
  id,
  deleteMessageTemplate,
  setBootstrap,
  removeBootstrapListItem,
}) => {
  await deleteMessageTemplate(id);
  setBootstrap(prev => removeBootstrapListItem(prev, "messageTemplates", item => item.id === id));
};

export const saveAppPersonPreset = async ({
  preset,
  savePersonPreset,
  setBootstrap,
  upsertBootstrapListItem,
}) => {
  const result = await savePersonPreset(preset);
  setBootstrap(prev => upsertBootstrapListItem(prev, "personPresets", result.preset));
  return result.preset;
};

export const deleteAppPersonPreset = async ({
  id,
  deletePersonPreset,
  setBootstrap,
  removeBootstrapListItem,
}) => {
  await deletePersonPreset(id);
  setBootstrap(prev => removeBootstrapListItem(prev, "personPresets", item => item.id === id));
};
