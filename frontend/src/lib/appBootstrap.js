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
