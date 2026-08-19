/**
 * @file frontend/src/components/DashboardPanels.jsx
 * @summary Blocos visuais reutilizaveis da dashboard.
 * @responsibility Separar hero, cards e listas da tela inicial.
 */

import React from "react";
import { COLORS, Icon, Btn } from "./ui";

export const DashboardHeader = ({ onNavigate, user }) => (
  <div className="dashboard-hero" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
    <div>
      <h2 style={{ margin: 0, fontSize: 24, color: COLORS.text }}>Dashboard</h2>
      <p style={{ margin: "6px 0 0", fontSize: 13, color: COLORS.textMuted }}>Resumo operacional da aplicação sem entrar nas Configurações.</p>
    </div>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {user?.role === "admin" && <Btn icon="calendar" aria-label="Eventos" title="Eventos" onClick={() => onNavigate("events")} />}
    </div>
  </div>
);

export const DashboardEmptyState = ({ onNavigate, user }) => (
  <div className="dashboard-empty-state" style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: 24, textAlign: "center" }}>
    <div style={{ width: 56, height: 56, borderRadius: "50%", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.primaryLight, color: COLORS.primary }}>
      <Icon name="chart" size={26} />
    </div>
    <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>Nenhum formulário cadastrado</h3>
    <p style={{ margin: "0 auto 16px", maxWidth: 520, color: COLORS.textSecondary, fontSize: 13, lineHeight: 1.5 }}>
      Quando houver formulários, este painel mostra o volume aberto, o andamento das respostas e os prazos mais próximos.
    </p>
    {user?.role === "admin" && <Btn icon="calendar" aria-label="Eventos" title="Eventos" onClick={() => onNavigate("events")} />}
  </div>
);

export const DashboardStatsGrid = ({ cards }) => (
  <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 18 }}>
    {cards.map(card => (
      <div key={card.label} className="elevated metric-card" style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: "16px 18px" }}>
        <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>{card.label}</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: card.color }}>{card.value}</div>
        <div style={{ fontSize: 11, color: COLORS.textMuted }}>{card.note}</div>
      </div>
    ))}
  </div>
);

export const DashboardMiniRow = ({ label, value, note }) => (
  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", borderBottom: `1px solid ${COLORS.borderLight}`, paddingBottom: 8 }}>
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text }}>{label}</div>
      <div style={{ fontSize: 11, color: COLORS.textMuted }}>{note}</div>
    </div>
    <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.primary }}>{value}</div>
  </div>
);

export const DashboardUpcomingClosings = ({ forms, onNavigate, formatClosing = value => value }) => (
  <div className="bi-panel dashboard-upcoming">
    <div className="bi-panel-head">
      <div className="bi-panel-title">Próximos fechamentos</div>
      <div className="bi-panel-hint">Formulários abertos, por data de fechamento.</div>
    </div>
    {forms.length === 0 ? (
      <div className="bi-empty">Nenhum formulário aberto com fechamento definido.</div>
    ) : (
      <div className="dash-closings">
        {forms.map(form => (
          <button
            key={form.id}
            type="button"
            className="dash-closing-row"
            onClick={() => onNavigate("results", form)}
            title="Abrir resultados"
          >
            <span className="dash-closing-main">
              <span className="dash-closing-title">{form.title}</span>
              <span className="dash-closing-sub">{form.closing ? `Fecha em ${formatClosing(form.closing)}` : "Sem fechamento definido"}</span>
            </span>
            <span className="dash-closing-badge">{form.type === "escala_organ" ? "ESCALA" : "PRESENÇA"}</span>
          </button>
        ))}
      </div>
    )}
  </div>
);
