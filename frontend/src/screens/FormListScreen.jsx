/**
 * @file frontend/src/screens/FormListScreen.jsx
 * @summary Tela de listagem de formularios.
 * @responsibility Filtrar, paginar e abrir resultados/links publicos.
 */

import React, { useMemo, useState } from "react";
import { COLORS, Btn, ConfirmModal, FeedbackBanner, resolveActionErrorMessage } from "../components/ui";
import { FormListToolbar } from "../components/FormListToolbar";
import { FormListCard } from "../components/FormListCard";
import { ROLES, canCreateForms, canViewForm, visibleFormsFor } from "../lib/auth";
import { buildFormSearchIndex, normalizeSearchText } from "../lib/forms";

const PAGE_SIZE = 6;

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

  const updateFilters = setter => value => {
    setPage(1);
    setter(value);
  };

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
      <FormListToolbar
        search={search}
        onSearchChange={value => updateFilters(setSearch)(value)}
        onClearSearch={() => updateFilters(setSearch)("")}
        status={fStatus}
        onStatusChange={value => updateFilters(setFStatus)(value)}
        type={fType}
        onTypeChange={value => updateFilters(setFType)(value)}
        label={fLabel}
        onLabelChange={value => updateFilters(setFLabel)(value)}
        sortBy={sortBy}
        onSortChange={value => updateFilters(setSortBy)(value)}
        showAdminFilters={Boolean(user)}
        labels={labels}
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {pagedForms.map(form => {
          const archiveBusy = archiveAction === `${form.id}:${form.status === "arquivado" ? "rascunho" : "arquivado"}`;
          const isPinned = pinnedSet.has(form.id);
          return (
            <FormListCard
              key={form.id}
              form={form}
              user={user}
              labels={labels}
              isPinned={isPinned}
              archiveBusy={archiveBusy}
              onNavigate={onNavigate}
              onDuplicateForm={onDuplicateForm}
              onTogglePinnedForm={onTogglePinnedForm}
              onArchiveForm={toggleArchive}
              onDeleteForm={openDeleteModal}
            />
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
