/**
 * @file frontend/src/components/FormListCard.jsx
 * @summary Card individual da listagem de formularios.
 * @responsibility Encapsular renderizacao e acoes de um formulario na listagem.
 */

import React from "react";
import { COLORS, Icon, Badge, StatusBadge, Btn, TypeBadge } from "./ui";
import { canCreateForms, canViewForm } from "../lib/auth";
import { formatDate, formatDateTime, getFormMode, getFormModeLabel, hasLinkedPeopleField } from "../lib/forms";
import { buildPublicFormPath } from "../lib/appPublicRoutes";

const LIST_ACTION_STYLE = {
  width: 42,
  height: 42,
  minWidth: 42,
  padding: 0,
  justifyContent: "center",
  borderRadius: 12,
};

export const FormListCard = ({
  form,
  user,
  labels = [],
  isPinned = false,
  canPinForms = false,
  archiveBusy = false,
  onNavigate,
  onDuplicateForm,
  onTogglePinnedForm,
  onArchiveForm,
  onDeleteForm,
}) => {
  const responses = form.metrics?.responses || 0;
  const total = form.metrics?.total || form.totalExpected || 0;
  const canOpenResults = canViewForm(user, form);
  const showFillSummary = Boolean(user) && (form.type === "escala_organ" || hasLinkedPeopleField(form));
  const fillPercent = total ? Math.min(100, (responses / total) * 100) : 0;
  const formMode = getFormMode(form);

  const openPublicForm = () => {
    if (!form?.id) return;
    if (user) {
      onNavigate("respond", form);
      return;
    }
    window.location.hash = buildPublicFormPath(form);
  };

  const openResults = () => {
    if (!canOpenResults) return;
    onNavigate("results", form);
  };

  const toggleArchive = async () => {
    if (!form || !onArchiveForm) return;
    const nextStatus = form.status === "arquivado" ? "rascunho" : "arquivado";
    await onArchiveForm(form, nextStatus);
  };

  return (
    <div
      className={`form-card form-card--interactive elevated${showFillSummary ? "" : " form-card--no-summary"}`}
      role="button"
      tabIndex={0}
      onClick={openPublicForm}
      onKeyDown={event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openPublicForm();
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
            <span style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.25 }}>{form?.title}</span>
            {form?.date && (
              <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.textSecondary, whiteSpace: "nowrap" }}>
                {formatDate(form.date)}
              </span>
            )}
            {isPinned && (
              <span title="Formulário fixado" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 999, background: COLORS.warningLight, color: COLORS.warning }}>
                <Icon name="pin" size={12} />
              </span>
            )}
          </div>
        </div>
        <div className="form-card-badges" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
          <StatusBadge status={form.status} />
          {canCreateForms(user) && <TypeBadge type={form.type} />}
          {form.type === "presenca" && (
            <span className="ui-badge" style={{ background: formMode === "nucleo" ? COLORS.primaryLight : COLORS.surfaceAlt, color: formMode === "nucleo" ? COLORS.primary : COLORS.textSecondary }}>
              {getFormModeLabel(form)}
            </span>
          )}
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
          <Btn icon="link" onClick={openPublicForm}>Responder</Btn>
          {canOpenResults && <Btn v="secondary" icon="eye" onClick={openResults}>Ver resultados</Btn>}
        </div>
        {!showFillSummary && (
          <div
            className="card-secondary-actions card-secondary-actions--bottom"
            style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end", marginTop: 12 }}
            onClick={event => event.stopPropagation()}
          >
            {canPinForms && (
              <Btn
                v={isPinned ? "warning" : "ghost"}
                icon="pin"
                sz="sm"
                style={LIST_ACTION_STYLE}
                title={isPinned ? "Desfixar formulário" : "Fixar formulário"}
                aria-label={isPinned ? "Desfixar formulário" : "Fixar formulário"}
                onClick={() => onTogglePinnedForm?.(form.id)}
              />
            )}
            {canCreateForms(user) && <Btn v="ghost" icon="edit" sz="sm" style={LIST_ACTION_STYLE} title="Editar formulário" aria-label="Editar formulário" onClick={() => onNavigate("create", form)} />}
            {canCreateForms(user) && <Btn v="ghost" icon="clipboard" sz="sm" style={LIST_ACTION_STYLE} title="Duplicar" aria-label="Duplicar" onClick={() => onDuplicateForm?.(form)} />}
            {canCreateForms(user) && (
              <Btn
                v="ghost"
                icon={form.status === "arquivado" ? "upload" : "archive"}
                sz="sm"
                style={LIST_ACTION_STYLE}
                title={form.status === "arquivado" ? "Restaurar formulário" : "Arquivar formulário"}
                aria-label={form.status === "arquivado" ? "Restaurar formulário" : "Arquivar formulário"}
                onClick={toggleArchive}
                loading={archiveBusy}
              />
            )}
            {canCreateForms(user) && <Btn v="danger" icon="trash" sz="sm" style={LIST_ACTION_STYLE} title="Excluir" aria-label="Excluir" onClick={() => onDeleteForm?.(form)} />}
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
              {canPinForms && (
                <Btn
                  v={isPinned ? "warning" : "ghost"}
                  icon="pin"
                  sz="sm"
                  style={LIST_ACTION_STYLE}
                  title={isPinned ? "Desfixar formulário" : "Fixar formulário"}
                  aria-label={isPinned ? "Desfixar formulário" : "Fixar formulário"}
                  onClick={() => onTogglePinnedForm?.(form.id)}
                />
              )}
              {canCreateForms(user) && <Btn v="ghost" icon="edit" sz="sm" style={LIST_ACTION_STYLE} title="Editar formulário" aria-label="Editar formulário" onClick={() => onNavigate("create", form)} />}
              {canCreateForms(user) && <Btn v="ghost" icon="clipboard" sz="sm" style={LIST_ACTION_STYLE} title="Duplicar" aria-label="Duplicar" onClick={() => onDuplicateForm?.(form)} />}
              {canCreateForms(user) && (
                <Btn
                  v="ghost"
                  icon={form.status === "arquivado" ? "upload" : "archive"}
                  sz="sm"
                  style={LIST_ACTION_STYLE}
                  title={form.status === "arquivado" ? "Restaurar formulário" : "Arquivar formulário"}
                  aria-label={form.status === "arquivado" ? "Restaurar formulário" : "Arquivar formulário"}
                  onClick={toggleArchive}
                  loading={archiveBusy}
                />
              )}
              {canCreateForms(user) && <Btn v="danger" icon="trash" sz="sm" style={LIST_ACTION_STYLE} title="Excluir" aria-label="Excluir" onClick={() => onDeleteForm?.(form)} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
