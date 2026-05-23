/**
 * @file frontend/src/lib/appPublicRoutes.js
 * @summary Builders e parser das rotas publicas do app.
 */

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
