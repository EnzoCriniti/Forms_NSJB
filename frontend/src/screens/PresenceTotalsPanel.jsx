/**
 * @file frontend/src/screens/PresenceTotalsPanel.jsx
 * @summary Painel de totalizacao dos resultados de presenca.
 */

import React from "react";
import { COLORS } from "../components/ui";

/*
 * Cada campo continua mostrando exatamente o mesmo dado — rotulo, quantos "Sim"
 * e quantos "Nao" — mas com uma barra de proporcao embaixo, que deixa a leitura
 * imediata sem precisar comparar os numeros mentalmente.
 */
const YesNoCard = ({ label, sim, nao, mealAttendance }) => {
  const total = Number(sim || 0) + Number(nao || 0);
  const simPercent = total > 0 ? Math.round((Number(sim || 0) / total) * 100) : 0;

  return (
    <div className="total-card total-card-bar">
      <div className="total-card-title">{label}</div>
      <div className="total-split">
        <span className="total-split__side">
          <strong className="total-split__value" style={{ color: COLORS.accent }}>{sim}</strong>
          <span className="total-split__label">Sim</span>
        </span>
        <span className="total-split__side total-split__side--end">
          <strong className="total-split__value" style={{ color: COLORS.danger }}>{nao}</strong>
          <span className="total-split__label">Não</span>
        </span>
      </div>
      <div className="total-ratio" role="img" aria-label={`${sim} sim e ${nao} não`}>
        <span className="total-ratio__fill" style={{ width: `${simPercent}%` }} />
      </div>
      <div className="total-ratio__caption">
        {total > 0 ? `${simPercent}% de "Sim" em ${total} resposta${total === 1 ? "" : "s"}` : "Sem respostas ainda"}
      </div>
      {mealAttendance && (
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${COLORS.borderLight}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
            <strong style={{ fontSize: 12, color: COLORS.textSecondary }}>Presentes estimados</strong>
            <strong style={{ fontSize: 18, color: COLORS.primary }}>{mealAttendance.total}</strong>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 6, fontSize: 11, color: COLORS.textMuted }}>
            <span>Respondentes: <strong>{mealAttendance.respondents}</strong></span>
            <span>Crianças: <strong>{mealAttendance.children}</strong></span>
            <span>Jovens: <strong>{mealAttendance.youths}</strong></span>
            <span>Visitantes: <strong>{mealAttendance.adultVisitors}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};

const SumCard = ({ label, sum }) => (
  <div className="total-card total-card-number">
    <div className="total-card-title">{label}</div>
    <div className="total-number">{sum}</div>
    <div className="total-caption">total informado</div>
  </div>
);

export const PresenceTotalsPanel = ({ totalsLayout }) => (
  <div className="totals-panel">
    <div className="totals-panel__title">Resultado do preenchimento</div>
    <div className="totals-grid">
      {totalsLayout.map(item => {
        const col = item.field;
        if (!col) return null;
        if (item.summary?.sim !== undefined) {
          return <YesNoCard key={col.id} label={col.label} sim={item.summary.sim} nao={item.summary.nao} mealAttendance={item.summary.mealAttendance} />;
        }
        if (item.summary?.sum !== undefined) {
          return <SumCard key={col.id} label={col.label} sum={item.summary.sum} />;
        }
        return null;
      })}
    </div>
  </div>
);
