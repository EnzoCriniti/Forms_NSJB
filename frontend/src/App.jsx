/**
 * @file frontend/src/App.jsx
 * @summary Orquestrador principal do frontend.
 * @responsibility Carregar bootstrap, manter sessao/tema e conectar telas com a API.
 */

import React, { useEffect, useMemo, useState } from "react";
import { COLORS, ClosedPublicScreen } from "./components/ui";
import { AppHeader } from "./components/AppHeader";
import { AppStatusScreen } from "./components/AppStatusScreen";
import { AuthPanel } from "./features/auth/AuthPanel";
import { canCreateForms, canViewForm, visibleFormsFor } from "./lib/auth";
import { STORAGE_KEYS } from "./lib/appConstants";
import { loadStored, persist } from "./lib/storage";
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
} from "./lib/api";
import { FormListScreen } from "./screens/FormListScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { EventsScreen } from "./screens/EventsScreen";
import { CreateFormScreen } from "./screens/CreateFormScreen";
import { ResultsScreen } from "./screens/ResultsScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { PublicFormScreen } from "./screens/PublicFormScreen";
import { PublicEscalaScreen } from "./screens/PublicEscalaScreen";
import { isFormClosedForPublic } from "./lib/forms";
import {
  buildDuplicateFormDraft,
  buildSaveFormPayloadFromExisting,
  buildPublicFormPath,
  buildPublicFormResultsPath,
  clampFontScale,
  FONT_SCALE_STEP,
  getPublicRouteFromLocation,
  normalizeStoredSession,
  sanitizeUser,
} from "./lib/appShell";

const EMPTY_BOOTSTRAP = {
  forms: [],
  events: [],
  responsesByForm: {},
  escalaByForm: {},
  users: [],
  labels: [],
  presets: [],
  fieldCatalog: [],
  scaleTaskCatalog: [],
  people: [],
  membersConfig: {},
  externalBases: [],
};

export default function App() {
  const [screen, setScreen] = useState("list");
  const [activeFormId, setActiveFormId] = useState(null);
  const [activeEventId, setActiveEventId] = useState(null);
  const [editingFormId, setEditingFormId] = useState(null);
  const [draftForm, setDraftForm] = useState(null);
  const [publicRoute, setPublicRoute] = useState(() => getPublicRouteFromLocation());
  const [session, setSession] = useState(() => normalizeStoredSession(loadStored(STORAGE_KEYS.session, null)));
  const [theme, setTheme] = useState(() => loadStored(STORAGE_KEYS.theme, "light"));
  const [fontScale, setFontScale] = useState(() => Number(loadStored(STORAGE_KEYS.fontScale, 1)) || 1);
  const [pinnedFormsByUser, setPinnedFormsByUser] = useState(() => loadStored(STORAGE_KEYS.pinnedForms, {}));
  const [pinnedEventsByUser, setPinnedEventsByUser] = useState(() => loadStored(STORAGE_KEYS.pinnedEvents, {}));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bootstrap, setBootstrap] = useState(EMPTY_BOOTSTRAP);
  const [responseDetails, setResponseDetails] = useState({});
  const [escalaDetails, setEscalaDetails] = useState({});
  const [detailLoading, setDetailLoading] = useState(null);
  const [formDeleteKeyConfigured, setFormDeleteKeyConfigured] = useState(null);
  const currentUser = session?.user || null;
  const authToken = session?.token || null;
  const pinnedFormIds = useMemo(() => {
    if (!currentUser?.id) return [];
    return Array.isArray(pinnedFormsByUser[String(currentUser.id)]) ? pinnedFormsByUser[String(currentUser.id)] : [];
  }, [currentUser?.id, pinnedFormsByUser]);
  const pinnedEventIds = useMemo(() => {
    if (!currentUser?.id) return [];
    return Array.isArray(pinnedEventsByUser[String(currentUser.id)]) ? pinnedEventsByUser[String(currentUser.id)] : [];
  }, [currentUser?.id, pinnedEventsByUser]);

  const forms = bootstrap.forms;
  const responsesByForm = { ...(bootstrap.responsesByForm || {}), ...responseDetails };
  const escalaByForm = { ...(bootstrap.escalaByForm || {}), ...escalaDetails };
  const { users, labels, presets, fieldCatalog, scaleTaskCatalog, people, membersConfig, externalBases, events } = bootstrap;
  const activeForm = useMemo(() => forms.find(form => form.id === activeFormId) || null, [forms, activeFormId]);
  const editingForm = useMemo(() => draftForm || forms.find(form => form.id === editingFormId) || null, [draftForm, forms, editingFormId]);
  const publicForm = useMemo(() => {
    const identifier = publicRoute?.identifier;
    if (!identifier) return null;
    return forms.find(form => String(form.id) === String(identifier) || form.slug === identifier) || null;
  }, [forms, publicRoute?.identifier]);
  const publicResultsEnabled = publicForm?.type === "presenca" && publicForm?.resultsConfig?.publicResultsEnabled === true;
  const publicResultsView = publicRoute?.view === "results";
  const hasLoadedResponses = formId => Object.prototype.hasOwnProperty.call(bootstrap.responsesByForm || {}, formId) || Object.prototype.hasOwnProperty.call(responseDetails, formId);
  const hasLoadedEscala = formId => Object.prototype.hasOwnProperty.call(bootstrap.escalaByForm || {}, formId) || Object.prototype.hasOwnProperty.call(escalaDetails, formId);

  useEffect(() => {
    setAuthToken(authToken);
    persist(STORAGE_KEYS.session, session);
  }, [authToken, session]);

  const refreshBootstrap = async ({ preserveSelection = true, silent = false, rethrow = false } = {}) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const next = { ...EMPTY_BOOTSTRAP, ...(await fetchBootstrap()) };
      setBootstrap(next);
      if (!preserveSelection) {
        const firstVisible = visibleFormsFor(currentUser, next.forms)[0] || null;
        setActiveFormId(firstVisible?.id || null);
      } else if (activeFormId && !next.forms.some(form => form.id === activeFormId)) {
        setActiveFormId(next.forms[0]?.id || null);
      } else if (!activeFormId) {
        const firstVisible = visibleFormsFor(currentUser, next.forms)[0] || null;
        setActiveFormId(firstVisible?.id || null);
      }
      return next;
    } catch (loadError) {
      setError(loadError.message || "Erro ao carregar dados.");
      if (rethrow) throw loadError;
      return null;
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const refreshFormDeleteKeyStatus = async () => {
    try {
      const result = await fetchFormDeleteKeyStatus();
      setFormDeleteKeyConfigured(Boolean(result.configured));
      return result;
    } catch {
      setFormDeleteKeyConfigured(false);
      return null;
    }
  };

  const loadResponsesForForm = async formId => {
    if (hasLoadedResponses(formId) || (detailLoading?.kind === "responses" && detailLoading.formId === formId)) return;
    setDetailLoading({ kind: "responses", formId });
    try {
      const result = await fetchFormResponses(formId);
      setResponseDetails(prev => ({ ...prev, [formId]: result.responses || [] }));
    } catch (loadError) {
      setError(loadError.message || "Erro ao carregar dados.");
    } finally {
      setDetailLoading(current => current && current.kind === "responses" && current.formId === formId ? null : current);
    }
  };

  const loadEscalaForForm = async (formId, { force = false } = {}) => {
    if (!force && (hasLoadedEscala(formId) || (detailLoading?.kind === "escala" && detailLoading.formId === formId))) return;
    setDetailLoading({ kind: "escala", formId });
    try {
      const result = await fetchFormEscala(formId);
      setEscalaDetails(prev => ({ ...prev, [formId]: result.sections || [] }));
    } catch (loadError) {
      setError(loadError.message || "Erro ao carregar dados.");
    } finally {
      setDetailLoading(current => current && current.kind === "escala" && current.formId === formId ? null : current);
    }
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
        persist(STORAGE_KEYS.session, null);
      }
    };

    refreshBootstrap({ preserveSelection: false });
    refreshFormDeleteKeyStatus();
    restoreSession();
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    persist(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    const scaleValue = String(fontScale);
    document.documentElement.style.setProperty("--app-font-scale", scaleValue);
    document.documentElement.dataset.fontScale = fontScale > 1 ? "large" : "normal";
    persist(STORAGE_KEYS.fontScale, fontScale);
  }, [fontScale]);

  useEffect(() => {
    const syncPreferences = event => {
      const nextTheme = event?.detail?.theme;
      const nextFontScale = event?.detail?.fontScale;
      if (nextTheme === "light" || nextTheme === "dark") {
        setTheme(nextTheme);
      }
      if (typeof nextFontScale === "number" && !Number.isNaN(nextFontScale)) {
        setFontScale(clampFontScale(nextFontScale));
      }
    };

    window.addEventListener("nsjb-preferences-change", syncPreferences);
    return () => window.removeEventListener("nsjb-preferences-change", syncPreferences);
  }, []);

  const increaseFontScale = () => setFontScale(current => clampFontScale(current + FONT_SCALE_STEP));
  const decreaseFontScale = () => setFontScale(current => clampFontScale(current - FONT_SCALE_STEP));

  useEffect(() => {
    persist(STORAGE_KEYS.pinnedForms, pinnedFormsByUser);
  }, [pinnedFormsByUser]);

  useEffect(() => {
    persist(STORAGE_KEYS.pinnedEvents, pinnedEventsByUser);
  }, [pinnedEventsByUser]);

  useEffect(() => {
    if (currentUser && screen === "list") {
      setScreen("events");
    }
  }, [currentUser?.id, currentUser?.role, screen]);

  const invalidateSession = () => {
    setSession(null);
    setAuthToken(null);
    persist(STORAGE_KEYS.session, null);
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
    const targetForm = publicForm || (["respond", "results"].includes(screen) ? activeForm : null);
    if (!targetForm || (publicForm && isFormClosedForPublic(publicForm) && !publicResultsView)) return undefined;

    if (targetForm.type === "escala_organ") {
      if (hasLoadedEscala(targetForm.id)) return undefined;
      if (detailLoading?.kind === "escala" && detailLoading.formId === targetForm.id) return undefined;
      loadEscalaForForm(targetForm.id);
    } else {
      if (hasLoadedResponses(targetForm.id)) return undefined;
      if (detailLoading?.kind === "responses" && detailLoading.formId === targetForm.id) return undefined;
      loadResponsesForForm(targetForm.id);
    }

    return undefined;
  }, [
    error,
    publicForm?.id,
    publicForm?.type,
    publicResultsView,
    activeForm?.id,
    activeForm?.type,
    screen,
    bootstrap.responsesByForm,
    bootstrap.escalaByForm,
    responseDetails,
    escalaDetails,
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
    if (nextScreen === "dashboard" && !canCreateForms(currentUser)) {
      setScreen("list");
      return;
    }
    if (nextScreen === "create" && !canCreateForms(currentUser)) {
      setScreen("list");
      return;
    }
    if (nextScreen === "settings" && !canCreateForms(currentUser)) {
      setScreen("list");
      return;
    }
    if (nextScreen === "list" && currentUser) {
      setScreen("events");
      return;
    }
    const targetForm = form || activeForm;
    if (nextScreen === "create") {
      setDraftForm(null);
      setEditingFormId(form?.id || null);
      if (form) setActiveFormId(form.id);
    } else if (form) {
      setActiveFormId(form.id);
      setDraftForm(null);
    } else {
      setDraftForm(null);
    }
    if (nextScreen === "results" && targetForm && !canViewForm(currentUser, targetForm)) {
      setScreen("list");
      return;
    }
    setScreen(nextScreen);
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
        setBootstrap(prev => ({
          ...prev,
          events: (prev.events || []).map(event => event.id === eventResponse.event.id ? eventResponse.event : event),
        }));
      }
    }
    setDraftForm(null);
    setEditingFormId(response.form.id);
    setActiveFormId(response.form.id);
    return response.form;
  };

  const handleSaveEvent = async payload => {
    const response = await saveEvent(payload);
    setBootstrap(prev => ({
      ...prev,
      events: [
        response.event,
        ...(prev.events || []).filter(event => event.id !== response.event.id),
      ].sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")) || Number(b.id || 0) - Number(a.id || 0)),
    }));
    return response.event;
  };

  const handlePublishEvent = async id => {
    const response = await publishEvent(id);
    setBootstrap(prev => ({
      ...prev,
      events: (prev.events || []).map(event => event.id === response.event.id ? response.event : event),
    }));
    return response.event;
  };

  const handleDeleteEvent = async id => {
    await deleteEvent(id);
    setPinnedEventsByUser(prev => {
      if (!currentUser?.id) return prev;
      const userKey = String(currentUser.id);
      const current = Array.isArray(prev[userKey]) ? prev[userKey] : [];
      return { ...prev, [userKey]: current.filter(eventId => eventId !== id) };
    });
    setBootstrap(prev => ({
      ...prev,
      events: (prev.events || []).filter(event => event.id !== id),
    }));
    if (activeEventId === id) setActiveEventId(null);
  };

  const handleTogglePinnedEvent = eventId => {
    if (!currentUser?.id || !eventId) return;
    const userKey = String(currentUser.id);
    setPinnedEventsByUser(prev => {
      const current = Array.isArray(prev[userKey]) ? prev[userKey] : [];
      const next = current.includes(eventId)
        ? current.filter(id => id !== eventId)
        : [eventId, ...current];
      return { ...prev, [userKey]: next };
    });
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
    if (!currentUser?.id || !formId) return;
    const userKey = String(currentUser.id);
    setPinnedFormsByUser(prev => {
      const current = Array.isArray(prev[userKey]) ? prev[userKey] : [];
      const next = current.includes(formId)
        ? current.filter(id => id !== formId)
        : [formId, ...current];
      return { ...prev, [userKey]: next };
    });
  };

  const handleSaveFormDeleteKey = async payload => {
    const result = await saveFormDeleteKey(payload);
    setFormDeleteKeyConfigured(Boolean(result.configured));
    return result;
  };

  const handleDeleteForm = async (formId, masterKey) => {
    const result = await deleteForm(formId, masterKey);
    setResponseDetails(prev => {
      const next = { ...prev };
      delete next[formId];
      return next;
    });
    setEscalaDetails(prev => {
      const next = { ...prev };
      delete next[formId];
      return next;
    });
    await refreshBootstrap({ silent: true, rethrow: true });
    setBootstrap(prev => ({
      ...prev,
      events: (prev.events || []).map(event => ({
        ...event,
        formIds: (event.formIds || []).filter(id => id !== formId),
      })),
    }));
    return result;
  };

  const handleSaveResponse = async payload => {
    const result = await saveResponse(payload);
    setResponseDetails(prev => ({ ...prev, [payload.formId]: result.responses }));
    setBootstrap(prev => ({
      ...prev,
      forms: prev.forms.map(form => form.id === payload.formId
        ? { ...form, metrics: { ...form.metrics, responses: result.responses.length } }
        : form),
    }));
  };

  const handleSaveEscala = async (formId, sections) => {
    const result = await saveEscala(formId, sections);
    setEscalaDetails(prev => ({ ...prev, [formId]: result.sections }));
    setBootstrap(prev => {
      const total = result.sections.reduce((sum, section) => sum + section.slots.length, 0);
      const filled = result.sections.reduce((sum, section) => sum + section.slots.filter(slot => slot.person).length, 0);
      return {
        ...prev,
        forms: prev.forms.map(form => form.id === formId
          ? { ...form, metrics: { responses: filled, total, filled, pending: total - filled } }
          : form),
      };
    });
  };

  const handleClaimEscalaSlot = async (formId, sectionIndex, slotIndex, person) => {
    try {
      const result = await claimEscalaSlot(formId, sectionIndex, slotIndex, person);
      setEscalaDetails(prev => ({ ...prev, [formId]: result.sections }));
      setBootstrap(prev => {
        const total = result.sections.reduce((sum, section) => sum + section.slots.length, 0);
        const filled = result.sections.reduce((sum, section) => sum + section.slots.filter(slot => slot.person).length, 0);
        return {
          ...prev,
          forms: prev.forms.map(form => form.id === formId
            ? { ...form, metrics: { responses: filled, total, filled, pending: total - filled } }
            : form),
        };
      });
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
    setBootstrap(prev => ({ ...prev, users: result.users }));
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
    setBootstrap(prev => ({ ...prev, users: result.users }));
    if (currentUser?.id === id) {
      await logout();
    }
  };

  const handleSaveLabel = async label => {
    const result = await saveLabel(label);
    setBootstrap(prev => ({ ...prev, labels: result.labels }));
  };

  const handleDeleteLabel = async id => {
    const result = await deleteLabel(id);
    setBootstrap(prev => ({ ...prev, labels: result.labels }));
  };

  const handleSavePreset = async preset => {
    const result = await savePreset(preset);
    setBootstrap(prev => ({ ...prev, presets: result.presets }));
  };

  const handleDeletePreset = async id => {
    const result = await deletePreset(id);
    setBootstrap(prev => ({ ...prev, presets: result.presets }));
  };

  const handleSavePeople = async nextPeople => {
    const result = await savePeople(nextPeople);
    setBootstrap(prev => ({ ...prev, people: result.people }));
  };

  const handleSaveMembersConfig = async nextConfig => {
    const result = await saveMembersConfig(nextConfig);
    setBootstrap(prev => ({ ...prev, membersConfig: result.membersConfig }));
    return result;
  };

  const handleSyncMembersConfig = async () => {
    const result = await syncMembersConfig();
    setBootstrap(prev => ({
      ...prev,
      people: result.people,
      membersConfig: result.membersConfig,
    }));
    return result;
  };

  const handleSaveExternalBase = async base => {
    const result = await saveExternalBase(base);
    setBootstrap(prev => ({ ...prev, externalBases: result.externalBases }));
    return result;
  };

  const handleDeleteExternalBase = async id => {
    const result = await deleteExternalBase(id);
    setBootstrap(prev => ({ ...prev, externalBases: result.externalBases }));
    return result;
  };

  const handleSyncExternalBase = async id => {
    const result = await syncExternalBase(id);
    setBootstrap(prev => ({ ...prev, externalBases: result.externalBases }));
    return result;
  };

  const handleSaveFieldCatalogItem = async item => {
    const result = await saveFieldCatalogItem(item);
    setBootstrap(prev => ({ ...prev, fieldCatalog: result.fieldCatalog }));
  };

  const handleDeleteFieldCatalogItem = async id => {
    const result = await deleteFieldCatalogItem(id);
    setBootstrap(prev => ({ ...prev, fieldCatalog: result.fieldCatalog }));
  };

  const handleSaveScaleTaskCatalogItem = async item => {
    const result = await saveScaleTaskCatalogItem(item);
    setBootstrap(prev => ({ ...prev, scaleTaskCatalog: result.scaleTaskCatalog }));
  };

  const handleDeleteScaleTaskCatalogItem = async id => {
    const result = await deleteScaleTaskCatalogItem(id);
    setBootstrap(prev => ({ ...prev, scaleTaskCatalog: result.scaleTaskCatalog }));
  };

  const nav = currentUser
    ? [
        ...(canCreateForms(currentUser) ? [{ key: "dashboard", icon: "chart", label: "Dashboard" }] : []),
        { key: "events", icon: "calendar", label: "Eventos" },
      ]
    : [];

  const backToPanel = () => {
    if (window.location.pathname.startsWith("/formularios/")) {
      window.history.pushState(null, "", "/");
    }
    window.location.hash = "";
    setPublicRoute(null);
    setScreen(canCreateForms(currentUser) ? "events" : "list");
  };

  if (loading) {
    return <AppStatusScreen loading tone="loading" message="Carregando aplicação..." />;
  }

  if (error) {
    return <AppStatusScreen tone="error" title="Erro ao iniciar" message={error} actionLabel="Tentar novamente" onAction={() => refreshBootstrap({ preserveSelection: false })} />;
  }

  const targetForm = publicForm || (["respond", "results"].includes(screen) ? activeForm : null);
  const waitingForTarget = Boolean(targetForm) && !(publicForm && isFormClosedForPublic(publicForm) && !publicResultsView) && (targetForm.type === "escala_organ" ? !hasLoadedEscala(targetForm.id) : !hasLoadedResponses(targetForm.id));
  if (waitingForTarget) {
    return <AppStatusScreen loading tone="loading" message="Carregando dados do formulario..." />;
  }

  if (publicForm && publicResultsView) {
    if (!publicResultsEnabled) {
      return (
        <div className="app-root public-root" style={{ fontFamily: "'Segoe UI', -apple-system, sans-serif", minHeight: "100vh", background: COLORS.surfaceAlt, color: COLORS.text, padding: "24px 16px" }}>
          <ClosedPublicScreen
            form={publicForm}
            onBack={currentUser ? backToPanel : null}
            title="Resultados públicos indisponíveis"
            message="Este formulário não está configurado para exibir resultados publicamente."
          />
        </div>
      );
    }
    return (
      <div className="app-root public-root" style={{ fontFamily: "'Segoe UI', -apple-system, sans-serif", minHeight: "100vh", background: COLORS.surfaceAlt, color: COLORS.text, padding: "24px 16px" }}>
        <ResultsScreen
          onNavigate={currentUser ? backToPanel : null}
          form={publicForm}
          responses={responsesByForm[publicForm.id] || []}
          sections={escalaByForm[publicForm.id] || []}
          people={people}
          user={null}
          labels={labels}
          onSaveSections={() => {}}
          publicFormHref={buildPublicFormPath(publicForm)}
        />
      </div>
    );
  }

  if (publicForm) {
    const publicOnBack = currentUser ? backToPanel : null;
    return (
      <div className="app-root public-root" style={{ fontFamily: "'Segoe UI', -apple-system, sans-serif", minHeight: "100vh", background: COLORS.surfaceAlt, color: COLORS.text, padding: "24px 16px" }}>
        {isFormClosedForPublic(publicForm)
          ? <ClosedPublicScreen form={publicForm} onBack={publicOnBack} actionLabel={publicResultsEnabled ? "Resultados" : ""} actionHref={publicResultsEnabled ? buildPublicFormResultsPath(publicForm) : ""} title={publicResultsEnabled ? "Formulário fechado" : "Formulário fechado"} message={publicResultsEnabled ? undefined : "Este formulário não está mais aceitando respostas."} />
          : publicForm.type === "escala_organ"
            ? <PublicEscalaScreen form={publicForm} onBack={publicOnBack} people={people} sections={escalaByForm[publicForm.id] || []} onSaveSections={sections => handleSaveEscala(publicForm.id, sections)} onClaimSlot={(sectionIndex, slotIndex, person) => handleClaimEscalaSlot(publicForm.id, sectionIndex, slotIndex, person)} />
            : <PublicFormScreen form={publicForm} responses={responsesByForm[publicForm.id] || []} onSaveResponse={handleSaveResponse} onBack={publicOnBack} people={people} externalBases={externalBases} resultsHref={publicResultsEnabled ? buildPublicFormResultsPath(publicForm) : ""} />}
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AppStatusScreen width={480} tone="info">
        <div className="login-screen">
          <div className="login-screen__header" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.primary, fontWeight: 800 }}>NF</div>
            <div>
              <h2 style={{ margin: 0, fontSize: 20 }}>Acesso restrito</h2>
              <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 13 }}>Entre com sua conta para acessar a pagina inicial e os formularios internos.</p>
            </div>
          </div>
          <AuthPanel
            user={null}
            onLogin={login}
            onLogout={logout}
            theme={theme}
            fontScale={fontScale}
            onIncreaseTextSize={increaseFontScale}
            onDecreaseTextSize={decreaseFontScale}
            onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
            onOpenSettings={() => navigate("settings")}
            variant="sheet"
          />
        </div>
      </AppStatusScreen>
    );
  }

  return (
    <div className="app-root" style={{ fontFamily: "'Segoe UI', -apple-system, sans-serif", minHeight: "100vh", background: COLORS.surfaceAlt, color: COLORS.text }}>
      <AppHeader
        nav={nav}
        screen={screen}
        currentUser={currentUser}
        theme={theme}
        fontScale={fontScale}
        onNavigate={navigate}
        onIncreaseFontScale={increaseFontScale}
        onDecreaseFontScale={decreaseFontScale}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        onOpenSettings={() => navigate("settings")}
        onLogin={login}
        onLogout={logout}
      />
      <main className="app-main" style={{ maxWidth: 1120, margin: "0 auto", padding: "24px 20px" }}>
        {screen === "dashboard" && (
          <DashboardScreen
            onNavigate={navigate}
            forms={forms}
            labels={labels}
            people={people}
            presets={presets}
            fieldCatalog={fieldCatalog}
            scaleTaskCatalog={scaleTaskCatalog}
            user={currentUser}
          />
        )}
        {screen === "events" && currentUser && (
          <EventsScreen
            events={events}
            forms={forms}
            labels={labels}
            user={currentUser}
            pinnedEventIds={pinnedEventIds}
            pinnedFormIds={pinnedFormIds}
            initialSelectedEventId={activeEventId}
            onSaveEvent={handleSaveEvent}
            onDeleteEvent={handleDeleteEvent}
            onTogglePinnedEvent={handleTogglePinnedEvent}
            onCreateFormInEvent={handleCreateFormInEvent}
            onDuplicateForm={handleDuplicateForm}
            onArchiveForm={handleArchiveForm}
            onTogglePinnedForm={handleTogglePinnedForm}
            onDeleteForm={handleDeleteForm}
            onNavigate={navigate}
          />
        )}
        {screen === "list" && <FormListScreen onNavigate={navigate} onDuplicateForm={handleDuplicateForm} onArchiveForm={handleArchiveForm} onTogglePinnedForm={handleTogglePinnedForm} pinnedFormIds={pinnedFormIds} user={currentUser} labels={labels} forms={forms} onDeleteForm={handleDeleteForm} formDeleteKeyConfigured={formDeleteKeyConfigured} />}
        {screen === "create" && <CreateFormScreen onNavigate={navigate} people={people} membersConfig={membersConfig} externalBases={externalBases} labels={labels} presets={presets} fieldCatalog={fieldCatalog} scaleTaskCatalog={scaleTaskCatalog} onSavePreset={handleSavePreset} onSaveForm={handleSaveForm} form={editingForm} isDuplicateMode={Boolean(draftForm)} />}
        {screen === "settings" && canCreateForms(currentUser) && (
          <SettingsScreen
            onNavigate={navigate}
            users={users}
            labels={labels}
            presets={presets}
            fieldCatalog={fieldCatalog}
            scaleTaskCatalog={scaleTaskCatalog}
            membersConfig={membersConfig}
            externalBases={externalBases}
            people={people}
            currentUser={currentUser}
            onSaveUser={handleSaveUser}
            onDeleteUser={handleDeleteUser}
            onSaveLabel={handleSaveLabel}
            onDeleteLabel={handleDeleteLabel}
            onSavePreset={handleSavePreset}
            onDeletePreset={handleDeletePreset}
            onSaveMembersConfig={handleSaveMembersConfig}
            onSyncMembersConfig={handleSyncMembersConfig}
            onSaveExternalBase={handleSaveExternalBase}
            onDeleteExternalBase={handleDeleteExternalBase}
            onSyncExternalBase={handleSyncExternalBase}
            onSavePeople={handleSavePeople}
            onSaveFieldCatalogItem={handleSaveFieldCatalogItem}
            onDeleteFieldCatalogItem={handleDeleteFieldCatalogItem}
            onSaveScaleTaskCatalogItem={handleSaveScaleTaskCatalogItem}
            onDeleteScaleTaskCatalogItem={handleDeleteScaleTaskCatalogItem}
            formDeleteKeyConfigured={formDeleteKeyConfigured}
            onSaveFormDeleteKey={handleSaveFormDeleteKey}
          />
        )}
        {screen === "results" && activeForm && (
          <ResultsScreen
            onNavigate={navigate}
            form={activeForm}
            responses={responsesByForm[activeForm.id] || []}
            sections={escalaByForm[activeForm.id] || []}
            people={people}
            user={currentUser}
            labels={labels}
            onSaveSections={sections => handleSaveEscala(activeForm.id, sections)}
          />
        )}
        {screen === "respond" && activeForm && activeForm.type === "presenca" && (
          <PublicFormScreen
            form={activeForm}
            responses={responsesByForm[activeForm.id] || []}
            onSaveResponse={handleSaveResponse}
            onBack={() => navigate("list")}
            people={people}
            externalBases={externalBases}
            resultsHref={activeForm.resultsConfig?.publicResultsEnabled ? buildPublicFormResultsPath(activeForm) : ""}
            variant="internal"
          />
        )}
        {screen === "respond" && activeForm && activeForm.type === "escala_organ" && (
          <PublicEscalaScreen
            form={activeForm}
            onBack={() => navigate("list")}
            people={people}
            sections={escalaByForm[activeForm.id] || []}
            onSaveSections={sections => handleSaveEscala(activeForm.id, sections)}
            onClaimSlot={(sectionIndex, slotIndex, person) => handleClaimEscalaSlot(activeForm.id, sectionIndex, slotIndex, person)}
            variant="internal"
          />
        )}
      </main>
    </div>
  );
}
