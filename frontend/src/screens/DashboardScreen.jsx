/**
 * @file frontend/src/screens/DashboardScreen.jsx
 * @summary Central de BI do núcleo, em abas (Visão geral, Presença, Escala, Sócios).
 * @responsibility Orquestrar carregamento dos relatórios, filtro de grau global,
 * gráficos, rankings clicáveis e o perfil por sócio.
 */

import React, { useEffect, useMemo, useState } from "react";
import { COLORS, FeedbackBanner, ScreenHeader, Icon } from "../components/ui";
import { formatDateTime } from "../lib/forms";
import { fetchBiDashboard } from "../lib/api";
import { DashboardUpcomingClosings } from "../components/DashboardPanels";
import { BiBarChart, BiDateRangeFilter, BiTabs, GrauFilterChips, KpiCard, StatCard, TopMembersPanel, grauColor } from "../features/bi/BiPanels";
import { BiTrendChart, BiHistogramChart, BiHBarChart, BiDonutChart } from "../features/bi/BiCharts";
import { MemberProfilePanel } from "../features/bi/MemberProfilePanel";
import { MembersTable } from "../features/bi/MembersTable";
import { timelineForGrau } from "../../../shared/biTimeline.mjs";
import {
  ALL_GRAUS,
  computePresencaKpi,
  escalaAssumedByGrau,
  filterByGrau,
  formatDuration,
  formatPercent,
  escalaFilledBySection,
  presencaByGrau,
  presencaFillDistribution,
  presetRange,
  rate,
  sortGrauOptions,
  summarizeEscalaFocus,
  timeToFillHistogram,
  topEscalaMonoFocus,
  topLeastEscala,
  topLeastPresenca,
  topSlowestResponders,
} from "../features/bi/biDomain";

const sortByClosing = (a, b) => String(a.closing || "").localeCompare(String(b.closing || ""));
const countBy = (items, predicate) => items.filter(predicate).length;
const shortDate = iso => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
};
const avgOf = (members, key) => {
  const values = members.map(m => m[key]).filter(v => v !== null && v !== undefined);
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
};

const TABS = [
  { id: "overview", label: "Visão geral", icon: "grid" },
  { id: "presenca", label: "Presença", icon: "check" },
  { id: "escala", label: "Escala", icon: "clipboard" },
  { id: "socios", label: "Sócios", icon: "user" },
];

// Em telas estreitas o dashboard mostra uma visão resumida: esconde heatmaps e
// gráficos pesados (que não cabem bem) e mantém KPIs, rankings e o essencial.
const useIsMobile = (query = "(max-width: 640px)") => {
  const get = () => typeof window !== "undefined" && window.matchMedia ? window.matchMedia(query).matches : false;
  const [isMobile, setIsMobile] = useState(get);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return undefined;
    const mql = window.matchMedia(query);
    const handler = event => setIsMobile(event.matches);
    setIsMobile(mql.matches);
    if (mql.addEventListener) mql.addEventListener("change", handler); else mql.addListener(handler);
    return () => { if (mql.removeEventListener) mql.removeEventListener("change", handler); else mql.removeListener(handler); };
  }, [query]);
  return isMobile;
};

export const DashboardScreen = ({ onNavigate, forms = [], events = [], user }) => {
  const [overview, setOverview] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [escala, setEscala] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [grau, setGrau] = useState(ALL_GRAUS);
  const [tab, setTab] = useState("overview");
  const [escalaMin, setEscalaMin] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedPersonKey, setSelectedPersonKey] = useState(null);
  const [rangePreset, setRangePreset] = useState("all");
  const [customRange, setCustomRange] = useState({ from: "", to: "" });
  const isMobile = useIsMobile();
  const barLabelWidth = isMobile ? 104 : 150;

  // Período efetivo enviado ao backend: atalho vira {from,to}; custom usa os
  // campos (só filtra quando ao menos uma data está preenchida).
  const range = useMemo(() => {
    if (rangePreset === "custom") {
      const from = customRange.from || undefined;
      const to = customRange.to || undefined;
      return from || to ? { from, to } : null;
    }
    return presetRange(rangePreset);
  }, [rangePreset, customRange]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const payload = await fetchBiDashboard(range);
        if (!active) return;
        setOverview(payload.overview);
        setTimeline(payload.timeline || []);
        setEscala(payload.escala || null);
        setError(null);
      } catch {
        if (active) setError("Não foi possível carregar o panorama.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [range?.from, range?.to]);

  const safeForms = Array.isArray(forms) ? forms : [];
  const safeEvents = Array.isArray(events) ? events : [];
  const allMembers = overview?.members || [];
  const graus = useMemo(() => sortGrauOptions(overview?.graus || []), [overview]);
  const filteredMembers = useMemo(() => filterByGrau(allMembers, grau), [allMembers, grau]);
  const presenca = useMemo(() => computePresencaKpi(filteredMembers), [filteredMembers]);
  const escalaTotals = overview?.escala || { totalSlots: 0, filledSlots: 0 };
  const escalaRate = rate(escalaTotals.filledSlots, escalaTotals.totalSlots);
  const grauChart = useMemo(() => presencaByGrau(allMembers), [allMembers]);
  const leastPresenca = useMemo(() => topLeastPresenca(filteredMembers), [filteredMembers]);
  const slowest = useMemo(() => topSlowestResponders(filteredMembers), [filteredMembers]);
  const leastEscala = useMemo(() => topLeastEscala(filteredMembers, 10, escalaMin), [filteredMembers, escalaMin]);
  const histogram = useMemo(() => timeToFillHistogram(filteredMembers), [filteredMembers]);
  const grauSuffix = grau === ALL_GRAUS ? "" : ` · ${grau}`;
  const isFiltered = grau !== ALL_GRAUS;

  const grauByKey = useMemo(() => new Map(allMembers.map(m => [m.personKey, m.grau])), [allMembers]);

  const trendData = useMemo(
    () => timelineForGrau(timeline, grau).map(point => ({ label: shortDate(point.date), value: point.rate, filled: point.filled, expected: point.expected, title: point.title })),
    [timeline, grau],
  );

  const presencaDetails = [
    { label: "Esperados", value: presenca.expected },
    { label: "Preenchidos", value: presenca.filled },
    { label: "Faltas", value: Math.max(presenca.expected - presenca.filled, 0), tone: "#c93c3c" },
    { label: "Tempo médio", value: formatDuration(avgOf(filteredMembers, "avgTimeToFillMinutes")) },
  ];
  const escalaDetails = [
    { label: "Vagas totais", value: escalaTotals.totalSlots },
    { label: "Preenchidas", value: escalaTotals.filledSlots },
    { label: "Em aberto", value: Math.max(escalaTotals.totalSlots - escalaTotals.filledSlots, 0), tone: "#c93c3c" },
  ];

  const stats = [
    { label: "Formulários de presença", value: countBy(safeForms, f => f.type === "presenca"), hint: `${countBy(safeForms, f => f.type === "presenca" && f.status === "aberto")} abertos`, icon: "form", accent: COLORS.primary },
    { label: "Escalas da Organ", value: countBy(safeForms, f => f.type === "escala_organ"), hint: `${countBy(safeForms, f => f.type === "escala_organ" && f.status === "aberto")} abertas`, icon: "clipboard", accent: COLORS.accent },
    { label: "Eventos encerrados", value: countBy(safeEvents, e => e.status === "encerrado"), hint: `${safeEvents.length} no total`, icon: "calendar", accent: COLORS.primary },
    { label: `Sócios acompanhados${grauSuffix}`, value: filteredMembers.length, hint: "na base ativa", icon: "user", accent: COLORS.accent },
  ];

  const upcomingClosings = useMemo(
    () => safeForms.filter(f => f.status === "aberto" && f.closing).sort(sortByClosing).slice(0, 5),
    [safeForms],
  );

  // Destaca o grau selecionado no gráfico por grau (demais esmaecidos).
  const grauChartColor = label => (isFiltered && label !== grau ? "var(--border)" : grauColor(label));

  const presencaKpiCard = (
    <KpiCard label={`Presença${grauSuffix}`} percent={formatPercent(presenca.rate)} caption={`${presenca.filled} de ${presenca.expected} esperados`} accent={COLORS.primary} icon="check" details={presencaDetails} />
  );
  const escalaKpiCard = isFiltered ? (
    <StatCard label={`Vagas de escala · ${grau}`} value={escalaAssumedByGrau(allMembers, grau)} hint="assumidas por sócios do grau" icon="clipboard" accent={COLORS.accent} />
  ) : (
    <KpiCard label="Escala da Organ" percent={formatPercent(escalaRate)} caption={`${escalaTotals.filledSlots} de ${escalaTotals.totalSlots} vagas`} accent={COLORS.accent} icon="clipboard" details={escalaDetails} />
  );

  const grauChartPanel = (
    <BiBarChart
      title="Presença por grau"
      hint="Taxa consolidada nos eventos encerrados."
      data={grauChart.map(item => ({ label: item.grau, value: item.rate, caption: formatPercent(item.rate), sub: `${item.filled}/${item.expected}` }))}
      emptyLabel="Sem eventos encerrados ainda."
      colorFor={grauChartColor}
    />
  );

  const trendPanel = (
    <div className="bi-panel">
      <div className="bi-panel-head">
        <div className="bi-panel-title">Evolução da presença{grauSuffix}</div>
        <div className="bi-panel-hint">Taxa de preenchimento por evento encerrado, na ordem do tempo.</div>
      </div>
      {trendData.length === 0
        ? <div className="bi-empty">Sem eventos encerrados ainda.</div>
        : <BiTrendChart data={trendData} valueFormatter={(value, p) => `${formatPercent(value)} · ${p.filled}/${p.expected}`} />}
    </div>
  );

  const presencaRanking = (
    <TopMembersPanel
      title="Top 10 — menos preenchem presença"
      hint="Menor taxa de presença nos eventos encerrados."
      items={leastPresenca.map(m => ({ personKey: m.personKey, personName: m.personName, grau: m.grau, value: formatPercent(m.fillRate), barPct: m.fillRate }))}
      emptyLabel="Sem eventos encerrados ainda."
      valueTone="#c93c3c"
      showBar
      onSelect={setSelectedPersonKey}
    />
  );

  const escalaRanking = (
    <TopMembersPanel
      title="Top 10 — menos fazem escala"
      hint="Menor número de vagas de escala assumidas."
      items={leastEscala.map(m => ({ personKey: m.personKey, personName: m.personName, grau: m.grau, value: `${m.escalaCount || 0}` }))}
      emptyLabel="Nenhuma escala registrada ainda."
      valueTone={COLORS.accent}
      onSelect={setSelectedPersonKey}
      headerControl={(
        <label className="bi-threshold">
          vagas ≥
          <select value={escalaMin} onChange={e => setEscalaMin(Number(e.target.value))}>
            {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      )}
    />
  );

  // Distribuição dos sócios por faixa de preenchimento (só quem já foi esperado).
  const fillDistribution = useMemo(() => presencaFillDistribution(filteredMembers), [filteredMembers]);

  // Vagas de escala assumidas por seção (global; a escala não guarda grau/vaga).
  const filledBySection = useMemo(() => escalaFilledBySection(escala?.vacancy || []), [escala]);

  // Foco na escala: entre quem faz escala da Organ, quem repete sempre a mesma
  // seção, quem só pegou uma vaga e quem circula (recalculado por grau).
  const focus = useMemo(() => {
    const people = (escala?.focus?.people || []).filter(p => grau === ALL_GRAUS || grauByKey.get(p.personKey) === grau);
    return {
      summary: summarizeEscalaFocus(people),
      mono: topEscalaMonoFocus(people).map(p => ({
        personKey: p.personKey,
        personName: p.personName,
        grau: grauByKey.get(p.personKey),
        value: `${p.total}× · ${p.topSection || "—"}`,
      })),
    };
  }, [escala, grau, grauByKey]);

  const focusStats = [
    { label: "Fazem escala", value: focus.summary.active, hint: "sócios com ao menos uma vaga assumida", icon: "users", accent: COLORS.accent },
    { label: "Sempre a mesma seção", value: focus.summary.mono, hint: "assumem 2+ vagas, todas na mesma seção", icon: "pin", accent: COLORS.warning },
    { label: "Só uma vaga", value: focus.summary.single, hint: "assumiram escala uma única vez", icon: "user", accent: COLORS.textSecondary },
    { label: "Circulam por seções", value: focus.summary.varied, hint: `passam por 2+ seções · média ${focus.summary.avgDistinct}`, icon: "grid", accent: "#1f9d6b" },
  ];

  // Diretório de sócios (aba Sócios).
  const directory = useMemo(() => {
    const term = search.trim().toLowerCase();
    return filteredMembers
      .filter(m => !term || m.personName.toLowerCase().includes(term))
      .sort((a, b) => a.personName.localeCompare(b.personName, "pt-BR"));
  }, [filteredMembers, search]);

  return (
    <div>
      <ScreenHeader className="settings-top-card" title="Dashboard" subtitle="Central de BI do núcleo: presença, escalas e participação por sócio." />

      <div style={{ marginBottom: 12 }}>
        <BiDateRangeFilter
          preset={rangePreset}
          from={customRange.from}
          to={customRange.to}
          onPreset={setRangePreset}
          onCustom={patch => { setRangePreset("custom"); setCustomRange(prev => ({ ...prev, ...patch })); }}
        />
      </div>

      {graus.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <GrauFilterChips graus={graus} value={grau} onChange={setGrau} />
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <BiTabs tabs={TABS} value={tab} onChange={setTab} />
      </div>

      {error && <FeedbackBanner tone="error" message={error} />}

      {loading ? (
        <div className="msg-empty" style={{ textAlign: "left" }}>Carregando panorama…</div>
      ) : tab === "overview" ? (
        <>
          <section className="dash-section">
            <div className="dash-section-head"><h3>Visão geral{grauSuffix}</h3></div>
            <div className="bi-kpi-grid">{presencaKpiCard}{escalaKpiCard}</div>
            <div className="bi-stats-grid" style={{ marginTop: 12 }}>
              {stats.map(stat => <StatCard key={stat.label} label={stat.label} value={stat.value} hint={stat.hint} icon={stat.icon} accent={stat.accent} />)}
            </div>
          </section>
          <section className="dash-section">{trendPanel}</section>
          <section className="dash-section">
            <div className="bi-lists-grid">{grauChartPanel}<DashboardUpcomingClosings forms={upcomingClosings} onNavigate={onNavigate} formatClosing={formatDateTime} /></div>
          </section>
        </>
      ) : tab === "presenca" ? (
        <>
          <section className="dash-section">
            <div className="bi-kpi-grid">{presencaKpiCard}{grauChartPanel}</div>
          </section>
          <section className="dash-section">{trendPanel}</section>
          <section className="dash-section">
            <div className="bi-panel">
              <div className="bi-panel-head">
                <div className="bi-panel-title">Distribuição do tempo de resposta</div>
                <div className="bi-panel-hint">Quantos sócios respondem em cada faixa de tempo (média por sócio).</div>
              </div>
              <BiHistogramChart data={histogram} valueFormatter={v => `${v} sócios`} />
            </div>
          </section>
          <section className="dash-section">
            <div className="bi-panel">
              <div className="bi-panel-head">
                <div className="bi-panel-title">Preenchimento por sócio{grauSuffix}</div>
                <div className="bi-panel-hint">Quantos sócios ficam em cada faixa de preenchimento (só quem já foi esperado).</div>
              </div>
              {filteredMembers.some(m => (m.presencaExpected || 0) > 0)
                ? <BiHistogramChart data={fillDistribution} color="#1f9d6b" valueFormatter={v => `${v} sócios`} />
                : <div className="bi-empty">Sem eventos encerrados ainda.</div>}
            </div>
          </section>
          <section className="dash-section">
            <div className="bi-lists-grid">
              {presencaRanking}
              <TopMembersPanel
                title="Top 10 — respondem mais devagar"
                hint="Maior tempo médio entre a abertura e a resposta."
                items={slowest.map(m => ({ personKey: m.personKey, personName: m.personName, grau: m.grau, value: formatDuration(m.avgTimeToFillMinutes) }))}
                emptyLabel="Sem respostas registradas ainda."
                valueTone={COLORS.warning}
                onSelect={setSelectedPersonKey}
              />
            </div>
          </section>
        </>
      ) : tab === "escala" ? (
        <>
          <section className="dash-section">
            <div className="bi-kpi-grid">
              {escalaKpiCard}
              <div className="bi-panel">
                <div className="bi-panel-head">
                  <div className="bi-panel-title">Vacância por seção</div>
                  <div className="bi-panel-hint">% de vagas que ficam vazias — quais seções faltam gente.</div>
                </div>
                {escala?.vacancy?.length
                  ? <BiHBarChart data={escala.vacancy.map(v => ({ label: v.title, value: v.vacancy }))} color={COLORS.danger} labelWidth={barLabelWidth} valueFormatter={(v, p) => `${formatPercent(v)} vazias (${p.filledSlots}/${p.totalSlots})`} />
                  : <div className="bi-empty">Sem escalas registradas.</div>}
              </div>
            </div>
          </section>
          <section className="dash-section">
            <div className="bi-panel">
              <div className="bi-panel-head">
                <div className="bi-panel-title">Tempo médio para preencher por seção</div>
                <div className="bi-panel-hint">Da abertura do evento até a inscrição — qual seção demora mais.</div>
              </div>
              {escala?.timing?.length
                ? <BiHBarChart data={escala.timing.map(t => ({ label: t.title, value: t.avgMinutes || 0 }))} color={COLORS.warning} labelWidth={barLabelWidth} valueFormatter={(v, p) => `${formatDuration(v)} em média (${p.count} vagas)`} />
                : <div className="bi-empty">Sem inscrições com horário registrado.</div>}
            </div>
          </section>
          <section className="dash-section">
            <div className="bi-panel">
              <div className="bi-panel-head">
                <div className="bi-panel-title">Seções mais assumidas</div>
                <div className="bi-panel-hint">Total de vagas preenchidas por seção — onde há mais gente.</div>
              </div>
              {filledBySection.length
                ? <BiHBarChart data={filledBySection} color={COLORS.primary} labelWidth={barLabelWidth} valueFormatter={v => `${v} ${v === 1 ? "vaga" : "vagas"}`} />
                : <div className="bi-empty">Sem escalas registradas.</div>}
            </div>
          </section>
          <section className="dash-section">
            <div className="dash-section-head"><h3>Foco na escala{grauSuffix}</h3></div>
            <div className="bi-stats-grid">
              {focusStats.map(stat => <StatCard key={stat.label} label={stat.label} value={stat.value} hint={stat.hint} icon={stat.icon} accent={stat.accent} />)}
            </div>
          </section>
          <section className="dash-section">
            <div className="bi-lists-grid">
              {escalaRanking}
              <TopMembersPanel
                title="Sempre a mesma seção"
                hint="Sócios que assumem 2+ vagas, mas sempre na mesma seção da Organ."
                items={focus.mono}
                emptyLabel="Ninguém repetindo a mesma seção ainda."
                valueTone={COLORS.warning}
                onSelect={setSelectedPersonKey}
              />
            </div>
          </section>
        </>
      ) : (
        <section className="dash-section">
          <div className="bi-panel">
            <div className="bi-panel-head bi-panel-head--row">
              <div>
                <div className="bi-panel-title">Diretório de sócios{grauSuffix}</div>
                <div className="bi-panel-hint">{directory.length} sócios · clique para abrir o perfil completo.</div>
              </div>
              <div className="bi-search">
                <Icon name="search" size={15} />
                <input type="text" placeholder="Buscar por nome" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <MembersTable members={directory} onSelect={setSelectedPersonKey} />
          </div>
        </section>
      )}

      {selectedPersonKey && (
        <MemberProfilePanel personKey={selectedPersonKey} forms={safeForms} onNavigate={onNavigate} onClose={() => setSelectedPersonKey(null)} />
      )}
    </div>
  );
};
