/**
 * @file backend/services/googleSheetsSource.mjs
 * @summary Helpers puros da origem Google Sheets.
 * @responsibility Compartilhar entre a base de socios e as bases externas a
 * conversao de letra de coluna em indice e a montagem da URL de export CSV
 * a partir da config (URL + range). Evita duplicar essa logica em cada servico.
 */

/** Converte letra(s) de coluna ("A", "B", "AA"...) em indice 0-based; -1 se invalida/vazia. */
export const colIndex = letter => {
  const normalized = String(letter || "").trim().toUpperCase();
  if (!normalized) return -1;
  let result = 0;
  for (const char of normalized) {
    const code = char.charCodeAt(0);
    if (code < 65 || code > 90) return -1;
    result = (result * 26) + (code - 64);
  }
  return result - 1;
};

/** Monta a URL de export CSV (gviz) a partir da URL da planilha e do range opcional. */
export const buildGoogleSheetsCsvUrl = config => {
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
