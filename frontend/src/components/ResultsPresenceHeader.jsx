/**
 * @file frontend/src/components/ResultsPresenceHeader.jsx
 * @summary Cabeçalho e resumo da tela de resultados de presença.
 * @responsibility Exibir contexto do formulario, filtros de grau e cards de resumo.
 */

import React from "react";
import { COLORS, Badge, StatusBadge, Btn, PublicReadingToolbar } from "./ui";
import { formatDateTime } from "../lib/forms";

export const ResultsPresenceHeader = ({
  onNavigate,
  publicActionHref,
  publicActionLabel = "Ver formulário",
  readingControls,
  form,
  labels = [],
  grauOptions = [],
  selectedGrau = "todos",
  onSelectGrau,
  stats = [],
}) => (
  <div>
    {publicActionHref && <PublicReadingToolbar {...readingControls} backHref={publicActionHref} />}
    {!publicActionHref && (
      <div className="results-inline-header" style={{ display: "grid", gap: 4, marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: "var(--text)", lineHeight: 1.1, letterSpacing: "-0.02em" }}>{form.title}</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <StatusBadge status={form.status} />
          {(form.labels || []).map(labelId => <Badge key={labelId} label={labelId} labels={labels} small />)}
          <span className="results-top-card__meta-note" style={{ fontSize: 11, color: "var(--text-muted)" }}>Fecha: {formatDateTime(form.closing)}</span>
        </div>
      </div>
    )}

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
  </div>
);
