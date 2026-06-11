/**
 * @file frontend/src/screens/resultsCsv.js
 * @summary Helpers de formatacao e exportacao CSV dos resultados.
 */

export const formatResultFieldValue = (value, type) => {
  if (value === undefined || value === null || value === "") return "";
  if (type === "grid") return Object.entries(value).map(([row, col]) => `${row}: ${col}`).join(" | ");
  return value;
};

export const escapeCsvValue = value => `"${String(value ?? "").replace(/"/g, '""')}"`;

export const buildCsvText = rows => rows.map(row => row.map(escapeCsvValue).join(";")).join("\n");

export const buildPresenceCsv = ({ columns, rows, showLinkedRows, getFieldValue, formatFieldValue }) => {
  const headers = ["Grau", "Nome", ...(showLinkedRows ? ["Status"] : []), ...columns.map(col => col.label)];
  const dataRows = rows.map(row => [
    row.grau,
    row.name,
    ...(showLinkedRows ? [row.status] : []),
    ...columns.map(col => formatFieldValue(getFieldValue(row.response, col.id), col.type)),
  ]);
  return buildCsvText([headers, ...dataRows]);
};

export const buildEscalaCsv = sections => {
  const headers = ["Seção", "Função", "Pessoa", "Status"];
  const rows = sections.flatMap(section => section.slots.map(slot => [
    section.title,
    slot.role,
    slot.person || "",
    slot.person ? "Preenchida" : "Pendente",
  ]));
  return buildCsvText([headers, ...rows]);
};
