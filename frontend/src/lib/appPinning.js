/**
 * @file frontend/src/lib/appPinning.js
 * @summary Helpers puros para itens fixados por usuario.
 */

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
