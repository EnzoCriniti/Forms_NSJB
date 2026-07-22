/**
 * @file frontend/src/screens/EscalaResultsOverview.jsx
 * @summary Barra superior, avisos e metricas da escala de resultados.
 */

import React from "react";
import { Btn, COLORS, FeedbackBanner, MetricCard } from "../components/ui";

export const EscalaResultsOverview = ({
  canEdit,
  feedback,
  filled,
  onExportCsv,
  total,
}) => (
  <>
    <div className="results-sheet-toolbar" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
      <Btn v="secondary" icon="download" sz="sm" onClick={onExportCsv}>Exportar</Btn>
    </div>
    {feedback && <div style={{ marginBottom: 12 }}><FeedbackBanner tone={feedback.tone === "error" ? "warning" : feedback.tone} message={feedback.message} fixed /></div>}
    {!canEdit && (
      <div style={{ marginBottom: 16 }}>
        <FeedbackBanner tone="info" title="Somente leitura" message="Você não tem permissão para editar esta escala. Apenas administradores podem fazer alterações." />
      </div>
    )}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
      <MetricCard value={filled} label="Preenchidas" tone={COLORS.primary} style={{ padding: "12px 16px" }} />
      <MetricCard value={total - filled} label="Pendentes" tone="var(--type-scale-text)" style={{ padding: "12px 16px", background: "var(--type-scale-bg)" }} />
      <MetricCard value={total} label="Total" tone={COLORS.textSecondary} style={{ padding: "12px 16px" }} />
    </div>
  </>
);
