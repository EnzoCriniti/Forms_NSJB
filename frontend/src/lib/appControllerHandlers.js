/**
 * @file frontend/src/lib/appControllerHandlers.js
 * @summary Montagem dos grupos de handlers usados pelo controller do App.
 */

import { canCreateForms } from "./auth";
import { removeFormDetail, upsertFormDetail } from "./appDataLoad";
import { persistSession } from "./appPreferences";
import { buildAppHandlerGroups } from "./appHandlerGroups";

export const buildAppControllerHandlers = ({
  activeEventId,
  activeForm,
  currentUser,
  events,
  refreshBootstrap,
  refreshEscalaForForm,
  setActiveEventId,
  setActiveFormId,
  setActiveMessageId,
  setBootstrap,
  setDraftForm,
  setEditingFormId,
  setEscalaDetails,
  setFontScale,
  setFormDeleteKeyConfigured,
  setPinnedEventsByUser,
  setPinnedFormsByUser,
  setResponseDetails,
  setScreen,
  setSession,
}) => buildAppHandlerGroups({
  activeForm,
  activeEventId,
  canCreateForms,
  currentUser,
  events,
  persistSession,
  refreshBootstrap,
  refreshEscalaForForm,
  removeFormDetail,
  setActiveEventId,
  setActiveFormId,
  setActiveMessageId,
  setBootstrap,
  setDraftForm,
  setEditingFormId,
  setEscalaDetails,
  setFontScale,
  setFormDeleteKeyConfigured,
  setPinnedEventsByUser,
  setPinnedFormsByUser,
  setResponseDetails,
  setScreen,
  setSession,
  upsertFormDetail,
});
