/**
 * @file backend/repositories/sessionsRepository.mjs
 * @summary Acesso a sessoes autenticadas.
 * @responsibility Criar, localizar e revogar tokens opacos persistidos em SQLite.
 */

import { nowIso } from "../database/shared.mjs";
import { database } from "../database/index.mjs";

export const createAuthSessionRecord = async ({ userId, tokenHash, expiresAt }) => {
  const now = nowIso();
  await database.execute(`
    INSERT INTO auth_sessions (user_id, token_hash, created_at, expires_at, revoked_at, last_used_at)
    VALUES (?, ?, ?, ?, NULL, ?)
  `, [userId, tokenHash, now, expiresAt, now]);
  return findAuthSessionByTokenHash(tokenHash);
};

export const revokeAuthSessionsByUserId = async (userId, exceptTokenHash = null) => {
  if (!userId) return;
  if (exceptTokenHash) {
    await database.execute(`
      UPDATE auth_sessions
      SET revoked_at = ?
      WHERE user_id = ? AND token_hash <> ? AND revoked_at IS NULL
    `, [nowIso(), userId, exceptTokenHash]);
    return;
  }
  await database.execute(`
    UPDATE auth_sessions
    SET revoked_at = ?
    WHERE user_id = ? AND revoked_at IS NULL
  `, [nowIso(), userId]);
};

export const revokeAuthSessionsByRole = async role => {
  if (!role) return;
  await database.execute(`
    UPDATE auth_sessions
    SET revoked_at = ?
    WHERE revoked_at IS NULL
      AND user_id IN (
        SELECT id
        FROM users
        WHERE role = ?
      )
  `, [nowIso(), role]);
};

export const findActiveAuthSessionByRole = async (role, now, minLastUsedAt) => {
  if (!role) return null;
  return database.queryOne(`
    SELECT
      s.id AS session_id,
      s.user_id,
      s.token_hash,
      s.created_at,
      s.expires_at,
      s.revoked_at,
      s.last_used_at,
      u.id AS id,
      u.name,
      u.username,
      u.role
    FROM auth_sessions s
    INNER JOIN users u ON u.id = s.user_id
    WHERE u.role = ?
      AND s.revoked_at IS NULL
      AND s.expires_at > ?
      AND s.last_used_at >= ?
    ORDER BY s.last_used_at DESC, s.id DESC
    LIMIT 1
  `, [role, now, minLastUsedAt]);
};

export const findAuthSessionByTokenHash = async tokenHash => database.queryOne(`
  SELECT
    s.id AS session_id,
    s.user_id,
    s.token_hash,
    s.created_at,
    s.expires_at,
    s.revoked_at,
    s.last_used_at,
    u.id AS id,
    u.name,
    u.username,
    u.password,
    u.password_hash,
    u.password_salt,
    u.password_algorithm,
    u.password_migrated_at,
    u.role
  FROM auth_sessions s
  INNER JOIN users u ON u.id = s.user_id
  WHERE s.token_hash = ?
  LIMIT 1
`, [tokenHash]);

export const touchAuthSessionRecord = async tokenHash => {
  await database.execute("UPDATE auth_sessions SET last_used_at = ? WHERE token_hash = ? AND revoked_at IS NULL", [nowIso(), tokenHash]);
};

export const revokeAuthSessionRecord = async tokenHash => {
  await database.execute("UPDATE auth_sessions SET revoked_at = ? WHERE token_hash = ? AND revoked_at IS NULL", [nowIso(), tokenHash]);
};
