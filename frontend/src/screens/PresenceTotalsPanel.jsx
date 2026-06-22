/**
 * @file frontend/src/screens/PresenceTotalsPanel.jsx
 * @summary Painel de totalizacao dos resultados de presenca.
 */

import React from "react";
import { COLORS } from "../components/ui";

export const PresenceTotalsPanel = ({ totalsLayout }) => (
  <div className="totals-panel" style={{ background: COLORS.surface, borderRadius: 10, padding: 16, marginBottom: 12, border: `1px solid ${COLORS.borderLight}` }}>
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.text }}>Resultado do preenchimento</div>
    </div>
    <div className="totals-grid">
      {totalsLayout.map(item => {
        const col = item.field;
        if (!col) return null;
        if (item.summary?.sim !== undefined) {
          const { sim, nao } = item.summary;
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
                  <span style={{ fontSize: 12, color: COLORS.textMuted }}>Não</span>
                </span>
              </div>
            </div>
          );
        }
        if (item.summary?.sum !== undefined) {
          return (
            <div key={col.id} className="total-card total-card-number" style={{ padding: 18, minHeight: 104 }}>
              <div className="total-card-title" style={{ fontSize: 13, marginBottom: 12 }}>{col.label}</div>
              <div className="total-number" style={{ fontSize: 28, lineHeight: 1.1 }}>{item.summary.sum}</div>
              <div className="total-caption" style={{ marginTop: 8 }}>total informado</div>
            </div>
          );
        }
        return null;
      })}
    </div>
  </div>
);
