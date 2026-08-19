/**
 * @file frontend/src/features/bi/BiPanels.jsx
 * @summary Componentes visuais reutilizaveis do BI.
 * @responsibility Filtro de grau, cartoes de KPI (ring), grafico por grau e
 * listas de ranking (responsivos, com avatar e mini-barras).
 */

import React from "react";
import { COLORS } from "../../components/ui";
import { ALL_GRAUS, RANGE_PRESETS } from "./biDomain";

// Cores categoricas por grau (mid-tones que funcionam em claro/escuro).
const GRAU_COLORS = { QM: "#2e6fd0", QS: "#16448c", CDC: "#1f9d6b", CI: "#e08a1e" };
export const grauColor = grau => GRAU_COLORS[String(grau || "").toUpperCase()] || "#7a8aa3";

const initials = name => String(name || "")
  .trim()
  .split(/\s+/)
  .filter(Boolean)
  .map(part => part[0])
  .filter((_, index, arr) => index === 0 || index === arr.length - 1)
  .join("")
  .toUpperCase() || "?";

export const GrauFilterChips = ({ graus = [], value = ALL_GRAUS, onChange }) => (
  <div className="bi-grau-chips" role="group" aria-label="Filtro por grau">
    {[ALL_GRAUS, ...graus].map(option => {
      const selected = option === value;
      const label = option === ALL_GRAUS ? "Todos" : option;
      const tone = option === ALL_GRAUS ? COLORS.primary : grauColor(option);
      return (
        <button
          key={option}
          type="button"
          className="bi-grau-chip"
          onClick={() => onChange(option)}
          aria-pressed={selected}
          style={{
            border: `1px solid ${selected ? tone : COLORS.border}`,
            background: selected ? tone : COLORS.surface,
            color: selected ? "#fff" : COLORS.textSecondary,
          }}
        >
          {option !== ALL_GRAUS && (
            <span className="bi-grau-dot" style={{ background: selected ? "#fff" : tone }} />
          )}
          {label}
        </button>
      );
    })}
  </div>
);

const rangeChipStyle = active => ({
  border: `1px solid ${active ? COLORS.primary : COLORS.border}`,
  background: active ? COLORS.primary : COLORS.surface,
  color: active ? "#fff" : COLORS.textSecondary,
});

/**
 * Filtro de periodo do dashboard: atalhos (Tudo/2/6/12 meses) + "Personalizado"
 * que revela dois campos de data. Responsivo (chips quebram, datas empilham).
 */
export const BiDateRangeFilter = ({ preset = "all", from = "", to = "", onPreset, onCustom }) => (
  <div className="bi-daterange">
    <div className="bi-grau-chips" role="group" aria-label="Filtro por período">
      {RANGE_PRESETS.map(option => (
        <button key={option.id} type="button" className="bi-grau-chip" aria-pressed={preset === option.id} onClick={() => onPreset(option.id)} style={rangeChipStyle(preset === option.id)}>
          {option.label}
        </button>
      ))}
      <button type="button" className="bi-grau-chip" aria-pressed={preset === "custom"} onClick={() => onPreset("custom")} style={rangeChipStyle(preset === "custom")}>
        Personalizado
      </button>
    </div>
    {preset === "custom" && (
      <div className="bi-daterange-custom">
        <label>De<input type="date" value={from || ""} max={to || undefined} onChange={event => onCustom({ from: event.target.value })} /></label>
        <label>Até<input type="date" value={to || ""} min={from || undefined} onChange={event => onCustom({ to: event.target.value })} /></label>
      </div>
    )}
  </div>
);

export const BiTabs = ({ tabs = [], value, onChange }) => (
  <div className="bi-tabs" role="tablist" aria-label="Seções do dashboard">
    {tabs.map(tab => (
      <button
        key={tab.id}
        type="button"
        role="tab"
        aria-selected={tab.id === value}
        className={`bi-tab${tab.id === value ? " is-active" : ""}`}
        onClick={() => onChange(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export const KpiCard = ({ label, percent, caption, accent = COLORS.primary, details = [] }) => (
  <div className="bi-kpi-card">
    <div className="bi-kpi-label" style={{ color: accent }}>{label}</div>
    <div className="bi-kpi-value">{percent}</div>
    <div className="bi-kpi-caption">{caption}</div>
    {details.length > 0 && (
      <div className="bi-kpi-hover" role="tooltip">
        {details.map(detail => (
          <div key={detail.label} className="bi-kpi-hover-row">
            <span>{detail.label}</span>
            <strong style={detail.tone ? { color: detail.tone } : undefined}>{detail.value}</strong>
          </div>
        ))}
      </div>
    )}
  </div>
);

export const StatCard = ({ label, value, hint }) => (
  <div className="bi-stat-card">
    <div className="bi-stat-value">{value}</div>
    <div className="bi-stat-label">{label}</div>
    {hint && <div className="bi-stat-hint">{hint}</div>}
  </div>
);

export const BiBarChart = ({ title, hint, data = [], emptyLabel, colorFor = grauColor }) => (
  <div className="bi-panel">
    <div className="bi-panel-head">
      <div className="bi-panel-title">{title}</div>
      {hint && <div className="bi-panel-hint">{hint}</div>}
    </div>
    {data.length === 0 ? (
      <div className="bi-empty">{emptyLabel}</div>
    ) : (
      <div className="bi-bars">
        {data.map(item => {
          const tone = colorFor(item.label);
          return (
            <div key={item.label} className="bi-bar-row">
              <div className="bi-bar-head">
                <span className="bi-bar-label">{item.label}</span>
                <span className="bi-bar-value">
                  {item.caption}
                  {item.sub && <span className="bi-bar-sub"> · {item.sub}</span>}
                </span>
              </div>
              <span className="bi-bar-track">
                <span className="bi-bar-fill" style={{ width: `${Math.min(100, Math.max(0, item.value))}%`, background: tone }} />
              </span>
            </div>
          );
        })}
      </div>
    )}
  </div>
);

export const TopMembersPanel = ({ title, hint, items = [], emptyLabel, valueTone = COLORS.text, showBar = false, onSelect, headerControl }) => (
  <div className="bi-panel">
    <div className="bi-panel-head bi-panel-head--row">
      <div>
        <div className="bi-panel-title">{title}</div>
        {hint && <div className="bi-panel-hint">{hint}</div>}
      </div>
      {headerControl}
    </div>
    {items.length === 0 ? (
      <div className="bi-empty">{emptyLabel}</div>
    ) : (
      <ol className="bi-rank-list">
        {items.map((item, index) => {
          const Row = onSelect ? "button" : "div";
          return (
            <li key={item.personKey}>
              <Row
                type={onSelect ? "button" : undefined}
                className={`bi-rank-row${onSelect ? " is-clickable" : ""}`}
                onClick={onSelect ? () => onSelect(item.personKey) : undefined}
              >
                <span className="bi-rank-pos">{index + 1}</span>
                <span className="bi-avatar" style={{ background: `${grauColor(item.grau)}22`, color: grauColor(item.grau) }}>
                  {initials(item.personName)}
                </span>
                <span className="bi-rank-info">
                  <span className="bi-rank-name">{item.personName}</span>
                  <span className="bi-rank-meta">
                    {item.grau && (
                      <span className="bi-grau-tag" style={{ color: grauColor(item.grau) }}>
                        <span className="bi-grau-dot" style={{ background: grauColor(item.grau) }} />
                        {item.grau}
                      </span>
                    )}
                    {showBar && (
                      <span className="bi-rank-bar">
                        <span className="bi-rank-bar-fill" style={{ width: `${Math.min(100, Math.max(0, item.barPct || 0))}%`, background: valueTone }} />
                      </span>
                    )}
                  </span>
                </span>
                <span className="bi-rank-value" style={{ color: valueTone }}>{item.value}</span>
              </Row>
            </li>
          );
        })}
      </ol>
    )}
  </div>
);

/**
 * Heatmap genérico em grid CSS. `rows` = [{key,label,grau,cells:{colKey:value}}];
 * `cols` = [{key,label}]; `intensity(value)` → 0..1; `format(value)` p/ título.
 */
