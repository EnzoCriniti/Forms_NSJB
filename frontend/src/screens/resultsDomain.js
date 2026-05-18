/**
 * @file frontend/src/screens/resultsDomain.js
 * @summary Helpers puros da tela de resultados.
 * @responsibility Concentrar ordenacao, filtros, estatisticas e formatacao reutilizavel da planilha.
 */

export const NO_VALUES = ["Nao", "Não", "NÃ£o", "NÃÂ£o"];
export const TABLE_ZOOM_MIN = 0.4;
export const TABLE_ZOOM_MAX = 2.5;
export const TABLE_ZOOM_STEP = 0.1;

export const clampTableZoom = value => Math.min(TABLE_ZOOM_MAX, Math.max(TABLE_ZOOM_MIN, Number(value) || 1));

export const normalizeGrauToken = value => String(value || "")
  .trim()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toUpperCase();

export const getGrauPriority = grau => {
  const normalized = normalizeGrauToken(grau);
  if (normalized === "QM") return 0;
  if (normalized === "CDC") return 1;
  if (normalized === "CI") return 2;
  if (normalized === "QS") return 3;
  return 4;
};

export const compareGrauOptions = (left, right) => {
  const leftPriority = getGrauPriority(left);
  const rightPriority = getGrauPriority(right);
  if (leftPriority !== rightPriority) {
    return leftPriority - rightPriority;
  }
  return String(left || "").localeCompare(String(right || ""), "pt-BR");
};

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
  const headers = ["Secao", "Funcao", "Pessoa", "Status"];
  const rows = sections.flatMap(section => section.slots.map(slot => [
    section.title,
    slot.role,
    slot.person || "",
    slot.person ? "Preenchida" : "Pendente",
  ]));
  return buildCsvText([headers, ...rows]);
};

export const buildPresenceStats = ({
  hasExpectedTotal,
  filteredResponsesLength,
  selectedGrau,
  expectedTotal,
  filteredRowsLength,
  totalsLayoutLength,
  linkedPeople,
  peopleLength,
}) => {
  if (hasExpectedTotal) {
    return [
      { l: "Respostas", v: filteredResponsesLength, s: `de ${selectedGrau === "todos" ? expectedTotal : filteredRowsLength}`, c: "#0f8b6b" },
      { l: "Faltam", v: Math.max((selectedGrau === "todos" ? expectedTotal : filteredRowsLength) - filteredResponsesLength, 0), s: "pendentes", c: "#c93c3c" },
    ];
  }

  return [
    { l: "Respostas", v: filteredResponsesLength, s: "recebidas", c: "#0f8b6b" },
    { l: "Campos totalizaveis", v: totalsLayoutLength, s: "configurados", c: "#1f7a9a" },
    { l: "Base vinculada", v: linkedPeople ? "Sim" : "Nao", s: linkedPeople ? `${peopleLength} pessoas` : "sem controle de faltantes", c: "#444444" },
  ];
};

export const buildActiveFilterOptions = ({
  activeFilter,
  columnSearches,
  columns,
  selectedGrau,
  tableRows,
  formatFieldValue,
  getFieldValue,
}) => {
  if (!activeFilter || activeFilter.type !== "select") {
    return [];
  }

  const grauFilter = String(selectedGrau || "todos").trim();
  const baseRows = grauFilter === "todos"
    ? tableRows
    : tableRows.filter(row => String(row.grau || "") === grauFilter);
  const preservedFilters = Object.entries(columnSearches).filter(([columnId, value]) => {
    return columnId !== activeFilter.id && String(value || "").trim();
  });

  const rows = preservedFilters.length === 0
    ? baseRows
    : baseRows.filter(row => preservedFilters.every(([columnId, rawValue]) => {
      const normalized = String(rawValue).trim().toLowerCase();
      if (columnId === "grau") return String(row.grau || "").toLowerCase().includes(normalized);
      if (columnId === "name") return String(row.name || "").toLowerCase().includes(normalized);
      if (columnId === "status") return String(row.status || "").toLowerCase().includes(normalized);
      const column = columns.find(item => String(item.id) === String(columnId));
      return String(formatFieldValue(getFieldValue(row.response, columnId), column?.type)).toLowerCase().includes(normalized);
    }));

  const values = rows.map(row => {
    if (activeFilter.id === "grau") return row.grau;
    if (activeFilter.id === "name") return row.name;
    if (activeFilter.id === "status") return row.status;
    const column = columns.find(item => String(item.id) === String(activeFilter.id));
    return formatFieldValue(getFieldValue(row.response, activeFilter.id), column?.type);
  });

  return [...new Set(values.map(value => String(value || "").trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR"));
};
