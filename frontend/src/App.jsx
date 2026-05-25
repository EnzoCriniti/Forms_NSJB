/**
 * @file frontend/src/App.jsx
 * @summary Orquestrador principal do frontend.
 * @responsibility Carregar bootstrap, manter sessao/tema e conectar telas com a API.
 */

import React, { useMemo, useState } from "react";
import { canCreateForms, visibleFormsFor } from "./lib/auth";
import { createEmptyBootstrap, normalizeBootstrap, pickActiveFormIdAfterBootstrap } from "./lib/appBootstrap";
import { AppViewport } from "./AppViewport";
import { isFormClosedForPublic } from "./lib/forms";
import { removeFormDetail, upsertFormDetail } from "./lib/appDataLoad";
import { buildAppDataHandlers } from "./lib/appDataHandlers";
import { applyExternalPreferenceChange, applyFontScalePreference, applyThemePreference, loadInitialFontScale, loadInitialPinnedEventsByUser, loadInitialPinnedFormsByUser, loadInitialSession, loadInitialTheme, persistPinnedEventsByUser, persistPinnedFormsByUser, persistSession } from "./lib/appPreferences";
import { getPublicRouteFromLocation } from "./lib/appPublicRoutes";
import { buildAppShellDerivedState } from "./lib/appShellDerivedState";
import { resolveAppDetailLoadRequest } from "./lib/appDetailTarget";
import { useAppLifecycleEffects } from "./lib/appLifecycleEffects";
import { buildAppHandlerGroups } from "./lib/appHandlerGroups";
import { buildAppShell, buildAppShellData, buildAppShellState } from "./lib/appShellBuilder";
import { buildAppViewportProps } from "./lib/appViewportProps";

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

  const {
    adminHandlers,
    eventHandlers,
    formHandlers,
    sessionHandlers,
  } = buildAppHandlerGroups({
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
  const {
    invalidateSession,
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
    setFontScale,
    setPublicRoute,
    setScreen,
    setSession,
    setTheme,
    theme,
  });

  const shellApp = buildAppShell({
    adminHandlers,
    canCreateForms,
    currentUser,
    data: buildAppShellData({
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
    }),
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
    state: buildAppShellState({
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
    }),
    theme,
  });

  return (
    <AppViewport {...buildAppViewportProps({
      app: shellApp,
      error,
      fontScale,
      loading,
      refreshBootstrap,
      sessionHandlers,
      setPublicRoute,
      setScreen,
      setTheme,
      theme,
    })}
    />
  );
}

