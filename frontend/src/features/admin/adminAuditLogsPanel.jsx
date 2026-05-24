/**
 * @file frontend/src/features/admin/adminAuditLogsPanel.jsx
 * @summary Painel de auditoria da central administrativa.
 * @responsibility Carregar, filtrar e renderizar logs de auditoria.
 */

import React, { useEffect, useState } from "react";
import { Btn, COLORS, FeedbackBanner, resolveActionErrorMessage } from "../../components/ui";
import { fetchAuditLogs } from "../../lib/api";
import { ADMIN_INPUT_STYLE } from "./adminSettingsConstants";

const emptyAuditFilters = {
  from: "",
  to: "",
  level: "",
  category: "",
  action: "",
  status: "",
  screen: "",
  actor: "",
  entityType: "",
  entityId: "",
  search: "",
};

export const AuditLogsPanel = ({ currentUser }) => {
  const [draftFilters, setDraftFilters] = useState(emptyAuditFilters);
  const [appliedFilters, setAppliedFilters] = useState(emptyAuditFilters);
  const [page, setPage] = useState(1);
  const [state, setState] = useState({
    loading: true,
    error: null,
    items: [],
    total: 0,
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const payload = await fetchAuditLogs({
          ...appliedFilters,
          limit: 10,
          offset: (page - 1) * 10,
        });
        if (!active) return;
        setState({
          loading: false,
          error: null,
          items: Array.isArray(payload.items) ? payload.items : [],
          total: Number(payload.total || 0),
        });
      } catch (error) {
        if (!active) return;
        setState(prev => ({
          ...prev,
          loading: false,
          error: resolveActionErrorMessage(error),
        }));
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [appliedFilters, page]);

  const updateFilter = (key, value) => {
    setDraftFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setPage(1);
    setAppliedFilters(draftFilters);
  };

  const clearFilters = () => {
    setPage(1);
    setDraftFilters(emptyAuditFilters);
    setAppliedFilters(emptyAuditFilters);
  };

  const totalPages = Math.max(1, Math.ceil(state.total / 10));
  const safePage = Math.min(page, totalPages);
  const fromIndex = state.total === 0 ? 0 : ((safePage - 1) * 10) + 1;
  const toIndex = Math.min(safePage * 10, state.total);

  return (
    <section style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <AuditTextInput label="Periodo inicial" type="date" value={draftFilters.from} onChange={value => updateFilter("from", value)} />
        <AuditTextInput label="Periodo final" type="date" value={draftFilters.to} onChange={value => updateFilter("to", value)} />
        <AuditTextInput label="Usuario" value={draftFilters.actor} placeholder="Nome do actor" onChange={value => updateFilter("actor", value)} />
        <AuditTextInput label="Tela" value={draftFilters.screen} placeholder="configuracoes, auth..." onChange={value => updateFilter("screen", value)} />
        <AuditTextInput label="Categoria" value={draftFilters.category} placeholder="forms, admin..." onChange={value => updateFilter("category", value)} />
        <AuditTextInput label="Acao" value={draftFilters.action} placeholder="create_form" onChange={value => updateFilter("action", value)} />
        <AuditSelect label="Status" value={draftFilters.status} onChange={value => updateFilter("status", value)} options={["success", "failure", "denied", "conflict"]} />
        <AuditSelect label="Nivel" value={draftFilters.level} onChange={value => updateFilter("level", value)} options={["info", "warn", "error"]} />
        <AuditTextInput label="Tipo de entidade" value={draftFilters.entityType} placeholder="form, user..." onChange={value => updateFilter("entityType", value)} />
        <AuditTextInput label="Id da entidade" value={draftFilters.entityId} placeholder="1" onChange={value => updateFilter("entityId", value)} />
        <AuditTextInput label="Texto" value={draftFilters.search} placeholder="Pesquisar mensagem ou contexto" onChange={value => updateFilter("search", value)} style={{ gridColumn: "1 / -1" }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <div style={{ color: COLORS.textMuted, fontSize: 12 }}>
          {state.total} evento(s) encontrados
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn v="secondary" sz="sm" onClick={clearFilters}>Limpar filtros</Btn>
          <Btn sz="sm" onClick={applyFilters}>Aplicar filtros</Btn>
        </div>
      </div>

      {state.loading && <FeedbackBanner tone="loading" message="Carregando auditoria..." />}
      {state.error && <FeedbackBanner tone="error" message={state.error} />}
      {!state.loading && !state.error && state.items.length === 0 && (
        <div style={{ color: COLORS.textMuted, fontSize: 12, padding: "12px 0" }}>Nenhum log encontrado para os filtros atuais.</div>
      )}

      {!state.loading && !state.error && state.items.length > 0 && <AuditTable items={state.items} />}

      {!state.loading && !state.error && state.total > 10 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: COLORS.textMuted }}>
            {fromIndex}-{toIndex} de {state.total}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <Btn v="secondary" sz="sm" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={safePage === 1}>Anterior</Btn>
            <Btn v="secondary" sz="sm" onClick={() => setPage(current => Math.min(totalPages, current + 1))} disabled={safePage === totalPages}>Proxima</Btn>
          </div>
        </div>
      )}
    </section>
  );
};

const AuditTextInput = ({ label, value, onChange, placeholder = "", type = "text", style }) => (
  <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, ...style }}>
    {label}
    <input type={type} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} style={{ ...ADMIN_INPUT_STYLE, marginTop: 4 }} />
  </label>
);

const AuditSelect = ({ label, value, onChange, options }) => (
  <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>
    {label}
    <select value={value} onChange={event => onChange(event.target.value)} style={{ ...ADMIN_INPUT_STYLE, marginTop: 4 }}>
      <option value="">Todos</option>
      {options.map(option => <option key={option} value={option}>{option[0].toUpperCase() + option.slice(1)}</option>)}
    </select>
  </label>
);

const AuditTable = ({ items }) => (
  <div className="ui-table-wrap">
    <table className="ui-table" style={{ fontSize: 12, minWidth: 920 }}>
      <thead>
        <tr>
          {["Data", "Usuario", "Acao", "Status", "Tela", "Entidade", "Mensagem", "Metadata"].map(label => (
            <th key={label}>{label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map(item => (
          <tr key={item.id}>
            <td style={{ whiteSpace: "nowrap" }}>{new Date(item.createdAt).toLocaleString("pt-BR")}</td>
            <td>
              <div style={{ fontWeight: 800, color: COLORS.text }}>{item.actorName || "Visitante"}</div>
              <div style={{ color: COLORS.textSecondary, fontSize: 11 }}>{item.actorRole || "visitor"}</div>
            </td>
            <td>{item.action}</td>
            <td>{item.status}</td>
            <td>{item.screen || "-"}</td>
            <td>
              <div style={{ fontWeight: 700 }}>{item.entityType || "-"}</div>
              <div style={{ color: COLORS.textSecondary, fontSize: 11 }}>{item.entityLabel || item.entityId || "-"}</div>
            </td>
            <td>{item.message || "-"}</td>
            <td style={{ fontSize: 11, color: COLORS.textSecondary }}>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "inherit" }}>
                {JSON.stringify(item.metadata || {}, null, 2)}
              </pre>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
