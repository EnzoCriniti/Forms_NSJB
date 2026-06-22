/**
 * @file frontend/src/screens/DashboardScreen.jsx
 * @summary Painel inicial: panorama de BI do nucleo.
 * @responsibility Exibir KPIs, filtro por grau e rankings a partir do modulo de BI.
 */

import React, { useEffect, useMemo, useState } from "react";
import { COLORS, FeedbackBanner, ScreenHeader } from "../components/ui";
import { formatDateTime } from "../lib/forms";
import { fetchBiOverview } from "../lib/api";
import { DashboardHeader, DashboardUpcomingClosings } from "../components/DashboardPanels";
import { GrauFilterChips, KpiCard, TopMembersPanel } from "../features/bi/BiPanels";
import {
  ALL_GRAUS,
  computePresencaKpi,
  filterByGrau,
  formatPercent,
  rate,
  sortGrauOptions,
  topLeastEscala,
  topLeastPresenca,
} from "../features/bi/biDomain";

const sortByClosing = (a, b) => String(a.closing || "").localeCompare(String(b.closing || ""));

export const DashboardScreen = ({ onNavigate, forms = [], user }) => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [grau, setGrau] = useState(ALL_GRAUS);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const payload = await fetchBiOverview();
        if (active) { setOverview(payload); setError(null); }
      } catch {
        if (active) setError("Não foi possível carregar o panorama.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const graus = useMemo(() => sortGrauOptions(overview?.graus || []), [overview]);
  const filteredMembers = useMemo(() => filterByGrau(overview?.members || [], grau), [overview, grau]);
  const presenca = useMemo(() => computePresencaKpi(filteredMembers), [filteredMembers]);
  const escala = overview?.escala || { totalSlots: 0, filledSlots: 0 };
  const escalaRate = rate(escala.filledSlots, escala.totalSlots);
  const leastPresenca = useMemo(() => topLeastPresenca(filteredMembers), [filteredMembers]);
  const leastEscala = useMemo(() => topLeastEscala(filteredMembers), [filteredMembers]);

  const grauSuffix = grau === ALL_GRAUS ? "" : ` · ${grau}`;
  const upcomingClosings = useMemo(
    () => (Array.isArray(forms) ? forms : [])
      .filter(form => form.status === "aberto" && form.closing)
      .sort(sortByClosing)
      .slice(0, 5),
    [forms],
  );

  return (
    <div>
      <DashboardHeader onNavigate={onNavigate} user={user} />

      <ScreenHeader
        className="settings-top-card"
        title="Panorama"
        titleSize={18}
        subtitle="Indicadores do núcleo a partir dos eventos encerrados e das escalas."
      />

      {graus.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <GrauFilterChips graus={graus} value={grau} onChange={setGrau} />
        </div>
      )}

      {error && <FeedbackBanner tone="error" message={error} />}

      {loading ? (
        <div className="msg-empty" style={{ textAlign: "left" }}>Carregando panorama…</div>
      ) : (
        <>
          <div className="bi-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 14 }}>
            <KpiCard
              label={`Preenchimento de presença${grauSuffix}`}
              percent={formatPercent(presenca.rate)}
              caption={`${presenca.filled} de ${presenca.expected} esperados`}
              accent={COLORS.primary}
            />
            <KpiCard
              label="Preenchimento de escalas (geral)"
              percent={formatPercent(escalaRate)}
              caption={`${escala.filledSlots} de ${escala.totalSlots} vagas`}
              accent={COLORS.accent}
            />
          </div>

          <div className="bi-lists-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 12, marginBottom: 14 }}>
            <TopMembersPanel
              title="Top 10 — menos preenchem presença"
              hint="Menor taxa de presença nos eventos encerrados."
              items={leastPresenca.map(member => ({ personKey: member.personKey, personName: member.personName, grau: member.grau, value: formatPercent(member.fillRate) }))}
              emptyLabel="Sem eventos encerrados ainda."
              valueTone="#c93c3c"
            />
            <TopMembersPanel
              title="Top 10 — menos fazem escala"
              hint="Menor número de vagas de escala assumidas."
              items={leastEscala.map(member => ({ personKey: member.personKey, personName: member.personName, grau: member.grau, value: `${member.escalaCount || 0}` }))}
              emptyLabel="Nenhuma escala registrada ainda."
              valueTone={COLORS.accent}
            />
          </div>

          <DashboardUpcomingClosings forms={upcomingClosings} onNavigate={onNavigate} formatClosing={formatDateTime} />
        </>
      )}
    </div>
  );
};
