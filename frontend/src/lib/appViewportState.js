/**
 * @file frontend/src/lib/appViewportState.js
 * @summary Decisao pura do modo visual do AppViewport.
 */

import { resolveAppViewportTargetState } from "./appDetailTarget";

export const APP_VIEWPORT_MODES = {
  detailLoading: "detailLoading",
  error: "error",
  loading: "loading",
  login: "login",
  public: "public",
  shell: "shell",
};

export const resolveAppViewportMode = ({
  activeForm,
  currentUser,
  error,
  escalaByForm,
  loading,
  publicForm,
  publicResultsView,
  responsesByForm,
  screen,
}) => {
  if (loading) return APP_VIEWPORT_MODES.loading;
  if (error) return APP_VIEWPORT_MODES.error;

  const { waitingForTarget } = resolveAppViewportTargetState({
    publicForm,
    publicResultsView,
    screen,
    activeForm,
    responsesByForm,
    escalaByForm,
  });
  if (waitingForTarget) return APP_VIEWPORT_MODES.detailLoading;
  if (publicForm) return APP_VIEWPORT_MODES.public;
  if (!currentUser) return APP_VIEWPORT_MODES.login;
  return APP_VIEWPORT_MODES.shell;
};
