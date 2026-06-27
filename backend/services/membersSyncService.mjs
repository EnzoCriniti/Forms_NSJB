/**
 * @file backend/services/membersSyncService.mjs
 * @summary Sincronizacao da base central de socios.
 * @responsibility Buscar a origem externa, mapear colunas e atualizar a base local.
 */

import { DEFAULT_MEMBERS_CONFIG } from "../data/seedData.mjs";
import { nowIso } from "../database/shared.mjs";
import { listPeople, replacePeopleRecords } from "../repositories/peopleRepository.mjs";
import { getJsonSetting, saveJsonSetting } from "../repositories/settingsRepository.mjs";
import { mapPeopleFromRows, parseCsvRows } from "./membersSyncHelpers.mjs";
import { buildGoogleSheetsCsvUrl } from "./googleSheetsSource.mjs";

const MEMBERS_CONFIG_KEY = "membersConfig";

export const getMembersConfig = async () => getJsonSetting(MEMBERS_CONFIG_KEY, DEFAULT_MEMBERS_CONFIG);

export const saveMembersConfig = async config => {
  const normalized = {
    ...DEFAULT_MEMBERS_CONFIG,
    ...(config || {}),
  };
  await saveJsonSetting(MEMBERS_CONFIG_KEY, normalized);
  return getMembersConfig();
};

export const syncMembersFromSource = async () => {
  const config = await getMembersConfig();
  if (config.sourceType !== "google_sheets") {
    throw new Error("A sincronizacao automatica ainda suporta apenas Google Sheets.");
  }
  if (!String(config.sheetUrl || "").trim()) {
    throw new Error("Configure a URL do Google Sheets antes de sincronizar.");
  }

  const response = await fetch(buildGoogleSheetsCsvUrl(config));
  if (!response.ok) {
    throw new Error(`Erro ao buscar planilha (${response.status}).`);
  }

  const text = await response.text();
  const rows = parseCsvRows(text);
  const people = mapPeopleFromRows(rows, config);
  await replacePeopleRecords(people);

  const updatedConfig = await saveMembersConfig({
    ...config,
    lastSyncedAt: nowIso(),
  });

  return {
    people: await listPeople(),
    membersConfig: updatedConfig,
    importedCount: people.length,
  };
};
