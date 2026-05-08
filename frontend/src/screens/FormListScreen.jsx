/**
 * @file frontend/src/screens/FormListScreen.jsx
 * @summary Tela de listagem de formularios.
 * @responsibility Filtrar, paginar e abrir resultados/links publicos.
 */

import React, { useMemo, useState } from "react";
import { COLORS, Icon, Badge, StatusBadge, Btn, TypeBadge, ConfirmModal, FeedbackBanner, resolveActionErrorMessage } from "../components/ui";
import { ROLES, canCreateForms, canViewForm, visibleFormsFor } from "../lib/auth";
import { buildFormSearchIndex, formatDate, formatDateTime, hasLinkedPeopleField, normalizeSearchText } from "../lib/forms";

const PAGE_SIZE = 6;
const LIST_ACTION_STYLE = {
  width: 42,
  height: 42,
  minWidth: 42,
  padding: 0,
  justifyContent: "center",
  borderRadius: 12,
};

export const FormListScreen = ({ onNavigate, onDuplicateForm, onArchiveForm, onTogglePinnedForm, pinnedFormIds = [], user, labels = [], forms = [], onDeleteForm, formDeleteKeyConfigured = null }) => {
  const [search, setSearch] = useState("");
  const [fLabel, setFLabel] = useState(null);
  const [fStatus, setFStatus] = useState(null);
  const [fType, setFType] = useState(null);
  const [sortBy, setSortBy] = useState("date_desc");
  const [page, setPage] = useState(1);
  const [feedback, setFeedback] = useState(null);
  const [deleteFeedback, setDeleteFeedback] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleteMasterKey, setDeleteMasterKey] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [archiveAction, setArchiveAction] = useState(null);

  const availableForms = visibleFormsFor(user, forms);
  const pinnedSet = useMemo(() => new Set(pinnedFormIds), [pinnedFormIds]);
  const normalizedSearch = normalizeSearchText(search);
  const filtered = useMemo(() => availableForms.filter(form => {
    if (normalizedSearch && !buildFormSearchIndex(form, labels).includes(normalizedSearch)) return false;
    if (user && !fStatus && form.status === "arquivado") return false;
    if (user && fLabel && !form.labels.includes(fLabel)) return false;
    if (user && fStatus && form.status !== fStatus) return false;
    if (user && fType && form.type !== fType) return false;
    return true;
  }).sort((a, b) => {
    const aPinned = user ? pinnedSet.has(a.id) : false;
    const bPinned = user ? pinnedSet.has(b.id) : false;
    if (aPinned !== bPinned) return aPinned ? -1 : 1;
    if (sortBy === "title") return a.title.localeCompare(b.title, "pt-BR");
    if (sortBy === "status") return a.status.localeCompare(b.status, "pt-BR");
    if (sortBy === "responses") return (b.metrics?.responses || 0) - (a.metrics?.responses || 0);
    return String(b.date || "").localeCompare(String(a.date || ""));
  }), [availableForms, normalizedSearch, labels, user, fLabel, fStatus, fType, sortBy, pinnedSet]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedForms = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const controlStyle = {
    minHeight: 38,
    padding: "8px 10px",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 8,
    fontSize: 13,
    fontFamily: "inherit",
    background: COLORS.surface,
    color: COLORS.text,
    cursor: "pointer",
    width: "auto",
    boxShadow: "none",
  };
  const searchStyle = {
    width: "100%",
    minHeight: 38,
    padding: "8px 38px 8px 34px",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 8,
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    background: COLORS.surface,
    color: COLORS.text,
    boxSizing: "border-box",
    boxShadow: "none",
  };

  const updateFilters = setter => value => {
    setPage(1);
    setter(value);
  };

  const openPublicForm = form => {
    if (!form?.slug) return;
    window.location.hash = `/f/${form.slug}`;
  };

  const openResults = form => {
    if (!canViewForm(user, form)) return;
    onNavigate("results", form);
  };

  const getDisplayTitle = form => form?.title;

  const openDeleteModal = form => {
    setPendingDelete(form);
    setDeleteMasterKey("");
    setDeleteFeedback(null);
    setFeedback(null);
  };

  const toggleArchive = async form => {
    if (!form || !onArchiveForm) return;
    const nextStatus = form.status === "arquivado" ? "rascunho" : "arquivado";
    const actionKey = `${form.id}:${nextStatus}`;
    setArchiveAction(actionKey);
    setFeedback(null);
    try {
      await onArchiveForm(form, nextStatus);
      setPage(1);
      setFeedback({
        tone: "success",
        message: nextStatus === "arquivado"
          ? "Formulario arquivado com sucesso."
          : "Formulario restaurado como rascunho.",
      });
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setArchiveAction(null);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete || !onDeleteForm) return;
    setDeleting(true);
    setDeleteFeedback({ tone: "loading", message: "Excluindo formulario..." });
    try {
      await onDeleteForm(pendingDelete.id, deleteMasterKey.trim());
      setFeedback({ tone: "success", message: "Excluido com sucesso." });
      setPendingDelete(null);
      setDeleteMasterKey("");
      setDeleteFeedback(null);
    } catch (error) {
      const message = error?.code === "MASTER_KEY_NOT_CONFIGURED"
        ? "Nenhuma chave mestra configurada. Configure em Configuracoes > Operacoes criticas antes de excluir formularios."
        : resolveActionErrorMessage(error);
      setDeleteFeedback({ tone: "error", message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      {feedback && <FeedbackBanner tone={feedback.tone} message={feedback.message} fixed />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, color: COLORS.text }}>Formularios</h2>
          <p style={{ margin: "4px 0 0", fontSize: 14, color: COLORS.textMuted }}>{availableForms.length} formularios disponiveis {user ? `para ${ROLES[user.role]?.label}` : "sem login"}</p>
        </div>
        {canCreateForms(user) && <Btn icon="plus" onClick={() => onNavigate("create")}>Novo Formulario</Btn>}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center", padding: 12, background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, boxShadow: "var(--shadow-sm)" }}>
        <div style={{ position: "relative", flex: "1 1 260px", minWidth: 220 }}>
          <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: COLORS.textMuted }}><Icon name="search" size={16} /></div>
          <input value={search} onChange={event => updateFilters(setSearch)(event.target.value)} placeholder="Buscar por titulo, data, classificacao ou status..." style={searchStyle} />
          {search && (
            <button
              type="button"
              aria-label="Limpar busca"
              onClick={() => updateFilters(setSearch)("")}
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                width: 28,
                height: 28,
                border: "none",
                borderRadius: 8,
                background: COLORS.surfaceAlt,
                color: COLORS.textSecondary,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="close" size={12} />
            </button>
          )}
        </div>
        {user && (
          <>
            <select value={fStatus || ""} onChange={event => updateFilters(setFStatus)(event.target.value || null)} style={controlStyle}>
              <option value="">Todos os status</option>
              <option value="aberto">Aberto</option>
              <option value="fechado">Fechado</option>
              <option value="rascunho">Rascunho</option>
              <option value="arquivado">Arquivado</option>
            </select>
            <select value={fType || ""} onChange={event => updateFilters(setFType)(event.target.value || null)} style={controlStyle}>
              <option value="">Todos os tipos</option>
              <option value="presenca">Presenca</option>
              <option value="escala_organ">Escala da Organ</option>
            </select>
            <select value={fLabel || ""} onChange={event => updateFilters(setFLabel)(event.target.value ? Number(event.target.value) : null)} style={controlStyle}>
              <option value="">Todas as classificacoes</option>
              {labels.map(label => <option key={label.id} value={label.id}>{label.name}</option>)}
            </select>
          </>
        )}
        <select value={sortBy} onChange={event => updateFilters(setSortBy)(event.target.value)} style={controlStyle}>
          <option value="date_desc">Mais recentes</option>
          <option value="title">Titulo</option>
          <option value="status">Status</option>
          <option value="responses">Mais preenchidos</option>
        </select>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {pagedForms.map(form => {
          const archiveBusy = archiveAction === `${form.id}:${form.status === "arquivado" ? "rascunho" : "arquivado"}`;
          const isPinned = pinnedSet.has(form.id);
          const responses = form.metrics?.responses || 0;
          const total = form.metrics?.total || form.totalExpected || 0;
          const canOpenResults = canViewForm(user, form);
          const fillPercent = total ? Math.min(100, (responses / total) * 100) : 0;
          const showFillSummary = Boolean(user) && (form.type === "escala_organ" || hasLinkedPeopleField(form));
          return (
            <div
              key={form.id}
              className={`form-card form-card--interactive elevated${showFillSummary ? "" : " form-card--no-summary"}`}
              role="button"
              tabIndex={0}
              onClick={() => openPublicForm(form)}
              onKeyDown={event => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openPublicForm(form);
                }
              }}
              style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", gap: 16, cursor: "pointer", transition: "all 0.15s", touchAction: "manipulation" }}
              onMouseEnter={event => { event.currentTarget.style.borderColor = COLORS.primary; }}
              onMouseLeave={event => { event.currentTarget.style.borderColor = COLORS.borderLight; }}
            >
              <div className="form-card-icon" style={{ width: 46, height: 46, borderRadius: 12, background: COLORS.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.primary, flexShrink: 0 }}><Icon name="form" size={20} /></div>
              <div className="form-card-main" style={{ flex: 1, minWidth: 0 }}>
                <div className="form-card-title-row" style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                  <div className="form-card-title-wrap" style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.25 }}>{getDisplayTitle(form)}</span>
                    {form?.date && (
                    <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.textSecondary, whiteSpace: "nowrap" }}>
                      {formatDate(form.date)}
                    </span>
                    )}
                    {isPinned && (
                      <span title="Formulario fixado" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 999, background: COLORS.warningLight, color: COLORS.warning }}>
                        <Icon name="pin" size={12} />
                      </span>
                    )}
                  </div>
                </div>
                <div className="form-card-badges" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                  <StatusBadge status={form.status} />
                  {canCreateForms(user) && <TypeBadge type={form.type} />}
                  {[...new Set(form.labels || [])].map(labelId => <Badge key={labelId} label={labelId} labels={labels} small />)}
                </div>
                <div className="form-card-meta" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", fontSize: 12, color: COLORS.textMuted }}>
                  <span>Fechamento: {formatDateTime(form.closing)}</span>
                </div>
                <div
                  className="card-primary-actions card-primary-actions--inline"
                  style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}
                  onClick={event => event.stopPropagation()}
                >
                  <Btn icon="link" onClick={() => openPublicForm(form)}>Responder</Btn>
                  {canOpenResults && <Btn v="secondary" icon="eye" onClick={() => openResults(form)}>Ver resultados</Btn>}
                </div>
                {!showFillSummary && (
                  <div
                    className="card-secondary-actions card-secondary-actions--bottom"
                    style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end", marginTop: 12 }}
                    onClick={event => event.stopPropagation()}
                  >
                    {user && (
                      <Btn
                        v={isPinned ? "warning" : "ghost"}
                        icon="pin"
                        sz="sm"
                        style={LIST_ACTION_STYLE}
                        title={isPinned ? "Desfixar formulario" : "Fixar formulario"}
                        aria-label={isPinned ? "Desfixar formulario" : "Fixar formulario"}
                        onClick={() => onTogglePinnedForm?.(form.id)}
                      />
                    )}
                    {canCreateForms(user) && <Btn v="ghost" icon="edit" sz="sm" style={LIST_ACTION_STYLE} title="Editar formulario" aria-label="Editar formulario" onClick={() => onNavigate("create", form)} />}
                    {canCreateForms(user) && <Btn v="ghost" icon="clipboard" sz="sm" style={LIST_ACTION_STYLE} title="Duplicar" aria-label="Duplicar" onClick={() => onDuplicateForm?.(form)} />}
                    {canCreateForms(user) && (
                      <Btn
                        v="ghost"
                        icon={form.status === "arquivado" ? "upload" : "archive"}
                        sz="sm"
                        style={LIST_ACTION_STYLE}
                        title={form.status === "arquivado" ? "Restaurar formulario" : "Arquivar formulario"}
                        aria-label={form.status === "arquivado" ? "Restaurar formulario" : "Arquivar formulario"}
                        onClick={() => toggleArchive(form)}
                        loading={archiveBusy}
                      />
                    )}
                    {canCreateForms(user) && <Btn v="danger" icon="trash" sz="sm" style={LIST_ACTION_STYLE} title="Excluir" aria-label="Excluir" onClick={() => openDeleteModal(form)} />}
                  </div>
                )}
              </div>
              {showFillSummary && (
                <div className="form-card-side" style={{ display: "grid", gap: 10, flexShrink: 0, width: 246 }}>
                  <div className="fill-summary" style={{ textAlign: "right", minWidth: 0, padding: "14px 16px", borderRadius: 14, background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}` }}>
                    <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.45 }}>Preenchimento</div>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "flex-end", gap: 3, marginTop: 4 }}>
                      <strong style={{ fontSize: 24, fontWeight: 800, color: COLORS.primary, lineHeight: 1 }}>{responses}</strong>
                      <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.textMuted }}>/ {total}</span>
                    </div>
                    <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 4 }}>{form.type === "escala_organ" ? "vagas preenchidas" : "respostas recebidas"}</div>
                    <div style={{ width: "100%", height: 7, background: COLORS.borderLight, borderRadius: 99, marginTop: 10, overflow: "hidden" }}>
                      <div style={{ width: `${fillPercent}%`, height: "100%", background: form.status === "fechado" ? COLORS.textMuted : COLORS.primary, borderRadius: 99 }} />
                    </div>
                  </div>
                  <div className="card-actions" style={{ display: "grid", gap: 10, minWidth: 0 }} onClick={event => event.stopPropagation()}>
                    <div className="card-secondary-actions" style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {user && (
                        <Btn
                          v={isPinned ? "warning" : "ghost"}
                          icon="pin"
                          sz="sm"
                          style={LIST_ACTION_STYLE}
                          title={isPinned ? "Desfixar formulario" : "Fixar formulario"}
                          aria-label={isPinned ? "Desfixar formulario" : "Fixar formulario"}
                          onClick={() => onTogglePinnedForm?.(form.id)}
                        />
                      )}
                      {canCreateForms(user) && <Btn v="ghost" icon="edit" sz="sm" style={LIST_ACTION_STYLE} title="Editar formulario" aria-label="Editar formulario" onClick={() => onNavigate("create", form)} />}
                      {canCreateForms(user) && <Btn v="ghost" icon="clipboard" sz="sm" style={LIST_ACTION_STYLE} title="Duplicar" aria-label="Duplicar" onClick={() => onDuplicateForm?.(form)} />}
                      {canCreateForms(user) && (
                        <Btn
                          v="ghost"
                          icon={form.status === "arquivado" ? "upload" : "archive"}
                          sz="sm"
                          style={LIST_ACTION_STYLE}
                          title={form.status === "arquivado" ? "Restaurar formulario" : "Arquivar formulario"}
                          aria-label={form.status === "arquivado" ? "Restaurar formulario" : "Arquivar formulario"}
                          onClick={() => toggleArchive(form)}
                          loading={archiveBusy}
                        />
                      )}
                      {canCreateForms(user) && <Btn v="danger" icon="trash" sz="sm" style={LIST_ACTION_STYLE} title="Excluir" aria-label="Excluir" onClick={() => openDeleteModal(form)} />}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {filtered.length > PAGE_SIZE && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <div style={{ fontSize: 12, color: COLORS.textMuted }}>
            Exibindo {(safePage - 1) * PAGE_SIZE + 1} a {Math.min(safePage * PAGE_SIZE, filtered.length)} de {filtered.length}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn v="secondary" sz="sm" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={safePage === 1}>Anterior</Btn>
            <div style={{ display: "flex", alignItems: "center", fontSize: 13, color: COLORS.textSecondary, padding: "0 8px" }}>Pagina {safePage} de {totalPages}</div>
            <Btn v="secondary" sz="sm" onClick={() => setPage(current => Math.min(totalPages, current + 1))} disabled={safePage === totalPages}>Proxima</Btn>
          </div>
        </div>
      )}
      <ConfirmModal
        open={Boolean(pendingDelete)}
        title="Excluir formulario"
        message={`Excluir o formulario "${pendingDelete?.title || ""}" remove respostas, response_values e dados de escala associados.`}
        confirmLabel="Excluir"
        tone="danger"
        busy={deleting}
        confirmDisabled={deleting || !deleteMasterKey.trim() || formDeleteKeyConfigured !== true}
        onCancel={() => {
          if (deleting) return;
          setPendingDelete(null);
          setDeleteMasterKey("");
          setDeleteFeedback(null);
        }}
        onConfirm={confirmDelete}
      >
        <div style={{ display: "grid", gap: 10 }}>
          {deleteFeedback && <FeedbackBanner tone={deleteFeedback.tone} message={deleteFeedback.message} />}
          {formDeleteKeyConfigured === false && <FeedbackBanner tone="info" message="Nenhuma chave mestra configurada. Configure em Configuracoes > Operacoes criticas antes de excluir formularios." />}
          {formDeleteKeyConfigured === null && <FeedbackBanner tone="loading" message="Verificando status da chave mestra..." />}
          <div style={{ fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.5 }}>
            A exclusao remove respostas, response_values, escala e dados associados. Digite a chave mestra para continuar.
          </div>
          <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
            Chave mestra
            <input
              type="password"
              value={deleteMasterKey}
              onChange={event => setDeleteMasterKey(event.target.value)}
              placeholder="Digite a chave mestra"
              disabled={deleting || formDeleteKeyConfigured === false || formDeleteKeyConfigured === null}
              style={{ padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, background: COLORS.surface, color: COLORS.text, width: "100%", boxSizing: "border-box" }}
            />
          </label>
        </div>
      </ConfirmModal>
    </div>
  );
};
