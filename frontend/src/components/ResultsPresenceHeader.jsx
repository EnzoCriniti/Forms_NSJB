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
    {publicActionHref && <PublicReadingToolbar {...readingControls} backHref={publicActionHref} />}

    {grauOptions.length > 0 && (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "0 0 14px" }}>
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

    <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, margin: "0 0 20px" }}>
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
