/**
 * @file frontend/src/App.jsx
 * @summary Orquestrador principal do frontend.
 * @responsibility Carregar bootstrap, manter sessao/tema e conectar telas com a API.
 */

import React, { useEffect, useMemo, useState } from "react";
import { canCreateForms, canViewForm, visibleFormsFor } from "./lib/auth";
import { buildEscalaMetrics, createEmptyBootstrap, normalizeBootstrap, pickActiveFormIdAfterBootstrap, removeBootstrapListItem, removeNestedBootstrapItem, removeFormIdFromEvents, removePinnedIdForUser, replaceBootstrapList, replaceBootstrapListFromResult, sortBootstrapEventsByDateDesc, togglePinnedIdForUser, updateBootstrapFormMetrics, upsertBootstrapListItem, upsertNestedBootstrapItem } from "./lib/appBootstrap";
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
import {
  buildDuplicateFormDraft,
  buildSaveFormPayloadFromExisting,
  buildAppShellDerivedState,
  clampFontScale,
  FONT_SCALE_STEP,
  getPublicRouteFromLocation,
  resolveAppDetailLoadRequest,
  resolveAppNavigation,
  sanitizeUser,
} from "./lib/appShell";

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
    const response = await saveForm(payload);
    const refreshed = await refreshBootstrap({ silent: true, rethrow: true });
    if (activeEventId) {
      const targetEvent = (refreshed?.events || events).find(event => event.id === activeEventId);
      if (targetEvent && !targetEvent.formIds.includes(response.form.id)) {
        const eventResponse = await saveEvent({
          ...targetEvent,
          formIds: [...targetEvent.formIds, response.form.id],
        });
        setBootstrap(prev => replaceBootstrapList(prev, "events", (prev.events || []).map(event => event.id === eventResponse.event.id ? eventResponse.event : event)));
      }
    }
    setDraftForm(null);
    setEditingFormId(response.form.id);
    setActiveFormId(response.form.id);
    return response.form;
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
    if (!event || !canCreateForms(currentUser)) return;
    setActiveEventId(event.id);
    setDraftForm(null);
    setEditingFormId(null);
    setScreen("create");
  };

  const handleDuplicateForm = form => {
    if (!form || !canCreateForms(currentUser)) return;
    setDraftForm(buildDuplicateFormDraft(form));
    setEditingFormId(null);
    setActiveFormId(form.id);
    setScreen("create");
  };

  const handleArchiveForm = async (form, nextStatus) => {
    if (!form || !canCreateForms(currentUser)) return null;
    const response = await saveForm(buildSaveFormPayloadFromExisting(form, nextStatus));
    await refreshBootstrap({ silent: true, rethrow: true });
    setDraftForm(null);
    setEditingFormId(null);
    setActiveFormId(response.form.id);
    return response.form;
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
    const result = await deleteForm(formId, masterKey);
    setResponseDetails(prev => removeFormDetail(prev, formId));
    setEscalaDetails(prev => removeFormDetail(prev, formId));
    await refreshBootstrap({ silent: true, rethrow: true });
    setBootstrap(prev => removeFormIdFromEvents(prev, formId));
    return result;
  };

  const handleSaveResponse = async payload => {
    const result = await saveResponse(payload);
    setResponseDetails(prev => upsertFormDetail(prev, payload.formId, result.responses));
    setBootstrap(prev => updateBootstrapFormMetrics(prev, payload.formId, { responses: result.responses.length }));
  };

  const handleSaveEscala = async (formId, sections) => {
    const result = await saveEscala(formId, sections);
    setEscalaDetails(prev => upsertFormDetail(prev, formId, result.sections));
    setBootstrap(prev => updateBootstrapFormMetrics(prev, formId, buildEscalaMetrics(result.sections)));
  };

  const handleClaimEscalaSlot = async (formId, sectionIndex, slotIndex, person) => {
    try {
      const result = await claimEscalaSlot(formId, sectionIndex, slotIndex, person);
      setEscalaDetails(prev => upsertFormDetail(prev, formId, result.sections));
      setBootstrap(prev => updateBootstrapFormMetrics(prev, formId, buildEscalaMetrics(result.sections)));
      return result.sections;
    } catch (error) {
      if (error?.status === 409 || error?.code === "ESCALA_CONFLICT") {
        await refreshEscalaForForm(formId);
      }
      throw error;
    }
  };

  const handleSaveUser = async user => {
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

  const handleDeleteUser = async id => {
    const result = await deleteUser(id);
    applyBootstrapListResult("users", result);
    if (currentUser?.id === id) {
      await logout();
    }
  };

  const handleSaveLabel = async label => {
    const result = await saveLabel(label);
    applyBootstrapListResult("labels", result);
  };

  const handleDeleteLabel = async id => {
    const result = await deleteLabel(id);
    applyBootstrapListResult("labels", result);
  };

  const handleSavePreset = async preset => {
    const result = await savePreset(preset);
    applyBootstrapListResult("presets", result);
  };

  const handleDeletePreset = async id => {
    const result = await deletePreset(id);
    applyBootstrapListResult("presets", result);
  };

  const handleSavePeople = async nextPeople => {
    const result = await savePeople(nextPeople);
    applyBootstrapListResult("people", result);
  };

  const handleSaveMembersConfig = async nextConfig => {
    const result = await saveMembersConfig(nextConfig);
    setBootstrap(prev => replaceBootstrapListFromResult(prev, "membersConfig", result));
    return result;
  };

  const handleSaveMessagingConfig = async nextConfig => {
    const result = await saveMessagingConfig(nextConfig);
    setBootstrap(prev => replaceBootstrapList(prev, "messagingConfig", result.config));
    return result.config;
  };

  const handleSaveMessageTemplate = async template => {
    const result = await saveMessageTemplate(template);
    setBootstrap(prev => upsertBootstrapListItem(prev, "messageTemplates", result.template));
    return result.template;
  };

  const handleDeleteMessageTemplate = async id => {
    await deleteMessageTemplate(id);
    setBootstrap(prev => removeBootstrapListItem(prev, "messageTemplates", item => item.id === id));
  };

  const handleSavePersonPreset = async preset => {
    const result = await savePersonPreset(preset);
    setBootstrap(prev => upsertBootstrapListItem(prev, "personPresets", result.preset));
    return result.preset;
  };

  const handleDeletePersonPreset = async id => {
    await deletePersonPreset(id);
    setBootstrap(prev => removeBootstrapListItem(prev, "personPresets", item => item.id === id));
  };

  const handleSaveEventMessage = async (eventId, payload) => {
    const result = await saveEventMessage(eventId, payload);
    setBootstrap(prev => upsertNestedBootstrapItem(prev, "events", event => event.id === eventId, "messages", result.message, { prepend: !payload?.id }));
    return result.message;
  };

  const openEventMessageEditor = (event, message = null) => {
    setActiveEventId(event.id);
    setActiveMessageId(message?.id || null);
    setScreen("eventMessageEditor");
  };

  const openEventMessageDetail = (event, message) => {
    setActiveEventId(event.id);
    setActiveMessageId(message.id);
    setScreen("eventMessageDetail");
  };

  const applyMessageUpdate = updated => {
    setBootstrap(prev => upsertNestedBootstrapItem(prev, "events", event => event.id === updated.eventId, "messages", updated));
  };

  const applyMessageDeletion = messageId => {
    setBootstrap(prev => removeNestedBootstrapItem(prev, "events", () => true, "messages", item => item.id === messageId));
  };

  const handleSyncMembersConfig = async () => {
    const result = await syncMembersConfig();
    setBootstrap(prev => replaceBootstrapList(replaceBootstrapList(prev, "people", result.people), "membersConfig", result.membersConfig));
    return result;
  };

  const handleSaveExternalBase = async base => {
    const result = await saveExternalBase(base);
    applyBootstrapListResult("externalBases", result);
    return result;
  };

  const handleDeleteExternalBase = async id => {
    const result = await deleteExternalBase(id);
    applyBootstrapListResult("externalBases", result);
    return result;
  };

  const handleSyncExternalBase = async id => {
    const result = await syncExternalBase(id);
    applyBootstrapListResult("externalBases", result);
    return result;
  };

  const handleSaveFieldCatalogItem = async item => {
    const result = await saveFieldCatalogItem(item);
    applyBootstrapListResult("fieldCatalog", result);
  };

  const handleDeleteFieldCatalogItem = async id => {
    const result = await deleteFieldCatalogItem(id);
    applyBootstrapListResult("fieldCatalog", result);
  };

  const handleSaveScaleTaskCatalogItem = async item => {
    const result = await saveScaleTaskCatalogItem(item);
    applyBootstrapListResult("scaleTaskCatalog", result);
  };

  const handleDeleteScaleTaskCatalogItem = async id => {
    const result = await deleteScaleTaskCatalogItem(id);
    applyBootstrapListResult("scaleTaskCatalog", result);
  };


  const nav = currentUser
    ? [
        ...(canCreateForms(currentUser) ? [{ key: "dashboard", icon: "chart", label: "Dashboard" }] : []),
        { key: "events", icon: "calendar", label: "Eventos" },
      ]
    : [];

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

