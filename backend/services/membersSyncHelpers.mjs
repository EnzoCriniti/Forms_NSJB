/**
 * @file backend/services/membersSyncHelpers.mjs
 * @summary Helpers puros da sincronizacao de socios.
 * @responsibility Converter CSV e mapear a origem externa para a base central.
 */

import { nowIso } from "../database/shared.mjs";
import { colIndex } from "./googleSheetsSource.mjs";
import { normalizePersonSex } from "../../shared/sex.mjs";

export const parseCsvRows = text => {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(cell.trim());
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell.trim());
      cell = "";
      if (row.some(value => value !== "")) rows.push(row);
      row = [];
      continue;
    }

    cell += char;
  }

  row.push(cell.trim());
  if (row.some(value => value !== "")) rows.push(row);
  return rows;
};

const normalizeActive = value => {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return true;
  if (["0", "false", "nao", "não", "inativo", "inactive"].includes(normalized)) return false;
  return true;
};

export const mapPeopleFromRows = (rows, config) => {
  const nameCol = colIndex(config.nameColumn || "B");
  const grauCol = colIndex(config.grauColumn || "A");
  const phoneCol = colIndex(config.phoneColumn || "");
  const sexCol = colIndex(config.sexColumn || "");
  const externalIdCol = colIndex(config.externalIdColumn || "");
  const activeCol = colIndex(config.activeColumn || "");
  const syncedAt = nowIso();

  return rows
    .slice(1)
    .map((row, index) => ({
      name: row[nameCol] || "",
      grau: grauCol >= 0 ? (row[grauCol] || "") : "",
      phone: phoneCol >= 0 ? (row[phoneCol] || "") : "",
      sex: sexCol >= 0 ? normalizePersonSex(row[sexCol]) : "",
      active: activeCol >= 0 ? normalizeActive(row[activeCol]) : true,
      source: "google_sheets",
      externalKey: externalIdCol >= 0 ? (row[externalIdCol] || "") : "",
      syncedAt,
      metadata: {
        rowNumber: index + 2,
      },
    }))
    .filter(person => person.name.trim());
};
