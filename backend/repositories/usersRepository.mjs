/**
 * @file backend/repositories/usersRepository.mjs
 * @summary Acesso a dados de usuarios.
 * @responsibility Ler, gravar e remover usuarios administrativos e viewers.
 */

import { nowIso } from "../database/shared.mjs";
import { database } from "../database/index.mjs";
import { createPasswordRecord } from "../core/auth.mjs";

export const listUsers = async () => (await database.queryMany(`
  SELECT id, name, username, role
  FROM users
  ORDER BY lower(name) ASC, id ASC
`));

export const findUserByUsername = async username => database.queryOne(`
  SELECT id, name, username, password, password_hash, password_salt, password_algorithm, password_iterations, password_migrated_at, role
  FROM users
  WHERE lower(username) = lower(?)
  LIMIT 1
`, [username]);

export const findUserById = async id => database.queryOne(`
  SELECT id, name, username, password, password_hash, password_salt, password_algorithm, password_iterations, password_migrated_at, role
  FROM users
  WHERE id = ?
  LIMIT 1
`, [id]);

export const findConflictingUserByUsername = async (username, id) => {
  if (id) return database.queryOne("SELECT id FROM users WHERE lower(username) = lower(?) AND id != ?", [username, id]);
  return database.queryOne("SELECT id FROM users WHERE lower(username) = lower(?)", [username]);
};

export const upsertUserRecord = async ({ id, name, username, password, role, passwordHash, passwordSalt, passwordAlgorithm, passwordIterations, passwordMigratedAt }) => {
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
        SET name = ?, username = ?, password = ?, password_hash = ?, password_salt = ?, password_algorithm = ?, password_iterations = ?, password_migrated_at = ?, role = ?, updated_at = ?
        WHERE id = ?
      `, [name, username, password || "", nextPasswordHash, nextPasswordSalt, nextPasswordAlgorithm, nextPasswordIterations, nextPasswordMigratedAt, role, now, id]);
    } else {
      await database.execute("UPDATE users SET name = ?, username = ?, role = ?, updated_at = ? WHERE id = ?", [name, username, role, now, id]);
    }
    return;
  }

  await database.execute(`
    INSERT INTO users (
      name, username, password, password_hash, password_salt, password_algorithm, password_iterations, password_migrated_at, role, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING id
  `, [name, username, password || "", nextPasswordHash, nextPasswordSalt, nextPasswordAlgorithm, nextPasswordIterations, nextPasswordMigratedAt, role, now, now]);
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
