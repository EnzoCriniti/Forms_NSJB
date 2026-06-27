/**
 * @file backend/services/externalBasesService.mjs
 * @summary CRUD e sincronizacao das bases externas.
 * @responsibility Persistir definicoes de bases externas e carregar opcoes vindas de Google Sheets.
 */

import { nowIso } from "../database/shared.mjs";
import { getJsonSetting, saveJsonSetting } from "../repositories/settingsRepository.mjs";
import { parseCsvRows } from "./membersSyncHelpers.mjs";
import { buildGoogleSheetsCsvUrl, colIndex } from "./googleSheetsSource.mjs";

const EXTERNAL_BASES_KEY = "externalBases";

const normalizeBaseItem = item => ({
  value: String(item?.value || "").trim(),
  label: String(item?.label || item?.value || "").trim(),
  description: String(item?.description || "").trim(),
  active: item?.active !== false,
});

const normalizeExternalBase = payload => ({
  id: payload?.id ? Number(payload.id) : null,
  name: String(payload?.name || "").trim(),
  description: String(payload?.description || "").trim(),
  sourceType: String(payload?.sourceType || "google_sheets").trim() || "google_sheets",
  sheetUrl: String(payload?.sheetUrl || "").trim(),
  range: String(payload?.range || "").trim(),
  valueColumn: String(payload?.valueColumn || "A").trim(),
  labelColumn: String(payload?.labelColumn || "B").trim(),
  descriptionColumn: String(payload?.descriptionColumn || "").trim(),
  activeColumn: String(payload?.activeColumn || "").trim(),
  syncEnabled: payload?.syncEnabled !== false,
  syncFrequencyHours: Number(payload?.syncFrequencyHours || 24) || 24,
  lastSyncedAt: payload?.lastSyncedAt || null,
  active: payload?.active !== false,
  items: Array.isArray(payload?.items) ? payload.items.map(normalizeBaseItem).filter(item => item.value || item.label) : [],
});

const mapExternalBaseItems = (rows, config) => {
  const valueCol = colIndex(config.valueColumn || "A");
  const labelCol = colIndex(config.labelColumn || "B");
  const descriptionCol = colIndex(config.descriptionColumn || "");
  const activeCol = colIndex(config.activeColumn || "");

  return rows
    .slice(1)
    .map(row => normalizeBaseItem({
      value: valueCol >= 0 ? row[valueCol] || "" : "",
      label: labelCol >= 0 ? row[labelCol] || "" : "",
      description: descriptionCol >= 0 ? row[descriptionCol] || "" : "",
      active: activeCol >= 0 ? !["0", "false", "nao", "não", "inativo", "inactive"].includes(String(row[activeCol] || "").trim().toLowerCase()) : true,
    }))
    .filter(item => item.value || item.label);
};

export const listExternalBases = async () => {
  const items = await getJsonSetting(EXTERNAL_BASES_KEY, []);
  return Array.isArray(items) ? items.map(normalizeExternalBase) : [];
};

export const saveExternalBase = async payload => {
  const current = await listExternalBases();
  const normalized = normalizeExternalBase(payload);
  if (!normalized.name) throw new Error("Nome da base externa e obrigatorio.");

  const nextId = normalized.id || ((current.reduce((highest, item) => Math.max(highest, Number(item.id || 0)), 0)) + 1);
  const nextRecord = { ...normalized, id: nextId };
  const nextList = normalized.id
    ? current.map(item => item.id === nextId ? nextRecord : item)
    : [...current, nextRecord];

  await saveJsonSetting(EXTERNAL_BASES_KEY, nextList);
  return listExternalBases();
};

export const deleteExternalBase = async id => {
  const current = await listExternalBases();
  await saveJsonSetting(EXTERNAL_BASES_KEY, current.filter(item => Number(item.id) !== Number(id)));
  return listExternalBases();
};

export const syncExternalBase = async id => {
  const current = await listExternalBases();
  const base = current.find(item => Number(item.id) === Number(id));
  if (!base) throw new Error("Base externa nao encontrada.");
  if (base.sourceType !== "google_sheets") throw new Error("A sincronizacao automatica ainda suporta apenas Google Sheets.");
  if (!base.sheetUrl) throw new Error("Configure a URL do Google Sheets antes de sincronizar.");

  const response = await fetch(buildGoogleSheetsCsvUrl(base));
  if (!response.ok) throw new Error(`Erro ao buscar planilha (${response.status}).`);

  const text = await response.text();
  const rows = parseCsvRows(text);
  const syncedItems = mapExternalBaseItems(rows, base);
  const updatedBase = {
    ...base,
    items: syncedItems,
    lastSyncedAt: nowIso(),
  };
  const nextList = current.map(item => item.id === updatedBase.id ? updatedBase : item);
  await saveJsonSetting(EXTERNAL_BASES_KEY, nextList);

  return {
    externalBase: updatedBase,
    externalBases: await listExternalBases(),
    importedCount: syncedItems.length,
  };
};
