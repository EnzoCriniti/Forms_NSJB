/**
 * @file frontend/src/lib/appSession.js
 * @summary Normalizacao dos dados de sessao mantidos pelo frontend.
 */

export const sanitizeUser = user => user ? {
  id: user.id,
  name: user.name,
  username: user.username,
  role: user.role,
} : null;

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
