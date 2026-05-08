/**
 * @file server/repositories/usersRepository.mjs
 * @summary Acesso a dados de usuarios.
 * @responsibility Ler, gravar e remover usuarios administrativos e viewers.
 */

import { db, nowIso } from "../db.mjs";
import { createPasswordRecord } from "../core/auth.mjs";

export const listUsers = () => db.prepare(`
  SELECT id, name, username, role
  FROM users
  ORDER BY lower(name) ASC, id ASC
`).all();

export const findUserByUsername = username => db.prepare(`
  SELECT id, name, username, password, password_hash, password_salt, password_algorithm, password_iterations, password_migrated_at, role
  FROM users
  WHERE lower(username) = lower(?)
  LIMIT 1
`).get(username);

export const findUserById = id => db.prepare(`
  SELECT id, name, username, password, password_hash, password_salt, password_algorithm, password_iterations, password_migrated_at, role
  FROM users
  WHERE id = ?
  LIMIT 1
`).get(id);

export const findConflictingUserByUsername = (username, id) => {
  if (id) return db.prepare("SELECT id FROM users WHERE lower(username) = lower(?) AND id != ?").get(username, id);
  return db.prepare("SELECT id FROM users WHERE lower(username) = lower(?)").get(username);
};

export const upsertUserRecord = ({ id, name, username, password, role, passwordHash, passwordSalt, passwordAlgorithm, passwordIterations, passwordMigratedAt }) => {
  const now = nowIso();
  const secret = password ? createPasswordRecord(password) : null;
  const nextPasswordHash = passwordHash || secret?.hash || null;
  const nextPasswordSalt = passwordSalt || secret?.salt || null;
  const nextPasswordAlgorithm = passwordAlgorithm || secret?.algorithm || null;
  const nextPasswordIterations = passwordIterations || secret?.iterations || null;
  const nextPasswordMigratedAt = passwordMigratedAt || null;

  if (id) {
    if (password || passwordHash) {
      db.prepare(`
        UPDATE users
        SET name = ?, username = ?, password = ?, password_hash = ?, password_salt = ?, password_algorithm = ?, password_iterations = ?, password_migrated_at = ?, role = ?, updated_at = ?
        WHERE id = ?
      `)
        .run(name, username, password || "", nextPasswordHash, nextPasswordSalt, nextPasswordAlgorithm, nextPasswordIterations, nextPasswordMigratedAt, role, now, id);
    } else {
      db.prepare("UPDATE users SET name = ?, username = ?, role = ?, updated_at = ? WHERE id = ?")
        .run(name, username, role, now, id);
    }
    return;
  }

  db.prepare(`
    INSERT INTO users (
      name, username, password, password_hash, password_salt, password_algorithm, password_iterations, password_migrated_at, role, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
    .run(name, username, password || "", nextPasswordHash, nextPasswordSalt, nextPasswordAlgorithm, nextPasswordIterations, nextPasswordMigratedAt, role, now, now);
};

export const setUserPasswordSecret = (id, { passwordHash, passwordSalt, passwordAlgorithm, passwordIterations, passwordMigratedAt }) => {
  db.prepare(`
    UPDATE users
    SET password_hash = ?, password_salt = ?, password_algorithm = ?, password_iterations = ?, password_migrated_at = ?, updated_at = ?
    WHERE id = ?
  `).run(passwordHash, passwordSalt, passwordAlgorithm, passwordIterations, passwordMigratedAt, nowIso(), id);
};

export const deleteUserRecord = id => {
  db.prepare("DELETE FROM users WHERE id = ?").run(id);
};
