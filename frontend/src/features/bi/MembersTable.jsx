/**
 * @file frontend/src/features/bi/MembersTable.jsx
 * @summary Tabela de participação por sócio (ordenável, paginada, clicável).
 * @responsibility Visão densa "tipo relatório" da base, derivada do overview do BI.
 * Cada linha abre o perfil do sócio.
 */

import React, { useEffect, useMemo, useState } from "react";
import { COLORS, Btn, Icon } from "../../components/ui";
import { rate, formatPercent, formatDuration, formatDate } from "./biDomain";

const PAGE_SIZE = 12;

const COLUMNS = [
  { key: "personName", label: "Sócio", align: "left" },
  { key: "grau", label: "Grau", align: "left" },
  { key: "expected", label: "Esperados", align: "right" },
  { key: "filled", label: "Preencheu", align: "right" },
  { key: "exempted", label: "Disp.", align: "right" },
  { key: "missed", label: "Faltas", align: "right" },
  { key: "fillRate", label: "% Presença", align: "right" },
  { key: "escalaCount", label: "Escala", align: "right" },
  { key: "avgTimeToFillMinutes", label: "Tempo médio", align: "right" },
  { key: "lastFilledAt", label: "Último", align: "right" },
];

const toRow = member => {
  const expected = member.presencaExpected || 0;
  const filled = member.presencaFilled || 0;
  return {
    personKey: member.personKey,
    personName: member.personName,
    grau: member.grau || "",
    expected,
    filled,
    exempted: member.presencaExempted || 0,
    missed: Math.max(expected - filled, 0),
    fillRate: rate(filled, expected),
    escalaCount: member.escalaCount || 0,
    avgTimeToFillMinutes: member.avgTimeToFillMinutes ?? null,
    lastFilledAt: member.lastFilledAt || null,
  };
};

const sortValue = (row, key) => {
  if (key === "personName") return row.personName.toLowerCase();
  if (key === "avgTimeToFillMinutes") return row.avgTimeToFillMinutes ?? Number.POSITIVE_INFINITY;
  if (key === "lastFilledAt") return row.lastFilledAt || "";
  return row[key];
};

export const MembersTable = ({ members = [], onSelect }) => {
  const [sortKey, setSortKey] = useState("missed");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => members.map(toRow), [members]);
  const sorted = useMemo(() => {
    const factor = sortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const left = sortValue(a, sortKey);
      const right = sortValue(b, sortKey);
      if (left < right) return -1 * factor;
      if (left > right) return 1 * factor;
      return a.personName.localeCompare(b.personName, "pt-BR");
    });
  }, [rows, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [sortKey, sortDir, members]);

  const onSort = key => {
    if (key === sortKey) { setSortDir(current => (current === "asc" ? "desc" : "asc")); return; }
    setSortKey(key);
    setSortDir(key === "personName" || key === "grau" ? "asc" : "desc");
  };
  const sortIcon = key => (key !== sortKey ? "sortNone" : sortDir === "asc" ? "sortAsc" : "sortDesc");

  if (rows.length === 0) {
    return <div className="bi-empty">Nenhum sócio para o filtro atual.</div>;
  }

  return (
    <>
      <div className="bi-table-scroll">
        <table className="bi-table">
          <thead>
            <tr>
              {COLUMNS.map(col => (
                <th key={col.key} onClick={() => onSort(col.key)} style={{ textAlign: col.align, cursor: "pointer" }}>
                  <span className="bi-th-inner" style={{ flexDirection: col.align === "right" ? "row-reverse" : "row" }}>
                    {col.label}<Icon name={sortIcon(col.key)} size={11} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map(row => (
              <tr key={row.personKey} className="bi-table-row" onClick={() => onSelect?.(row.personKey)}>
                <td style={{ fontWeight: 600 }}>{row.personName}</td>
                <td style={{ color: COLORS.textMuted }}>{row.grau || "—"}</td>
                <td style={{ textAlign: "right" }}>{row.expected}</td>
                <td style={{ textAlign: "right", color: COLORS.primary, fontWeight: 700 }}>{row.filled}</td>
                <td style={{ textAlign: "right", color: COLORS.textMuted }}>{row.exempted}</td>
                <td style={{ textAlign: "right", color: row.missed > 0 ? "#c93c3c" : COLORS.textMuted, fontWeight: row.missed > 0 ? 700 : 400 }}>{row.missed}</td>
                <td style={{ textAlign: "right" }}>{formatPercent(row.fillRate)}</td>
                <td style={{ textAlign: "right", color: COLORS.textMuted }}>{row.escalaCount}</td>
                <td style={{ textAlign: "right", color: COLORS.textMuted }}>{formatDuration(row.avgTimeToFillMinutes)}</td>
                <td style={{ textAlign: "right", color: COLORS.textMuted }}>{formatDate(row.lastFilledAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bi-table-foot">
        <span>{sorted.length} sócio{sorted.length !== 1 ? "s" : ""}</span>
        <div className="bi-table-pager">
          <Btn v="secondary" sz="sm" icon="back" aria-label="Página anterior" disabled={safePage <= 1} onClick={() => setPage(current => Math.max(1, current - 1))} />
          <span>{safePage} / {totalPages}</span>
          <Btn v="secondary" sz="sm" aria-label="Próxima página" disabled={safePage >= totalPages} onClick={() => setPage(current => Math.min(totalPages, current + 1))}>›</Btn>
        </div>
      </div>
    </>
  );
};
