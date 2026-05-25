/**
 * @file frontend/src/App.jsx
 * @summary Orquestrador principal do frontend.
 * @responsibility Carregar bootstrap, manter sessao/tema e conectar telas com a API.
 */

import React, { useMemo, useState } from "react";
import { canCreateForms, canViewForm, visibleFormsFor } from "./lib/auth";
import { createEmptyBootstrap, normalizeBootstrap, pickActiveFormIdAfterBootstrap } from "./lib/appBootstrap";
import { removeBootstrapListItem, removeNestedBootstrapItem, removeFormIdFromEvents, replaceBootstrapList, replaceBootstrapListFromResult, sortBootstrapEventsByDateDesc, upsertBootstrapListItem, upsertNestedBootstrapItem } from "./lib/appBootstrapLists";
import { buildEscalaMetrics, updateBootstrapFormMetrics } from "./lib/appBootstrapMetrics";
import { removePinnedIdForUser, togglePinnedIdForUser } from "./lib/appPinning";
import {
  fetchBootstrap,
  fetchAuthMe,
  fetchFormResponses,
  fetchFormEscala,
  fetchFormDeleteKeyStatus,
  loginWithCredentials,
  logoutAuth,
  setAuthToken,
  saveForm,
  saveEvent,
  publishEvent,
  deleteEvent,
  saveResponse,
  claimEscalaSlot,
  saveEscala,
  saveFormDeleteKey,
  saveUser,
  deleteUser,
  saveLabel,
  deleteLabel,
  savePreset,
  deletePreset,
  savePeople,
  saveMembersConfig,
  syncMembersConfig,
  saveExternalBase,
  deleteExternalBase,
  syncExternalBase,
  saveFieldCatalogItem,
  deleteFieldCatalogItem,
  saveScaleTaskCatalogItem,
  deleteScaleTaskCatalogItem,
  deleteForm,
  saveMessagingConfig,
  saveMessageTemplate,
  deleteMessageTemplate,
  savePersonPreset,
  deletePersonPreset,
  saveEventMessage,
} from "./lib/api";
import { AppViewport } from "./AppViewport";
import { isFormClosedForPublic } from "./lib/forms";
import { removeFormDetail, upsertFormDetail } from "./lib/appDataLoad";
import { buildAppDataHandlers } from "./lib/appDataHandlers";
import { applyExternalPreferenceChange, applyFontScalePreference, applyThemePreference, loadInitialFontScale, loadInitialPinnedEventsByUser, loadInitialPinnedFormsByUser, loadInitialSession, loadInitialTheme, persistPinnedEventsByUser, persistPinnedFormsByUser, persistSession } from "./lib/appPreferences";
import { buildDuplicateFormDraft, buildSaveFormPayloadFromExisting } from "./lib/appFormDrafts";
import { buildAppFormHandlers } from "./lib/appFormHandlers";
import { buildAppAdminHandlers } from "./lib/appAdminHandlers";
import { buildAppEventHandlers } from "./lib/appEventHandlers";
import { resolveAppNavigation } from "./lib/appNavigation";
import { getPublicRouteFromLocation } from "./lib/appPublicRoutes";
import { sanitizeUser } from "./lib/appSession";
import { buildAppShellDerivedState } from "./lib/appShellDerivedState";
import { resolveAppDetailLoadRequest } from "./lib/appDetailTarget";
import { clampFontScale, FONT_SCALE_STEP } from "./lib/appFontScale";
import { useAppLifecycleEffects } from "./lib/appLifecycleEffects";
import { buildAppSessionHandlers } from "./lib/appSessionHandlers";
import { buildAppShell } from "./lib/appShellBuilder";

export default function App() {
  const [screen, setScreen] = useState("list");
  const [activeFormId, setActiveFormId] = useState(null);
  const [activeEventId, setActiveEventId] = useState(null);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [editingFormId, setEditingFormId] = useState(null);
  const [draftForm, setDraftForm] = useState(null);
  const [publicRoute, setPublicRoute] = useState(() => getPublicRouteFromLocation());
  const [session, setSession] = useState(loadInitialSession);
  const [theme, setTheme] = useState(loadInitialTheme);
  const [fontScale, setFontScale] = useState(loadInitialFontScale);
  const [pinnedFormsByUser, setPinnedFormsByUser] = useState(loadInitialPinnedFormsByUser);
  const [pinnedEventsByUser, setPinnedEventsByUser] = useState(loadInitialPinnedEventsByUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bootstrap, setBootstrap] = useState(createEmptyBootstrap);
  const [responseDetails, setResponseDetails] = useState({});
  const [escalaDetails, setEscalaDetails] = useState({});
  const [detailLoading, setDetailLoading] = useState(null);
  const [formDeleteKeyConfigured, setFormDeleteKeyConfigured] = useState(null);
  const currentUser = session?.user || null;
  const authToken = session?.token || null;
  const { users, labels, presets, fieldCatalog, scaleTaskCatalog, people, membersConfig, externalBases, events, messageTemplates = [], personPresets = [], messagingConfig = { whatsappGroupName: "", autoDispatchEnabled: true, publicBaseUrl: "" } } = bootstrap;
  const {
    forms,
    responsesByForm,
    escalaByForm,
    pinnedFormIds,
    pinnedEventIds,
    activeForm,
    activeEvent,
    editingForm,
    publicForm,
    publicResultsEnabled,
    publicResultsView,
  } = useMemo(() => buildAppShellDerivedState({
    bootstrap,
    responseDetails,
    escalaDetails,
    currentUser,
    pinnedFormsByUser,
    pinnedEventsByUser,
    activeFormId,
    activeEventId,
    editingFormId,
    draftForm,
    publicRoute,
  }), [
    bootstrap,
    responseDetails,
    escalaDetails,
    currentUser,
    pinnedFormsByUser,
    pinnedEventsByUser,
    activeFormId,
    activeEventId,
    editingFormId,
    draftForm,
    publicRoute,
  ]);
  const {
    loadEscalaForForm,
    loadResponsesForForm,
    refreshBootstrap,
    refreshEscalaForForm,
    refreshFormDeleteKeyStatus,
  } = buildAppDataHandlers({
    activeFormId,
    bootstrap,
    currentUser,
    detailLoading,
    escalaDetails,
    fetchBootstrap,
    fetchFormDeleteKeyStatus,
    fetchFormEscala,
    fetchFormResponses,
    normalizeBootstrap,
    pickActiveFormIdAfterBootstrap,
    responseDetails,
    setActiveFormId,
    setBootstrap,
    setDetailLoading,
    setError,
    setEscalaDetails,
    setFormDeleteKeyConfigured,
    setLoading,
    setResponseDetails,
    visibleFormsFor,
  });

  const sessionHandlers = buildAppSessionHandlers({
    activeForm,
    canCreateForms,
    canViewForm,
    clampFontScale,
    currentUser,
    fontScaleStep: FONT_SCALE_STEP,
    loginWithCredentials,
    logoutAuth,
    persistSession,
    resolveAppNavigation,
    setActiveFormId,
    setAuthToken,
    setDraftForm,
    setEditingFormId,
    setFontScale,
    setScreen,
    setSession,
  });
  const {
    decreaseFontScale,
    increaseFontScale,
    invalidateSession,
    login,
    logout,
    navigate,
  } = sessionHandlers;

  useAppLifecycleEffects({
    activeForm,
    applyExternalPreferenceChange,
    applyFontScalePreference,
    applyThemePreference,
    authToken,
    currentUser,
    detailLoading,
    error,
    escalaByForm,
    fetchAuthMe,
    fontScale,
    getPublicRouteFromLocation,
    invalidateSession,
    loadEscalaForForm,
    loadResponsesForForm,
    persistPinnedEventsByUser,
    persistPinnedFormsByUser,
    persistSession,
    pinnedEventsByUser,
    pinnedFormsByUser,
    publicForm,
    publicResultsView,
    refreshBootstrap,
    refreshFormDeleteKeyStatus,
    resolveAppDetailLoadRequest,
    responsesByForm,
    screen,
    session,
    setAuthToken,
    setFontScale,
    setPublicRoute,
    setScreen,
    setSession,
    setTheme,
    theme,
  });

  const eventHandlers = buildAppEventHandlers({
    activeEventId,
    canCreateForms,
    currentUser,
    deleteEvent,
    removeBootstrapListItem,
    removePinnedIdForUser,
    replaceBootstrapList,
    saveEvent,
    publishEvent,
    setActiveEventId,
    setBootstrap,
    setDraftForm,
    setEditingFormId,
    setPinnedEventsByUser,
    setScreen,
    sortBootstrapEventsByDateDesc,
    togglePinnedIdForUser,
    upsertBootstrapListItem,
  });

  const handleSaveFormDeleteKey = async payload => {
    const result = await saveFormDeleteKey(payload);
    setFormDeleteKeyConfigured(Boolean(result.configured));
    return result;
  };

  const applyBootstrapListResult = (key, result, resultKey = key) => {
    setBootstrap(prev => replaceBootstrapListFromResult(prev, key, result, resultKey));
  };

  const formHandlers = buildAppFormHandlers({
    activeEventId,
    buildDuplicateFormDraft,
    buildEscalaMetrics,
    buildSaveFormPayloadFromExisting,
    canCreateForms,
    claimEscalaSlot,
    currentUser,
    deleteForm,
    events,
    refreshBootstrap,
    refreshEscalaForForm,
    removeFormDetail,
    removeFormIdFromEvents,
    replaceBootstrapList,
    saveEscala,
    saveEvent,
    saveForm,
    saveResponse,
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
  });

  const adminHandlers = buildAppAdminHandlers({
    applyBootstrapListResult,
    currentUser,
    deleteExternalBase,
    deleteFieldCatalogItem,
    deleteLabel,
    deleteMessageTemplate,
    deletePersonPreset,
    deletePreset,
    deleteScaleTaskCatalogItem,
    deleteUser,
    logout,
    removeBootstrapListItem,
    removeNestedBootstrapItem,
    replaceBootstrapList,
    replaceBootstrapListFromResult,
    sanitizeUser,
    saveEventMessage,
    saveExternalBase,
    saveFieldCatalogItem,
    saveLabel,
    saveMembersConfig,
    saveMessageTemplate,
    saveMessagingConfig,
    savePeople,
    savePersonPreset,
    savePreset,
    saveScaleTaskCatalogItem,
    saveUser,
    setActiveEventId,
    setActiveMessageId,
    setBootstrap,
    setScreen,
    setSession,
    syncExternalBase,
    syncMembersConfig,
    upsertBootstrapListItem,
    upsertNestedBootstrapItem,
  });

  const shellApp = buildAppShell({
    adminHandlers: {
      ...adminHandlers,
      handleSaveFormDeleteKey,
    },
    canCreateForms,
    currentUser,
    data: {
      forms,
      labels,
      people,
      presets,
      fieldCatalog,
      scaleTaskCatalog,
      events,
      messageTemplates,
      personPresets,
      messagingConfig,
      membersConfig,
      externalBases,
      users,
      responsesByForm,
      escalaByForm,
    },
    eventHandlers,
    formDeleteKeyConfigured,
    formHandlers,
    navigate,
    sessionHandlers,
    setActiveEventId,
    setActiveFormId,
    setActiveMessageId,
    setDraftForm,
    setEditingFormId,
    setScreen,
    setTheme,
    state: {
      screen,
      fontScale,
      publicForm,
      publicRoute,
      publicResultsEnabled,
      publicResultsView,
      pinnedEventIds,
      pinnedFormIds,
      activeEventId,
      activeMessageId,
      activeEvent,
      activeForm,
      editingForm,
      draftForm,
    },
    theme,
  });

  return (
    <AppViewport
      app={shellApp}
      loading={loading}
      error={error}
      refreshBootstrap={refreshBootstrap}
      login={login}
      logout={logout}
      theme={theme}
      fontScale={fontScale}
      increaseFontScale={increaseFontScale}
      decreaseFontScale={decreaseFontScale}
      setTheme={setTheme}
      setScreen={setScreen}
      setPublicRoute={setPublicRoute}
      setActiveMessageId={setActiveMessageId}
    />
  );
}

