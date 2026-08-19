/**
 * @file frontend/src/features/teams/components/TeamPeriodSummaryPanel.jsx
 * @summary Resumo de formularios e eventos vinculados ao periodo de equipes.
 */

import React from "react";
import { COLORS, Icon, TypeBadge } from "../../../components/ui";
import { formatTeamDate } from "../../../screens/teamsDomain";

const FormLink = ({ form, onOpenResults }) => (
  <button
    type="button"
    onClick={() => onOpenResults(form.id)}
    style={{
      border: `1px solid ${COLORS.borderLight}`,
      borderRadius: 8,
      background: COLORS.surface,
      color: COLORS.text,
      padding: 10,
      display: "grid",
      gap: 6,
      textAlign: "left",
      cursor: "pointer",
      width: "100%",
    }}
  >
    <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <TypeBadge type={form.type} />
      <strong>{form.title}</strong>
    </span>
    <span style={{ color: COLORS.textMuted, fontSize: 12 }}>
      {formatTeamDate(form.date)} - {form.status}
    </span>
  </button>
);

const SummaryBadge = ({ children, tone = "info" }) => (
  <span className="ui-badge" style={{ background: tone === "success" ? COLORS.primaryLight : COLORS.surface, color: tone === "success" ? COLORS.primary : COLORS.textSecondary, border: `1px solid ${COLORS.border}` }}>
    {children}
  </span>
);

export const TeamPeriodSummaryPanel = ({ summary, loading, onOpenResults }) => {
  if (loading) {
    return (
      <section className="empty-state">
        <span className="empty-state__title">Carregando…</span>
        <p className="empty-state__hint">Buscando os formulários e eventos deste período.</p>
      </section>
    );
  }

  if (!summary?.period) {
    return (
      <section className="empty-state">
        <span className="empty-state__title">Nenhum período selecionado</span>
        <p className="empty-state__hint">Escolha um período na lista ao lado para ver os formulários e eventos vinculados a ele.</p>
      </section>
    );
  }

  const events = Array.isArray(summary.events) ? summary.events : [];
  const unlinkedForms = Array.isArray(summary.unlinkedForms) ? summary.unlinkedForms : [];

  return (
    <section style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <Icon name="calendar" size={18} />
        <div>
          <h2 style={{ margin: 0, fontSize: 18, color: COLORS.text }}>Formularios e eventos do periodo</h2>
          <p style={{ margin: "4px 0 0", color: COLORS.textMuted, fontSize: 13 }}>
            Clique em um formulario para abrir o resultado.
          </p>
        </div>
      </div>
      {events.length === 0 && unlinkedForms.length === 0 && (
        <div style={{ border: `1px dashed ${COLORS.border}`, borderRadius: 8, padding: 18, color: COLORS.textMuted }}>
          Nenhum formulario ou evento encontrado nesse intervalo.
        </div>
      )}
      {events.map(event => (
        <article key={event.id} style={{ border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 14, background: COLORS.surfaceAlt, display: "grid", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div>
              <strong style={{ color: COLORS.text }}>{event.title}</strong>
              <div style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 3 }}>{formatTeamDate(event.date)} - {event.status}</div>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {event.hasPresence && <SummaryBadge>Presenca</SummaryBadge>}
              {event.hasOrganScale && <SummaryBadge tone="success">Escala da Organ</SummaryBadge>}
            </div>
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {(event.forms || []).map(form => (
              <FormLink key={form.id} form={form} onOpenResults={onOpenResults} />
            ))}
          </div>
        </article>
      ))}
      {unlinkedForms.length > 0 && (
        <article style={{ border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 14, background: COLORS.surfaceAlt, display: "grid", gap: 10 }}>
          <strong style={{ color: COLORS.text }}>Formularios sem evento vinculado</strong>
          <div style={{ display: "grid", gap: 8 }}>
            {unlinkedForms.map(form => (
              <FormLink key={form.id} form={form} onOpenResults={onOpenResults} />
            ))}
          </div>
        </article>
      )}
    </section>
  );
};
