/**
 * @file server/core/auth.mjs
 * @summary Utilitarios de seguranca para senhas e tokens.
 * @responsibility Padronizar hash, verificacao e geracao de credenciais opacas.
 */

import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from "node:crypto";

export const PASSWORD_ITERATIONS = 210000;
export const PASSWORD_KEY_LENGTH = 64;
export const PASSWORD_DIGEST = "sha512";
export const PASSWORD_ALGORITHM = "pbkdf2-sha512";
export const TOKEN_HASH_ALGORITHM = "sha256";

export const createPasswordRecord = (password, { salt = randomBytes(16).toString("hex"), iterations = PASSWORD_ITERATIONS } = {}) => {
  const hash = pbkdf2Sync(
    String(password),
    String(salt),
    Number(iterations) || PASSWORD_ITERATIONS,
    PASSWORD_KEY_LENGTH,
    PASSWORD_DIGEST,
  ).toString("hex");

  return {
    salt,
    hash,
    algorithm: PASSWORD_ALGORITHM,
    iterations: Number(iterations) || PASSWORD_ITERATIONS,
  };
};

export const verifyPassword = (password, record) => {
  if (!record?.salt || !record?.hash) return false;
  const expected = Buffer.from(String(record.hash), "hex");
  const received = Buffer.from(createPasswordRecord(password, {
    salt: record.salt,
    iterations: record.iterations,
  }).hash, "hex");
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
};

export const generateOpaqueToken = () => randomBytes(32).toString("hex");

export const hashOpaqueToken = token => createHash(TOKEN_HASH_ALGORITHM)
  .update(String(token))
  .digest("hex");
