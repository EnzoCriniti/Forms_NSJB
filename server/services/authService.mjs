/**
 * @file server/services/authService.mjs
 * @summary Regras de autenticacao local.
 * @responsibility Validar login, emitir token opaco e resolver sessao autenticada.
 */

import { nowIso } from "../db.mjs";
import { findUserByUsername, setUserPasswordSecret } from "../repositories/usersRepository.mjs";
import {
  createAuthSessionRecord,
  findActiveAuthSessionByRole,
  findAuthSessionByTokenHash,
  revokeAuthSessionRecord,
  revokeAuthSessionsByUserId,
  touchAuthSessionRecord,
} from "../repositories/sessionsRepository.mjs";
import {
  createPasswordRecord,
  generateOpaqueToken,
  hashOpaqueToken,
  verifyPassword,
} from "../core/auth.mjs";

const SESSION_TTL_DAYS = 7;
const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
const SESSION_IDLE_TIMEOUT_MINUTES = 30;
const SESSION_IDLE_TIMEOUT_MS = SESSION_IDLE_TIMEOUT_MINUTES * 60 * 1000;

const makeError = (message, statusCode, code) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

const safeUser = user => user ? {
  id: user.id,
  name: user.name,
  username: user.username,
  role: user.role,
} : null;

const isSessionExpired = session => {
  if (!session) return true;
  if (session.expires_at && new Date(session.expires_at).getTime() <= Date.now()) return true;
  if (session.last_used_at && new Date(session.last_used_at).getTime() <= Date.now() - SESSION_IDLE_TIMEOUT_MS) return true;
  return false;
};

const migrateLegacyPassword = (user, password) => {
  if (user.password_hash && user.password_salt) return;
  const secret = createPasswordRecord(password);
  setUserPasswordSecret(user.id, {
    passwordHash: secret.hash,
    passwordSalt: secret.salt,
    passwordAlgorithm: secret.algorithm,
    passwordIterations: secret.iterations,
    passwordMigratedAt: nowIso(),
  });
};

export const loginWithCredentials = ({ username, password }) => {
  const login = String(username || "").trim();
  const secret = String(password || "");

  if (!login || !secret) {
    throw makeError("Usuario e senha sao obrigatorios.", 400, "AUTH_INVALID_PAYLOAD");
  }

  const user = findUserByUsername(login);
  if (!user) {
    throw makeError("Usuario ou senha invalidos.", 401, "AUTH_INVALID_CREDENTIALS");
  }

  const passwordMatches = user.password_hash && user.password_salt
    ? verifyPassword(secret, {
      hash: user.password_hash,
      salt: user.password_salt,
      iterations: user.password_iterations,
    })
    : String(user.password || "") === secret;

  if (!passwordMatches) {
    throw makeError("Usuario ou senha invalidos.", 401, "AUTH_INVALID_CREDENTIALS");
  }

  if (!user.password_hash || !user.password_salt) {
    migrateLegacyPassword(user, secret);
  }

  if (user.role === "admin") {
    const now = new Date().toISOString();
    const minLastUsedAt = new Date(Date.now() - SESSION_IDLE_TIMEOUT_MS).toISOString();
    const activeAdminSession = findActiveAuthSessionByRole("admin", now, minLastUsedAt);
    if (activeAdminSession) {
      throw makeError("Ja existe um administrador conectado em outro dispositivo. Aguarde o logout ou o timeout de inatividade.", 409, "AUTH_ADMIN_SESSION_ACTIVE");
    }
  } else {
    revokeAuthSessionsByUserId(user.id);
  }
  const token = generateOpaqueToken();
  const tokenHash = hashOpaqueToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  createAuthSessionRecord({ userId: user.id, tokenHash, expiresAt });

  return {
    token,
    expiresAt,
    user: safeUser(user),
  };
};

export const getAuthenticatedUserFromToken = token => {
  if (!token) return null;
  const tokenHash = hashOpaqueToken(token);
  const session = findAuthSessionByTokenHash(tokenHash);
  if (!session) return null;
  if (session.revoked_at) return null;
  if (isSessionExpired(session)) {
    revokeAuthSessionRecord(tokenHash);
    return null;
  }
  touchAuthSessionRecord(tokenHash);
  return {
    sessionId: session.session_id,
    tokenHash,
    user: safeUser(session),
    expiresAt: session.expires_at,
  };
};

export const logoutByToken = token => {
  if (!token) return false;
  revokeAuthSessionRecord(hashOpaqueToken(token));
  return true;
};

export const extractBearerToken = headers => {
  const value = headers?.authorization || headers?.Authorization;
  if (!value || typeof value !== "string") return null;
  const match = value.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
};
