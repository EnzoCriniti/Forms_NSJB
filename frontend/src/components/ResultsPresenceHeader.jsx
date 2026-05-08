/**
 * @file frontend/src/components/ResultsPresenceHeader.jsx
 * @summary Cabeçalho e resumo da tela de resultados de presença.
 * @responsibility Exibir contexto do formulario, filtros de grau e cards de resumo.
 */

import React from "react";
import { COLORS, Icon, Badge, StatusBadge, Btn } from "./ui";
import { formatDateTime } from "../lib/forms";

export const ResultsPresenceHeader = ({
  onNavigate,
  form,
  labels = [],
  grauOptions = [],
  selectedGrau = "todos",
  onSelectGrau,
  stats = [],
  onExport,
}) => (
  <div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
        <Btn v="ghost" icon="back" onClick={() => onNavigate("list")} />
        <div style={{ minWidth: 0 }}>
          <h2 style={{ margin: 0, fontSize: 20 }}>{form.title}</h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4, flexWrap: "wrap" }}>
            <StatusBadge status={form.status} />
            {(form.labels || []).map(labelId => <Badge key={labelId} label={labelId} labels={labels} small />)}
            <span style={{ fontSize: 11, color: COLORS.textMuted }}>Fecha: {formatDateTime(form.closing)}</span>
          </div>
        </div>
      </div>
    </div>

    {grauOptions.length > 0 && (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "18px 0 14px" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>Filtrar por grau</span>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <Btn
              v={selectedGrau === "todos" ? "primary" : "secondary"}
              sz="sm"
              onClick={() => onSelectGrau("todos")}
            >
              Todos
            </Btn>
            {grauOptions.map(grau => (
              <Btn
                key={grau}
                v={selectedGrau === grau ? "primary" : "secondary"}
                sz="sm"
                onClick={() => onSelectGrau(grau)}
              >
                {grau}
              </Btn>
            ))}
          </div>
        </div>
      </div>
    )}

    <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, margin: "30px 0 20px" }}>
      {stats.map((card, index) => (
        <div key={index} className="elevated metric-card" style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>{card.l}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: card.c }}>{card.v}</div>
          <div style={{ fontSize: 11, color: COLORS.textMuted }}>{card.s}</div>
        </div>
      ))}
    </div>

    <div style={{ display: "flex", justifyContent: "flex-end", margin: "0 0 12px" }}>
      <Btn v="secondary" sz="sm" icon="download" onClick={onExport}>Exportar</Btn>
    </div>
  </div>
);
