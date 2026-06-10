/**
 * @file frontend/src/components/DashboardPanels.jsx
 * @summary Blocos visuais reutilizaveis da dashboard.
 * @responsibility Separar hero, cards e listas da tela inicial.
 */

import React from "react";
import { COLORS, Icon, Btn, StatusBadge, TypeBadge } from "./ui";

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
  <div className="dashboard-empty-state" style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 14, padding: 24, textAlign: "center" }}>
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
        <div style={{ fontSize: 24, fontWeight: 800, color: card.color }}>{card.value}</div>
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
    <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.primary }}>{value}</div>
  </div>
);

export const DashboardUpcomingClosings = ({ forms, onNavigate, formatClosing = value => value }) => (
  <div className="dashboard-panel dashboard-upcoming" style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 14, padding: 18 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.text }}>Próximos fechamentos</div>
        <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>Ordenado pelo prazo mais próximo.</div>
      </div>
      <div style={{ fontSize: 11, color: COLORS.textMuted }}>{forms.length} formulário{forms.length !== 1 ? "s" : ""}</div>
    </div>
    {forms.length === 0 ? (
      <div style={{ padding: "18px 0", color: COLORS.textMuted, fontSize: 13 }}>Nenhum formulário aberto com fechamento definido.</div>
    ) : (
      <div style={{ display: "grid", gap: 10 }}>
        {forms.map(form => (
          <div key={form.id} className="dashboard-upcoming-row" style={{ border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <strong style={{ fontSize: 14 }}>{form.title}</strong>
                <StatusBadge status={form.status} />
                <TypeBadge type={form.type} />
              </div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>
                {form.sessionName || "Sem sessão"}{form.closing ? ` • Fecha em ${formatClosing(form.closing)}` : ""}
              </div>
            </div>
            <Btn v="secondary" sz="sm" icon="eye" onClick={() => onNavigate("results", form)}>Abrir resultados</Btn>
          </div>
        ))}
      </div>
    )}
  </div>
);
