/**
 * @file frontend/src/lib/appAdminActions.js
 * @summary Acoes administrativas e de mensagens usadas pelo shell principal.
 * @responsibility Concentrar mutacoes de usuarios, catalogos, bases, mensagens e configuracoes fora de App.jsx.
 */

export const saveAppUser = async ({
  user,
  currentUser,
  saveUser,
  applyBootstrapListResult,
  sanitizeUser,
  setSession,
}) => {
  const result = await saveUser(user);
  applyBootstrapListResult("users", result);
  if (currentUser?.id === user.id) {
    const refreshed = result.users.find(item => item.id === user.id);
    setSession(prev => prev ? {
      ...prev,
      user: sanitizeUser(refreshed || currentUser),
    } : prev);
  }
  return { ok: true };
};

export const deleteAppUser = async ({
  id,
  currentUser,
  deleteUser,
  applyBootstrapListResult,
  logout,
}) => {
  const result = await deleteUser(id);
  applyBootstrapListResult("users", result);
  if (currentUser?.id === id) {
    await logout();
  }
};

export const saveAppListResult = async ({
  payload,
  key,
  saveFn,
  applyBootstrapListResult,
}) => {
  const result = await saveFn(payload);
  applyBootstrapListResult(key, result);
  return result;
};

export const deleteAppListResult = async ({
  id,
  key,
  deleteFn,
  applyBootstrapListResult,
}) => {
  const result = await deleteFn(id);
  applyBootstrapListResult(key, result);
  return result;
};

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

export const saveAppEventMessage = async ({
  eventId,
  payload,
  saveEventMessage,
  setBootstrap,
  upsertNestedBootstrapItem,
}) => {
  const result = await saveEventMessage(eventId, payload);
  setBootstrap(prev => upsertNestedBootstrapItem(prev, "events", event => event.id === eventId, "messages", result.message, { prepend: !payload?.id }));
  return result.message;
};

export const openAppEventMessageEditor = ({
  event,
  message = null,
  setActiveEventId,
  setActiveMessageId,
  setScreen,
}) => {
  setActiveEventId(event.id);
  setActiveMessageId(message?.id || null);
  setScreen("eventMessageEditor");
};

export const openAppEventMessageDetail = ({
  event,
  message,
  setActiveEventId,
  setActiveMessageId,
  setScreen,
}) => {
  setActiveEventId(event.id);
  setActiveMessageId(message.id);
  setScreen("eventMessageDetail");
};

export const applyAppMessageUpdate = ({
  updated,
  setBootstrap,
  upsertNestedBootstrapItem,
}) => {
  setBootstrap(prev => upsertNestedBootstrapItem(prev, "events", event => event.id === updated.eventId, "messages", updated));
};

export const applyAppMessageDeletion = ({
  messageId,
  setBootstrap,
  removeNestedBootstrapItem,
}) => {
  setBootstrap(prev => removeNestedBootstrapItem(prev, "events", () => true, "messages", item => item.id === messageId));
};
