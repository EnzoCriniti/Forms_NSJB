/**
 * @file frontend/src/features/bi/BiPanels.jsx
 * @summary Componentes visuais reutilizaveis do BI.
 * @responsibility Filtro de grau, cartoes de KPI e listas de ranking (responsivos).
 */

import React from "react";
import { COLORS } from "../../components/ui";
import { ALL_GRAUS } from "./biDomain";

export const GrauFilterChips = ({ graus = [], value = ALL_GRAUS, onChange }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }} role="group" aria-label="Filtro por grau">
    {[ALL_GRAUS, ...graus].map(option => {
      const selected = option === value;
      const label = option === ALL_GRAUS ? "Todos" : option;
      return (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={selected}
          style={{
            padding: "6px 14px",
            borderRadius: 999,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 700,
            border: `1px solid ${selected ? COLORS.primary : COLORS.border}`,
            background: selected ? COLORS.primary : COLORS.surface,
            color: selected ? "#fff" : COLORS.textSecondary,
          }}
        >
          {label}
        </button>
      );
    })}
  </div>
);

export const KpiCard = ({ label, percent, caption, accent = COLORS.primary }) => (
  <div className="bi-kpi-card" style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 16, padding: 18, display: "grid", gap: 10 }}>
    <div style={{ fontSize: 12, color: COLORS.textMuted, fontWeight: 600 }}>{label}</div>
    <div style={{ fontSize: 34, fontWeight: 800, color: accent, lineHeight: 1 }}>{percent}</div>
    <div style={{ height: 8, borderRadius: 999, background: COLORS.surfaceAlt, overflow: "hidden" }}>
      <div style={{ width: `${Math.min(100, Math.max(0, parseFloat(percent) || 0))}%`, height: "100%", background: accent, borderRadius: 999, transition: "width .3s" }} />
    </div>
    <div style={{ fontSize: 12, color: COLORS.textMuted }}>{caption}</div>
  </div>
);

export const StatCard = ({ label, value, hint, accent = COLORS.text }) => (
  <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 14, padding: "14px 16px" }}>
    <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 800, color: accent, lineHeight: 1.1 }}>{value}</div>
    {hint && <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>{hint}</div>}
  </div>
);

export const BiBarChart = ({ title, hint, data = [], emptyLabel, accent = COLORS.primary }) => (
  <div className="bi-panel" style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 16, padding: 18, display: "grid", gap: 12, alignContent: "start" }}>
    <div>
      <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.text }}>{title}</div>
      {hint && <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{hint}</div>}
    </div>
    {data.length === 0 ? (
      <div style={{ fontSize: 13, color: COLORS.textMuted }}>{emptyLabel}</div>
    ) : (
      <div style={{ display: "grid", gap: 10 }}>
        {data.map(item => (
          <div key={item.label} style={{ display: "grid", gridTemplateColumns: "48px 1fr 52px", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>{item.label}</span>
            <span style={{ height: 12, borderRadius: 999, background: COLORS.surfaceAlt, overflow: "hidden" }}>
              <span style={{ display: "block", height: "100%", width: `${Math.min(100, Math.max(0, item.value))}%`, background: accent, borderRadius: 999, transition: "width .3s" }} />
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.text, textAlign: "right" }}>{item.caption}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const rankBadgeStyle = {
  width: 22, height: 22, borderRadius: 999, flexShrink: 0,
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  fontSize: 11, fontWeight: 800, background: COLORS.surfaceAlt, color: COLORS.textSecondary,
};

export const TopMembersPanel = ({ title, hint, items = [], emptyLabel, valueTone = COLORS.text }) => (
  <div className="bi-panel" style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 16, padding: 18, display: "grid", gap: 12, alignContent: "start" }}>
    <div>
      <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.text }}>{title}</div>
      {hint && <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{hint}</div>}
    </div>
    {items.length === 0 ? (
      <div style={{ fontSize: 13, color: COLORS.textMuted }}>{emptyLabel}</div>
    ) : (
      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
        {items.map((item, index) => (
          <li key={item.personKey} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={rankBadgeStyle}>{index + 1}</span>
            <span style={{ minWidth: 0, flex: 1 }}>
              <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: COLORS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.personName}</span>
              {item.grau && <span style={{ fontSize: 11, color: COLORS.textMuted }}>{item.grau}</span>}
            </span>
            <span style={{ fontSize: 13, fontWeight: 800, color: valueTone, flexShrink: 0 }}>{item.value}</span>
          </li>
        ))}
      </ol>
    )}
  </div>
);
