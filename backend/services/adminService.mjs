/**
 * @file backend/services/adminService.mjs
 * @summary Regras administrativas do sistema.
 * @responsibility Orquestrar usuarios, classificacoes, presets, socios e configuracoes.
 */

import { randomBytes, pbkdf2Sync, timingSafeEqual } from "node:crypto";
import { listUsers, findConflictingUserByUsername, upsertUserRecord, deleteUserRecord } from "../repositories/usersRepository.mjs";
import { listLabels, upsertLabelRecord, deleteLabelRecord } from "../repositories/labelsRepository.mjs";
import { listPresets, upsertPresetRecord, deletePresetRecord } from "../repositories/presetsRepository.mjs";
import { listPeople, replacePeopleRecords } from "../repositories/peopleRepository.mjs";
import { getJsonSetting, saveJsonSetting } from "../repositories/settingsRepository.mjs";
import { nowIso } from "../database/shared.mjs";
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

export const saveUser = async payload => {
  const username = String(payload.username || "").trim();
  const name = String(payload.name || username).trim();
  const password = String(payload.password || "").trim();
  if (!username || !payload.role) throw new Error("Usuario e papel sao obrigatorios.");
  if (!payload.id && !password) throw new Error("Senha e obrigatoria para novo usuario.");
  if (await findConflictingUserByUsername(username, payload.id)) throw new Error("Usuario ja existe.");
  await upsertUserRecord({ id: payload.id, name, username, password, role: payload.role });
  return listUsers();
};

export const deleteUser = async id => {
  await deleteUserRecord(id);
  return listUsers();
};

export const saveLabel = async payload => {
  if (!payload.name?.trim()) throw new Error("Nome da classificacao e obrigatorio.");
  await upsertLabelRecord({
    id: payload.id,
    name: payload.name.trim(),
    color: payload.color,
    createdBy: payload.createdBy || "Admin",
  });
  return listLabels();
};

export const deleteLabel = async id => {
  await deleteLabelRecord(id);
  return listLabels();
};

export const savePreset = async payload => {
  if (!payload.name?.trim()) throw new Error("Nome do preset e obrigatorio.");
  await upsertPresetRecord({
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

export const deletePreset = async id => {
  await deletePresetRecord(id);
  return listPresets();
};

export const savePeople = async people => {
  await replacePeopleRecords(people || []);
  return listPeople();
};

export const saveMembersConfig = async config => {
  await saveJsonSetting("membersConfig", config);
  return getJsonSetting("membersConfig", {});
};

export const saveFieldCatalogItem = async payload => {
  const key = normalizeKey(payload.key);
  if (!key) throw new Error("Chave do campo base e obrigatoria.");
  if (await findFieldCatalogConflict(key, payload.id)) throw new Error("Ja existe um campo base com esta chave.");
  await upsertFieldCatalogRecord({
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

export const deleteFieldCatalogItem = async id => {
  await deleteFieldCatalogRecord(id);
  return listFieldCatalog();
};

export const saveScaleTaskCatalogItem = async payload => {
  const key = normalizeKey(payload.key);
  if (!key) throw new Error("Chave da tarefa base e obrigatoria.");
  if (await findScaleTaskCatalogConflict(key, payload.id)) throw new Error("Ja existe uma tarefa base com esta chave.");
  await upsertScaleTaskCatalogRecord({
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

export const deleteScaleTaskCatalogItem = async id => {
  await deleteScaleTaskCatalogRecord(id);
  return listScaleTaskCatalog();
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
