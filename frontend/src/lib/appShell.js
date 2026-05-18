/**
 * @file frontend/src/lib/appShell.js
 * @summary Helpers puros do shell principal do frontend.
 * @responsibility Guardar funcoes de sessao, fontes e rascunhos que nao pertencem a tela.
 */

export const FONT_SCALE_MIN = 0.9;
export const FONT_SCALE_MAX = 1.3;
export const FONT_SCALE_STEP = 0.1;

export const sanitizeUser = user => user ? {
  id: user.id,
  name: user.name,
  username: user.username,
  role: user.role,
} : null;

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

export const clampFontScale = value => Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, Number(value.toFixed(2))));

export const PUBLIC_FORM_PATH_PREFIX = "/formularios/";
export const PUBLIC_EVENT_PATH_PREFIX = "/eventos/";

const encodePublicRouteSegment = value => encodeURIComponent(String(value || "").trim());

export const buildPublicFormPath = formOrId => {
  const id = typeof formOrId === "object" ? formOrId?.id : formOrId;
  if (!id) return "";
  return `#${PUBLIC_FORM_PATH_PREFIX}${encodePublicRouteSegment(id)}`;
};

export const buildPublicFormResultsPath = formOrId => {
  const id = typeof formOrId === "object" ? formOrId?.id : formOrId;
  if (!id) return "";
  return `#${PUBLIC_FORM_PATH_PREFIX}${encodePublicRouteSegment(id)}/resultados`;
};

export const buildPublicEventFormPath = (event, formOrId) => {
  const eventId = typeof event === "object" ? event?.id : event;
  const formId = typeof formOrId === "object" ? formOrId?.id : formOrId;
  if (!eventId || !formId) return "";
  return `#${PUBLIC_EVENT_PATH_PREFIX}${encodePublicRouteSegment(eventId)}/${encodePublicRouteSegment(formId)}`;
};

export const normalizeStoredSession = stored => {
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

export const getPublicSlugFromLocation = () => {
  return getPublicRouteFromLocation()?.identifier || null;
};

export const getPublicRouteFromLocation = () => {
  const eventHashPath = window.location.hash.startsWith(`#${PUBLIC_EVENT_PATH_PREFIX}`)
    ? window.location.hash.replace("#", "")
    : "";
  const eventPathname = window.location.pathname.startsWith(PUBLIC_EVENT_PATH_PREFIX)
    ? window.location.pathname
    : "";
  const rawEventPath = eventHashPath || eventPathname;
  if (rawEventPath.startsWith(PUBLIC_EVENT_PATH_PREFIX)) {
    const [, eventIdentifier, formIdentifier, viewPart] = rawEventPath.match(/^\/eventos\/([^/]+)\/([^/]+)(?:\/([^/]+))?/) || [];
    const identifier = decodePublicSlug(formIdentifier);
    if (!identifier) return null;
    return {
      identifier,
      eventIdentifier: decodePublicSlug(eventIdentifier),
      view: viewPart === "resultados" ? "results" : "form",
      isLegacySlug: !/^\d+$/.test(identifier),
    };
  }

  const hashPath = window.location.hash.startsWith(`#${PUBLIC_FORM_PATH_PREFIX}`)
    ? window.location.hash.replace("#", "")
    : "";
  const pathname = window.location.pathname.startsWith(PUBLIC_FORM_PATH_PREFIX)
    ? window.location.pathname
    : "";
  const rawPath = hashPath || pathname;
  if (!rawPath.startsWith(PUBLIC_FORM_PATH_PREFIX)) return null;

  const withoutPrefix = rawPath.replace(PUBLIC_FORM_PATH_PREFIX, "");
  const view = withoutPrefix.endsWith("/resultados") ? "results" : "form";
  const slugPart = view === "results" ? withoutPrefix.replace(/\/resultados$/, "") : withoutPrefix;
  const identifier = decodePublicSlug(slugPart);
  if (!identifier) return null;
  return {
    identifier,
    view,
    isLegacySlug: !/^\d+$/.test(identifier),
  };
};
