/**
 * @file backend/services/adminService.mjs
 * @summary Regras administrativas do sistema.
 * @responsibility Orquestrar usuarios, classificacoes, presets, socios e configuracoes.
 */

import { listUsers, findConflictingUserByUsername, upsertUserRecord, deleteUserRecord } from "../repositories/usersRepository.mjs";
import { listLabels, upsertLabelRecord, deleteLabelRecord } from "../repositories/labelsRepository.mjs";
import { listPresets, upsertPresetRecord, deletePresetRecord } from "../repositories/presetsRepository.mjs";
import { listPeople, replacePeopleRecords } from "../repositories/peopleRepository.mjs";
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
import { saveMembersConfig as saveMembersConfigSetting, syncMembersFromSource } from "./membersSyncService.mjs";
import { deleteExternalBase as deleteExternalBaseSetting, listExternalBases, saveExternalBase as saveExternalBaseSetting, syncExternalBase } from "./externalBasesService.mjs";

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

export { saveMembersConfigSetting as saveMembersConfig, syncMembersFromSource };
export { listExternalBases, syncExternalBase };

export const saveExternalBase = async payload => saveExternalBaseSetting(payload);

export const deleteExternalBase = async id => deleteExternalBaseSetting(id);

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
    selectionSource: payload.selectionSource,
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
