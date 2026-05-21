/**
 * @file frontend/src/features/admin/adminSettingsShared.jsx
 * @summary Blocos compartilhados da central administrativa.
 * @responsibility Reunir helpers, constantes e paineis reutilizaveis do admin.
 */

import React, { useEffect, useState } from "react";
import { COLORS, Btn, FeedbackBanner, FieldControl, NotePanel, SurfacePanel, resolveActionErrorMessage } from "../../components/ui";
import { fetchAuditLogs } from "../../lib/api";

export const PAGE_SIZE = 6;
export const ADMIN_INPUT_STYLE = {
  width: "100%",
  minHeight: 42,
  padding: "10px 12px",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 10,
  background: COLORS.surface,
  color: COLORS.text,
  boxShadow: "var(--shadow-sm)",
};
export const DEFAULT_GRID_ROWS = ["Opcao 1", "Opcao 2"];
export const DEFAULT_GRID_COLS = ["0", "1", "2", "3"];
export const SCALE_PRESETS = [
  { label: "0 a 3", cols: ["0", "1", "2", "3"] },
  { label: "0 a 5", cols: ["0", "1", "2", "3", "4", "5"] },
  { label: "1 a 5", cols: ["1", "2", "3", "4", "5"] },
  { label: "Ruim / Bom", cols: ["Ruim", "Regular", "Bom", "Otimo"] },
];

export const fieldTypeLabels = {
  person_select: "Seletor por base",
  yes_no: "Sim / Nao",
  number: "Numero",
  text: "Texto",
  grid: "Grade",
};

export const fieldCategoryLabels = {
  presenca: "Presenca",
  quantidade: "Quantidade",
  texto: "Texto",
  avaliacao: "Avaliacao",
  outro: "Outro",
};

export const taskCategoryLabels = {
  cozinha: "Cozinha",
  limpeza: "Limpeza",
  organizacao: "Organizacao",
  sessao: "Sessao",
  outro: "Outro",
};

export const normalizeFieldSelectionSource = field => {
  if (field?.type !== "person_select") return undefined;
  if (field.selectionSource?.kind === "external_base") {
    return {
      kind: "external_base",
      externalBaseId: Number(field.selectionSource.externalBaseId || 0),
    };
  }
  return { kind: "members" };
};

export const normalizeIdentifier = value => String(value || "")
  .trim()
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "");

export const getExternalBaseName = (externalBases, baseId) => (externalBases || []).find(base => String(base.id) === String(baseId || ""))?.name || "base externa";

export const PaginatedList = ({ items, emptyText, renderItem }) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = items.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (items.length === 0) {
    return <div style={{ color: COLORS.textMuted, fontSize: 12, padding: "12px 0" }}>{emptyText}</div>;
  }

  return (
    <div>
      {visible.map(renderItem)}
      {items.length > PAGE_SIZE && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: COLORS.textMuted }}>
            {((safePage - 1) * PAGE_SIZE) + 1}-{Math.min(safePage * PAGE_SIZE, items.length)} de {items.length}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <Btn v="secondary" sz="sm" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={safePage === 1}>Anterior</Btn>
            <Btn v="secondary" sz="sm" onClick={() => setPage(current => Math.min(totalPages, current + 1))} disabled={safePage === totalPages}>Proxima</Btn>
          </div>
        </div>
      )}
    </div>
  );
};

export const FieldCatalogPreview = ({ draft, externalBases }) => {
  const label = draft.defaultLabel.trim() || draft.name.trim() || "Rotulo do campo";
  const gridRows = draft.gridSchema?.rows?.filter(Boolean)?.length ? draft.gridSchema.rows.filter(Boolean) : DEFAULT_GRID_ROWS;
  const gridCols = draft.gridSchema?.cols?.filter(Boolean)?.length ? draft.gridSchema.cols.filter(Boolean) : DEFAULT_GRID_COLS;
  const externalBase = draft.selectionSource?.kind === "external_base"
    ? (externalBases || []).find(base => String(base.id) === String(draft.selectionSource.externalBaseId || ""))
    : null;
  return (
    <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginBottom: 10 }}>
        <strong style={{ fontSize: 12, color: COLORS.text }}>Previa do campo</strong>
        <span style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 800, textTransform: "uppercase" }}>{fieldTypeLabels[draft.type]}</span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>{label}</div>
      {draft.type === "person_select" && (
        <>
          <select disabled style={{ width: "100%", minHeight: 42, padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 10, background: COLORS.surface, color: COLORS.text, boxShadow: "var(--shadow-sm)" }}>
            <option>{draft.selectionSource?.kind === "external_base" ? "Selecione uma opcao..." : "Selecione uma pessoa..."}</option>
          </select>
          <div style={{ marginTop: 8, fontSize: 11, color: COLORS.textMuted, lineHeight: 1.45 }}>
            {draft.selectionSource?.kind === "external_base"
              ? `Vinculo configurado: ${externalBase?.name || "base externa"}`
              : "Vinculo configurado: base central de socios"}
          </div>
        </>
      )}
      {draft.type === "yes_no" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button disabled style={{ padding: 10, border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, background: COLORS.surface, color: COLORS.text, fontWeight: 800 }}>Sim</button>
          <button disabled style={{ padding: 10, border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, background: COLORS.surface, color: COLORS.text, fontWeight: 800 }}>Nao</button>
        </div>
      )}
      {draft.type === "number" && <input disabled type="number" placeholder="0" style={{ width: "100%", minHeight: 42, padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 10, background: COLORS.surface, color: COLORS.text, boxShadow: "var(--shadow-sm)" }} />}
      {draft.type === "text" && <input disabled placeholder="Resposta curta" style={{ width: "100%", minHeight: 42, padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 10, background: COLORS.surface, color: COLORS.text, boxShadow: "var(--shadow-sm)" }} />}
      {draft.type === "grid" && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ padding: 6, textAlign: "left", borderBottom: `2px solid ${COLORS.borderLight}` }} />
                {gridCols.map((col, index) => <th key={index} style={{ padding: 6, textAlign: "center", borderBottom: `2px solid ${COLORS.borderLight}`, color: COLORS.textSecondary }}>{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {gridRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  <td style={{ padding: 6, color: COLORS.text, borderBottom: `1px solid ${COLORS.borderLight}` }}>{row}</td>
                  {gridCols.map((_, colIndex) => <td key={colIndex} style={{ padding: 6, textAlign: "center", borderBottom: `1px solid ${COLORS.borderLight}` }}><input disabled type="radio" /></td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export const GridSchemaEditor = ({ value, onChange }) => {
  const rows = value?.rows?.length ? value.rows : DEFAULT_GRID_ROWS;
  const cols = value?.cols?.length ? value.cols : DEFAULT_GRID_COLS;
  const updateRow = (index, nextValue) => onChange({ rows: rows.map((row, rowIndex) => rowIndex === index ? nextValue : row), cols });
  const updateCol = (index, nextValue) => onChange({ rows, cols: cols.map((col, colIndex) => colIndex === index ? nextValue : col) });

  return (
    <div style={{ display: "grid", gap: 10, background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 10 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, color: COLORS.textSecondary, marginBottom: 6 }}>Linhas da matriz</div>
        {rows.map((row, index) => (
          <div key={index} style={{ display: "flex", gap: 6, marginBottom: 5 }}>
            <input value={row} onChange={e => updateRow(index, e.target.value)} placeholder={`Linha ${index + 1}`} style={{ width: "100%", minHeight: 42, padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 10, background: COLORS.surface, color: COLORS.text, boxShadow: "var(--shadow-sm)", flex: 1 }} />
            <button onClick={() => onChange({ rows: rows.filter((_, rowIndex) => rowIndex !== index), cols })} style={{ border: 0, background: "transparent", color: COLORS.danger, cursor: "pointer" }}>Remover</button>
          </div>
        ))}
        <Btn v="secondary" sz="sm" onClick={() => onChange({ rows: [...rows, ""], cols })}>Adicionar linha</Btn>
      </div>
      <div>
        <div style={{ fontSize: 11, fontWeight: 800, color: COLORS.textSecondary, marginBottom: 6 }}>Colunas da matriz</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
          {SCALE_PRESETS.map(preset => <Btn key={preset.label} v="ghost" sz="sm" onClick={() => onChange({ rows, cols: preset.cols })}>{preset.label}</Btn>)}
        </div>
        {cols.map((col, index) => (
          <div key={index} style={{ display: "flex", gap: 6, marginBottom: 5 }}>
            <input value={col} onChange={e => updateCol(index, e.target.value)} placeholder={`Coluna ${index + 1}`} style={{ width: "100%", minHeight: 42, padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 10, background: COLORS.surface, color: COLORS.text, boxShadow: "var(--shadow-sm)", flex: 1 }} />
            <button onClick={() => onChange({ rows, cols: cols.filter((_, colIndex) => colIndex !== index) })} style={{ border: 0, background: "transparent", color: COLORS.danger, cursor: "pointer" }}>Remover</button>
          </div>
        ))}
        <Btn v="secondary" sz="sm" onClick={() => onChange({ rows, cols: [...cols, ""] })}>Adicionar coluna</Btn>
      </div>
    </div>
  );
};

export const AuditLogsPanel = ({ currentUser }) => {
  const [draftFilters, setDraftFilters] = useState({
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
  });
  const [appliedFilters, setAppliedFilters] = useState(draftFilters);
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
    setDraftFilters({
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
    });
    setAppliedFilters({
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
    });
  };

  const totalPages = Math.max(1, Math.ceil(state.total / 10));
  const safePage = Math.min(page, totalPages);
  const fromIndex = state.total === 0 ? 0 : ((safePage - 1) * 10) + 1;
  const toIndex = Math.min(safePage * 10, state.total);

  return (
    <section style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>
          Periodo inicial
          <input type="date" value={draftFilters.from} onChange={e => updateFilter("from", e.target.value)} style={{ width: "100%", minHeight: 42, padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 10, background: COLORS.surface, color: COLORS.text, boxShadow: "var(--shadow-sm)", marginTop: 4 }} />
        </label>
        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>
          Periodo final
          <input type="date" value={draftFilters.to} onChange={e => updateFilter("to", e.target.value)} style={{ width: "100%", minHeight: 42, padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 10, background: COLORS.surface, color: COLORS.text, boxShadow: "var(--shadow-sm)", marginTop: 4 }} />
        </label>
        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>
          Usuario
          <input value={draftFilters.actor} onChange={e => updateFilter("actor", e.target.value)} placeholder="Nome do actor" style={{ width: "100%", minHeight: 42, padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 10, background: COLORS.surface, color: COLORS.text, boxShadow: "var(--shadow-sm)", marginTop: 4 }} />
        </label>
        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>
          Tela
          <input value={draftFilters.screen} onChange={e => updateFilter("screen", e.target.value)} placeholder="configuracoes, auth..." style={{ width: "100%", minHeight: 42, padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 10, background: COLORS.surface, color: COLORS.text, boxShadow: "var(--shadow-sm)", marginTop: 4 }} />
        </label>
        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>
          Categoria
          <input value={draftFilters.category} onChange={e => updateFilter("category", e.target.value)} placeholder="forms, admin..." style={{ width: "100%", minHeight: 42, padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 10, background: COLORS.surface, color: COLORS.text, boxShadow: "var(--shadow-sm)", marginTop: 4 }} />
        </label>
        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>
          Acao
          <input value={draftFilters.action} onChange={e => updateFilter("action", e.target.value)} placeholder="create_form" style={{ width: "100%", minHeight: 42, padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 10, background: COLORS.surface, color: COLORS.text, boxShadow: "var(--shadow-sm)", marginTop: 4 }} />
        </label>
        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>
          Status
          <select value={draftFilters.status} onChange={e => updateFilter("status", e.target.value)} style={{ width: "100%", minHeight: 42, padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 10, background: COLORS.surface, color: COLORS.text, boxShadow: "var(--shadow-sm)", marginTop: 4 }}>
            <option value="">Todos</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="denied">Denied</option>
            <option value="conflict">Conflict</option>
          </select>
        </label>
        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>
          Nivel
          <select value={draftFilters.level} onChange={e => updateFilter("level", e.target.value)} style={{ width: "100%", minHeight: 42, padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 10, background: COLORS.surface, color: COLORS.text, boxShadow: "var(--shadow-sm)", marginTop: 4 }}>
            <option value="">Todos</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
          </select>
        </label>
        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>
          Tipo de entidade
          <input value={draftFilters.entityType} onChange={e => updateFilter("entityType", e.target.value)} placeholder="form, user..." style={{ width: "100%", minHeight: 42, padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 10, background: COLORS.surface, color: COLORS.text, boxShadow: "var(--shadow-sm)", marginTop: 4 }} />
        </label>
        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>
          Id da entidade
          <input value={draftFilters.entityId} onChange={e => updateFilter("entityId", e.target.value)} placeholder="1" style={{ width: "100%", minHeight: 42, padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 10, background: COLORS.surface, color: COLORS.text, boxShadow: "var(--shadow-sm)", marginTop: 4 }} />
        </label>
        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, gridColumn: "1 / -1" }}>
          Texto
          <input value={draftFilters.search} onChange={e => updateFilter("search", e.target.value)} placeholder="Pesquisar mensagem ou contexto" style={{ width: "100%", minHeight: 42, padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 10, background: COLORS.surface, color: COLORS.text, boxShadow: "var(--shadow-sm)", marginTop: 4 }} />
        </label>
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

      {!state.loading && !state.error && state.items.length > 0 && (
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
              {state.items.map(item => (
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
      )}

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

export const AdminField = ({ children, style }) => (
  <div className="admin-field" style={{ display: "grid", gap: 6, ...style }}>
    {children}
  </div>
);
