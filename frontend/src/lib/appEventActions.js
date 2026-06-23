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
  setBootstrap(prev => {
    const nextEvents = sortBootstrapEventsByDateDesc([
      response.event,
      ...(prev.events || []).filter(event => event.id !== response.event.id),
    ]);
    const next = replaceBootstrapList(prev, "events", nextEvents);
    if (!prev.eventsPage) return next;
    return {
      ...next,
      eventsPage: {
        ...prev.eventsPage,
        total: payload?.id ? Number(prev.eventsPage.total || 0) : Number(prev.eventsPage.total || 0) + 1,
      },
    };
  });
  return response.event;
};

export const loadAppEventsPage = async ({
  filters,
  fetchEvents,
  setBootstrap,
}) => {
  const result = await fetchEvents(filters);
  setBootstrap(prev => ({
    ...prev,
    events: Array.isArray(result.events) ? result.events : [],
    eventsPage: {
      total: Number(result.total || 0),
      limit: Number(result.limit || filters?.limit || 20),
      offset: Number(result.offset || filters?.offset || 0),
      search: result.search || filters?.search || "",
    },
  }));
  return result;
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
  setBootstrap(prev => {
    const next = removeBootstrapListItem(prev, "events", event => event.id === id);
    if (!prev.eventsPage) return next;
    return {
      ...next,
      eventsPage: {
        ...prev.eventsPage,
        total: Math.max(0, Number(prev.eventsPage.total || 0) - 1),
      },
    };
  });
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
