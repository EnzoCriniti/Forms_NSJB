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
const YesNoCard = ({ label, sim, nao }) => {
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
          return <YesNoCard key={col.id} label={col.label} sim={item.summary.sim} nao={item.summary.nao} />;
        }
        if (item.summary?.sum !== undefined) {
          return <SumCard key={col.id} label={col.label} sum={item.summary.sum} />;
        }
        return null;
      })}
    </div>
  </div>
);
