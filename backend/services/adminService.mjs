/**
 * @file backend/services/adminService.mjs
 * @summary Regras administrativas do sistema.
 * @responsibility Orquestrar usuarios, classificacoes, presets, socios e configuracoes.
 */

import { listUsers, findConflictingUserByUsername, upsertUserRecord, deleteUserRecord } from "../repositories/usersRepository.mjs";
import { listLabels, upsertLabelRecord, deleteLabelRecord } from "../repositories/labelsRepository.mjs";
import { listPresets, upsertPresetRecord, deletePresetRecord } from "../repositories/presetsRepository.mjs";
import { listPeople, replacePeopleRecords } from "../repositories/peopleRepository.mjs";
import { saveMembersConfig as saveMembersConfigSetting, syncMembersFromSource } from "./membersSyncService.mjs";
import { deleteExternalBase as deleteExternalBaseSetting, listExternalBases, saveExternalBase as saveExternalBaseSetting, syncExternalBase } from "./externalBasesService.mjs";

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
