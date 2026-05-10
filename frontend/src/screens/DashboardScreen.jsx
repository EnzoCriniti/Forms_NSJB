/**
 * @file frontend/src/screens/DashboardScreen.jsx
 * @summary Painel inicial da aplicacao.
 * @responsibility Exibir resumo operacional sem depender das configuracoes administrativas.
 */

import React, { useMemo } from "react";
import { COLORS, Btn } from "../components/ui";
import { formatDateTime } from "../lib/forms";
import {
  DashboardEmptyState,
  DashboardHeader,
  DashboardMiniRow,
  DashboardStatsGrid,
  DashboardUpcomingClosings,
} from "../components/DashboardPanels";

const toNumber = value => Number(value || 0);

const formatPercent = (value, total) => {
  if (!total) return "0%";
  return `${Math.round((value / total) * 10) / 10}%`;
};

const sortByClosing = (a, b) => String(a.closing || "").localeCompare(String(b.closing || ""));

export const DashboardScreen = ({ onNavigate, forms = [], labels = [], people = [], presets = [], fieldCatalog = [], scaleTaskCatalog = [], user }) => {
  const safeForms = Array.isArray(forms) ? forms : [];
  const presenceForms = useMemo(() => safeForms.filter(form => form.type === "presenca"), [safeForms]);
  const scaleForms = useMemo(() => safeForms.filter(form => form.type === "escala_organ"), [safeForms]);
  const openForms = useMemo(() => safeForms.filter(form => form.status === "aberto"), [safeForms]);
  const archivedForms = useMemo(() => safeForms.filter(form => form.status === "arquivado"), [safeForms]);
  const draftForms = useMemo(() => safeForms.filter(form => form.status === "rascunho"), [safeForms]);

  const totalPresenceResponses = useMemo(
    () => presenceForms.reduce((sum, form) => sum + toNumber(form.metrics?.responses), 0),
    [presenceForms],
  );
  const totalExpectedPresence = useMemo(
    () => presenceForms.reduce((sum, form) => sum + toNumber(form.metrics?.total || form.totalExpected), 0),
    [presenceForms],
  );
  const totalScaleFilled = useMemo(
    () => scaleForms.reduce((sum, form) => sum + toNumber(form.metrics?.filled ?? form.metrics?.responses), 0),
    [scaleForms],
  );
  const totalScalePending = useMemo(
    () => scaleForms.reduce((sum, form) => sum + toNumber(form.metrics?.pending ?? Math.max(toNumber(form.metrics?.total) - toNumber(form.metrics?.responses), 0)), 0),
    [scaleForms],
  );

  const upcomingClosings = useMemo(
    () => [...openForms]
      .filter(form => form.closing)
      .sort(sortByClosing)
      .slice(0, 5),
    [openForms],
  );

  const quickStats = [
    { label: "Formularios", value: safeForms.length, note: `${presenceForms.length} presenca | ${scaleForms.length} escala`, color: COLORS.primary },
    { label: "Abertos", value: openForms.length, note: "em operacao", color: COLORS.accent },
    { label: "Rascunhos", value: draftForms.length, note: "nao publicados", color: COLORS.warning },
    { label: "Arquivados", value: archivedForms.length, note: "fora da lista publica", color: COLORS.textSecondary },
    { label: "Respostas", value: totalPresenceResponses, note: totalExpectedPresence > 0 ? `${formatPercent(totalPresenceResponses, totalExpectedPresence)} do previsto` : "sem meta prevista", color: COLORS.primary },
    { label: "Vagas escala", value: totalScaleFilled, note: `${totalScalePending} pendentes`, color: COLORS.accent },
  ];

  const baseCards = [
    { label: "Classificacoes", value: labels.length, note: "categorias administrativas" },
    { label: "Pessoas", value: people.length, note: "base vinculada" },
    { label: "Presets", value: presets.length, note: "modelos salvos" },
    { label: "Campos base", value: fieldCatalog.length, note: "campos padrao" },
    { label: "Tarefas base", value: scaleTaskCatalog.length, note: "funcoes da escala" },
  ];

  const emptyState = safeForms.length === 0;

  return (
    <div>
      <DashboardHeader onNavigate={onNavigate} user={user} />
      {emptyState ? (
        <DashboardEmptyState onNavigate={onNavigate} user={user} />
      ) : (
        <>
          <DashboardStatsGrid cards={quickStats} />

          <div className="dashboard-base-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 18 }}>
            {baseCards.map(card => (
              <div key={card.label} className="dashboard-base-card" style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>{card.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.text }}>{card.value}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>{card.note}</div>
              </div>
            ))}
          </div>

          <div className="dashboard-main-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: 14, alignItems: "start" }}>
            <DashboardUpcomingClosings forms={upcomingClosings} onNavigate={onNavigate} formatClosing={formatDateTime} />

            <div style={{ display: "grid", gap: 10 }}>
              <div className="dashboard-panel" style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.text, marginBottom: 10 }}>Distribuicao</div>
                <div style={{ display: "grid", gap: 10 }}>
                  <DashboardMiniRow label="Presenca" value={presenceForms.length} note={`${totalPresenceResponses} respostas`} />
                  <DashboardMiniRow label="Escala da Organ" value={scaleForms.length} note={`${totalScaleFilled} vagas ocupadas`} />
                  <DashboardMiniRow label="Arquivados" value={archivedForms.length} note="fora da operacao" />
                </div>
              </div>

              <div className="dashboard-panel" style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.text, marginBottom: 10 }}>Atalhos</div>
                <div style={{ display: "grid", gap: 8 }}>
                  <Btn v="secondary" icon="list" onClick={() => onNavigate("list")}>Ver formularios</Btn>
                  {user?.role === "admin" && <Btn icon="plus" onClick={() => onNavigate("create")}>Criar novo formulario</Btn>}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
