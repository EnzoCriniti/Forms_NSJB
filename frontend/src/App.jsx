/**
 * @file frontend/src/App.jsx
 * @summary Orquestrador principal do frontend.
 * @responsibility Carregar bootstrap, manter sessao/tema e conectar telas com a API.
 */

import React, { useEffect, useMemo, useState } from "react";
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
import { hasLoadedFormDetails, loadFormEscalaDetail, loadFormResponsesDetail, refreshAppBootstrap, refreshFormDeleteKeyConfiguredStatus, removeFormDetail, upsertFormDetail } from "./lib/appDataLoad";
import { applyExternalPreferenceChange, applyFontScalePreference, applyThemePreference, loadInitialFontScale, loadInitialPinnedEventsByUser, loadInitialPinnedFormsByUser, loadInitialSession, loadInitialTheme, persistPinnedEventsByUser, persistPinnedFormsByUser, persistSession } from "./lib/appPreferences";
import { buildDuplicateFormDraft, buildSaveFormPayloadFromExisting } from "./lib/appFormDrafts";
import { archiveAppForm, claimAppEscalaSlot, deleteAppForm, saveAppEscala, saveAppForm, saveAppResponse, startDuplicateForm, startEventFormCreation } from "./lib/appFormActions";
import { applyAppMessageDeletion, applyAppMessageUpdate, deleteAppListResult, deleteAppMessageTemplate, deleteAppPersonPreset, deleteAppUser, openAppEventMessageDetail, openAppEventMessageEditor, saveAppEventMessage, saveAppListResult, saveAppMembersConfig, saveAppMessageTemplate, saveAppMessagingConfig, saveAppPersonPreset, saveAppUser, syncAppMembersConfig } from "./lib/appAdminActions";
import { resolveAppNavigation } from "./lib/appNavigation";
import { getPublicRouteFromLocation } from "./lib/appPublicRoutes";
import { sanitizeUser } from "./lib/appSession";
import { buildAppShellDerivedState } from "./lib/appShellDerivedState";
import { resolveAppDetailLoadRequest } from "./lib/appDetailTarget";
import { clampFontScale, FONT_SCALE_STEP } from "./lib/appFontScale";
import { buildAppNavItems } from "./lib/appNav";

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
  const hasLoadedResponses = formId => hasLoadedFormDetails({ bootstrapDetails: bootstrap.responsesByForm, details: responseDetails, formId });
  const hasLoadedEscala = formId => hasLoadedFormDetails({ bootstrapDetails: bootstrap.escalaByForm, details: escalaDetails, formId });

  useEffect(() => {
    setAuthToken(authToken);
    persistSession(session);
  }, [authToken, session]);

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

  useEffect(() => {
    const restoreSession = async () => {
      if (!session) return;
      try {
        const result = await fetchAuthMe();
        setSession({
          user: result.user || session.user,
          token: session.token,
          expiresAt: result.expiresAt || session.expiresAt || null,
        });
      } catch {
        setSession(null);
        setAuthToken(null);
        persistSession(null);
      }
    };

    refreshBootstrap({ preserveSelection: false });
    refreshFormDeleteKeyStatus();
    restoreSession();
  }, []);

  useEffect(() => {
    applyThemePreference(theme);
  }, [theme]);

  useEffect(() => {
    applyFontScalePreference(fontScale);
  }, [fontScale]);

  useEffect(() => {
    const syncPreferences = event => applyExternalPreferenceChange({ event, setTheme, setFontScale });

    window.addEventListener("nsjb-preferences-change", syncPreferences);
    return () => window.removeEventListener("nsjb-preferences-change", syncPreferences);
  }, []);

  const increaseFontScale = () => setFontScale(current => clampFontScale(current + FONT_SCALE_STEP));
  const decreaseFontScale = () => setFontScale(current => clampFontScale(current - FONT_SCALE_STEP));

  useEffect(() => {
    persistPinnedFormsByUser(pinnedFormsByUser);
  }, [pinnedFormsByUser]);

  useEffect(() => {
    persistPinnedEventsByUser(pinnedEventsByUser);
  }, [pinnedEventsByUser]);

  useEffect(() => {
    if (currentUser && screen === "list") {
      setScreen("events");
    }
  }, [currentUser?.id, currentUser?.role, screen]);

  const invalidateSession = () => {
    setSession(null);
    setAuthToken(null);
    persistSession(null);
    setActiveFormId(null);
    setEditingFormId(null);
    setDraftForm(null);
    setScreen("list");
  };

  useEffect(() => {
    const syncPublicRoute = () => setPublicRoute(getPublicRouteFromLocation());
    window.addEventListener("hashchange", syncPublicRoute);
    window.addEventListener("popstate", syncPublicRoute);
    return () => {
      window.removeEventListener("hashchange", syncPublicRoute);
      window.removeEventListener("popstate", syncPublicRoute);
    };
  }, []);

  useEffect(() => {
    if (error) return undefined;
    const loadRequest = resolveAppDetailLoadRequest({
      publicForm,
      publicResultsView,
      screen,
      activeForm,
      responsesByForm,
      escalaByForm,
      detailLoading,
    });
    if (!loadRequest) return undefined;

    if (loadRequest.kind === "escala") {
      loadEscalaForForm(loadRequest.formId);
    } else {
      loadResponsesForForm(loadRequest.formId);
    }

    return undefined;
  }, [
    error,
    publicForm?.id,
    publicForm?.type,
    publicForm?.status,
    publicForm?.closing,
    publicResultsView,
    activeForm?.id,
    activeForm?.type,
    screen,
    responsesByForm,
    escalaByForm,
    detailLoading?.kind,
    detailLoading?.formId,
  ]);

  useEffect(() => {
    if (!authToken) return undefined;

    let mounted = true;
    const validateSession = async () => {
      try {
        const result = await fetchAuthMe();
        if (!mounted) return;
        setSession(prev => prev ? {
          ...prev,
          user: result.user || prev.user,
          expiresAt: result.expiresAt || prev.expiresAt || null,
        } : prev);
      } catch (error) {
        if (!mounted) return;
        if (error?.status === 401 || error?.status === 403) {
          invalidateSession();
        }
      }
    };

    const timer = window.setInterval(validateSession, 30000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [authToken, publicForm]);

  const login = async (username, password) => {
    const result = await loginWithCredentials({ username, password });
    setSession({
      user: result.user,
      token: result.token,
      expiresAt: result.expiresAt || null,
    });
    return result.user;
  };

  const logout = async () => {
    try {
      await logoutAuth();
    } catch {
      // Logout local continua efetivo mesmo se a revogacao remota falhar.
    }
    invalidateSession();
  };

  const navigate = (nextScreen, form) => {
    const decision = resolveAppNavigation({
      nextScreen,
      form,
      activeForm,
      currentUser,
      canCreateForms,
      canViewForm,
    });

    if (decision.clearDraft) {
      setDraftForm(null);
    }
    if (Object.prototype.hasOwnProperty.call(decision, "editingFormId")) {
      setEditingFormId(decision.editingFormId);
    }
    if (decision.activeFormId) {
      setActiveFormId(decision.activeFormId);
    }
    setScreen(decision.screen);
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
    const response = await saveEvent(payload);
    setBootstrap(prev => replaceBootstrapList(prev, "events", sortBootstrapEventsByDateDesc([
      response.event,
      ...(prev.events || []).filter(event => event.id !== response.event.id),
    ])));
    return response.event;
  };

  const handlePublishEvent = async id => {
    const response = await publishEvent(id);
    setBootstrap(prev => upsertBootstrapListItem(prev, "events", response.event));
    return response.event;
  };

  const handleDeleteEvent = async id => {
    await deleteEvent(id);
    setPinnedEventsByUser(prev => removePinnedIdForUser(prev, currentUser?.id, id));
    setBootstrap(prev => removeBootstrapListItem(prev, "events", event => event.id === id));
    if (activeEventId === id) setActiveEventId(null);
  };

  const handleTogglePinnedEvent = eventId => {
    setPinnedEventsByUser(prev => togglePinnedIdForUser(prev, currentUser?.id, eventId));
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

  const shellApp = {
    nav,
    screen,
    currentUser,
    theme,
    fontScale,
    onNavigate: navigate,
    onIncreaseFontScale: increaseFontScale,
    onDecreaseFontScale: decreaseFontScale,
    onToggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
    onOpenSettings: () => navigate("settings"),
    onLogin: login,
    onLogout: logout,
    publicForm,
    publicRoute,
    publicResultsEnabled,
    publicResultsView,
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
    pinnedEventIds,
    pinnedFormIds,
    activeEventId,
    activeMessageId,
    activeEvent,
    activeForm,
    editingForm,
    draftForm,
    membersConfig,
    externalBases,
    users,
    formDeleteKeyConfigured,
    responsesByForm,
    escalaByForm,
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
    setActiveMessageId,
    setActiveEventId,
    setScreen,
    setDraftForm,
    setEditingFormId,
    setActiveFormId,
    canCreateForms,
    handleSaveForm,
    openEventMessageEditor,
    openEventMessageDetail,
    handleSaveResponse,
  };

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

