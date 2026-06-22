/**
 * @file frontend/src/screens/ReportsScreen.jsx
 * @summary Aba de relatorios/BI do nucleo.
 * @responsibility Consolidar indicadores a partir dos snapshots de participacao por evento.
 */

import React, { useEffect, useMemo, useState } from "react";
import { COLORS, FeedbackBanner, Icon, ScreenHeader } from "../components/ui";
import { fetchMemberParticipationReport } from "../lib/api";

const formatDuration = minutes => {
  if (minutes === null || minutes === undefined) return "—";
  const total = Math.max(0, Math.round(minutes));
  if (total < 60) return `${total}min`;
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}min`;
};

const formatDate = iso => {
  if (!iso) return "—";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("pt-BR");
};

const formatPercent = value => `${Number(value || 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

const COLUMNS = [
  { key: "personName", label: "Sócio", align: "left", value: row => row.personName.toLowerCase() },
  { key: "grau", label: "Grau", align: "left", value: row => row.grau },
  { key: "expected", label: "Esperados", align: "right", value: row => row.expected },
  { key: "filled", label: "Preencheu", align: "right", value: row => row.filled },
  { key: "missed", label: "Faltas", align: "right", value: row => row.missed },
  { key: "fillRate", label: "% Presença", align: "right", value: row => row.fillRate },
  { key: "avgTimeToFillMinutes", label: "Tempo médio", align: "right", value: row => (row.avgTimeToFillMinutes ?? Number.POSITIVE_INFINITY) },
  { key: "lastFilledAt", label: "Último preenchimento", align: "right", value: row => (row.lastFilledAt || "") },
];

const cellStyle = (align, extra = {}) => ({ padding: "10px 12px", textAlign: align, fontSize: 13, ...extra });

export const ReportsScreen = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortKey, setSortKey] = useState("missed");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const payload = await fetchMemberParticipationReport();
        if (active) { setMembers(Array.isArray(payload.members) ? payload.members : []); setError(null); }
      } catch {
        if (active) setError("Não foi possível carregar o relatório.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const sortedMembers = useMemo(() => {
    const column = COLUMNS.find(col => col.key === sortKey) || COLUMNS[0];
    const factor = sortDir === "asc" ? 1 : -1;
    return [...members].sort((a, b) => {
      const left = column.value(a);
      const right = column.value(b);
      if (left < right) return -1 * factor;
      if (left > right) return 1 * factor;
      return a.personName.localeCompare(b.personName, "pt-BR");
    });
  }, [members, sortKey, sortDir]);

  const totals = useMemo(() => members.reduce((acc, row) => ({
    expected: acc.expected + row.expected,
    filled: acc.filled + row.filled,
    missed: acc.missed + row.missed,
  }), { expected: 0, filled: 0, missed: 0 }), [members]);

  const onSort = key => {
    if (key === sortKey) {
      setSortDir(current => current === "asc" ? "desc" : "asc");
      return;
    }
    setSortKey(key);
    setSortDir(key === "personName" || key === "grau" ? "asc" : "desc");
  };

  const sortIcon = key => {
    if (key !== sortKey) return "sortNone";
    return sortDir === "asc" ? "sortAsc" : "sortDesc";
  };

  return (
    <div>
      <ScreenHeader
        className="settings-top-card"
        title="Relatórios"
        titleSize={20}
        subtitle="Indicadores do núcleo a partir dos eventos encerrados."
      />

      <div className="msg-card" style={{ display: "grid", gap: 14 }}>
        <div className="msg-card__head">
          <div>
            <div className="msg-card__title">Participação por sócio</div>
            <div className="msg-card__hint">Esperado x preenchido, faltas e tempo médio de resposta, consolidados no fechamento de cada evento.</div>
          </div>
          {members.length > 0 && (
            <div style={{ display: "flex", gap: 16, flexShrink: 0 }}>
              <ReportStat label="Sócios" value={members.length} />
              <ReportStat label="Preenchimentos" value={totals.filled} color={COLORS.primary} />
              <ReportStat label="Faltas" value={totals.missed} color="#c93c3c" />
            </div>
          )}
        </div>

        {error && <FeedbackBanner tone="error" message={error} />}

        {loading ? (
          <div className="msg-empty" style={{ textAlign: "left" }}>Carregando relatório…</div>
        ) : members.length === 0 ? (
          <div className="msg-empty" style={{ textAlign: "left" }}>
            Nenhum evento encerrado ainda. Os indicadores aparecem aqui quando um evento com formulário de presença é encerrado.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${COLORS.borderLight}` }}>
                  {COLUMNS.map(col => (
                    <th
                      key={col.key}
                      onClick={() => onSort(col.key)}
                      style={cellStyle(col.align, { cursor: "pointer", color: COLORS.textSecondary, fontSize: 12, whiteSpace: "nowrap", userSelect: "none" })}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, flexDirection: col.align === "right" ? "row-reverse" : "row" }}>
                        {col.label}
                        <Icon name={sortIcon(col.key)} size={11} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedMembers.map(row => (
                  <tr key={row.personKey} style={{ borderBottom: `1px solid ${COLORS.borderLight}` }}>
                    <td style={cellStyle("left", { fontWeight: 600 })}>{row.personName}</td>
                    <td style={cellStyle("left", { color: COLORS.textMuted })}>{row.grau || "—"}</td>
                    <td style={cellStyle("right")}>{row.expected}</td>
                    <td style={cellStyle("right", { color: COLORS.primary, fontWeight: 700 })}>{row.filled}</td>
                    <td style={cellStyle("right", { color: row.missed > 0 ? "#c93c3c" : COLORS.textMuted, fontWeight: row.missed > 0 ? 700 : 400 })}>{row.missed}</td>
                    <td style={cellStyle("right")}>{formatPercent(row.fillRate)}</td>
                    <td style={cellStyle("right", { color: COLORS.textMuted })}>{formatDuration(row.avgTimeToFillMinutes)}</td>
                    <td style={cellStyle("right", { color: COLORS.textMuted })}>{formatDate(row.lastFilledAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const ReportStat = ({ label, value, color }) => (
  <div style={{ textAlign: "right" }}>
    <div style={{ fontSize: 18, fontWeight: 800, color: color || COLORS.text }}>{value}</div>
    <div style={{ fontSize: 11, color: COLORS.textMuted }}>{label}</div>
  </div>
);
