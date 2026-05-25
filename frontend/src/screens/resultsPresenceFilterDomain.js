/**
 * @file frontend/src/screens/resultsPresenceFilterDomain.js
 * @summary Filtros, opcoes ativas e ordenacao de linhas da presenca.
 */

export const buildPresenceFilterButtons = ({ columns = [], linkedPeople = false, showLinkedRows = false }) => {
  const items = [{ id: "name", label: "Nome", type: "text" }];

  if (linkedPeople) {
    items.unshift({ id: "grau", label: "Grau", type: "select" });
  }

  if (showLinkedRows) {
    items.push({ id: "status", label: "Status", type: "select" });
  }

  for (const col of columns) {
    items.push({
      id: String(col.id),
      label: col.label,
      type: ["yes_no", "select", "radio"].includes(col.type) ? "select" : "text",
    });
  }

  return items;
};

export const filterPresenceRows = ({
  tableRows = [],
  selectedGrau = "todos",
  columnSearches = {},
  columns = [],
  searchEnabled = true,
  getFieldValue,
  formatFieldValue,
}) => {
  const grauFilter = String(selectedGrau || "todos").trim();
  const rowsByGrau = grauFilter === "todos"
    ? tableRows
    : tableRows.filter(row => String(row.grau || "") === grauFilter);
  const activeFilters = Object.entries(columnSearches).filter(([, value]) => String(value || "").trim());
  if (!searchEnabled || activeFilters.length === 0) return rowsByGrau;
  return rowsByGrau.filter(row => activeFilters.every(([columnId, rawValue]) => {
    const normalized = String(rawValue).trim().toLowerCase();
    if (columnId === "grau") return String(row.grau || "").toLowerCase().includes(normalized);
    if (columnId === "name") return String(row.name || "").toLowerCase().includes(normalized);
    if (columnId === "status") return String(row.status || "").toLowerCase().includes(normalized);
    const column = columns.find(item => String(item.id) === String(columnId));
    return String(formatFieldValue(getFieldValue(row.response, columnId), column?.type)).toLowerCase().includes(normalized);
  }));
};

export const filterPresenceResponses = ({ baseResponses = [], selectedGrau = "todos", tableRows = [] }) => {
  const normalizedSelectedGrau = String(selectedGrau || "todos").trim().toLowerCase();
  if (normalizedSelectedGrau === "todos") {
    return baseResponses;
  }

  return baseResponses.filter(response => {
    const responseGrau = String(
      response?.grau ??
        response?.grade ??
        response?.personGrau ??
        response?.person?.grau ??
        response?.linkedPerson?.grau ??
        response?.row?.grau ??
        response?.student?.grau ??
        ""
    ).trim().toLowerCase();

    if (responseGrau) {
      return responseGrau === normalizedSelectedGrau;
    }

    const responseName = String(
      response?.nome ?? response?.name ?? response?.personName ?? response?.participantName ?? ""
    ).trim().toLowerCase();

    if (!responseName) {
      return false;
    }

    return tableRows.some(row => {
      const rowGrau = String(row?.grau ?? "").trim().toLowerCase();
      const rowName = String(row?.nome ?? row?.name ?? "").trim().toLowerCase();
      return rowGrau === normalizedSelectedGrau && rowName === responseName;
    });
  });
};

export const sortPresenceRows = ({ rows = [], sortCol = null, sortDir = "asc", getFieldValue }) => {
  const data = [...rows];
  if (!sortCol) return data;
  data.sort((a, b) => {
    const getSortValue = row => {
      if (sortCol === "grau") return row.grau || "";
      if (sortCol === "name") return row.name || "";
      if (sortCol === "status") return row.status || "";
      return getFieldValue(row.response, sortCol);
    };
    const va = getSortValue(a);
    const vb = getSortValue(b);
    if (typeof va === "string" || typeof vb === "string") {
      const comparison = String(va || "").localeCompare(String(vb || ""), "pt-BR");
      return sortDir === "asc" ? comparison : -comparison;
    }
    return sortDir === "asc" ? Number(va || 0) - Number(vb || 0) : Number(vb || 0) - Number(va || 0);
  });
  return data;
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
