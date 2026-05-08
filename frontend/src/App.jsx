/**
 * @file frontend/src/App.jsx
 * @summary Orquestrador principal do frontend.
 * @responsibility Carregar bootstrap, manter sessao/tema e conectar telas com a API.
 */

import React, { useEffect, useMemo, useState } from "react";
import appData from "./data/appData.json";
import { AuthPanel } from "./features/auth/AuthPanel";
import { AdminSettingsModal } from "./features/admin/AdminSettingsModal";
import { COLORS, Icon, Btn, ClosedPublicScreen } from "./components/ui";
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
  saveFieldCatalogItem,
  deleteFieldCatalogItem,
  saveScaleTaskCatalogItem,
  deleteScaleTaskCatalogItem,
  deleteForm,
} from "./lib/api";
import { FormListScreen } from "./screens/FormListScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { CreateFormScreen } from "./screens/CreateFormScreen";
import { ResultsScreen } from "./screens/ResultsScreen";
import { PublicFormScreen } from "./screens/PublicFormScreen";
import { PublicEscalaScreen } from "./screens/PublicEscalaScreen";
import { isFormClosedForPublic } from "./lib/forms";

const EMPTY_BOOTSTRAP = {
  forms: [],
  responsesByForm: {},
  escalaByForm: {},
  users: [],
  labels: [],
  presets: [],
  fieldCatalog: [],
  scaleTaskCatalog: [],
  people: [],
  membersConfig: {},
};

const sanitizeUser = user => user ? {
  id: user.id,
  name: user.name,
  username: user.username,
  role: user.role,
} : null;

const cloneFormDraft = form => JSON.parse(JSON.stringify(form));

const buildDuplicateFormDraft = form => {
  const copy = cloneFormDraft(form);
  return {
    ...copy,
    id: null,
    slug: "",
    status: "rascunho",
    title: copy.title ? `${copy.title} (Copia)` : "Formulario (Copia)",
  };
};

const buildSaveFormPayloadFromExisting = (form, status = form?.status) => ({
  id: form?.id,
  slug: form?.slug,
  type: form?.type,
  status,
  title: form?.title || "",
  sessionName: form?.sessionName || "",
  description: form?.description || "",
  labels: form?.labels || [],
  date: form?.date || "",
  closing: form?.closing || "",
  closingText: form?.closingText || "",
  totalExpected: form?.totalExpected || 0,
  fieldDefinitions: form?.fieldDefinitions || [],
  resultsConfig: form?.resultsConfig || {},
  scaleSections: form?.scaleSections || [],
});

const HeaderThemeIcon = ({ theme }) => (
  theme === "dark"
    ? <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    : <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
);

const FONT_SCALE_MIN = 0.9;
const FONT_SCALE_MAX = 1.3;
const FONT_SCALE_STEP = 0.1;
const clampFontScale = value => Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, Number(value.toFixed(2))));

const normalizeStoredSession = stored => {
  if (!stored) return null;
  const token = typeof stored.token === "string" && stored.token.trim() ? stored.token : null;
  if (!token) return null;
  return {
    user: sanitizeUser(stored.user || stored),
    token,
    expiresAt: stored.expiresAt || null,
  };
};

const decodePublicSlug = slug => {
  if (!slug) return null;
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
};

const getPublicSlugFromLocation = () => {
  if (window.location.hash.startsWith("#/f/")) {
    return decodePublicSlug(window.location.hash.replace("#/f/", ""));
  }
  if (window.location.pathname.startsWith("/f/")) {
    return decodePublicSlug(window.location.pathname.replace("/f/", ""));
  }
  return null;
};

export default function App() {
  const [screen, setScreen] = useState("list");
  const [activeFormId, setActiveFormId] = useState(null);
  const [editingFormId, setEditingFormId] = useState(null);
  const [draftForm, setDraftForm] = useState(null);
  const [publicSlug, setPublicSlug] = useState(() => getPublicSlugFromLocation());
  const [session, setSession] = useState(() => normalizeStoredSession(loadStored(STORAGE_KEYS.session, null)));
  const [theme, setTheme] = useState(() => loadStored(STORAGE_KEYS.theme, "light"));
  const [fontScale, setFontScale] = useState(() => Number(loadStored(STORAGE_KEYS.fontScale, 1)) || 1);
  const [pinnedFormsByUser, setPinnedFormsByUser] = useState(() => loadStored(STORAGE_KEYS.pinnedForms, {}));
  const [showSettings, setShowSettings] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
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

  const forms = bootstrap.forms;
  const responsesByForm = { ...(bootstrap.responsesByForm || {}), ...responseDetails };
  const escalaByForm = { ...(bootstrap.escalaByForm || {}), ...escalaDetails };
  const { users, labels, presets, fieldCatalog, scaleTaskCatalog, people, membersConfig } = bootstrap;
  const activeForm = useMemo(() => forms.find(form => form.id === activeFormId) || null, [forms, activeFormId]);
  const editingForm = useMemo(() => draftForm || forms.find(form => form.id === editingFormId) || null, [draftForm, forms, editingFormId]);
  const publicForm = useMemo(() => forms.find(form => form.slug === publicSlug) || null, [forms, publicSlug]);
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

  const increaseFontScale = () => setFontScale(current => clampFontScale(current + FONT_SCALE_STEP));
  const decreaseFontScale = () => setFontScale(current => clampFontScale(current - FONT_SCALE_STEP));

  useEffect(() => {
    persist(STORAGE_KEYS.pinnedForms, pinnedFormsByUser);
  }, [pinnedFormsByUser]);

  useEffect(() => {
    if (currentUser) {
      setShowLogin(false);
    }
  }, [currentUser]);

  const invalidateSession = ({ promptLogin = false } = {}) => {
    setSession(null);
    setAuthToken(null);
    persist(STORAGE_KEYS.session, null);
    setActiveFormId(null);
    setEditingFormId(null);
    setDraftForm(null);
    setShowSettings(false);
    setScreen("list");
    setShowLogin(promptLogin && !publicForm);
  };

  useEffect(() => {
    const syncPublicSlug = () => setPublicSlug(getPublicSlugFromLocation());
    window.addEventListener("hashchange", syncPublicSlug);
    window.addEventListener("popstate", syncPublicSlug);
    return () => {
      window.removeEventListener("hashchange", syncPublicSlug);
      window.removeEventListener("popstate", syncPublicSlug);
    };
  }, []);

  useEffect(() => {
    if (error) return undefined;
    const targetForm = publicForm || (screen === "results" ? activeForm : null);
    if (!targetForm || (publicForm && isFormClosedForPublic(publicForm))) return undefined;

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
          invalidateSession({ promptLogin: true });
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
    await refreshBootstrap({ silent: true, rethrow: true });
    setDraftForm(null);
    setEditingFormId(response.form.id);
    setActiveFormId(response.form.id);
    return response.form;
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

  const nav = canCreateForms(currentUser)
    ? [
        { key: "dashboard", icon: "chart", label: "Dashboard" },
        { key: "list", icon: "list", label: "Formulários" },
        { key: "create", icon: "plus", label: "Novo" },
      ]
    : [];

  const backToPanel = () => {
    if (window.location.pathname.startsWith("/f/")) {
      window.history.pushState(null, "", "/");
    }
    window.location.hash = "";
    setPublicSlug(null);
    setScreen("list");
  };

  const loginModal = showLogin && !currentUser && (
    <div className="modal-backdrop login-backdrop" onClick={() => setShowLogin(false)}>
      <div className="modal-card login-modal-card" onClick={event => event.stopPropagation()} style={{ width: "min(520px, 100%)" }}>
        <div className="login-modal-header" style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22 }}>Entrar</h2>
            <p style={{ margin: "6px 0 0", color: "var(--text-secondary)", lineHeight: 1.45 }}>
              Acesse com sua conta para liberar as opcoes do cabecalho.
            </p>
          </div>
          <Btn v="ghost" sz="sm" onClick={() => setShowLogin(false)}>
            Fechar
          </Btn>
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
          onOpenSettings={() => setShowSettings(true)}
          variant="sheet"
        />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="app-root" style={{ minHeight: "100vh", background: COLORS.surfaceAlt, color: COLORS.text, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", border: `4px solid ${COLORS.borderLight}`, borderTopColor: COLORS.primary, margin: "0 auto 16px", animation: "spin 0.9s linear infinite" }} />
          <strong>Carregando aplicação...</strong>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-root" style={{ minHeight: "100vh", background: COLORS.surfaceAlt, color: COLORS.text, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ maxWidth: 460, background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 16, padding: 24 }}>
          <h2 style={{ marginTop: 0 }}>Erro ao iniciar</h2>
          <p style={{ color: COLORS.textSecondary }}>{error}</p>
          <Btn onClick={() => refreshBootstrap({ preserveSelection: false })}>Tentar novamente</Btn>
        </div>
      </div>
    );
  }

  const targetForm = publicForm || (screen === "results" ? activeForm : null);
  const waitingForTarget = Boolean(targetForm) && !(publicForm && isFormClosedForPublic(publicForm)) && (targetForm.type === "escala_organ" ? !hasLoadedEscala(targetForm.id) : !hasLoadedResponses(targetForm.id));
  if (waitingForTarget) {
    return (
      <div className="app-root" style={{ minHeight: "100vh", background: COLORS.surfaceAlt, color: COLORS.text, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", border: `4px solid ${COLORS.borderLight}`, borderTopColor: COLORS.primary, margin: "0 auto 16px", animation: "spin 0.9s linear infinite" }} />
          <strong>Carregando dados do formulario...</strong>
        </div>
      </div>
    );
  }

  if (publicForm) {
    const publicOnBack = currentUser ? backToPanel : null;
    return (
      <div className="app-root public-root" style={{ fontFamily: "'Segoe UI', -apple-system, sans-serif", minHeight: "100vh", background: COLORS.surfaceAlt, color: COLORS.text, padding: "24px 16px" }}>
        {isFormClosedForPublic(publicForm)
          ? <ClosedPublicScreen form={publicForm} onBack={publicOnBack} />
          : publicForm.type === "escala_organ"
            ? <PublicEscalaScreen form={publicForm} onBack={publicOnBack} people={people} sections={escalaByForm[publicForm.id] || []} onSaveSections={sections => handleSaveEscala(publicForm.id, sections)} onClaimSlot={(sectionIndex, slotIndex, person) => handleClaimEscalaSlot(publicForm.id, sectionIndex, slotIndex, person)} />
            : <PublicFormScreen form={publicForm} responses={responsesByForm[publicForm.id] || []} onSaveResponse={handleSaveResponse} onBack={publicOnBack} people={people} />}
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="app-root" style={{ minHeight: "100vh", background: COLORS.surfaceAlt, color: COLORS.text, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ width: "min(480px, 100%)", background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 18, padding: 28, boxShadow: "var(--shadow-md)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: COLORS.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.primary, fontWeight: 800 }}>NF</div>
            <div>
              <h2 style={{ margin: 0, fontSize: 20 }}>Acesso restrito</h2>
              <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 13 }}>Entre com sua conta para acessar a pagina inicial e os formularios internos.</p>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Btn onClick={() => setShowLogin(true)}>Entrar</Btn>
          </div>
        </div>
        {loginModal}
      </div>
    );
  }

  return (
    <div className="app-root" style={{ fontFamily: "'Segoe UI', -apple-system, sans-serif", minHeight: "100vh", background: COLORS.surfaceAlt, color: COLORS.text }}>
      <header className="app-header" style={{ background: COLORS.primary, padding: "12px 24px", display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: 18, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#fff" }}>NF</div>
          <span title={`Dados base JSON v${appData.version}`} style={{ fontWeight: 700, fontSize: 16, color: "#fff", letterSpacing: 0 }}>NSJB Forms</span>
        </div>
        <nav className="app-nav" style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
          {nav.map(n => (
            <button
              key={n.key}
              onClick={() => navigate(n.key)}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                border: "none", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                background: screen === n.key ? "rgba(255,255,255,0.2)" : "transparent",
                color: screen === n.key ? "#fff" : "rgba(255,255,255,0.7)",
              }}
            ><Icon name={n.icon} size={14} />{n.label}</button>
          ))}
        </nav>
        {currentUser ? (
          <AuthPanel
            user={currentUser}
            onLogin={login}
            onLogout={logout}
            theme={theme}
            fontScale={fontScale}
            onIncreaseTextSize={increaseFontScale}
            onDecreaseTextSize={decreaseFontScale}
            onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
            onOpenSettings={() => setShowSettings(true)}
          />
        ) : (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, alignItems: "center" }}>
            <Btn
              v="ghost"
              sz="sm"
              onClick={decreaseFontScale}
              title="Diminuir fonte"
              aria-label="Diminuir fonte"
              disabled={fontScale <= FONT_SCALE_MIN}
              style={{ border: "1px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.08)", color: "#fff", minHeight: 38, padding: "8px 10px", fontWeight: 800 }}
            >
              A-
            </Btn>
            <Btn
              v="ghost"
              sz="sm"
              onClick={increaseFontScale}
              title="Aumentar fonte"
              aria-label="Aumentar fonte"
              disabled={fontScale >= FONT_SCALE_MAX}
              style={{ border: "1px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.08)", color: "#fff", minHeight: 38, padding: "8px 10px", fontWeight: 800 }}
            >
              A+
            </Btn>
            <Btn
              v="ghost"
              sz="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title={theme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
              style={{ border: "1px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.08)", color: "#fff", minHeight: 38, padding: "8px 10px" }}
            >
              <HeaderThemeIcon theme={theme} />
            </Btn>
            <Btn
              v="ghost"
              sz="sm"
              onClick={() => setShowLogin(true)}
              style={{ border: "1px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.08)", color: "#fff", minHeight: 38, paddingInline: 14 }}
            >
              Entrar
            </Btn>
          </div>
        )}
      </header>
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
        {screen === "list" && <FormListScreen onNavigate={navigate} onDuplicateForm={handleDuplicateForm} onArchiveForm={handleArchiveForm} onTogglePinnedForm={handleTogglePinnedForm} pinnedFormIds={pinnedFormIds} user={currentUser} labels={labels} forms={forms} onDeleteForm={handleDeleteForm} formDeleteKeyConfigured={formDeleteKeyConfigured} />}
        {screen === "create" && <CreateFormScreen onNavigate={navigate} people={people} membersConfig={membersConfig} labels={labels} presets={presets} fieldCatalog={fieldCatalog} scaleTaskCatalog={scaleTaskCatalog} onSavePreset={handleSavePreset} onSaveForm={handleSaveForm} form={editingForm} isDuplicateMode={Boolean(draftForm)} />}
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
      </main>
      {loginModal}
      {showSettings && canCreateForms(currentUser) && (
        <AdminSettingsModal
          users={users}
          labels={labels}
          presets={presets}
          fieldCatalog={fieldCatalog}
          scaleTaskCatalog={scaleTaskCatalog}
          membersConfig={membersConfig}
          people={people}
          currentUser={currentUser}
          onSaveUser={handleSaveUser}
          onDeleteUser={handleDeleteUser}
          onSaveLabel={handleSaveLabel}
          onDeleteLabel={handleDeleteLabel}
          onSavePreset={handleSavePreset}
          onDeletePreset={handleDeletePreset}
          onSaveMembersConfig={handleSaveMembersConfig}
          onSavePeople={handleSavePeople}
          onSaveFieldCatalogItem={handleSaveFieldCatalogItem}
          onDeleteFieldCatalogItem={handleDeleteFieldCatalogItem}
          onSaveScaleTaskCatalogItem={handleSaveScaleTaskCatalogItem}
          onDeleteScaleTaskCatalogItem={handleDeleteScaleTaskCatalogItem}
          formDeleteKeyConfigured={formDeleteKeyConfigured}
          onSaveFormDeleteKey={handleSaveFormDeleteKey}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
