/**
 * @file src/screens/DashboardScreen.jsx
 * @summary Painel inicial da aplicacao.
 * @responsibility Exibir resumo operacional sem depender das configuracoes administrativas.
 */

import React, { useMemo } from "react";
import { COLORS, Icon, Btn, StatusBadge, TypeBadge } from "../components/ui";
import { canCreateForms } from "../lib/auth";
import { formatDateTime } from "../lib/forms";

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24, color: COLORS.text }}>Dashboard</h2>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: COLORS.textMuted }}>Resumo operacional da aplicacao sem entrar nas Configuracoes.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn v="secondary" icon="list" onClick={() => onNavigate("list")}>Formularios</Btn>
          {canCreateForms(user) && <Btn icon="plus" onClick={() => onNavigate("create")}>Novo Formulario</Btn>}
        </div>
      </div>

      {emptyState ? (
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 14, padding: 24, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", background: COLORS.primaryLight, color: COLORS.primary }}>
            <Icon name="chart" size={26} />
          </div>
          <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>Nenhum formulario cadastrado</h3>
          <p style={{ margin: "0 auto 16px", maxWidth: 520, color: COLORS.textSecondary, fontSize: 13, lineHeight: 1.5 }}>
            Quando houver formularios, este painel mostra o volume aberto, o andamento das respostas e os prazos mais proximos.
          </p>
          {canCreateForms(user) && <Btn icon="plus" onClick={() => onNavigate("create")}>Criar formulario</Btn>}
        </div>
      ) : (
        <>
          <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 18 }}>
            {quickStats.map(card => (
              <div key={card.label} className="elevated metric-card" style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>{card.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: card.color }}>{card.value}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>{card.note}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 18 }}>
            {baseCards.map(card => (
              <div key={card.label} style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: "16px 18px" }}>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>{card.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: COLORS.text }}>{card.value}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>{card.note}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: 14, alignItems: "start" }}>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 14, padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.text }}>Proximos fechamentos</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>Ordenado pelo prazo mais proximo.</div>
                </div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>{upcomingClosings.length} formulario{upcomingClosings.length !== 1 ? "s" : ""}</div>
              </div>

              {upcomingClosings.length === 0 ? (
                <div style={{ padding: "18px 0", color: COLORS.textMuted, fontSize: 13 }}>Nenhum formulario aberto com fechamento definido.</div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {upcomingClosings.map(form => (
                    <div key={form.id} style={{ border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <strong style={{ fontSize: 14 }}>{form.title}</strong>
                          <StatusBadge status={form.status} />
                          <TypeBadge type={form.type} />
                        </div>
                        <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>
                          {form.sessionName || "Sem sessao"}{form.closing ? ` • Fecha em ${formatDateTime(form.closing)}` : ""}
                        </div>
                      </div>
                      <Btn v="secondary" sz="sm" icon="eye" onClick={() => onNavigate("results", form)}>Abrir resultados</Btn>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.text, marginBottom: 10 }}>Distribuicao</div>
                <div style={{ display: "grid", gap: 10 }}>
                  <MiniRow label="Presenca" value={presenceForms.length} note={`${totalPresenceResponses} respostas`} />
                  <MiniRow label="Escala da Organ" value={scaleForms.length} note={`${totalScaleFilled} vagas ocupadas`} />
                  <MiniRow label="Arquivados" value={archivedForms.length} note="fora da operacao" />
                </div>
              </div>

              <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: COLORS.text, marginBottom: 10 }}>Atalhos</div>
                <div style={{ display: "grid", gap: 8 }}>
                  <Btn v="secondary" icon="list" onClick={() => onNavigate("list")}>Ver formularios</Btn>
                  {canCreateForms(user) && <Btn icon="plus" onClick={() => onNavigate("create")}>Criar novo formulario</Btn>}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const MiniRow = ({ label, value, note }) => (
  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", borderBottom: `1px solid ${COLORS.borderLight}`, paddingBottom: 8 }}>
    <div>
      <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text }}>{label}</div>
      <div style={{ fontSize: 11, color: COLORS.textMuted }}>{note}</div>
    </div>
    <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.primary }}>{value}</div>
  </div>
);
