/**
 * @file frontend/src/lib/appBootstrapLists.js
 * @summary Mutacoes puras das listas do bootstrap do app.
 */

export const replaceBootstrapList = (bootstrap, key, list) => ({
  ...bootstrap,
  [key]: list,
});

export const replaceBootstrapListFromResult = (bootstrap, key, result, resultKey = key) => (
  Array.isArray(result?.[resultKey])
    ? replaceBootstrapList(bootstrap, key, result[resultKey])
    : bootstrap
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

export const removeFormIdFromEvents = (bootstrap, formId) => replaceBootstrapList(
  bootstrap,
  "events",
  (Array.isArray(bootstrap?.events) ? bootstrap.events : []).map(event => ({
    ...event,
    formIds: (Array.isArray(event?.formIds) ? event.formIds : []).filter(id => id !== formId),
  })),
);
