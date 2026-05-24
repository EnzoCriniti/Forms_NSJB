/**
 * @file frontend/src/screens/PresenceResultsScreen.jsx
 * @summary Controller da planilha de resultados de presenca.
 */

import React, { useMemo, useRef, useState } from "react";
import { COLORS, Icon } from "../components/ui";
import { downloadCsv } from "../lib/downloadCsv";
import { getExpectedResponses, getFieldValue, getResultsConfig, getVisibleFields, hasLinkedPeopleField, isPrimaryPeopleBaseField } from "../lib/forms";
import { PresenceResultsPanel } from "./resultsPanels";
import {
  NO_VALUES,
  TABLE_ZOOM_STEP,
  attachPresenceTotalsSummary,
  buildActiveFilterOptions,
  buildPresenceBaseResponses,
  buildPresenceCsv,
  buildPresenceFilterButtons,
  buildPresenceGrauOptions,
  buildPresenceStats,
  buildPresenceTableMinWidth,
  buildPresenceTableRows,
  buildPresenceTotals,
  buildPresenceTotalsLayout,
  clampTableZoom,
  filterPresenceResponses,
  filterPresenceRows,
  formatResultFieldValue,
  sortPresenceRows,
} from "./resultsDomain";

export const PresenceResultsScreen = ({ responses, form, people, publicFormHref, readingControls }) => {
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

  const tableRows = useMemo(() => buildPresenceTableRows({ responses, people, showLinkedRows }), [people, responses, showLinkedRows]);
  const baseResponses = useMemo(() => buildPresenceBaseResponses({ responses, people, showLinkedRows }), [people, responses, showLinkedRows]);
  const grauOptions = useMemo(() => buildPresenceGrauOptions({ tableRows }), [tableRows]);
  const filteredRows = useMemo(() => filterPresenceRows({
    tableRows,
    selectedGrau,
    columnSearches,
    columns,
    searchEnabled: resultsConfig.searchEnabled,
    getFieldValue,
    formatFieldValue: formatResultFieldValue,
  }), [columnSearches, columns, resultsConfig.searchEnabled, selectedGrau, tableRows]);
  const filteredResponses = useMemo(() => filterPresenceResponses({ baseResponses, selectedGrau, tableRows }), [baseResponses, selectedGrau, tableRows]);
  const sorted = useMemo(() => sortPresenceRows({ rows: filteredRows, sortCol, sortDir, getFieldValue }), [filteredRows, sortCol, sortDir]);
  const totals = useMemo(() => buildPresenceTotals({ columns, responses: filteredResponses, getFieldValue }), [columns, filteredResponses]);
  const totalsLayout = useMemo(() => buildPresenceTotalsLayout({ columns, totalsLayout: resultsConfig.totalsLayout }), [columns, resultsConfig.totalsLayout]);
  const tableMinWidth = useMemo(() => buildPresenceTableMinWidth({ columnsLength: columns.length, showLinkedRows }), [columns.length, showLinkedRows]);
  const filterButtons = useMemo(() => buildPresenceFilterButtons({ columns, linkedPeople, showLinkedRows }), [columns, linkedPeople, showLinkedRows]);
  const activeFilter = filterButtons.find(item => item.id === activeSearchCol) || null;
  const activeFilterLabel = activeFilter?.label || "";
  const activeFilterOptions = useMemo(() => buildActiveFilterOptions({
    activeFilter,
    columnSearches,
    columns,
    selectedGrau,
    tableRows,
    formatFieldValue: formatResultFieldValue,
    getFieldValue,
  }), [activeFilter, columnSearches, columns, selectedGrau, tableRows]);
  const stats = buildPresenceStats({
    hasExpectedTotal,
    filteredResponsesLength: filteredResponses.length,
    selectedGrau,
    expectedTotal,
    filteredRowsLength: filteredRows.length,
    totalsLayoutLength: totalsLayout.length,
    linkedPeople,
    peopleLength: people.length,
  });
  const totalsWithSummary = attachPresenceTotalsSummary({ totalsLayout, totals });

  const updateTableZoom = direction => {
    setTableZoom(current => clampTableZoom(current + (direction * TABLE_ZOOM_STEP)));
  };
  const getTouchDistance = touches => {
    if (touches.length < 2) return 0;
    const [first, second] = touches;
    return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
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

  const exportCsv = () => {
    const csv = buildPresenceCsv({
      columns,
      rows: sorted,
      showLinkedRows,
      getFieldValue,
      formatFieldValue: formatResultFieldValue,
    });
    downloadCsv({ csv, filename: `${form.slug}-resultados.csv` });
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

  return (
    <PresenceResultsPanel
      publicFormHref={publicFormHref}
      readingControls={readingControls}
      linkedPeople={linkedPeople}
      grauOptions={grauOptions}
      selectedGrau={selectedGrau}
      onSelectGrau={setSelectedGrau}
      stats={stats}
      feedback={feedback}
      totalsLayout={totalsWithSummary}
      filteredResponses={filteredResponses}
      tableRows={tableRows}
      sorted={sorted}
      showLinkedRows={showLinkedRows}
      columns={columns}
      resultsConfig={resultsConfig}
      tableMinWidth={tableMinWidth}
      tableZoom={tableZoom}
      onZoomChange={updateTableZoom}
      onResetZoom={() => setTableZoom(1)}
      onExportCsv={exportCsv}
      filterButtons={filterButtons}
      activeSearchCol={activeSearchCol}
      onToggleSearchCol={col => setActiveSearchCol(current => current === col ? null : col)}
      activeFilter={activeFilter}
      activeFilterLabel={activeFilterLabel}
      activeFilterOptions={activeFilterOptions}
      columnSearches={columnSearches}
      onChangeColumnSearch={(col, value) => setColumnSearches(prev => ({ ...prev, [col]: value }))}
      onClearFilters={() => {
        setColumnSearches({});
        setActiveSearchCol(null);
      }}
      onClearColumnSearch={col => setColumnSearches(prev => ({ ...prev, [col]: "" }))}
      handleTableTouchStart={handleTableTouchStart}
      handleTableTouchMove={handleTableTouchMove}
      handleTableTouchEnd={handleTableTouchEnd}
      headerCellStyle={headerCellStyle}
      sortIndicator={sortIndicator}
      onSort={handleSort}
      formatFieldValue={formatResultFieldValue}
      getFieldValue={getFieldValue}
      NO_VALUES={NO_VALUES}
    />
  );
};
