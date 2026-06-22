/**
 * @file frontend/src/lib/appHandlerGroups.js
 * @summary Montagem dos grupos de handlers do App.
 * @responsibility Conectar builders de sessao, eventos, formularios e admin aos setters/estado do App.
 */

import { canViewForm } from "./auth";
import { removeBootstrapListItem, removeNestedBootstrapItem, removeFormIdFromEvents, replaceBootstrapList, replaceBootstrapListFromResult, sortBootstrapEventsByDateDesc, upsertBootstrapListItem, upsertNestedBootstrapItem } from "./appBootstrapLists";
import { buildEscalaMetrics, updateBootstrapFormMetrics } from "./appBootstrapMetrics";
import { removePinnedIdForUser, togglePinnedIdForUser } from "./appPinning";
import { buildDuplicateFormDraft, buildSaveFormPayloadFromExisting } from "./appFormDrafts";
import { buildAppFormHandlers } from "./appFormHandlers";
import { buildAppAdminHandlers } from "./appAdminHandlers";
import { buildAppEventHandlers } from "./appEventHandlers";
import { resolveAppNavigation } from "./appNavigation";
import { sanitizeUser } from "./appSession";
import { clampFontScale, FONT_SCALE_STEP } from "./appFontScale";
import { buildAppSessionHandlers } from "./appSessionHandlers";

export const buildAppHandlerGroups = ({
  activeEventId,
  activeForm,
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
}) => {
  const sessionHandlers = buildAppSessionHandlers({
    activeForm,
    canCreateForms,
    canViewForm,
    clampFontScale,
    currentUser,
    fontScaleStep: FONT_SCALE_STEP,
    persistSession,
    resolveAppNavigation,
    setActiveEventId,
    setActiveFormId,
    setDraftForm,
    setEditingFormId,
    setFontScale,
    setScreen,
    setSession,
  });

  return {
    sessionHandlers,
    eventHandlers: buildAppEventHandlers({
      activeEventId,
      canCreateForms,
      currentUser,
      removeBootstrapListItem,
      removePinnedIdForUser,
      replaceBootstrapList,
      setActiveEventId,
      setBootstrap,
      setDraftForm,
      setEditingFormId,
      setPinnedEventsByUser,
      setScreen,
      sortBootstrapEventsByDateDesc,
      togglePinnedIdForUser,
      upsertBootstrapListItem,
    }),
    formHandlers: buildAppFormHandlers({
      activeEventId,
      buildDuplicateFormDraft,
      buildEscalaMetrics,
      buildSaveFormPayloadFromExisting,
      canCreateForms,
      currentUser,
      events,
      refreshBootstrap,
      refreshEscalaForForm,
      removeFormDetail,
      removeFormIdFromEvents,
      replaceBootstrapList,
      setActiveFormId,
      setBootstrap,
      setDraftForm,
      setEditingFormId,
      setEscalaDetails,
      setPinnedFormsByUser,
      setResponseDetails,
      setScreen,
      togglePinnedIdForUser,
      updateBootstrapFormMetrics,
      upsertFormDetail,
    }),
    adminHandlers: buildAppAdminHandlers({
      currentUser,
      logout: sessionHandlers.logout,
      removeBootstrapListItem,
      removeNestedBootstrapItem,
      replaceBootstrapList,
      replaceBootstrapListFromResult,
      sanitizeUser,
      setActiveEventId,
      setActiveMessageId,
      setBootstrap,
      setFormDeleteKeyConfigured,
      setScreen,
      setSession,
      upsertBootstrapListItem,
      upsertNestedBootstrapItem,
    }),
  };
};
