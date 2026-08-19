/**
 * @file frontend/src/components/ResultsPresenceHeader.jsx
 * @summary Controles superiores da tela de resultados de presenca.
 * @responsibility Exibir toolbar publica, filtros de grau e cards de resumo.
 */

import React from "react";
import { COLORS, Btn } from "./ui";
import { PublicReadingToolbar } from "./publicUi";

export const ResultsPresenceHeader = ({
  publicActionHref,
  readingControls,
  grauOptions = [],
  selectedGrau = "todos",
  onSelectGrau,
  stats = [],
}) => (
  <div>
    {publicActionHref && <PublicReadingToolbar {...readingControls} backHref={publicActionHref} backLabel="Voltar ao formulário" />}

    {grauOptions.length > 0 && (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "0 0 14px" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>Filtrar por grau</span>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <Btn
              v={selectedGrau === "todos" ? "primary" : "secondary"}
              sz="sm"
              style={{ minHeight: 36, padding: "8px 16px", borderRadius: 999, fontSize: 12.5 }}
              onClick={() => onSelectGrau("todos")}
            >
              Todos
            </Btn>
            {grauOptions.map(grau => (
              <Btn
                key={grau}
                v={selectedGrau === grau ? "primary" : "secondary"}
                sz="sm"
                style={{ minHeight: 36, padding: "8px 16px", borderRadius: 999, fontSize: 12.5 }}
                onClick={() => onSelectGrau(grau)}
              >
                {grau}
              </Btn>
            ))}
          </div>
        </div>
      </div>
    )}

    <div className="stats-grid results-stats-grid">
      {stats.map((card, index) => (
        <div key={index} className="metric-card results-stat-card">
          <div className="results-stat-card__value" style={{ color: card.c }}>{card.v}</div>
          <div className="results-stat-card__label">{card.l}</div>
          <div className="results-stat-card__hint">{card.s}</div>
        </div>
      ))}
    </div>
  </div>
);
