/**
 * @file frontend/src/screens/presenceResultsController.js
 * @summary Controller local da planilha de resultados de presenca.
 */

import React, { useMemo, useRef, useState } from "react";
import { COLORS, Icon } from "../components/ui";
import { downloadCsv } from "../lib/downloadCsv";
import { getExpectedResponses, getFieldValue, getResultsConfig, getVisibleFields, hasLinkedPeopleField, isPrimaryPeopleBaseField } from "../lib/forms";
import {
  buildPresenceCsv,
  formatResultFieldValue,
} from "./resultsCsv";
import {
  NO_VALUES,
  TABLE_ZOOM_STEP,
  attachPresenceTotalsSummary,
  buildActiveFilterOptions,
  buildPresenceBaseResponses,
  buildPresenceFilterButtons,
  buildPresenceGrauOptions,
  buildPresenceHeaderCellStyle,
  buildPresenceStats,
  buildPresenceTableMinWidth,
  buildPresenceTableRows,
  buildPresenceTotals,
  buildPresenceTotalsLayout,
  clampTableZoom,
  filterPresenceResponses,
  filterPresenceRows,
  getPresenceSortIconName,
  getPresenceTouchDistance,
  resolvePresenceSortState,
  sortPresenceRows,
} from "./resultsPresenceDomain";

export const usePresenceResultsController = ({ responses, form, people }) => {
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
    const next = resolvePresenceSortState({ sortCol, sortDir, nextCol: col });
    setSortCol(next.sortCol);
    setSortDir(next.sortDir);
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
  const handleTableTouchStart = event => {
    if (event.touches.length !== 2) return;
    touchZoomRef.current = { distance: getPresenceTouchDistance(event.touches), zoom: tableZoom };
  };
  const handleTableTouchMove = event => {
    if (event.touches.length !== 2 || !touchZoomRef.current.distance) return;
    event.preventDefault();
    const nextDistance = getPresenceTouchDistance(event.touches);
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

  const sortIndicator = col => React.createElement(Icon, {
    name: getPresenceSortIconName({ sortCol, sortDir, col }),
    size: 11,
  });
  const headerCellStyle = col => buildPresenceHeaderCellStyle({ col, sortCol, colors: COLORS });

  return {
    activeFilter,
    activeFilterLabel,
    activeFilterOptions,
    activeSearchCol,
    columnSearches,
    columns,
    feedback,
    filteredResponses,
    filterButtons,
    formatFieldValue: formatResultFieldValue,
    getFieldValue,
    grauOptions,
    handleTableTouchEnd,
    handleTableTouchMove,
    handleTableTouchStart,
    headerCellStyle,
    linkedPeople,
    NO_VALUES,
    onChangeColumnSearch: (col, value) => setColumnSearches(prev => ({ ...prev, [col]: value })),
    onClearColumnSearch: col => setColumnSearches(prev => ({ ...prev, [col]: "" })),
    onClearFilters: () => {
      setColumnSearches({});
      setActiveSearchCol(null);
    },
    onExportCsv: exportCsv,
    onResetZoom: () => setTableZoom(1),
    onSelectGrau: setSelectedGrau,
    onSort: handleSort,
    onToggleSearchCol: col => setActiveSearchCol(current => current === col ? null : col),
    onZoomChange: updateTableZoom,
    resultsConfig,
    selectedGrau,
    showLinkedRows,
    sortIndicator,
    sorted,
    stats,
    tableMinWidth,
    tableRows,
    tableZoom,
    totalsLayout: totalsWithSummary,
  };
};
