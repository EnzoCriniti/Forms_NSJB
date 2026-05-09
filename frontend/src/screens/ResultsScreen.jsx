/**
 * @file frontend/src/screens/ResultsScreen.jsx
 * @summary Tela de resultados.
 * @responsibility Exibir respostas de presenca e edicao/resultados da escala.
 */

import React, { useMemo, useRef, useState } from "react";
import { COLORS, Icon, Badge, StatusBadge, Btn, ConfirmModal, FeedbackBanner, resolveActionErrorMessage } from "../components/ui";
import { ResultsPresenceHeader } from "../components/ResultsPresenceHeader";
import { canEditEscala } from "../lib/auth";
import { formatDateTime, getExpectedResponses, getFieldValue, getResultsConfig, getVisibleFields, hasLinkedPeopleField, isPrimaryPeopleBaseField } from "../lib/forms";

const NO_VALUES = ["Nao", "Não", "NÃ£o", "NÃƒÂ£o"];

const TABLE_ZOOM_MIN = 0.4;
const TABLE_ZOOM_MAX = 2.5;

const clampTableZoom = value => Math.min(TABLE_ZOOM_MAX, Math.max(TABLE_ZOOM_MIN, Number(value.toFixed(2))));

export const ResultsScreen = ({ onNavigate, responses, form, sections, people, user, labels, onSaveSections }) => (
  form?.type === "escala_organ"
    ? <EscalaResultsScreen onNavigate={onNavigate} people={people} canEdit={canEditEscala(user)} form={form} sections={sections} labels={labels} onSaveSections={onSaveSections} />
    : <PresenceResultsScreen onNavigate={onNavigate} responses={responses} form={form} labels={labels} people={people} />
);

const PresenceResultsScreen = ({ onNavigate, responses, form, labels, people }) => {
  const columns = useMemo(() => getVisibleFields(form).filter(field => !(field.type === "person_select" && isPrimaryPeopleBaseField(form, field))), [form]);
  const resultsConfig = getResultsConfig(form);
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [columnSearches, setColumnSearches] = useState({});
  const [activeSearchCol, setActiveSearchCol] = useState(null);
  const [selectedGrau, setSelectedGrau] = useState("todos");
  const [feedback, setFeedback] = useState(null);
  const [tableZoom, setTableZoom] = useState(1);
  const touchZoomRef = useRef({ distance: 0, zoom: 1 });

  const linkedPeople = hasLinkedPeopleField(form);
  const showLinkedRows = linkedPeople && resultsConfig.showLinkedRoster && people.length > 0;
  const expectedTotal = getExpectedResponses(form, people);
  const hasExpectedTotal = expectedTotal > 0;

  const handleSort = col => {
    if (sortCol === col) {
      if (sortDir === "asc") setSortDir("desc");
      else {
        setSortCol(null);
        setSortDir("asc");
      }
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const tableRows = useMemo(() => {
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
    const rosterRows = people.map(person => ({
      key: `${person.grau}-${person.name}`,
      grau: person.grau || "",
      name: person.name || "",
      status: responseByName.has(person.name) ? "Respondido" : "Pendente",
      response: responseByName.get(person.name) || null,
    }));
    return rosterRows;
  }, [people, responses, showLinkedRows]);

  const baseResponses = useMemo(() => {
    if (!showLinkedRows) {
      return responses;
    }

    const peopleNames = new Set(people.map(person => person.name));
    return responses.filter(response => peopleNames.has(response.respondentName));
  }, [people, responses, showLinkedRows]);

  const grauOptions = useMemo(() => {
    const values = [...new Set(tableRows.map(row => String(row.grau || "").trim()).filter(Boolean))];
    return values.sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [tableRows]);

  const filteredRows = useMemo(() => {
    const grauFilter = String(selectedGrau || "todos").trim();
    const rowsByGrau = grauFilter === "todos"
      ? tableRows
      : tableRows.filter(row => String(row.grau || "") === grauFilter);
    const activeFilters = Object.entries(columnSearches).filter(([, value]) => String(value || "").trim());
    if (!resultsConfig.searchEnabled || activeFilters.length === 0) return rowsByGrau;
    return rowsByGrau.filter(row => activeFilters.every(([columnId, rawValue]) => {
      const normalized = String(rawValue).trim().toLowerCase();
      if (columnId === "grau") return String(row.grau || "").toLowerCase().includes(normalized);
      if (columnId === "name") return String(row.name || "").toLowerCase().includes(normalized);
      if (columnId === "status") return String(row.status || "").toLowerCase().includes(normalized);
      const column = columns.find(item => String(item.id) === String(columnId));
      return String(formatFieldValue(getFieldValue(row.response, columnId), column?.type)).toLowerCase().includes(normalized);
    }));
  }, [columnSearches, columns, resultsConfig.searchEnabled, selectedGrau, tableRows]);

  const filteredResponses = useMemo(() => {
    if (selectedGrau === "todos") {
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
        return responseGrau === selectedGrau;
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
        return rowGrau === selectedGrau && rowName === responseName;
      });
    });
  }, [baseResponses, selectedGrau, tableRows]);

  const sorted = useMemo(() => {
    const data = [...filteredRows];
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
  }, [filteredRows, sortCol, sortDir]);

  const totals = useMemo(() => {
    const result = {};
    for (const col of columns) {
      if (col.type === "yes_no") {
        result[col.id] = {
          sim: filteredResponses.filter(response => getFieldValue(response, col.id) === "Sim").length,
          nao: filteredResponses.filter(response => NO_VALUES.includes(getFieldValue(response, col.id))).length,
        };
      } else if (col.type === "number") {
        result[col.id] = {
          sum: filteredResponses.reduce((sum, response) => sum + Number(getFieldValue(response, col.id) || 0), 0),
        };
      }
    }
    return result;
  }, [columns, filteredResponses]);

  const totalsLayout = useMemo(() => {
    const configured = resultsConfig.totalsLayout
      .map(item => ({ ...item, field: columns.find(col => String(col.id) === String(item.fieldId)) }))
      .filter(item => item.field);

    if (configured.length > 0) return configured;

    return columns
      .filter(col => col.total)
      .map(col => ({ fieldId: col.id, style: col.type === "yes_no" ? "split" : "number", field: col }));
  }, [columns, resultsConfig.totalsLayout]);

  const tableMinWidth = useMemo(() => {
    const base = showLinkedRows ? 350 : 240;
    const dynamic = columns.length * 160;
    return Math.max(960, base + dynamic);
  }, [columns.length, showLinkedRows]);

  const filterButtons = useMemo(() => {
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
  }, [columns, linkedPeople, showLinkedRows]);

  const activeFilter = filterButtons.find(item => item.id === activeSearchCol) || null;
  const activeFilterLabel = activeFilter?.label || "";
  const zoomPercent = Math.round(tableZoom * 100);
  const getTouchDistance = touches => {
    if (touches.length < 2) return 0;
    const [first, second] = touches;
    return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
  };
  const handleTableWheel = event => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    const zoomFactor = Math.exp(-event.deltaY * 0.0015);
    setTableZoom(current => clampTableZoom(current * zoomFactor));
  };
  const handleTableTouchStart = event => {
    if (event.touches.length !== 2) return;
    touchZoomRef.current = { distance: getTouchDistance(event.touches), zoom: tableZoom };
  };
  const handleTableTouchMove = event => {
    if (event.touches.length !== 2 || !touchZoomRef.current.distance) return;
    event.preventDefault();
    const nextDistance = getTouchDistance(event.touches);
    setTableZoom(clampTableZoom(touchZoomRef.current.zoom * (nextDistance / touchZoomRef.current.distance)));
  };
  const handleTableTouchEnd = event => {
    if (event.touches.length < 2) {
      touchZoomRef.current = { distance: 0, zoom: tableZoom };
    }
  };

  const activeFilterOptions = useMemo(() => {
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
  }, [activeFilter, columnSearches, columns, selectedGrau, tableRows]);

  const exportCsv = () => {
    const headers = ["Grau", "Nome", ...(showLinkedRows ? ["Status"] : []), ...columns.map(col => col.label)];
    const escape = value => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const rows = sorted.map(row => [
      row.grau,
      row.name,
      ...(showLinkedRows ? [row.status] : []),
      ...columns.map(col => formatFieldValue(getFieldValue(row.response, col.id), col.type)),
    ]);
    const csv = [headers, ...rows].map(row => row.map(escape).join(";")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${form.slug}-resultados.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setFeedback({ tone: "success", message: "CSV exportado com sucesso." });
  };

  const sortIndicator = col => sortCol !== col ? <Icon name="sortNone" size={11} /> : sortDir === "asc" ? <Icon name="sortAsc" size={11} /> : <Icon name="sortDesc" size={11} />;
  const headerCellStyle = col => ({
    padding: "10px 12px",
    textAlign: ["grau", "name", "status"].includes(col) ? "left" : "center",
    color: "#fff",
    fontWeight: 600,
    whiteSpace: "nowrap",
    cursor: "pointer",
    userSelect: "none",
    background: sortCol === col ? COLORS.primaryDark : COLORS.primary,
    transition: "background 0.15s",
    verticalAlign: "top",
    minWidth: col === "grau" ? 90 : col === "name" ? 160 : col === "status" ? 110 : 130,
  });

  const stats = hasExpectedTotal
    ? [
        { l: "Respostas", v: filteredResponses.length, s: `de ${selectedGrau === "todos" ? expectedTotal : filteredRows.length}`, c: COLORS.primary },
        { l: "Faltam", v: Math.max((selectedGrau === "todos" ? expectedTotal : filteredRows.length) - filteredResponses.length, 0), s: "pendentes", c: COLORS.danger },
      ]
    : [
        { l: "Respostas", v: filteredResponses.length, s: "recebidas", c: COLORS.primary },
        { l: "Campos totalizaveis", v: totalsLayout.length, s: "configurados", c: COLORS.accent },
        { l: "Base vinculada", v: linkedPeople ? "Sim" : "Nao", s: linkedPeople ? `${people.length} pessoas` : "sem controle de faltantes", c: COLORS.textSecondary },
      ];

  return (
    <div>
      <ResultsPresenceHeader
        onNavigate={onNavigate}
        form={form}
        labels={labels}
        grauOptions={linkedPeople ? grauOptions : []}
        selectedGrau={selectedGrau}
        onSelectGrau={setSelectedGrau}
        stats={stats}
        onExport={exportCsv}
      />
      {feedback && <div style={{ marginBottom: 12 }}><FeedbackBanner tone={feedback.tone} message={feedback.message} fixed /></div>}
      <div className="totals-panel" style={{ background: COLORS.surface, borderRadius: 10, padding: 16, marginBottom: 12, border: `1px solid ${COLORS.borderLight}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.text }}>Totalizacao</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{totalsLayout.length} indicador{totalsLayout.length !== 1 ? "es" : ""} configurado{totalsLayout.length !== 1 ? "s" : ""}</div>
          </div>
          <div style={{ fontSize: 11, color: COLORS.textMuted }}>{filteredResponses.length} resposta{filteredResponses.length !== 1 ? "s" : ""}</div>
        </div>
        <div className="totals-grid">
          {totalsLayout.map(item => {
            const col = item.field;
            if (!col) return null;
            if (totals[col.id]?.sim !== undefined) {
              const { sim, nao } = totals[col.id];
              return (
                <div key={col.id} className="total-card total-card-bar" style={{ padding: 18, minHeight: 104 }}>
                  <div className="total-card-title" style={{ fontSize: 13, marginBottom: 12 }}>{col.label}</div>
                  <div className="total-split" style={{ gap: 18, justifyContent: "space-between" }}>
                    <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <strong style={{ fontSize: 24, lineHeight: 1, color: COLORS.accent }}>{sim}</strong>
                      <span style={{ fontSize: 12, color: COLORS.textMuted }}>Sim</span>
                    </span>
                    <span style={{ display: "flex", flexDirection: "column", gap: 2, textAlign: "right" }}>
                      <strong style={{ fontSize: 24, lineHeight: 1, color: COLORS.danger }}>{nao}</strong>
                      <span style={{ fontSize: 12, color: COLORS.textMuted }}>Nao</span>
                    </span>
                  </div>
                </div>
              );
            }
            if (totals[col.id]?.sum !== undefined) {
              return (
                <div key={col.id} className="total-card total-card-number" style={{ padding: 18, minHeight: 104 }}>
                  <div className="total-card-title" style={{ fontSize: 13, marginBottom: 12 }}>{col.label}</div>
                  <div className="total-number" style={{ fontSize: 28, lineHeight: 1.1 }}>{totals[col.id].sum}</div>
                  <div className="total-caption" style={{ marginTop: 8 }}>total informado</div>
                </div>
              );
            }
            return null;
          })}
        </div>
      </div>

      {resultsConfig.searchEnabled && (
        <div
          className="results-filter-toolbar"
          style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.borderLight}`,
            borderRadius: 12,
            padding: 14,
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, marginBottom: 10 }}>Filtros da planilha</div>
          <div className="results-filter-toolbar-row" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {filterButtons.map(item => (
              <Btn
                key={item.id}
                v={activeSearchCol === item.id ? "primary" : "secondary"}
                sz="sm"
                onClick={() => setActiveSearchCol(current => current === item.id ? null : item.id)}
              >
                {item.label}
              </Btn>
            ))}
            {Object.values(columnSearches).some(value => String(value || "").trim()) && (
              <Btn
                v="ghost"
                sz="sm"
                onClick={() => {
                  setColumnSearches({});
                  setActiveSearchCol(null);
                }}
              >
                Limpar filtros
              </Btn>
            )}
          </div>
          {activeSearchCol && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 12, flexWrap: "wrap" }}>
              {activeFilter?.type === "select"
                ? (
                  <select
                    value={columnSearches[activeSearchCol] || ""}
                    onChange={event => setColumnSearches(prev => ({ ...prev, [activeSearchCol]: event.target.value }))}
                    style={{
                      flex: "1 1 240px",
                      minWidth: 0,
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: `1px solid ${COLORS.border}`,
                      background: COLORS.surfaceAlt,
                      color: COLORS.text,
                      fontFamily: "inherit",
                    }}
                  >
                    <option value="">Todos os valores de {activeFilterLabel.toLowerCase()}</option>
                    {activeFilterOptions.map(option => <option key={option} value={option}>{option}</option>)}
                  </select>
                )
                : (
                  <input
                    value={columnSearches[activeSearchCol] || ""}
                    onChange={event => setColumnSearches(prev => ({ ...prev, [activeSearchCol]: event.target.value }))}
                    placeholder={`Filtrar ${activeFilterLabel.toLowerCase()}...`}
                    style={{
                      flex: "1 1 240px",
                      minWidth: 0,
                      padding: "10px 12px",
                      borderRadius: 10,
                      border: `1px solid ${COLORS.border}`,
                      background: COLORS.surfaceAlt,
                      color: COLORS.text,
                      fontFamily: "inherit",
                    }}
                  />
                )}
              <Btn
                v="secondary"
                sz="sm"
                onClick={() => setColumnSearches(prev => ({ ...prev, [activeSearchCol]: "" }))}
              >
                Limpar
              </Btn>
            </div>
          )}
        </div>
      )}

      <div className="results-sheet-toolbar" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
        <div className="results-zoom-indicator" style={{ fontSize: 12, fontWeight: 800, color: COLORS.textSecondary }}>
          Zoom {zoomPercent}%
        </div>
      </div>

      <div
        className="results-table-shell"
        onWheel={handleTableWheel}
        onTouchStart={handleTableTouchStart}
        onTouchMove={handleTableTouchMove}
        onTouchEnd={handleTableTouchEnd}
        onTouchCancel={handleTableTouchEnd}
        style={{ width: "100%", maxWidth: "100%", display: "block", overflow: "auto", WebkitOverflowScrolling: "touch", touchAction: "auto", overscrollBehavior: "contain", borderRadius: 10, border: `1px solid ${COLORS.borderLight}` }}
      >
        <div className="results-table-stage" style={{ width: "max-content", minWidth: `${tableMinWidth}px`, zoom: tableZoom }}>
        <table className="results-table" style={{ width: "100%", minWidth: `${tableMinWidth}px`, borderCollapse: "collapse", fontSize: 12, tableLayout: "auto", userSelect: "text", WebkitUserSelect: "text" }}>
          <thead>
            <tr>
              <th className="results-sticky-col results-sticky-grau" onClick={() => handleSort("grau")} style={{ ...headerCellStyle("grau"), position: "sticky", left: 0, zIndex: 2 }}>
                <ColumnHeader label="Grau" sortIndicator={sortIndicator("grau")} />
              </th>
              <th className="results-sticky-col results-sticky-name" onClick={() => handleSort("name")} style={{ ...headerCellStyle("name"), position: "sticky", left: 42, zIndex: 2 }}>
                <ColumnHeader label="Nome" sortIndicator={sortIndicator("name")} />
              </th>
              {showLinkedRows && (
                <th onClick={() => handleSort("status")} style={headerCellStyle("status")}>
                  <ColumnHeader label="Status" sortIndicator={sortIndicator("status")} />
                </th>
              )}
              {columns.map(col => (
                <th key={col.id} onClick={() => handleSort(col.id)} style={headerCellStyle(col.id)}>
                  <ColumnHeader label={col.label} sortIndicator={sortIndicator(col.id)} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, index) => (
              <tr key={row.key} style={{ background: index % 2 ? COLORS.surfaceAlt : COLORS.surface }}>
                <td className="results-sticky-col results-sticky-grau" style={{ padding: "8px 12px", fontWeight: 600, color: COLORS.textSecondary, position: "sticky", left: 0, background: index % 2 ? COLORS.surfaceAlt : COLORS.surface, zIndex: 1, minWidth: 90, userSelect: "text", WebkitUserSelect: "text" }}>{row.grau}</td>
                <td className="results-sticky-col results-sticky-name" style={{ padding: "8px 12px", fontWeight: 500, whiteSpace: "nowrap", position: "sticky", left: 42, background: index % 2 ? COLORS.surfaceAlt : COLORS.surface, zIndex: 1, minWidth: 160, userSelect: "text", WebkitUserSelect: "text" }}>{row.name}</td>
                {showLinkedRows && (
                  <td style={{ padding: "8px 12px", fontWeight: 700, color: row.status === "Respondido" ? COLORS.accent : row.status === "Extra" ? COLORS.warning : COLORS.danger, minWidth: 110, userSelect: "text", WebkitUserSelect: "text" }}>
                    {row.status}
                  </td>
                )}
                {columns.map(col => {
                  const value = getFieldValue(row.response, col.id);
                  const bool = value === "Sim" || NO_VALUES.includes(value);
                  return <td key={col.id} style={{ padding: "8px 12px", textAlign: "center", fontWeight: 500, color: bool ? (value === "Sim" ? COLORS.accent : COLORS.danger) : COLORS.text, minWidth: 130, whiteSpace: "nowrap", userSelect: "text", WebkitUserSelect: "text" }}>{formatFieldValue(value, col.type)}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 8, textAlign: "right" }}>
        Exibindo {sorted.length} de {tableRows.length} linhas{hasExpectedTotal ? ` • Total esperado: ${selectedGrau === "todos" ? expectedTotal : filteredRows.length}` : ""}
      </div>
    </div>
  );
};

const ColumnHeader = ({ label, sortIndicator }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
    <span>{label}</span>
    {sortIndicator}
  </div>
);

const EscalaResultsScreen = ({ onNavigate, people, canEdit, form, sections, labels, onSaveSections }) => {
  const [showSignup, setShowSignup] = useState(false);
  const [selSlot, setSelSlot] = useState(null);
  const [signName, setSignName] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [busyAction, setBusyAction] = useState(null);
  const [pendingRemoval, setPendingRemoval] = useState(null);
  const names = people.map(person => person.name);
  const total = sections.reduce((sum, section) => sum + section.slots.length, 0);
  const filled = sections.reduce((sum, section) => sum + section.slots.filter(slot => slot.person).length, 0);

  const persistSections = async (next, successMessage = "Alterações salvas.") => {
    setFeedback({ tone: "loading", message: "Salvando escala..." });
    await onSaveSections(next);
    setFeedback({ tone: "success", message: successMessage });
  };

  const clickSlot = (sectionIndex, slotIndex) => {
    if (!canEdit) return;
    if (!sections[sectionIndex].slots[slotIndex].person) {
      setSelSlot({ sectionIndex, slotIndex });
      setShowSignup(true);
      setSignName("");
    }
  };

  const signup = async () => {
    if (!signName || !selSlot) return;
    const next = sections.map((section, sectionIndex) => sectionIndex === selSlot.sectionIndex ? {
      ...section,
      slots: section.slots.map((slot, slotIndex) => slotIndex === selSlot.slotIndex ? { ...slot, person: signName } : slot),
    } : section);
    setBusyAction("signup");
    try {
      await persistSections(next, "Vaga preenchida com sucesso.");
      setShowSignup(false);
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setBusyAction(null);
    }
  };

  const remove = async (sectionIndex, slotIndex) => {
    setPendingRemoval({ sectionIndex, slotIndex });
  };

  const confirmRemoval = async () => {
    if (!pendingRemoval) return;
    const { sectionIndex, slotIndex } = pendingRemoval;
    const next = sections.map((section, currentSectionIndex) => currentSectionIndex === sectionIndex ? {
      ...section,
      slots: section.slots.map((slot, currentSlotIndex) => currentSlotIndex === slotIndex ? { ...slot, person: "" } : slot),
    } : section);
    setBusyAction("remove");
    try {
      await persistSections(next, "Vaga excluída com sucesso.");
      setPendingRemoval(null);
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setBusyAction(null);
    }
  };

  const updateSlot = async (sectionIndex, slotIndex, patch) => {
    const next = sections.map((section, currentSectionIndex) => currentSectionIndex === sectionIndex ? {
      ...section,
      slots: section.slots.map((slot, currentSlotIndex) => currentSlotIndex === slotIndex ? { ...slot, ...patch } : slot),
    } : section);
    setBusyAction("update");
    try {
      await persistSections(next);
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setBusyAction(null);
    }
  };

  const addSlot = async sectionIndex => {
    const next = sections.map((section, currentSectionIndex) => currentSectionIndex === sectionIndex ? { ...section, slots: [...section.slots, { role: "Auxiliar", person: "" }] } : section);
    setBusyAction("add");
    try {
      await persistSections(next);
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setBusyAction(null);
    }
  };

  const exportCsv = () => {
    const headers = ["Secao", "Funcao", "Pessoa", "Status"];
    const escape = value => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const rows = sections.flatMap(section => section.slots.map(slot => [section.title, slot.role, slot.person || "", slot.person ? "Preenchida" : "Pendente"]));
    const csv = [headers, ...rows].map(row => row.map(escape).join(";")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${form.slug}-escala.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setFeedback({ tone: "success", message: "CSV exportado com sucesso." });
  };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Btn v="ghost" icon="back" onClick={() => onNavigate("list")} />
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 22 }}>{form.title}</h2>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6, flexWrap: "wrap" }}>
              <StatusBadge status={form.status} />
              {form.labels.map(labelId => <Badge key={labelId} label={labelId} labels={labels} small />)}
              <span style={{ fontSize: 11, color: COLORS.textMuted }}>Fecha: {formatDateTime(form.closing)}</span>
            </div>
          </div>
          <Btn v="secondary" icon="download" sz="sm" onClick={exportCsv}>Exportar</Btn>
        </div>
        {feedback && <div style={{ marginTop: 10 }}><FeedbackBanner tone={feedback.tone} message={feedback.message} fixed /></div>}
      </div>
      {!canEdit && (
        <div style={{ background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 10, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: "#795548", display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name="lock" size={14} />
          Voce nao tem permissao para editar esta escala. Apenas administradores podem fazer alteracoes.
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 10, padding: "12px 16px", textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 700, color: COLORS.primary }}>{filled}</div><div style={{ fontSize: 11, color: COLORS.textMuted }}>Preenchidas</div></div>
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 10, padding: "12px 16px", textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 700, color: COLORS.danger }}>{total - filled}</div><div style={{ fontSize: 11, color: COLORS.textMuted }}>Pendentes</div></div>
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 10, padding: "12px 16px", textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 700, color: COLORS.textSecondary }}>{total}</div><div style={{ fontSize: 11, color: COLORS.textMuted }}>Total</div></div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${COLORS.borderLight}` }}>
            <div style={{ background: section.color, padding: "10px 16px" }}><h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#333" }}>{section.title}</h3></div>
            <div style={{ background: COLORS.surface }}>
              {section.slots.map((slot, slotIndex) => (
                <div key={slotIndex} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 16px", borderBottom: slotIndex < section.slots.length - 1 ? `1px solid ${COLORS.borderLight}` : "none", cursor: canEdit && !slot.person ? "pointer" : "default", transition: "background 0.15s" }} onClick={() => clickSlot(sectionIndex, slotIndex)}>
                  {canEdit ? (
                    <select value={slot.role} onClick={event => event.stopPropagation()} onChange={event => updateSlot(sectionIndex, slotIndex, { role: event.target.value })} style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, width: 110, flexShrink: 0, border: `1px solid ${COLORS.borderLight}`, borderRadius: 6, padding: "5px 6px", background: COLORS.surface }}>
                      <option>Responsavel</option>
                      <option>Auxiliar</option>
                    </select>
                  ) : (
                    <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, width: 110, flexShrink: 0 }}>{slot.role}</span>
                  )}
                  {slot.person ? (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: COLORS.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.primary }}><Icon name="user" size={12} /></div>
                        {canEdit ? (
                          <select value={slot.person} onClick={event => event.stopPropagation()} onChange={event => updateSlot(sectionIndex, slotIndex, { person: event.target.value })} style={{ border: `1px solid ${COLORS.borderLight}`, borderRadius: 6, padding: "6px 8px", fontSize: 13, fontWeight: 500, minWidth: 260, background: COLORS.surface }}>
                            <option value="">Pendente</option>
                            {people.map(person => <option key={person.name} value={person.name}>{person.name}</option>)}
                          </select>
                        ) : (
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{slot.person}</span>
                        )}
                      </div>
                      {canEdit && <button aria-label={`Remover vaga ${section.title} ${slot.role}`} disabled={busyAction === "remove"} onClick={event => { event.stopPropagation(); remove(sectionIndex, slotIndex); }} style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: busyAction === "remove" ? "not-allowed" : "pointer", padding: 4, opacity: busyAction === "remove" ? 0.3 : 0.5 }}><Icon name="close" size={12} /></button>}
                    </div>
                  ) : (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", border: `2px dashed ${COLORS.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.textMuted }}><Icon name={canEdit ? "plus" : "user"} size={10} /></div>
                      <span style={{ fontSize: 12, color: COLORS.textMuted, fontStyle: "italic" }}>{canEdit ? "Pendente - selecione um nome" : "Pendente"}</span>
                      {canEdit && (
                        <select value={slot.person} onClick={event => event.stopPropagation()} onChange={event => updateSlot(sectionIndex, slotIndex, { person: event.target.value })} style={{ border: `1px solid ${COLORS.borderLight}`, borderRadius: 6, padding: "6px 8px", fontSize: 13, minWidth: 260, background: COLORS.surface }}>
                          <option value="">Pendente</option>
                          {people.map(person => <option key={person.name} value={person.name}>{person.name}</option>)}
                        </select>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {canEdit && (
                <div style={{ padding: "8px 16px", background: COLORS.surfaceAlt }}>
                  <Btn v="secondary" icon="plus" sz="sm" onClick={() => addSlot(sectionIndex)} loading={busyAction === "add"}>Adicionar vaga nesta secao</Btn>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {showSignup && selSlot && canEdit && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: COLORS.surface, borderRadius: 16, padding: 24, width: 400, maxWidth: "90vw" }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>Inscrever-se na vaga</h3>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: COLORS.textSecondary }}><strong>{sections[selSlot.sectionIndex].title}</strong> - {sections[selSlot.sectionIndex].slots[selSlot.slotIndex].role}</p>
            <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, display: "block", marginBottom: 6 }}>Selecione seu nome</label>
            <select value={signName} onChange={event => setSignName(event.target.value)} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 14, fontFamily: "inherit", background: COLORS.surface, boxSizing: "border-box", marginBottom: 16 }}>
              <option value="">Selecione...</option>{names.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}><Btn v="secondary" onClick={() => { setShowSignup(false); setSelSlot(null); }} disabled={busyAction === "signup"}>Cancelar</Btn><Btn icon="check" onClick={signup} disabled={!signName} loading={busyAction === "signup"}>Confirmar</Btn></div>
          </div>
        </div>
      )}
      <ConfirmModal
        open={Boolean(pendingRemoval)}
        title="Remover vaga"
        message="Tem certeza que deseja remover a pessoa desta vaga? A alteração será salva imediatamente."
        confirmLabel="Remover"
        tone="danger"
        busy={busyAction === "remove"}
        onCancel={() => setPendingRemoval(null)}
        onConfirm={confirmRemoval}
      />
    </div>
  );
};

const formatFieldValue = (value, type) => {
  if (value === undefined || value === null || value === "") return "";
  if (type === "grid") return Object.entries(value).map(([row, col]) => `${row}: ${col}`).join(" | ");
  return value;
};
