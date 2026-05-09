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

export const clampFontScale = value => Math.min(FONT_SCALE_MAX, Math.max(FONT_SCALE_MIN, Number(value.toFixed(2))));

export const PUBLIC_FORM_PATH_PREFIX = "/formularios/";
export const LEGACY_PUBLIC_FORM_PATH_PREFIX = "/f/";

export const buildPublicFormPath = slug => {
  if (!slug) return "";
  return `#${PUBLIC_FORM_PATH_PREFIX}${encodeURIComponent(slug)}`;
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
  if (window.location.hash.startsWith(`#${PUBLIC_FORM_PATH_PREFIX}`)) {
    return decodePublicSlug(window.location.hash.replace(`#${PUBLIC_FORM_PATH_PREFIX}`, ""));
  }
  if (window.location.hash.startsWith(`#${LEGACY_PUBLIC_FORM_PATH_PREFIX}`)) {
    return decodePublicSlug(window.location.hash.replace(`#${LEGACY_PUBLIC_FORM_PATH_PREFIX}`, ""));
  }
  if (window.location.pathname.startsWith(PUBLIC_FORM_PATH_PREFIX)) {
    return decodePublicSlug(window.location.pathname.replace(PUBLIC_FORM_PATH_PREFIX, ""));
  }
  if (window.location.pathname.startsWith(LEGACY_PUBLIC_FORM_PATH_PREFIX)) {
    return decodePublicSlug(window.location.pathname.replace(LEGACY_PUBLIC_FORM_PATH_PREFIX, ""));
  }
  return null;
};
