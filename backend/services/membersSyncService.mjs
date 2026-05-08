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

const MEMBERS_CONFIG_KEY = "membersConfig";

const buildGoogleSheetsCsvUrl = config => {
  const match = String(config.sheetUrl || "").match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!match) throw new Error("URL do Google Sheets invalida.");
  const id = match[1];
  const [sheetPart, rangePart] = String(config.range || "").includes("!")
    ? String(config.range).split("!")
    : ["", String(config.range || "")];
  const params = new URLSearchParams({ tqx: "out:csv" });
  if (sheetPart) params.set("sheet", sheetPart);
  if (rangePart) params.set("range", rangePart);
  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?${params.toString()}`;
};

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
