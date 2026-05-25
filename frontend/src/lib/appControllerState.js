/**
 * @file frontend/src/lib/appControllerState.js
 * @summary Estado global do controller do App agrupado por blocos.
 */

import { useState } from "react";
import { createEmptyBootstrap } from "./appBootstrap";
import { getPublicRouteFromLocation } from "./appPublicRoutes";
import { loadInitialFontScale, loadInitialPinnedEventsByUser, loadInitialPinnedFormsByUser, loadInitialSession, loadInitialTheme } from "./appPreferences";

export const useAppControllerState = () => {
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

  return {
    values: {
      activeEventId,
      activeFormId,
      activeMessageId,
      authToken,
      bootstrap,
      currentUser,
      detailLoading,
      draftForm,
      editingFormId,
      error,
      escalaDetails,
      fontScale,
      formDeleteKeyConfigured,
      loading,
      pinnedEventsByUser,
      pinnedFormsByUser,
      publicRoute,
      responseDetails,
      screen,
      session,
      theme,
    },
    setters: {
      setActiveEventId,
      setActiveFormId,
      setActiveMessageId,
      setBootstrap,
      setDetailLoading,
      setDraftForm,
      setEditingFormId,
      setError,
      setEscalaDetails,
      setFontScale,
      setFormDeleteKeyConfigured,
      setLoading,
      setPinnedEventsByUser,
      setPinnedFormsByUser,
      setPublicRoute,
      setResponseDetails,
      setScreen,
      setSession,
      setTheme,
    },
  };
};
