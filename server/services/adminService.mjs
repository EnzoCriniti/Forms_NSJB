/**
 * @file server/services/adminService.mjs
 * @summary Regras administrativas do sistema.
 * @responsibility Orquestrar usuarios, classificacoes, presets, socios e configuracoes.
 */

import { randomBytes, pbkdf2Sync, timingSafeEqual } from "node:crypto";
import { listUsers, findConflictingUserByUsername, upsertUserRecord, deleteUserRecord } from "../repositories/usersRepository.mjs";
import { listLabels, upsertLabelRecord, deleteLabelRecord } from "../repositories/labelsRepository.mjs";
import { listPresets, upsertPresetRecord, deletePresetRecord } from "../repositories/presetsRepository.mjs";
import { listPeople, replacePeopleRecords } from "../repositories/peopleRepository.mjs";
import { getJsonSetting, saveJsonSetting } from "../repositories/settingsRepository.mjs";
import { nowIso } from "../db.mjs";
import {
  deleteFieldCatalogRecord,
  deleteScaleTaskCatalogRecord,
  findFieldCatalogConflict,
  findScaleTaskCatalogConflict,
  listFieldCatalog,
  listScaleTaskCatalog,
  upsertFieldCatalogRecord,
  upsertScaleTaskCatalogRecord,
} from "../repositories/catalogRepository.mjs";

const MASTER_KEY_SETTING = "formDeleteKey";
const MASTER_KEY_ITERATIONS = 210000;

const normalizeKey = value => String(value || "")
  .trim()
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "");

const normalizeGridSchema = payload => ({
  rows: Array.isArray(payload?.rows) ? payload.rows.map(item => String(item || "").trim()).filter(Boolean) : [],
  cols: Array.isArray(payload?.cols) ? payload.cols.map(item => String(item || "").trim()).filter(Boolean) : [],
});

const makeError = (message, statusCode, code) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

const readFormDeleteKeyRecord = () => {
  const record = getJsonSetting(MASTER_KEY_SETTING, null);
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

const verifyMasterKey = (masterKey, record = readFormDeleteKeyRecord()) => {
  if (!record) return false;
  const expected = Buffer.from(record.hash, "hex");
  const received = Buffer.from(hashFormDeleteKey(masterKey, record.salt, record.iterations), "hex");
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
};

export const saveUser = payload => {
  const username = String(payload.username || "").trim();
  const name = String(payload.name || username).trim();
  const password = String(payload.password || "").trim();
  if (!username || !payload.role) throw new Error("Usuário e papel são obrigatórios.");
  if (!payload.id && !password) throw new Error("Senha é obrigatória para novo usuário.");
  if (findConflictingUserByUsername(username, payload.id)) throw new Error("Usuário já existe.");
  upsertUserRecord({ id: payload.id, name, username, password, role: payload.role });
  return listUsers();
};

export const deleteUser = id => {
  deleteUserRecord(id);
  return listUsers();
};

export const saveLabel = payload => {
  if (!payload.name?.trim()) throw new Error("Nome da classificação é obrigatório.");
  upsertLabelRecord({
    id: payload.id,
    name: payload.name.trim(),
    color: payload.color,
    createdBy: payload.createdBy || "Admin",
  });
  return listLabels();
};

export const deleteLabel = id => {
  deleteLabelRecord(id);
  return listLabels();
};

export const savePreset = payload => {
  if (!payload.name?.trim()) throw new Error("Nome do preset é obrigatório.");
  upsertPresetRecord({
    id: payload.id,
    type: payload.type,
    name: payload.name.trim(),
    desc: payload.desc || "",
    closingText: payload.closingText || "",
    labels: payload.labels || [],
    fieldDefinitions: payload.fieldDefinitions || [],
    resultsConfig: payload.resultsConfig || {},
    scaleSections: payload.scaleSections || [],
    createdBy: payload.createdBy || "Admin",
  });
  return listPresets();
};

export const deletePreset = id => {
  deletePresetRecord(id);
  return listPresets();
};

export const savePeople = people => {
  replacePeopleRecords(people || []);
  return listPeople();
};

export const saveMembersConfig = config => {
  saveJsonSetting("membersConfig", config);
  return getJsonSetting("membersConfig", {});
};

export const saveFieldCatalogItem = payload => {
  const key = normalizeKey(payload.key);
  if (!key) throw new Error("Chave do campo base e obrigatoria.");
  if (findFieldCatalogConflict(key, payload.id)) throw new Error("Ja existe um campo base com esta chave.");
  upsertFieldCatalogRecord({
    id: payload.id,
    key,
    name: payload.name.trim(),
    type: payload.type,
    category: payload.category,
    defaultLabel: payload.defaultLabel.trim(),
    gridSchema: payload.type === "grid" ? normalizeGridSchema(payload.gridSchema) : {},
    description: String(payload.description || "").trim(),
    active: payload.active !== false,
  });
  return listFieldCatalog();
};

export const deleteFieldCatalogItem = id => {
  deleteFieldCatalogRecord(id);
  return listFieldCatalog();
};

export const saveScaleTaskCatalogItem = payload => {
  const key = normalizeKey(payload.key);
  if (!key) throw new Error("Chave da tarefa base e obrigatoria.");
  if (findScaleTaskCatalogConflict(key, payload.id)) throw new Error("Ja existe uma tarefa base com esta chave.");
  upsertScaleTaskCatalogRecord({
    id: payload.id,
    key,
    name: payload.name.trim(),
    category: payload.category,
    defaultLabel: payload.defaultLabel.trim(),
    description: String(payload.description || "").trim(),
    active: payload.active !== false,
  });
  return listScaleTaskCatalog();
};

export const deleteScaleTaskCatalogItem = id => {
  deleteScaleTaskCatalogRecord(id);
  return listScaleTaskCatalog();
};

export const getFormDeleteKeyStatus = () => ({
  configured: Boolean(readFormDeleteKeyRecord()),
});

export const saveFormDeleteKey = payload => {
  const currentRecord = readFormDeleteKeyRecord();
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
  saveJsonSetting(MASTER_KEY_SETTING, {
    version: 1,
    algorithm: "pbkdf2-sha512",
    iterations: MASTER_KEY_ITERATIONS,
    salt,
    hash: hashFormDeleteKey(newMasterKey, salt, MASTER_KEY_ITERATIONS),
    updatedAt: nowIso(),
  });

  return getFormDeleteKeyStatus();
};

export const verifyFormDeleteKey = masterKey => verifyMasterKey(masterKey);
