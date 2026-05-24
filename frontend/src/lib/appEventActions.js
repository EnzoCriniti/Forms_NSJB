/**
 * @file frontend/src/lib/appEventActions.js
 * @summary Acoes de eventos usadas pelo shell principal.
 * @responsibility Concentrar mutacoes de eventos e pins fora de App.jsx.
 */

export const saveAppEvent = async ({
  payload,
  saveEvent,
  setBootstrap,
  replaceBootstrapList,
  sortBootstrapEventsByDateDesc,
}) => {
  const response = await saveEvent(payload);
  setBootstrap(prev => replaceBootstrapList(prev, "events", sortBootstrapEventsByDateDesc([
    response.event,
    ...(prev.events || []).filter(event => event.id !== response.event.id),
  ])));
  return response.event;
};

export const publishAppEvent = async ({
  id,
  publishEvent,
  setBootstrap,
  upsertBootstrapListItem,
}) => {
  const response = await publishEvent(id);
  setBootstrap(prev => upsertBootstrapListItem(prev, "events", response.event));
  return response.event;
};

export const deleteAppEvent = async ({
  id,
  activeEventId,
  currentUser,
  deleteEvent,
  removeBootstrapListItem,
  removePinnedIdForUser,
  setActiveEventId,
  setBootstrap,
  setPinnedEventsByUser,
}) => {
  await deleteEvent(id);
  setPinnedEventsByUser(prev => removePinnedIdForUser(prev, currentUser?.id, id));
  setBootstrap(prev => removeBootstrapListItem(prev, "events", event => event.id === id));
  if (activeEventId === id) setActiveEventId(null);
};

export const toggleAppPinnedEvent = ({
  eventId,
  currentUser,
  setPinnedEventsByUser,
  togglePinnedIdForUser,
}) => {
  setPinnedEventsByUser(prev => togglePinnedIdForUser(prev, currentUser?.id, eventId));
};
