/**
 * @file backend/repositories/usersRepository.mjs
 * @summary Acesso a dados de usuarios.
 * @responsibility Ler, gravar e remover usuarios administrativos e viewers.
 */

import { nowIso } from "../database/shared.mjs";
import { database } from "../database/index.mjs";
import { createPasswordRecord } from "../core/auth.mjs";

export const listUsers = async () => (await database.queryMany(`
  SELECT id, name, username, role, layer_id
  FROM users
  ORDER BY lower(name) ASC, id ASC
`));

const USER_WITH_LAYER = `
  SELECT u.id, u.name, u.username, u.password, u.password_hash, u.password_salt, u.password_algorithm,
         u.password_iterations, u.password_migrated_at, u.role, u.layer_id,
         al.name AS layer_name, al.permissions_json AS layer_permissions
  FROM users u
  LEFT JOIN access_layers al ON al.id = u.layer_id
`;

export const findUserByUsername = async username => database.queryOne(
  `${USER_WITH_LAYER} WHERE lower(u.username) = lower(?) LIMIT 1`,
  [username],
);

export const findUserById = async id => database.queryOne(
  `${USER_WITH_LAYER} WHERE u.id = ? LIMIT 1`,
  [id],
);

export const findConflictingUserByUsername = async (username, id) => {
  if (id) return database.queryOne("SELECT id FROM users WHERE lower(username) = lower(?) AND id != ?", [username, id]);
  return database.queryOne("SELECT id FROM users WHERE lower(username) = lower(?)", [username]);
};

export const upsertUserRecord = async ({ id, name, username, password, role, layerId, passwordHash, passwordSalt, passwordAlgorithm, passwordIterations, passwordMigratedAt }) => {
  const now = nowIso();
  const secret = password ? createPasswordRecord(password) : null;
  const nextPasswordHash = passwordHash || secret?.hash || null;
  const nextPasswordSalt = passwordSalt || secret?.salt || null;
  const nextPasswordAlgorithm = passwordAlgorithm || secret?.algorithm || null;
  const nextPasswordIterations = passwordIterations || secret?.iterations || null;
  const nextPasswordMigratedAt = passwordMigratedAt || null;

  if (id) {
    if (password || passwordHash) {
      await database.execute(`
        UPDATE users
        SET name = ?, username = ?, password = ?, password_hash = ?, password_salt = ?, password_algorithm = ?, password_iterations = ?, password_migrated_at = ?, role = ?, layer_id = ?, updated_at = ?
        WHERE id = ?
      `, [name, username, password || "", nextPasswordHash, nextPasswordSalt, nextPasswordAlgorithm, nextPasswordIterations, nextPasswordMigratedAt, role, layerId ?? null, now, id]);
    } else {
      await database.execute("UPDATE users SET name = ?, username = ?, role = ?, layer_id = ?, updated_at = ? WHERE id = ?", [name, username, role, layerId ?? null, now, id]);
    }
    return;
  }

  await database.execute(`
    INSERT INTO users (
      name, username, password, password_hash, password_salt, password_algorithm, password_iterations, password_migrated_at, role, layer_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING id
  `, [name, username, password || "", nextPasswordHash, nextPasswordSalt, nextPasswordAlgorithm, nextPasswordIterations, nextPasswordMigratedAt, role, layerId ?? null, now, now]);
};

export const setUserPasswordSecret = async (id, { passwordHash, passwordSalt, passwordAlgorithm, passwordIterations, passwordMigratedAt }) => {
  await database.execute(`
    UPDATE users
    SET password_hash = ?, password_salt = ?, password_algorithm = ?, password_iterations = ?, password_migrated_at = ?, updated_at = ?
    WHERE id = ?
  `, [passwordHash, passwordSalt, passwordAlgorithm, passwordIterations, passwordMigratedAt, nowIso(), id]);
};

export const deleteUserRecord = async id => {
  await database.execute("DELETE FROM users WHERE id = ?", [id]);
};
