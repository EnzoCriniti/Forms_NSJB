/**
 * @file frontend/src/screens/resultsPresenceTableDomain.js
 * @summary Linhas, totais e largura da planilha de presenca.
 */

export const NO_VALUES = ["Nao", "NÃƒÂ£o", "NÃƒÆ’Ã‚Â£o", "NÃƒÆ’Ã‚Æ’Ãƒâ€šÃ‚Â£o"];

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

export const attachPresenceTotalsSummary = ({ totalsLayout = [], totals = {} }) => totalsLayout.map(item => {
  const col = item.field;
  return {
    ...item,
    summary: col ? totals[col.id] : null,
  };
});
