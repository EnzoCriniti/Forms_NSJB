/**
 * @file frontend/src/lib/appDetailTarget.js
 * @summary Decisao pura de carregamento dos dados de detalhe do app.
 */

import { isFormClosedForPublic } from "./forms";

export const resolveAppViewportTargetState = ({
  publicForm = null,
  publicResultsView = false,
  screen = "",
  activeForm = null,
  responsesByForm = {},
  escalaByForm = {},
}) => {
  const targetForm = publicForm || (["respond", "results"].includes(screen) ? activeForm : null);
  const skipClosedPublicFormLoad = publicForm?.type !== "escala_organ" && isFormClosedForPublic(publicForm) && !publicResultsView;
  const hasTargetData = targetForm?.type === "escala_organ"
    ? Object.prototype.hasOwnProperty.call(escalaByForm, targetForm.id)
    : Object.prototype.hasOwnProperty.call(responsesByForm, targetForm?.id);

  return {
    targetForm,
    waitingForTarget: Boolean(targetForm) && !skipClosedPublicFormLoad && !hasTargetData,
  };
};

export const resolveAppDetailLoadRequest = ({
  publicForm = null,
  publicResultsView = false,
  screen = "",
  activeForm = null,
  responsesByForm = {},
  escalaByForm = {},
  detailLoading = null,
}) => {
  const { targetForm, waitingForTarget } = resolveAppViewportTargetState({
    publicForm,
    publicResultsView,
    screen,
    activeForm,
    responsesByForm,
    escalaByForm,
  });

  if (!waitingForTarget) return null;
  const kind = targetForm.type === "escala_organ" ? "escala" : "responses";
  if (detailLoading?.kind === kind && detailLoading.formId === targetForm.id) {
    return null;
  }
  return { kind, formId: targetForm.id };
};
