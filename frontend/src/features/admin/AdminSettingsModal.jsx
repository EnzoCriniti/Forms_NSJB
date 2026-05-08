/**
 * @file frontend/src/features/admin/AdminSettingsModal.jsx
 * @summary Central administrativa do frontend.
 * @responsibility Gerenciar usuarios, socios, catalogos, classificacoes e templates.
 */

import React, { useEffect, useState } from "react";
import { COLORS, Btn, ConfirmModal, FeedbackBanner, resolveActionErrorMessage } from "../../components/ui";
import { fetchAuditLogs } from "../../lib/api";
import { ROLES } from "../../lib/auth";
import { MemberListConfigModalContent } from "../members/MemberListConfigModal";

const inputStyle = {
  width: "100%",
  minHeight: 42,
  padding: "10px 12px",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 10,
  background: COLORS.surface,
  color: COLORS.text,
  boxShadow: "var(--shadow-sm)",
};

const PAGE_SIZE = 6;
const DEFAULT_GRID_ROWS = ["Opcao 1", "Opcao 2"];
const DEFAULT_GRID_COLS = ["0", "1", "2", "3"];
const SCALE_PRESETS = [
  { label: "0 a 3", cols: ["0", "1", "2", "3"] },
  { label: "0 a 5", cols: ["0", "1", "2", "3", "4", "5"] },
  { label: "1 a 5", cols: ["1", "2", "3", "4", "5"] },
  { label: "Ruim / Bom", cols: ["Ruim", "Regular", "Bom", "Otimo"] },
];
const emptyUser = { name: "", username: "", password: "", role: "viewer" };
const emptyLabel = { name: "", color: "#2e7d32" };
const emptyPreset = { name: "", type: "presenca", fieldDefinitions: [], scaleSections: [] };
const emptyFieldCatalog = { key: "", name: "", type: "yes_no", category: "presenca", defaultLabel: "", gridSchema: { rows: DEFAULT_GRID_ROWS, cols: DEFAULT_GRID_COLS }, description: "", active: true };
const emptyScaleTaskCatalog = { key: "", name: "", category: "cozinha", defaultLabel: "", description: "", active: true };
const emptySecurityDraft = { currentMasterKey: "", newMasterKey: "" };
const EMPTY_AUDIT_FILTERS = {
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
const AUDIT_PAGE_SIZE = 10;

const fieldTypeLabels = {
  person_select: "Nome da base",
  yes_no: "Sim / Nao",
  number: "Numero",
  text: "Texto",
  grid: "Grade",
};

const fieldCategoryLabels = {
  presenca: "Presenca",
  quantidade: "Quantidade",
  texto: "Texto",
  avaliacao: "Avaliacao",
  outro: "Outro",
};

const taskCategoryLabels = {
  cozinha: "Cozinha",
  limpeza: "Limpeza",
  organizacao: "Organizacao",
  sessao: "Sessao",
  outro: "Outro",
};

const normalizeIdentifier = value => String(value || "")
  .trim()
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "");

const PaginatedList = ({ items, emptyText, renderItem }) => {
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

const FieldCatalogPreview = ({ draft }) => {
  const label = draft.defaultLabel.trim() || draft.name.trim() || "Rotulo do campo";
  const gridRows = draft.gridSchema?.rows?.filter(Boolean)?.length ? draft.gridSchema.rows.filter(Boolean) : DEFAULT_GRID_ROWS;
  const gridCols = draft.gridSchema?.cols?.filter(Boolean)?.length ? draft.gridSchema.cols.filter(Boolean) : DEFAULT_GRID_COLS;
  return (
    <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginBottom: 10 }}>
        <strong style={{ fontSize: 12, color: COLORS.text }}>Previa do campo</strong>
        <span style={{ fontSize: 10, color: COLORS.textMuted, fontWeight: 800, textTransform: "uppercase" }}>{fieldTypeLabels[draft.type]}</span>
      </div>
      <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>{label}</div>
      {draft.type === "person_select" && <select disabled style={inputStyle}><option>Selecione uma pessoa...</option></select>}
      {draft.type === "yes_no" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button disabled style={{ padding: 10, border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, background: COLORS.surface, color: COLORS.text, fontWeight: 800 }}>Sim</button>
          <button disabled style={{ padding: 10, border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, background: COLORS.surface, color: COLORS.text, fontWeight: 800 }}>Nao</button>
        </div>
      )}
      {draft.type === "number" && <input disabled type="number" placeholder="0" style={inputStyle} />}
      {draft.type === "text" && <input disabled placeholder="Resposta curta" style={inputStyle} />}
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

const GridSchemaEditor = ({ value, onChange }) => {
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
            <input value={row} onChange={e => updateRow(index, e.target.value)} placeholder={`Linha ${index + 1}`} style={{ ...inputStyle, padding: "6px 10px", flex: 1 }} />
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
            <input value={col} onChange={e => updateCol(index, e.target.value)} placeholder={`Coluna ${index + 1}`} style={{ ...inputStyle, padding: "6px 10px", flex: 1 }} />
            <button onClick={() => onChange({ rows, cols: cols.filter((_, colIndex) => colIndex !== index) })} style={{ border: 0, background: "transparent", color: COLORS.danger, cursor: "pointer" }}>Remover</button>
          </div>
        ))}
        <Btn v="secondary" sz="sm" onClick={() => onChange({ rows, cols: [...cols, ""] })}>Adicionar coluna</Btn>
      </div>
    </div>
  );
};

const AuditLogsPanel = ({ currentUser }) => {
  const [draftFilters, setDraftFilters] = useState(EMPTY_AUDIT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_AUDIT_FILTERS);
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
          limit: AUDIT_PAGE_SIZE,
          offset: (page - 1) * AUDIT_PAGE_SIZE,
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
    setDraftFilters(EMPTY_AUDIT_FILTERS);
    setAppliedFilters(EMPTY_AUDIT_FILTERS);
  };

  const totalPages = Math.max(1, Math.ceil(state.total / AUDIT_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const fromIndex = state.total === 0 ? 0 : ((safePage - 1) * AUDIT_PAGE_SIZE) + 1;
  const toIndex = Math.min(safePage * AUDIT_PAGE_SIZE, state.total);

  return (
    <section style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>
          Periodo inicial
          <input type="date" value={draftFilters.from} onChange={e => updateFilter("from", e.target.value)} style={{ ...inputStyle, marginTop: 4 }} />
        </label>
        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>
          Periodo final
          <input type="date" value={draftFilters.to} onChange={e => updateFilter("to", e.target.value)} style={{ ...inputStyle, marginTop: 4 }} />
        </label>
        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>
          Usuario
          <input value={draftFilters.actor} onChange={e => updateFilter("actor", e.target.value)} placeholder="Nome do actor" style={{ ...inputStyle, marginTop: 4 }} />
        </label>
        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>
          Tela
          <input value={draftFilters.screen} onChange={e => updateFilter("screen", e.target.value)} placeholder="configuracoes, auth..." style={{ ...inputStyle, marginTop: 4 }} />
        </label>
        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>
          Categoria
          <input value={draftFilters.category} onChange={e => updateFilter("category", e.target.value)} placeholder="forms, admin..." style={{ ...inputStyle, marginTop: 4 }} />
        </label>
        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>
          Acao
          <input value={draftFilters.action} onChange={e => updateFilter("action", e.target.value)} placeholder="create_form" style={{ ...inputStyle, marginTop: 4 }} />
        </label>
        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>
          Status
          <select value={draftFilters.status} onChange={e => updateFilter("status", e.target.value)} style={{ ...inputStyle, marginTop: 4 }}>
            <option value="">Todos</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
            <option value="denied">Denied</option>
            <option value="conflict">Conflict</option>
          </select>
        </label>
        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>
          Nivel
          <select value={draftFilters.level} onChange={e => updateFilter("level", e.target.value)} style={{ ...inputStyle, marginTop: 4 }}>
            <option value="">Todos</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
          </select>
        </label>
        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>
          Tipo de entidade
          <input value={draftFilters.entityType} onChange={e => updateFilter("entityType", e.target.value)} placeholder="form, user..." style={{ ...inputStyle, marginTop: 4 }} />
        </label>
        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>
          Id da entidade
          <input value={draftFilters.entityId} onChange={e => updateFilter("entityId", e.target.value)} placeholder="1" style={{ ...inputStyle, marginTop: 4 }} />
        </label>
        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, gridColumn: "1 / -1" }}>
          Texto
          <input value={draftFilters.search} onChange={e => updateFilter("search", e.target.value)} placeholder="Pesquisar mensagem ou contexto" style={{ ...inputStyle, marginTop: 4 }} />
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

      {!state.loading && !state.error && state.total > AUDIT_PAGE_SIZE && (
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

const AdminField = ({ children, style }) => (
  <div style={{ display: "grid", gap: 6, ...style }}>
    {children}
  </div>
);

export const AdminSettingsModal = ({
  users,
  labels,
  presets,
  fieldCatalog = [],
  scaleTaskCatalog = [],
  membersConfig,
  people,
  currentUser,
  onSaveUser,
  onDeleteUser,
  onSaveLabel,
  onDeleteLabel,
  onSavePreset,
  onDeletePreset,
  onSaveFieldCatalogItem,
  onDeleteFieldCatalogItem,
  onSaveScaleTaskCatalogItem,
  onDeleteScaleTaskCatalogItem,
  onSaveMembersConfig,
  onSavePeople,
  onSyncMembersConfig,
  formDeleteKeyConfigured = null,
  onSaveFormDeleteKey,
  onClose,
  mode = "modal",
}) => {
  const [tab, setTab] = useState("users");
  const [userDraft, setUserDraft] = useState(emptyUser);
  const [labelDraft, setLabelDraft] = useState(emptyLabel);
  const [presetDraft, setPresetDraft] = useState(emptyPreset);
  const [fieldCatalogDraft, setFieldCatalogDraft] = useState(emptyFieldCatalog);
  const [scaleTaskDraft, setScaleTaskDraft] = useState(emptyScaleTaskCatalog);
  const [securityDraft, setSecurityDraft] = useState(emptySecurityDraft);
  const [catalogMode, setCatalogMode] = useState("fields");
  const [feedback, setFeedback] = useState(null);
  const [busyAction, setBusyAction] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const tabs = [
    { key: "users", label: "Acessos", description: "Usuarios e perfis" },
    { key: "members", label: "Base de socios", description: "Fonte sincronizada e mapeamento" },
    { key: "catalog", label: "Campos e tarefas", description: "Biblioteca reutilizavel" },
    { key: "labels", label: "Classificacoes", description: "Etiquetas dos formularios" },
    { key: "presets", label: "Templates", description: "Modelos prontos" },
    { key: "security", label: "Exclusao segura", description: "Chave mestra" },
    ...(currentUser?.role === "admin" ? [{ key: "audit", label: "Historico", description: "Auditoria do sistema" }] : []),
  ];
  const activeTab = tabs.find(item => item.key === tab) || tabs[0];

  const requestDelete = (title, message, confirmLabel, onConfirm) => {
    setPendingDelete({ title, message, confirmLabel, onConfirm });
  };

  const submitUser = async () => {
    if (!userDraft.username.trim() || (!userDraft.id && !userDraft.password.trim())) return;
    const isEdit = Boolean(userDraft.id);
    setBusyAction("user");
    setFeedback({ tone: "loading", message: isEdit ? "Salvando usuario..." : "Criando usuario..." });
    try {
      await onSaveUser({ ...userDraft, name: userDraft.name.trim() || userDraft.username.trim(), username: userDraft.username.trim() });
      setUserDraft(emptyUser);
      setFeedback({ tone: "success", message: isEdit ? "Alterações salvas." : "Criado com sucesso." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setBusyAction(null);
    }
  };

  const submitLabel = async () => {
    if (!labelDraft.name.trim()) return;
    const isEdit = Boolean(labelDraft.id);
    setBusyAction("label");
    setFeedback({ tone: "loading", message: isEdit ? "Salvando classificacao..." : "Criando classificacao..." });
    try {
      await onSaveLabel({ ...labelDraft, name: labelDraft.name.trim(), createdBy: labelDraft.createdBy || currentUser?.name || "Admin" });
      setLabelDraft(emptyLabel);
      setFeedback({ tone: "success", message: isEdit ? "Alterações salvas." : "Criado com sucesso." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setBusyAction(null);
    }
  };

  const submitPreset = async () => {
    if (!presetDraft.name.trim()) return;
    const isEdit = Boolean(presetDraft.id);
    setBusyAction("preset");
    setFeedback({ tone: "loading", message: isEdit ? "Salvando template..." : "Criando template..." });
    try {
      await onSavePreset({ ...presetDraft, name: presetDraft.name.trim(), createdBy: presetDraft.createdBy || currentUser?.name || "Admin" });
      setPresetDraft(emptyPreset);
      setFeedback({ tone: "success", message: isEdit ? "Alterações salvas." : "Criado com sucesso." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setBusyAction(null);
    }
  };

  const submitFieldCatalog = async () => {
    const resolvedKey = normalizeIdentifier(fieldCatalogDraft.key || fieldCatalogDraft.name || fieldCatalogDraft.defaultLabel);
    if (!resolvedKey || !fieldCatalogDraft.name.trim() || !fieldCatalogDraft.defaultLabel.trim()) return;
    const isEdit = Boolean(fieldCatalogDraft.id);
    setBusyAction("fieldCatalog");
    setFeedback({ tone: "loading", message: isEdit ? "Salvando campo base..." : "Criando campo base..." });
    try {
      await onSaveFieldCatalogItem({ ...fieldCatalogDraft, key: resolvedKey });
      setFieldCatalogDraft(emptyFieldCatalog);
      setFeedback({ tone: "success", message: isEdit ? "Alterações salvas." : "Criado com sucesso." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setBusyAction(null);
    }
  };

  const submitScaleTask = async () => {
    const resolvedKey = normalizeIdentifier(scaleTaskDraft.key || scaleTaskDraft.name || scaleTaskDraft.defaultLabel);
    if (!resolvedKey || !scaleTaskDraft.name.trim() || !scaleTaskDraft.defaultLabel.trim()) return;
    const isEdit = Boolean(scaleTaskDraft.id);
    setBusyAction("scaleTask");
    setFeedback({ tone: "loading", message: isEdit ? "Salvando tarefa base..." : "Criando tarefa base..." });
    try {
      await onSaveScaleTaskCatalogItem({ ...scaleTaskDraft, key: resolvedKey });
      setScaleTaskDraft(emptyScaleTaskCatalog);
      setFeedback({ tone: "success", message: isEdit ? "Alterações salvas." : "Criado com sucesso." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setBusyAction(null);
    }
  };

  const submitSecurity = async () => {
    if (!securityDraft.newMasterKey.trim()) return;
    setBusyAction("security");
    setFeedback({ tone: "loading", message: formDeleteKeyConfigured ? "Atualizando chave mestra..." : "Configurando chave mestra..." });
    try {
      await onSaveFormDeleteKey({
        currentMasterKey: formDeleteKeyConfigured ? securityDraft.currentMasterKey : undefined,
        newMasterKey: securityDraft.newMasterKey,
      });
      setSecurityDraft(emptySecurityDraft);
      setFeedback({ tone: "success", message: formDeleteKeyConfigured ? "Alteracoes salvas." : "Chave mestra configurada." });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setBusyAction(null);
    }
  };

  const isScreen = mode === "screen";

  const content = (
      <div
        className={isScreen ? "settings-screen-card modal-card modal-card-wide" : "modal-card modal-card-wide"}
        style={isScreen ? { width: "100%", maxWidth: "100%", margin: 0 } : undefined}
      >
        <div className="settings-modal-header" style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0 }}>Configuracoes</h3>
            <p style={{ margin: "4px 0 0", color: COLORS.textSecondary, fontSize: 12 }}>
              {isScreen ? "Area administrativa principal do sistema." : "Area administrativa do MVP."}
            </p>
          </div>
          <Btn v="ghost" onClick={onClose}>{isScreen ? "Voltar" : "Fechar"}</Btn>
        </div>

        <div className="settings-tabs" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          {tabs.map(item => (
            <Btn
              key={item.key}
              v={tab === item.key ? "primary" : "secondary"}
              sz="sm"
              onClick={() => setTab(item.key)}
              style={{ borderRadius: 999, padding: "8px 12px", fontWeight: 800 }}
            >
              {item.label}
            </Btn>
          ))}
        </div>

        <div style={{ marginBottom: 18, background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: "12px 14px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: COLORS.textMuted, textTransform: "uppercase", marginBottom: 4 }}>{activeTab.label}</div>
          <div style={{ fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.5 }}>{activeTab.description}</div>
        </div>

        {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} fixed />}

        {tab === "users" && (
          <section className="settings-grid">
            <div>
              <h4 style={{ margin: "0 0 10px" }}>{userDraft.id ? "Editar usuario" : "Novo usuario"}</h4>
              <div style={{ display: "grid", gap: 10 }}>
                <AdminField>
                  <input value={userDraft.name} onChange={e => setUserDraft({ ...userDraft, name: e.target.value })} placeholder="Nome exibido" style={inputStyle} />
                </AdminField>
                <AdminField>
                  <input value={userDraft.username} onChange={e => setUserDraft({ ...userDraft, username: e.target.value })} placeholder="Usuario de login" style={inputStyle} />
                </AdminField>
                <AdminField>
                  <input value={userDraft.password} onChange={e => setUserDraft({ ...userDraft, password: e.target.value })} placeholder={userDraft.id ? "Nova senha (opcional)" : "Senha"} type="password" style={inputStyle} />
                </AdminField>
                <AdminField>
                  <select value={userDraft.role} onChange={e => setUserDraft({ ...userDraft, role: e.target.value })} style={inputStyle}>
                    <option value="viewer">Visualizador</option>
                    <option value="admin">Administrativo</option>
                  </select>
                </AdminField>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn onClick={submitUser} loading={busyAction === "user"}>{userDraft.id ? "Salvar usuario" : "Criar usuario"}</Btn>
                  {userDraft.id && <Btn v="ghost" onClick={() => setUserDraft(emptyUser)}>Cancelar</Btn>}
                </div>
              </div>
            </div>
            <div>
              <h4 style={{ margin: "0 0 10px" }}>Usuarios cadastrados</h4>
              <PaginatedList
                items={users}
                emptyText="Nenhum usuario cadastrado."
                renderItem={user => (
                  <div key={user.id} className="settings-row">
                    <div><strong>{user.name}</strong><div>{user.username} - {ROLES[user.role]?.label}</div></div>
                    <Btn v="secondary" sz="sm" onClick={() => setUserDraft({ ...user, password: "" })}>Editar</Btn>
                    <Btn v="danger" sz="sm" onClick={() => requestDelete(
                      "Excluir usuario",
                      `Tem certeza que deseja excluir ${user.name}?`,
                      "Excluir",
                      () => onDeleteUser(user.id),
                    )} disabled={user.id === currentUser?.id}>Remover</Btn>
                  </div>
                )}
              />
            </div>
          </section>
        )}

        {tab === "members" && <MemberListConfigModalContent config={membersConfig} people={people} onSave={onSaveMembersConfig} onSync={onSyncMembersConfig} />}

        {tab === "security" && (
          <section className="settings-grid">
            <div>
              <h4 style={{ margin: "0 0 10px" }}>{formDeleteKeyConfigured ? "Alterar chave mestra" : "Cadastrar chave mestra"}</h4>
              <div style={{ display: "grid", gap: 10 }}>
                <FeedbackBanner
                  tone={formDeleteKeyConfigured === null ? "loading" : "info"}
                  message={formDeleteKeyConfigured === null
                    ? "Carregando status da chave mestra..."
                    : formDeleteKeyConfigured
                      ? "A chave mestra esta configurada. Para alterar, informe a chave atual e a nova chave."
                      : "Nenhuma chave mestra configurada. Cadastre uma nova chave para liberar exclusoes seguras."}
                />
                {formDeleteKeyConfigured && (
                  <AdminField>
                    <input
                      type="password"
                      value={securityDraft.currentMasterKey}
                      onChange={e => setSecurityDraft({ ...securityDraft, currentMasterKey: e.target.value })}
                      placeholder="Chave mestra atual"
                      style={inputStyle}
                    />
                  </AdminField>
                )}
                <AdminField>
                  <input
                    type="password"
                    value={securityDraft.newMasterKey}
                    onChange={e => setSecurityDraft({ ...securityDraft, newMasterKey: e.target.value })}
                    placeholder="Nova chave mestra"
                    style={inputStyle}
                  />
                </AdminField>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Btn
                    onClick={submitSecurity}
                    loading={busyAction === "security"}
                    disabled={!securityDraft.newMasterKey.trim() || (formDeleteKeyConfigured && !securityDraft.currentMasterKey.trim())}
                  >
                    {formDeleteKeyConfigured ? "Salvar alteracao" : "Cadastrar chave"}
                  </Btn>
                  {(securityDraft.currentMasterKey || securityDraft.newMasterKey) && <Btn v="ghost" onClick={() => setSecurityDraft(emptySecurityDraft)}>Cancelar</Btn>}
                </div>
              </div>
            </div>
            <div>
              <h4 style={{ margin: "0 0 10px" }}>Status da seguranca</h4>
              <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 12, fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.55 }}>
                <div style={{ fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>
                  {formDeleteKeyConfigured === null
                    ? "Carregando..."
                    : formDeleteKeyConfigured
                      ? "Chave mestra configurada"
                      : "Nenhuma chave mestra configurada"}
                </div>
                <div>A exclusao de formularios exige validacao no backend antes de remover respostas, response_values e escala associados.</div>
              </div>
            </div>
          </section>
        )}

        {tab === "catalog" && (
          <section>
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {[
                { key: "fields", label: "Campos de formulario" },
                { key: "tasks", label: "Tarefas da escala" },
              ].map(item => (
                <Btn
                  key={item.key}
                  v={catalogMode === item.key ? "primary" : "secondary"}
                  sz="sm"
                  onClick={() => setCatalogMode(item.key)}
                  style={{ borderRadius: 10, padding: "8px 10px", fontWeight: 800 }}
                >
                  {item.label}
                </Btn>
              ))}
            </div>
            {catalogMode === "fields" && (
              <section className="settings-grid">
                <div>
                  <h4 style={{ margin: "0 0 10px" }}>{fieldCatalogDraft.id ? "Editar campo base" : "Novo campo base"}</h4>
                  <div style={{ display: "grid", gap: 10 }}>
                    <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 10, padding: 12, fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.55 }}>
                      Preencha o nome exibido no formulario e ajuste o tipo. O identificador tecnico pode ser informado manualmente ou sera gerado automaticamente ao salvar.
                    </div>
                    <AdminField>
                      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Identificador tecnico</label>
                      <input value={fieldCatalogDraft.key} onChange={e => setFieldCatalogDraft({ ...fieldCatalogDraft, key: e.target.value })} placeholder="Opcional. Ex: presenca_sessao" style={inputStyle} />
                    </AdminField>
                    <AdminField>
                      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Nome administrativo</label>
                      <input value={fieldCatalogDraft.name} onChange={e => setFieldCatalogDraft({ ...fieldCatalogDraft, name: e.target.value })} placeholder="Ex: Presenca em sessao" style={inputStyle} />
                    </AdminField>
                    <AdminField>
                      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Nome exibido no formulario</label>
                      <input value={fieldCatalogDraft.defaultLabel} onChange={e => setFieldCatalogDraft({ ...fieldCatalogDraft, defaultLabel: e.target.value })} placeholder="Ex: Sessao" style={inputStyle} />
                    </AdminField>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      <AdminField>
                        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Tipo do campo</label>
                        <select value={fieldCatalogDraft.type} onChange={e => setFieldCatalogDraft({ ...fieldCatalogDraft, type: e.target.value })} style={inputStyle}>
                          {Object.entries(fieldTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                      </AdminField>
                      <AdminField>
                        <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Grupo</label>
                        <select value={fieldCatalogDraft.category} onChange={e => setFieldCatalogDraft({ ...fieldCatalogDraft, category: e.target.value })} style={inputStyle}>
                          {Object.entries(fieldCategoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                        </select>
                      </AdminField>
                    </div>
                    {fieldCatalogDraft.type === "grid" && (
                      <GridSchemaEditor
                        value={fieldCatalogDraft.gridSchema}
                        onChange={gridSchema => setFieldCatalogDraft({ ...fieldCatalogDraft, gridSchema })}
                      />
                    )}
                    <AdminField>
                      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Observacoes internas</label>
                      <textarea value={fieldCatalogDraft.description} onChange={e => setFieldCatalogDraft({ ...fieldCatalogDraft, description: e.target.value })} placeholder="Quando usar este campo ou o que a equipe precisa lembrar" rows={3} style={inputStyle} />
                    </AdminField>
                    <div style={{ fontSize: 11, color: COLORS.textMuted }}>
                      Identificador previsto: <strong style={{ color: COLORS.text }}>{normalizeIdentifier(fieldCatalogDraft.key || fieldCatalogDraft.name || fieldCatalogDraft.defaultLabel) || "sera gerado ao preencher o nome"}</strong>
                    </div>
                    <FieldCatalogPreview draft={fieldCatalogDraft} />
                    <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: COLORS.textSecondary }}>
                      <input type="checkbox" checked={fieldCatalogDraft.active !== false} onChange={e => setFieldCatalogDraft({ ...fieldCatalogDraft, active: e.target.checked })} /> Ativo para novos formularios
                    </label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Btn onClick={submitFieldCatalog} loading={busyAction === "fieldCatalog"}>{fieldCatalogDraft.id ? "Salvar campo" : "Criar campo"}</Btn>
                      {fieldCatalogDraft.id && <Btn v="ghost" onClick={() => setFieldCatalogDraft(emptyFieldCatalog)}>Cancelar</Btn>}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 style={{ margin: "0 0 10px" }}>Campos cadastrados</h4>
                  <PaginatedList
                    items={fieldCatalog}
                    emptyText="Nenhum campo base cadastrado."
                    renderItem={item => (
                      <div key={item.id} className="settings-row catalog-row">
                        <div>
                          <strong>{item.name}</strong>
                          <div>{item.defaultLabel || item.name} • {fieldTypeLabels[item.type]} • {fieldCategoryLabels[item.category]} • {item.active ? "Ativo" : "Inativo"}</div>
                          <div>Id: {item.key}</div>
                          {item.description && <div>{item.description}</div>}
                        </div>
                        <Btn v="secondary" sz="sm" onClick={() => setFieldCatalogDraft({ ...emptyFieldCatalog, ...item, gridSchema: item.gridSchema || emptyFieldCatalog.gridSchema })}>Editar</Btn>
                        <Btn v="danger" sz="sm" onClick={() => requestDelete(
                          "Excluir campo base",
                          `Tem certeza que deseja excluir o campo base ${item.name}?`,
                          "Excluir",
                          () => onDeleteFieldCatalogItem(item.id),
                        )}>Remover</Btn>
                      </div>
                    )}
                  />
                </div>
              </section>
            )}

            {catalogMode === "tasks" && (
              <section className="settings-grid">
                <div>
                  <h4 style={{ margin: "0 0 10px" }}>{scaleTaskDraft.id ? "Editar tarefa base" : "Nova tarefa base"}</h4>
                  <div style={{ display: "grid", gap: 10 }}>
                    <div style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 10, padding: 12, fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.55 }}>
                      Use esta biblioteca para reaproveitar tarefas recorrentes. O identificador tecnico pode ficar em branco e sera gerado ao salvar.
                    </div>
                    <AdminField>
                      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Identificador tecnico</label>
                      <input value={scaleTaskDraft.key} onChange={e => setScaleTaskDraft({ ...scaleTaskDraft, key: e.target.value })} placeholder="Opcional. Ex: preparo_jantar" style={inputStyle} />
                    </AdminField>
                    <AdminField>
                      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Nome administrativo</label>
                      <input value={scaleTaskDraft.name} onChange={e => setScaleTaskDraft({ ...scaleTaskDraft, name: e.target.value })} placeholder="Ex: Preparo do jantar" style={inputStyle} />
                    </AdminField>
                    <AdminField>
                      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Nome exibido na escala</label>
                      <input value={scaleTaskDraft.defaultLabel} onChange={e => setScaleTaskDraft({ ...scaleTaskDraft, defaultLabel: e.target.value })} placeholder="Ex: Preparacao do jantar" style={inputStyle} />
                    </AdminField>
                    <AdminField>
                      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Grupo</label>
                      <select value={scaleTaskDraft.category} onChange={e => setScaleTaskDraft({ ...scaleTaskDraft, category: e.target.value })} style={inputStyle}>
                        {Object.entries(taskCategoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </AdminField>
                    <AdminField>
                      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Observacoes internas</label>
                      <textarea value={scaleTaskDraft.description} onChange={e => setScaleTaskDraft({ ...scaleTaskDraft, description: e.target.value })} placeholder="Quando usar esta tarefa ou como ela costuma aparecer na escala" rows={3} style={inputStyle} />
                    </AdminField>
                    <div style={{ fontSize: 11, color: COLORS.textMuted }}>
                      Identificador previsto: <strong style={{ color: COLORS.text }}>{normalizeIdentifier(scaleTaskDraft.key || scaleTaskDraft.name || scaleTaskDraft.defaultLabel) || "sera gerado ao preencher o nome"}</strong>
                    </div>
                    <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: COLORS.textSecondary }}>
                      <input type="checkbox" checked={scaleTaskDraft.active !== false} onChange={e => setScaleTaskDraft({ ...scaleTaskDraft, active: e.target.checked })} /> Ativa para novas escalas
                    </label>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Btn onClick={submitScaleTask} loading={busyAction === "scaleTask"}>{scaleTaskDraft.id ? "Salvar tarefa" : "Criar tarefa"}</Btn>
                      {scaleTaskDraft.id && <Btn v="ghost" onClick={() => setScaleTaskDraft(emptyScaleTaskCatalog)}>Cancelar</Btn>}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 style={{ margin: "0 0 10px" }}>Tarefas cadastradas</h4>
                  <PaginatedList
                    items={scaleTaskCatalog}
                    emptyText="Nenhuma tarefa base cadastrada."
                    renderItem={item => (
                      <div key={item.id} className="settings-row catalog-row">
                        <div>
                          <strong>{item.name}</strong>
                          <div>{item.defaultLabel || item.name} • {taskCategoryLabels[item.category]} • {item.active ? "Ativa" : "Inativa"}</div>
                          <div>Id: {item.key}</div>
                          {item.description && <div>{item.description}</div>}
                        </div>
                        <Btn v="secondary" sz="sm" onClick={() => setScaleTaskDraft(item)}>Editar</Btn>
                        <Btn v="danger" sz="sm" onClick={() => requestDelete(
                          "Excluir tarefa base",
                          `Tem certeza que deseja excluir a tarefa base ${item.name}?`,
                          "Excluir",
                          () => onDeleteScaleTaskCatalogItem(item.id),
                        )}>Remover</Btn>
                      </div>
                    )}
                  />
                </div>
              </section>
            )}
          </section>
        )}

        {tab === "labels" && (
          <section className="settings-grid">
            <div>
              <h4 style={{ margin: "0 0 10px" }}>{labelDraft.id ? "Editar classificacao" : "Nova classificacao"}</h4>
              <div style={{ display: "grid", gap: 12 }}>
                <AdminField>
                  <input value={labelDraft.name} onChange={e => setLabelDraft({ ...labelDraft, name: e.target.value })} placeholder="Nome da classificacao" style={inputStyle} />
                </AdminField>
                <AdminField>
                  <input value={labelDraft.color} onChange={e => setLabelDraft({ ...labelDraft, color: e.target.value })} type="color" style={{ ...inputStyle, padding: 4, height: 44, minHeight: 44, boxSizing: "border-box", overflow: "hidden" }} />
                </AdminField>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn onClick={submitLabel} loading={busyAction === "label"}>{labelDraft.id ? "Salvar classificacao" : "Criar classificacao"}</Btn>
                  {labelDraft.id && <Btn v="ghost" onClick={() => setLabelDraft(emptyLabel)}>Cancelar</Btn>}
                </div>
              </div>
            </div>
            <div>
              <h4 style={{ margin: "0 0 10px" }}>Classificacoes existentes</h4>
              <PaginatedList
                items={labels}
                emptyText="Nenhuma classificacao cadastrada."
                renderItem={label => (
                    <div key={label.id} className="settings-row">
                      <div><strong><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 99, background: label.color, marginRight: 8 }} />{label.name}</strong><div>Criado por {label.createdBy || "Sistema"}</div></div>
                    <Btn v="secondary" sz="sm" onClick={() => setLabelDraft(label)}>Editar</Btn>
                    <Btn v="danger" sz="sm" onClick={() => requestDelete(
                      "Excluir classificacao",
                      `Tem certeza que deseja excluir a classificacao ${label.name}?`,
                      "Excluir",
                      () => onDeleteLabel(label.id),
                    )}>Remover</Btn>
                  </div>
                )}
              />
            </div>
          </section>
        )}

        {tab === "presets" && (
          <section className="settings-grid">
            <div>
              <h4 style={{ margin: "0 0 10px" }}>{presetDraft.id ? "Editar template" : "Novo template"}</h4>
              <div style={{ display: "grid", gap: 10 }}>
                <AdminField>
                  <input value={presetDraft.name} onChange={e => setPresetDraft({ ...presetDraft, name: e.target.value })} placeholder="Nome do template" style={inputStyle} />
                </AdminField>
                <AdminField>
                  <select value={presetDraft.type} onChange={e => setPresetDraft({ ...presetDraft, type: e.target.value })} style={inputStyle}>
                    <option value="presenca">Presenca</option>
                    <option value="escala_organ">Escala da Organ</option>
                  </select>
                </AdminField>
                <div style={{ display: "flex", gap: 8 }}>
                  <Btn onClick={submitPreset} loading={busyAction === "preset"}>{presetDraft.id ? "Salvar template" : "Criar template"}</Btn>
                  {presetDraft.id && <Btn v="ghost" onClick={() => setPresetDraft(emptyPreset)}>Cancelar</Btn>}
                </div>
              </div>
            </div>
            <div>
              <h4 style={{ margin: "0 0 10px" }}>Templates existentes</h4>
              <PaginatedList
                items={presets}
                emptyText="Nenhum template cadastrado."
                renderItem={preset => {
                  const count = preset.type === "escala_organ"
                    ? `${preset.scaleSections?.length ?? 0} secoes`
                    : `${preset.fieldDefinitions?.length ?? 0} campos`;
                  return (
                    <div key={preset.id} className="settings-row">
                      <div>
                        <strong>{preset.name}</strong>
                        <div>{preset.type === "escala_organ" ? "Escala da Organ" : "Presenca"} - {count} - Criado por {preset.createdBy || "Sistema"}</div>
                      </div>
                      <Btn v="secondary" sz="sm" onClick={() => setPresetDraft(preset)}>Editar</Btn>
                      <Btn v="danger" sz="sm" onClick={() => requestDelete(
                        "Excluir template",
                        `Tem certeza que deseja excluir o template ${preset.name}?`,
                        "Excluir",
                        () => onDeletePreset(preset.id),
                      )}>Remover</Btn>
                    </div>
                  );
                }}
              />
            </div>
          </section>
        )}

        {tab === "audit" && currentUser?.role === "admin" && <AuditLogsPanel currentUser={currentUser} />}
        <ConfirmModal
          open={Boolean(pendingDelete)}
          title={pendingDelete?.title || "Confirmar exclusão"}
          message={pendingDelete?.message || "Tem certeza que deseja continuar?"}
          confirmLabel={pendingDelete?.confirmLabel || "Excluir"}
          tone="danger"
          busy={busyAction === "delete"}
          onCancel={() => setPendingDelete(null)}
          onConfirm={async () => {
            if (!pendingDelete) return;
            setBusyAction("delete");
            setFeedback({ tone: "loading", message: "Excluindo..." });
            try {
              await pendingDelete.onConfirm();
              setFeedback({ tone: "success", message: "Excluído com sucesso." });
              setPendingDelete(null);
            } catch (error) {
              setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
            } finally {
              setBusyAction(null);
            }
          }}
        />
      </div>
  );

  if (isScreen) {
    return content;
  }

  return (
    <div className="modal-backdrop">
      {content}
    </div>
  );
};
