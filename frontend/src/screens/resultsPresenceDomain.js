/**
 * @file frontend/src/screens/resultsPresenceDomain.js
 * @summary Helpers puros da planilha de presenca.
 */

export const NO_VALUES = ["Nao", "NÃ£o", "NÃƒÂ£o", "NÃƒÂƒÃ‚Â£o"];
export const TABLE_ZOOM_MIN = 0.4;
export const TABLE_ZOOM_MAX = 2.5;
export const TABLE_ZOOM_STEP = 0.1;

export const clampTableZoom = value => Math.min(TABLE_ZOOM_MAX, Math.max(TABLE_ZOOM_MIN, Number(value) || 1));

export const getPresenceTouchDistance = touches => {
  if (!touches || touches.length < 2) return 0;
  const [first, second] = touches;
  return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
};

export const resolvePresenceSortState = ({ sortCol, sortDir, nextCol }) => {
  if (sortCol !== nextCol) {
    return { sortCol: nextCol, sortDir: "asc" };
  }

  if (sortDir === "asc") {
    return { sortCol, sortDir: "desc" };
  }

  return { sortCol: null, sortDir: "asc" };
};

export const getPresenceSortIconName = ({ sortCol, sortDir, col }) => {
  if (sortCol !== col) return "sortNone";
  return sortDir === "asc" ? "sortAsc" : "sortDesc";
};

export const buildPresenceHeaderCellStyle = ({ col, sortCol, colors }) => ({
  padding: "10px 12px",
  textAlign: ["grau", "name", "status"].includes(col) ? "left" : "center",
  color: "#fff",
  fontWeight: 600,
  whiteSpace: "nowrap",
  cursor: "pointer",
  userSelect: "none",
  background: sortCol === col ? colors.primaryDark : colors.primary,
  transition: "background 0.15s",
  verticalAlign: "top",
  minWidth: col === "grau" ? 90 : col === "name" ? 160 : col === "status" ? 110 : 130,
});

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

export const buildPresenceTableRows = ({ responses = [], people = [], showLinkedRows = false }) => {
  if (!showLinkedRows) {
    return responses.map(response => ({
      key: response.id || `${response.respondentGrau}-${response.respondentName}`,
      grau: response.respondentGrau || "",
      name: response.respondentName || "",
      status: "Respondido",
      response,
    }));
  }

  const responseByName = new Map(responses.map(response => [response.respondentName, response]));
  return people.map(person => ({
    key: `${person.grau}-${person.name}`,
    grau: person.grau || "",
    name: person.name || "",
    status: responseByName.has(person.name) ? "Respondido" : "Pendente",
    response: responseByName.get(person.name) || null,
  }));
};

export const buildPresenceBaseResponses = ({ responses = [], people = [], showLinkedRows = false }) => {
  if (!showLinkedRows) {
    return responses;
  }

  const peopleNames = new Set(people.map(person => person.name));
  return responses.filter(response => peopleNames.has(response.respondentName));
};

export const buildPresenceTotals = ({ columns = [], responses = [], getFieldValue }) => {
  const result = {};
  for (const col of columns) {
    if (col.type === "yes_no") {
      result[col.id] = {
        sim: responses.filter(response => getFieldValue(response, col.id) === "Sim").length,
        nao: responses.filter(response => NO_VALUES.includes(getFieldValue(response, col.id))).length,
      };
    } else if (col.type === "number") {
      result[col.id] = {
        sum: responses.reduce((sum, response) => sum + Number(getFieldValue(response, col.id) || 0), 0),
      };
    }
  }
  return result;
};

export const buildPresenceTotalsLayout = ({ columns = [], totalsLayout = [] }) => {
  const configured = totalsLayout
    .map(item => ({ ...item, field: columns.find(col => String(col.id) === String(item.fieldId)) }))
    .filter(item => item.field);

  if (configured.length > 0) return configured;

  return columns
    .filter(col => col.total)
    .map(col => ({ fieldId: col.id, style: col.type === "yes_no" ? "split" : "number", field: col }));
};

export const buildPresenceTableMinWidth = ({ columnsLength = 0, showLinkedRows = false }) => {
  const base = showLinkedRows ? 350 : 240;
  const dynamic = columnsLength * 160;
  return Math.max(960, base + dynamic);
};

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

export const buildPresenceGrauOptions = ({ tableRows = [] }) => {
  const values = [...new Set(tableRows.map(row => String(row.grau || "").trim()).filter(Boolean))];
  return values.sort(compareGrauOptions);
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

export const attachPresenceTotalsSummary = ({ totalsLayout = [], totals = {} }) => totalsLayout.map(item => {
  const col = item.field;
  return {
    ...item,
    summary: col ? totals[col.id] : null,
  };
});

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
