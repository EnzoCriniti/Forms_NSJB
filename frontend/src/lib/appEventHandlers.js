/**
 * @file frontend/src/lib/appEventHandlers.js
 * @summary Montagem dos handlers de eventos usados pelo App principal.
 * @responsibility Agrupar wrappers de eventos para reduzir a orquestracao manual em App.jsx.
 */

import { startEventFormCreation } from "./appFormEntryActions";
import { deleteAppEvent, publishAppEvent, saveAppEvent, toggleAppPinnedEvent } from "./appEventActions";
import {
  deleteEvent as apiDeleteEvent,
  publishEvent as apiPublishEvent,
  saveEvent as apiSaveEvent,
} from "./api";

export const buildAppEventHandlers = ({
  activeEventId,
  canCreateForms,
  currentUser,
  deleteEvent = apiDeleteEvent,
  removeBootstrapListItem,
  removePinnedIdForUser,
  replaceBootstrapList,
  saveEvent = apiSaveEvent,
  publishEvent = apiPublishEvent,
  setActiveEventId,
  setBootstrap,
  setDraftForm,
  setEditingFormId,
  setPinnedEventsByUser,
  setScreen,
  sortBootstrapEventsByDateDesc,
  togglePinnedIdForUser,
  upsertBootstrapListItem,
}) => ({
  handleSaveEvent: async payload => saveAppEvent({
    payload,
    saveEvent,
    setBootstrap,
    replaceBootstrapList,
    sortBootstrapEventsByDateDesc,
  }),

  handlePublishEvent: async id => publishAppEvent({
    id,
    publishEvent,
    setBootstrap,
    upsertBootstrapListItem,
  }),

  handleDeleteEvent: async id => {
    await deleteAppEvent({
      id,
      activeEventId,
      currentUser,
      deleteEvent,
      removeBootstrapListItem,
      removePinnedIdForUser,
      setActiveEventId,
      setBootstrap,
      setPinnedEventsByUser,
    });
  },

  handleTogglePinnedEvent: eventId => {
    toggleAppPinnedEvent({
      eventId,
      currentUser,
      setPinnedEventsByUser,
      togglePinnedIdForUser,
    });
  },

  handleCreateFormInEvent: event => {
    startEventFormCreation({
      event,
      currentUser,
      canCreateForms,
      setActiveEventId,
      setDraftForm,
      setEditingFormId,
      setScreen,
    });
  },
});
