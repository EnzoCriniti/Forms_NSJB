/**
 * @file frontend/src/screens/presenceResultsController.js
 * @summary Controller local da planilha de resultados de presenca.
 */

import React, { useMemo, useState } from "react";
import { COLORS, Icon } from "../components/ui";
import { downloadCsv } from "../lib/downloadCsv";
import { getExpectedResponses, getFieldValue, getResultsConfig, getVisibleFields, hasLinkedPeopleField, isPrimaryPeopleBaseField } from "../lib/forms";
import { usePresenceTableZoomController } from "./presenceTableZoomController";
import {
  buildPresenceCsv,
  formatResultFieldValue,
} from "./resultsCsv";
import {
  NO_VALUES,
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
  filterPresenceResponses,
  filterPresenceRows,
  getPresenceSortIconName,
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
  const tableZoomController = usePresenceTableZoomController();

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
    handleTableTouchEnd: tableZoomController.handleTableTouchEnd,
    handleTableTouchMove: tableZoomController.handleTableTouchMove,
    handleTableTouchStart: tableZoomController.handleTableTouchStart,
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
    onResetZoom: tableZoomController.onResetZoom,
    onSelectGrau: setSelectedGrau,
    onSort: handleSort,
    onToggleSearchCol: col => setActiveSearchCol(current => current === col ? null : col),
    onZoomChange: tableZoomController.onZoomChange,
    resultsConfig,
    selectedGrau,
    showLinkedRows,
    sortIndicator,
    sorted,
    stats,
    tableMinWidth,
    tableRows,
    tableZoom: tableZoomController.tableZoom,
    totalsLayout: totalsWithSummary,
  };
};
