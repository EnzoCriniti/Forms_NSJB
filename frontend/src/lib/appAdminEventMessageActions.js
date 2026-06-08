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
