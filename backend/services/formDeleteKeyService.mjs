/**
 * @file backend/services/formDeleteKeyService.mjs
 * @summary Seguranca da chave mestra de exclusao de formularios.
 * @responsibility Hash, persistencia e verificacao da chave usada em operacoes criticas.
 */

import { randomBytes, pbkdf2Sync, timingSafeEqual } from "node:crypto";
import { nowIso } from "../database/shared.mjs";
import { getJsonSetting, saveJsonSetting } from "../repositories/settingsRepository.mjs";

const MASTER_KEY_SETTING = "formDeleteKey";
const MASTER_KEY_ITERATIONS = 210000;

const makeError = (message, statusCode, code) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

const readFormDeleteKeyRecord = async () => {
  const record = await getJsonSetting(MASTER_KEY_SETTING, null);
  if (!record || typeof record !== "object") return null;
  if (!record.salt || !record.hash) return null;
  return {
    salt: String(record.salt),
    hash: String(record.hash),
    iterations: Number(record.iterations || MASTER_KEY_ITERATIONS),
    updatedAt: record.updatedAt || null,
  };
};

const hashFormDeleteKey = (masterKey, salt, iterations = MASTER_KEY_ITERATIONS) => pbkdf2Sync(
  String(masterKey),
  String(salt),
  Number(iterations) || MASTER_KEY_ITERATIONS,
  64,
  "sha512",
).toString("hex");

const verifyMasterKey = (masterKey, record) => {
  if (!record) return false;
  const expected = Buffer.from(record.hash, "hex");
  const received = Buffer.from(hashFormDeleteKey(masterKey, record.salt, record.iterations), "hex");
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
};

export const getFormDeleteKeyStatus = async () => ({
  configured: Boolean(await readFormDeleteKeyRecord()),
});

export const saveFormDeleteKey = async payload => {
  const currentRecord = await readFormDeleteKeyRecord();
  const newMasterKey = String(payload.newMasterKey || "").trim();
  if (!newMasterKey) throw makeError("Nova chave mestra e obrigatoria.", 400, "MASTER_KEY_REQUIRED");

  if (currentRecord) {
    const currentMasterKey = String(payload.currentMasterKey || "").trim();
    if (!currentMasterKey) throw makeError("Chave mestra atual e obrigatoria.", 400, "MASTER_KEY_CURRENT_REQUIRED");
    if (!verifyMasterKey(currentMasterKey, currentRecord)) {
      throw makeError("Chave mestra atual incorreta.", 403, "MASTER_KEY_INVALID");
    }
  }

  const salt = randomBytes(16).toString("hex");
  await saveJsonSetting(MASTER_KEY_SETTING, {
    version: 1,
    algorithm: "pbkdf2-sha512",
    iterations: MASTER_KEY_ITERATIONS,
    salt,
    hash: hashFormDeleteKey(newMasterKey, salt, MASTER_KEY_ITERATIONS),
    updatedAt: nowIso(),
  });

  return getFormDeleteKeyStatus();
};

export const verifyFormDeleteKey = async masterKey => verifyMasterKey(masterKey, await readFormDeleteKeyRecord());
