/**
 * @file frontend/src/lib/appShell.js
 * @summary Helpers puros do shell principal do frontend.
 * @responsibility Guardar funcoes de sessao, fontes e rascunhos que nao pertencem a tela.
 */

import { isFormClosedForPublic } from "./forms";

export * from "./appPublicRoutes";
export * from "./appSession";

export const FONT_SCALE_MIN = 0.9;
export const FONT_SCALE_MAX = 1.3;
export const FONT_SCALE_STEP = 0.1;

export const cloneFormDraft = form => JSON.parse(JSON.stringify(form));

export const buildDuplicateFormDraft = form => {
  const copy = cloneFormDraft(form);
  return {
    ...copy,
    id: null,
    slug: "",
    status: "rascunho",
    title: copy.title ? `${copy.title} (Copia)` : "Formulario (Copia)",
  };
};

export const buildSaveFormPayloadFromExisting = (form, status = form?.status) => ({
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

export const resolveAppNavigation = ({
  nextScreen,
  form = null,
  activeForm = null,
  currentUser = null,
  canCreateForms,
  canViewForm,
}) => {
  const canCreate = canCreateForms(currentUser);
  if (["dashboard", "create", "settings"].includes(nextScreen) && !canCreate) {
    return { screen: "list", clearDraft: false };
  }

  if (nextScreen === "list" && currentUser) {
    return { screen: "events", clearDraft: false };
  }

  const targetForm = form || activeForm;
  if (nextScreen === "results" && targetForm && !canViewForm(currentUser, targetForm)) {
    return { screen: "list", clearDraft: false };
  }

  if (nextScreen === "create") {
    return {
      screen: nextScreen,
      clearDraft: true,
      editingFormId: form?.id || null,
      activeFormId: form?.id,
    };
  }

  return {
    screen: nextScreen,
    clearDraft: true,
    activeFormId: form?.id,
  };
};

export const getPinnedIdsForUser = (pinnedByUser, userId) => {
  if (!userId) return [];
  const value = pinnedByUser?.[String(userId)];
  return Array.isArray(value) ? value : [];
};

export const buildAppShellDerivedState = ({
  bootstrap,
  responseDetails = {},
  escalaDetails = {},
  currentUser,
  pinnedFormsByUser = {},
  pinnedEventsByUser = {},
  activeFormId = null,
  activeEventId = null,
  editingFormId = null,
  draftForm = null,
  publicRoute = null,
}) => {
  const forms = bootstrap?.forms || [];
  const events = bootstrap?.events || [];
  const responsesByForm = { ...(bootstrap?.responsesByForm || {}), ...responseDetails };
  const escalaByForm = { ...(bootstrap?.escalaByForm || {}), ...escalaDetails };
  const publicIdentifier = publicRoute?.identifier;
  const publicForm = publicIdentifier
    ? forms.find(form => String(form.id) === String(publicIdentifier) || form.slug === publicIdentifier) || null
    : null;

  return {
    forms,
    events,
    responsesByForm,
    escalaByForm,
    pinnedFormIds: getPinnedIdsForUser(pinnedFormsByUser, currentUser?.id),
    pinnedEventIds: getPinnedIdsForUser(pinnedEventsByUser, currentUser?.id),
    activeForm: forms.find(form => form.id === activeFormId) || null,
    activeEvent: events.find(event => event.id === activeEventId) || null,
    editingForm: draftForm || forms.find(form => form.id === editingFormId) || null,
    publicForm,
    publicResultsEnabled: publicForm?.type === "presenca" && publicForm?.resultsConfig?.publicResultsEnabled === true,
    publicResultsView: publicRoute?.view === "results",
  };
};

export const resolveAppViewportTargetState = ({
  publicForm = null,
  publicResultsView = false,
  screen = "",
  activeForm = null,
  responsesByForm = {},
  escalaByForm = {},
}) => {
  const targetForm = publicForm || (["respond", "results"].includes(screen) ? activeForm : null);
  const skipClosedPublicFormLoad = publicForm && isFormClosedForPublic(publicForm) && !publicResultsView;
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

export const clampFontScale = value => Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, Number(value.toFixed(2))));
