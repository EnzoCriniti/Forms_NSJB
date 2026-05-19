/**
 * @file frontend/src/lib/appBootstrap.js
 * @summary Helpers puros do bootstrap principal do frontend.
 * @responsibility Normalizar dados iniciais e decidir selecao padrao de formularios.
 */

export const createEmptyBootstrap = () => ({
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
  messageTemplates: [],
  personPresets: [],
  messagingConfig: { whatsappGroupName: "", autoDispatchEnabled: true, publicBaseUrl: "" },
});

export const normalizeBootstrap = bootstrap => ({
  ...createEmptyBootstrap(),
  ...(bootstrap || {}),
});

export const replaceBootstrapList = (bootstrap, key, list) => ({
  ...bootstrap,
  [key]: list,
});

export const replaceBootstrapListFromResult = (bootstrap, key, result, resultKey = key) => replaceBootstrapList(
  bootstrap,
  key,
  result?.[resultKey],
);

export const upsertBootstrapListItem = (bootstrap, key, item, { matchKey = "id", prepend = false } = {}) => {
  const list = Array.isArray(bootstrap?.[key]) ? bootstrap[key] : [];
  const index = list.findIndex(current => String(current?.[matchKey]) === String(item?.[matchKey]));
  let next;
  if (index >= 0) {
    next = list.map((current, currentIndex) => currentIndex === index ? item : current);
  } else if (prepend) {
    next = [item, ...list];
  } else {
    next = [...list, item];
  }
  return replaceBootstrapList(bootstrap, key, next);
};

export const removeBootstrapListItem = (bootstrap, key, predicate) => {
  const list = Array.isArray(bootstrap?.[key]) ? bootstrap[key] : [];
  return replaceBootstrapList(bootstrap, key, list.filter(item => !predicate(item)));
};

export const upsertNestedBootstrapItem = (bootstrap, key, parentPredicate, childKey, item, { prepend = false } = {}) => {
  const list = Array.isArray(bootstrap?.[key]) ? bootstrap[key] : [];
  return replaceBootstrapList(bootstrap, key, list.map(parent => {
    if (!parentPredicate(parent)) return parent;
    const currentChildren = Array.isArray(parent?.[childKey]) ? parent[childKey] : [];
    const index = currentChildren.findIndex(current => String(current?.id) === String(item?.id));
    const nextChildren = index >= 0
      ? currentChildren.map((current, currentIndex) => currentIndex === index ? item : current)
      : prepend
        ? [item, ...currentChildren]
        : [...currentChildren, item];
    return { ...parent, [childKey]: nextChildren };
  }));
};

export const removeNestedBootstrapItem = (bootstrap, key, parentPredicate, childKey, childPredicate) => {
  const list = Array.isArray(bootstrap?.[key]) ? bootstrap[key] : [];
  return replaceBootstrapList(bootstrap, key, list.map(parent => {
    if (!parentPredicate(parent)) return parent;
    const currentChildren = Array.isArray(parent?.[childKey]) ? parent[childKey] : [];
    return { ...parent, [childKey]: currentChildren.filter(item => !childPredicate(item)) };
  }));
};

export const sortBootstrapEventsByDateDesc = events => [...(Array.isArray(events) ? events : [])].sort(
  (left, right) => String(right?.date || "").localeCompare(String(left?.date || "")) || Number(right?.id || 0) - Number(left?.id || 0),
);

export const updateBootstrapFormMetrics = (bootstrap, formId, metrics) => replaceBootstrapList(
  bootstrap,
  "forms",
  (Array.isArray(bootstrap?.forms) ? bootstrap.forms : []).map(form => (
    form.id === formId
      ? { ...form, metrics: { ...(form.metrics || {}), ...metrics } }
      : form
  )),
);

export const buildEscalaMetrics = sections => {
  const safeSections = Array.isArray(sections) ? sections : [];
  const total = safeSections.reduce((sum, section) => sum + (Array.isArray(section?.slots) ? section.slots.length : 0), 0);
  const filled = safeSections.reduce((sum, section) => {
    const slots = Array.isArray(section?.slots) ? section.slots : [];
    return sum + slots.filter(slot => slot?.person).length;
  }, 0);
  return { responses: filled, total, filled, pending: total - filled };
};

export const removeFormIdFromEvents = (bootstrap, formId) => replaceBootstrapList(
  bootstrap,
  "events",
  (Array.isArray(bootstrap?.events) ? bootstrap.events : []).map(event => ({
    ...event,
    formIds: (Array.isArray(event?.formIds) ? event.formIds : []).filter(id => id !== formId),
  })),
);

export const removePinnedIdForUser = (pinnedByUser, userId, id) => {
  if (!userId) return pinnedByUser;
  const userKey = String(userId);
  const current = Array.isArray(pinnedByUser?.[userKey]) ? pinnedByUser[userKey] : [];
  return { ...pinnedByUser, [userKey]: current.filter(item => item !== id) };
};

export const togglePinnedIdForUser = (pinnedByUser, userId, id) => {
  if (!userId || !id) return pinnedByUser;
  const userKey = String(userId);
  const current = Array.isArray(pinnedByUser?.[userKey]) ? pinnedByUser[userKey] : [];
  const next = current.includes(id)
    ? current.filter(item => item !== id)
    : [id, ...current];
  return { ...pinnedByUser, [userKey]: next };
};

export const pickActiveFormIdAfterBootstrap = ({
  currentFormId,
  currentUser,
  forms,
  visibleForms = [],
  preserveSelection = true,
}) => {
  const nextForms = Array.isArray(forms) ? forms : [];
  const nextVisibleForms = Array.isArray(visibleForms) ? visibleForms : [];

  if (!preserveSelection) {
    return nextVisibleForms[0]?.id || null;
  }

  if (currentFormId && !nextForms.some(form => form.id === currentFormId)) {
    return nextForms[0]?.id || null;
  }

  if (!currentFormId) {
    return nextVisibleForms[0]?.id || null;
  }

  if (!currentUser?.id && nextForms.length === 0) {
    return null;
  }

  return currentFormId;
};
