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
import { loadFormEscalaDetail, loadFormResponsesDetail, refreshAppBootstrap, refreshFormDeleteKeyConfiguredStatus, removeFormDetail, upsertFormDetail } from "./lib/appDataLoad";
import { applyExternalPreferenceChange, applyFontScalePreference, applyThemePreference, loadInitialFontScale, loadInitialPinnedEventsByUser, loadInitialPinnedFormsByUser, loadInitialSession, loadInitialTheme, persistPinnedEventsByUser, persistPinnedFormsByUser, persistSession } from "./lib/appPreferences";
import { buildDuplicateFormDraft, buildSaveFormPayloadFromExisting } from "./lib/appFormDrafts";
import { archiveAppForm, claimAppEscalaSlot, deleteAppForm, saveAppEscala, saveAppForm, saveAppResponse, startDuplicateForm, startEventFormCreation } from "./lib/appFormActions";
import { applyAppMessageDeletion, applyAppMessageUpdate, deleteAppListResult, deleteAppMessageTemplate, deleteAppPersonPreset, deleteAppUser, openAppEventMessageDetail, openAppEventMessageEditor, saveAppEventMessage, saveAppListResult, saveAppMembersConfig, saveAppMessageTemplate, saveAppMessagingConfig, saveAppPersonPreset, saveAppUser, syncAppMembersConfig } from "./lib/appAdminActions";
import { deleteAppEvent, publishAppEvent, saveAppEvent, toggleAppPinnedEvent } from "./lib/appEventActions";
import { resolveAppNavigation } from "./lib/appNavigation";
import { getPublicRouteFromLocation } from "./lib/appPublicRoutes";
import { sanitizeUser } from "./lib/appSession";
import { buildAppShellDerivedState } from "./lib/appShellDerivedState";
import { resolveAppDetailLoadRequest } from "./lib/appDetailTarget";
import { clampFontScale, FONT_SCALE_STEP } from "./lib/appFontScale";
import { buildAppNavItems } from "./lib/appNav";
import { buildShellApp } from "./lib/appShellObject";
import { useAppLifecycleEffects } from "./lib/appLifecycleEffects";
import { invalidateAppSession, loginAppSession, logoutAppSession, navigateAppScreen, updateAppFontScale } from "./lib/appSessionActions";

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
  const refreshBootstrap = async ({ preserveSelection = true, silent = false, rethrow = false } = {}) => {
    return refreshAppBootstrap({
      preserveSelection,
      silent,
      rethrow,
      activeFormId,
      currentUser,
      setLoading,
      setError,
      setBootstrap,
      setActiveFormId,
      fetchBootstrap,
      normalizeBootstrap,
      pickActiveFormIdAfterBootstrap,
      visibleFormsFor,
    });
  };

  const refreshFormDeleteKeyStatus = async () => {
    return refreshFormDeleteKeyConfiguredStatus({
      fetchFormDeleteKeyStatus,
      setFormDeleteKeyConfigured,
    });
  };

  const loadResponsesForForm = async formId => {
    await loadFormResponsesDetail({
      formId,
      bootstrapResponsesByForm: bootstrap.responsesByForm,
      responseDetails,
      detailLoading,
      setDetailLoading,
      setResponseDetails,
      setError,
      fetchFormResponses,
    });
  };

  const loadEscalaForForm = async (formId, { force = false } = {}) => {
    await loadFormEscalaDetail({
      formId,
      force,
      bootstrapEscalaByForm: bootstrap.escalaByForm,
      escalaDetails,
      detailLoading,
      setDetailLoading,
      setEscalaDetails,
      setError,
      fetchFormEscala,
    });
  };

  const refreshEscalaForForm = async formId => loadEscalaForForm(formId, { force: true });

  const increaseFontScale = () => updateAppFontScale({ direction: "increase", setFontScale, clampFontScale, fontScaleStep: FONT_SCALE_STEP });
  const decreaseFontScale = () => updateAppFontScale({ direction: "decrease", setFontScale, clampFontScale, fontScaleStep: FONT_SCALE_STEP });

  const invalidateSession = () => {
    invalidateAppSession({
      persistSession,
      setActiveFormId,
      setAuthToken,
      setDraftForm,
      setEditingFormId,
      setScreen,
      setSession,
    });
  };

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

  const login = async (username, password) => {
    return loginAppSession({ username, password, loginWithCredentials, setSession });
  };

  const logout = async () => {
    await logoutAppSession({ logoutAuth, invalidateSession });
  };

  const navigate = (nextScreen, form) => {
    navigateAppScreen({
      nextScreen,
      form,
      activeForm,
      currentUser,
      canCreateForms,
      canViewForm,
      resolveAppNavigation,
      setActiveFormId,
      setDraftForm,
      setEditingFormId,
      setScreen,
    });
  };

  const handleSaveForm = async payload => {
    return saveAppForm({
      payload,
      activeEventId,
      events,
      saveForm,
      saveEvent,
      refreshBootstrap,
      setActiveFormId,
      setBootstrap,
      setDraftForm,
      setEditingFormId,
      replaceBootstrapList,
    });
  };

  const handleSaveEvent = async payload => {
    return saveAppEvent({
      payload,
      saveEvent,
      setBootstrap,
      replaceBootstrapList,
      sortBootstrapEventsByDateDesc,
    });
  };

  const handlePublishEvent = async id => {
    return publishAppEvent({
      id,
      publishEvent,
      setBootstrap,
      upsertBootstrapListItem,
    });
  };

  const handleDeleteEvent = async id => {
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
  };

  const handleTogglePinnedEvent = eventId => {
    toggleAppPinnedEvent({
      eventId,
      currentUser,
      setPinnedEventsByUser,
      togglePinnedIdForUser,
    });
  };

  const handleCreateFormInEvent = event => {
    startEventFormCreation({
      event,
      currentUser,
      canCreateForms,
      setActiveEventId,
      setDraftForm,
      setEditingFormId,
      setScreen,
    });
  };

  const handleDuplicateForm = form => {
    startDuplicateForm({
      form,
      currentUser,
      canCreateForms,
      buildDuplicateFormDraft,
      setActiveFormId,
      setDraftForm,
      setEditingFormId,
      setScreen,
    });
  };

  const handleArchiveForm = async (form, nextStatus) => {
    return archiveAppForm({
      form,
      nextStatus,
      currentUser,
      canCreateForms,
      buildSaveFormPayloadFromExisting,
      saveForm,
      refreshBootstrap,
      setActiveFormId,
      setDraftForm,
      setEditingFormId,
    });
  };

  const handleTogglePinnedForm = formId => {
    setPinnedFormsByUser(prev => togglePinnedIdForUser(prev, currentUser?.id, formId));
  };

  const handleSaveFormDeleteKey = async payload => {
    const result = await saveFormDeleteKey(payload);
    setFormDeleteKeyConfigured(Boolean(result.configured));
    return result;
  };

  const applyBootstrapListResult = (key, result, resultKey = key) => {
    setBootstrap(prev => replaceBootstrapListFromResult(prev, key, result, resultKey));
  };

  const handleDeleteForm = async (formId, masterKey) => {
    return deleteAppForm({
      formId,
      masterKey,
      deleteForm,
      refreshBootstrap,
      setBootstrap,
      setEscalaDetails,
      setResponseDetails,
      removeFormDetail,
      removeFormIdFromEvents,
    });
  };

  const handleSaveResponse = async payload => {
    await saveAppResponse({
      payload,
      saveResponse,
      setBootstrap,
      setResponseDetails,
      updateBootstrapFormMetrics,
      upsertFormDetail,
    });
  };

  const handleSaveEscala = async (formId, sections) => {
    await saveAppEscala({
      formId,
      sections,
      saveEscala,
      setBootstrap,
      setEscalaDetails,
      buildEscalaMetrics,
      updateBootstrapFormMetrics,
      upsertFormDetail,
    });
  };

  const handleClaimEscalaSlot = async (formId, sectionIndex, slotIndex, person) => {
    return claimAppEscalaSlot({
      formId,
      sectionIndex,
      slotIndex,
      person,
      claimEscalaSlot,
      refreshEscalaForForm,
      setBootstrap,
      setEscalaDetails,
      buildEscalaMetrics,
      updateBootstrapFormMetrics,
      upsertFormDetail,
    });
  };

  const handleSaveUser = async user => {
    return saveAppUser({ user, currentUser, saveUser, applyBootstrapListResult, sanitizeUser, setSession });
  };

  const handleDeleteUser = async id => {
    await deleteAppUser({ id, currentUser, deleteUser, applyBootstrapListResult, logout });
  };

  const handleSaveLabel = async label => {
    await saveAppListResult({ payload: label, key: "labels", saveFn: saveLabel, applyBootstrapListResult });
  };

  const handleDeleteLabel = async id => {
    await deleteAppListResult({ id, key: "labels", deleteFn: deleteLabel, applyBootstrapListResult });
  };

  const handleSavePreset = async preset => {
    await saveAppListResult({ payload: preset, key: "presets", saveFn: savePreset, applyBootstrapListResult });
  };

  const handleDeletePreset = async id => {
    await deleteAppListResult({ id, key: "presets", deleteFn: deletePreset, applyBootstrapListResult });
  };

  const handleSavePeople = async nextPeople => {
    await saveAppListResult({ payload: nextPeople, key: "people", saveFn: savePeople, applyBootstrapListResult });
  };

  const handleSaveMembersConfig = async nextConfig => {
    return saveAppMembersConfig({ nextConfig, saveMembersConfig, setBootstrap, replaceBootstrapListFromResult });
  };

  const handleSaveMessagingConfig = async nextConfig => {
    return saveAppMessagingConfig({ nextConfig, saveMessagingConfig, setBootstrap, replaceBootstrapList });
  };

  const handleSaveMessageTemplate = async template => {
    return saveAppMessageTemplate({ template, saveMessageTemplate, setBootstrap, upsertBootstrapListItem });
  };

  const handleDeleteMessageTemplate = async id => {
    await deleteAppMessageTemplate({ id, deleteMessageTemplate, setBootstrap, removeBootstrapListItem });
  };

  const handleSavePersonPreset = async preset => {
    return saveAppPersonPreset({ preset, savePersonPreset, setBootstrap, upsertBootstrapListItem });
  };

  const handleDeletePersonPreset = async id => {
    await deleteAppPersonPreset({ id, deletePersonPreset, setBootstrap, removeBootstrapListItem });
  };

  const handleSaveEventMessage = async (eventId, payload) => {
    return saveAppEventMessage({ eventId, payload, saveEventMessage, setBootstrap, upsertNestedBootstrapItem });
  };

  const openEventMessageEditor = (event, message = null) => {
    openAppEventMessageEditor({ event, message, setActiveEventId, setActiveMessageId, setScreen });
  };

  const openEventMessageDetail = (event, message) => {
    openAppEventMessageDetail({ event, message, setActiveEventId, setActiveMessageId, setScreen });
  };

  const applyMessageUpdate = updated => {
    applyAppMessageUpdate({ updated, setBootstrap, upsertNestedBootstrapItem });
  };

  const applyMessageDeletion = messageId => {
    applyAppMessageDeletion({ messageId, setBootstrap, removeNestedBootstrapItem });
  };

  const handleSyncMembersConfig = async () => {
    return syncAppMembersConfig({ syncMembersConfig, setBootstrap, replaceBootstrapList });
  };

  const handleSaveExternalBase = async base => {
    return saveAppListResult({ payload: base, key: "externalBases", saveFn: saveExternalBase, applyBootstrapListResult });
  };

  const handleDeleteExternalBase = async id => {
    return deleteAppListResult({ id, key: "externalBases", deleteFn: deleteExternalBase, applyBootstrapListResult });
  };

  const handleSyncExternalBase = async id => {
    return saveAppListResult({ payload: id, key: "externalBases", saveFn: syncExternalBase, applyBootstrapListResult });
  };

  const handleSaveFieldCatalogItem = async item => {
    await saveAppListResult({ payload: item, key: "fieldCatalog", saveFn: saveFieldCatalogItem, applyBootstrapListResult });
  };

  const handleDeleteFieldCatalogItem = async id => {
    await deleteAppListResult({ id, key: "fieldCatalog", deleteFn: deleteFieldCatalogItem, applyBootstrapListResult });
  };

  const handleSaveScaleTaskCatalogItem = async item => {
    await saveAppListResult({ payload: item, key: "scaleTaskCatalog", saveFn: saveScaleTaskCatalogItem, applyBootstrapListResult });
  };

  const handleDeleteScaleTaskCatalogItem = async id => {
    await deleteAppListResult({ id, key: "scaleTaskCatalog", deleteFn: deleteScaleTaskCatalogItem, applyBootstrapListResult });
  };


  const nav = buildAppNavItems({ currentUser, canCreateForms });

  const shellApp = buildShellApp({
    state: {
      nav,
      screen,
      currentUser,
      theme,
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
      formDeleteKeyConfigured,
    },
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
    actions: {
      onNavigate: navigate,
      onIncreaseFontScale: increaseFontScale,
      onDecreaseFontScale: decreaseFontScale,
      onToggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
      onOpenSettings: () => navigate("settings"),
      onLogin: login,
      onLogout: logout,
      handleSaveEvent,
      handlePublishEvent,
      handleDeleteEvent,
      handleTogglePinnedEvent,
      handleCreateFormInEvent,
      handleDuplicateForm,
      handleArchiveForm,
      handleTogglePinnedForm,
      handleDeleteForm,
      handleSaveEventMessage,
      applyMessageUpdate,
      applyMessageDeletion,
      handleSaveEscala,
      handleClaimEscalaSlot,
      handleSaveUser,
      handleDeleteUser,
      handleSaveLabel,
      handleDeleteLabel,
      handleSavePreset,
      handleDeletePreset,
      handleSaveMembersConfig,
      handleSyncMembersConfig,
      handleSaveExternalBase,
      handleDeleteExternalBase,
      handleSyncExternalBase,
      handleSavePeople,
      handleSaveFieldCatalogItem,
      handleDeleteFieldCatalogItem,
      handleSaveScaleTaskCatalogItem,
      handleDeleteScaleTaskCatalogItem,
      handleSaveFormDeleteKey,
      handleSaveMessagingConfig,
      handleSaveMessageTemplate,
      handleDeleteMessageTemplate,
      handleSavePersonPreset,
      handleDeletePersonPreset,
      handleSaveForm,
      openEventMessageEditor,
      openEventMessageDetail,
      handleSaveResponse,
    },
    setters: {
      setActiveMessageId,
      setActiveEventId,
      setScreen,
      setDraftForm,
      setEditingFormId,
      setActiveFormId,
    },
    permissions: {
      canCreateForms,
    },
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

