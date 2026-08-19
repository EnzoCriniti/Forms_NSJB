/**
 * @file frontend/src/components/FormListCard.jsx
 * @summary Card individual da listagem de formularios.
 * @responsibility Encapsular renderizacao e acoes de um formulario na listagem.
 */

import React, { useEffect, useRef, useState } from "react";
import { COLORS, Icon, Badge, StatusBadge, Btn, TypeBadge } from "./ui";
import { canCreateForms, canViewForm } from "../lib/auth";
import { formatDate, formatDateTime, getFormMode, getFormModeLabel, isLinkedRosterEnabled } from "../lib/forms";
import { buildPublicFormPath, buildPublicFormUrl } from "../lib/appPublicRoutes";

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
  const [copiedPublicLink, setCopiedPublicLink] = useState(false);
  const copiedPublicLinkTimerRef = useRef(null);
  const responses = form.metrics?.responses || 0;
  const total = form.metrics?.total || form.totalExpected || 0;
  const canOpenResults = canViewForm(user, form);
  const showFillSummary = Boolean(user) && (form.type === "escala_organ" || isLinkedRosterEnabled(form));
  const isScaleForm = form.type === "escala_organ";
  const typeIcon = isScaleForm ? "users" : "clipboard";
  const typeIconLabel = isScaleForm ? "Escala da Organ" : "Formul\u00e1rio de presen\u00e7a";
  const typeBackground = isScaleForm ? "var(--type-scale-bg)" : "var(--type-presence-bg)";
  const typeColor = isScaleForm ? "var(--type-scale-text)" : "var(--type-presence-text)";
  const fillPercent = total ? Math.min(100, (responses / total) * 100) : 0;
  const formMode = getFormMode(form);
  const formattedDate = form?.date ? formatDate(form.date) : "";
  const titleDateSuffix = formattedDate ? ` - ${formattedDate}` : "";
  const displayTitle = titleDateSuffix && form?.title?.endsWith(titleDateSuffix)
    ? form.title.slice(0, -titleDateSuffix.length)
    : form?.title;

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

  useEffect(() => () => {
    if (copiedPublicLinkTimerRef.current) {
      clearTimeout(copiedPublicLinkTimerRef.current);
    }
  }, []);

  const copyPublicLink = async () => {
    if (!form?.id || typeof navigator === "undefined" || !navigator.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(buildPublicFormUrl(form));
      setCopiedPublicLink(true);
      if (copiedPublicLinkTimerRef.current) {
        clearTimeout(copiedPublicLinkTimerRef.current);
      }
      copiedPublicLinkTimerRef.current = setTimeout(() => setCopiedPublicLink(false), 1500);
    } catch {
      setCopiedPublicLink(false);
    }
  };

  // A confirmacao de copia nao pode ocupar espaco: a coluna de acoes do card
  // tem largura fixa, entao um texto ao lado do botao empurrava os demais para
  // a linha de baixo. O retorno visual vira troca de icone (no proprio botao) e
  // o aviso textual fica so para leitores de tela.
  const shareButton = (
    <span style={{ display: "inline-flex", alignItems: "center" }}>
      <Btn
        v="ghost"
        icon={copiedPublicLink ? "check" : "share"}
        sz="sm"
        style={copiedPublicLink ? { ...LIST_ACTION_STYLE, color: COLORS.accent } : LIST_ACTION_STYLE}
        title={copiedPublicLink ? "Link copiado" : "Copiar link público"}
        aria-label={copiedPublicLink ? "Link copiado" : "Copiar link público"}
        onClick={copyPublicLink}
      />
      <span role="status" aria-live="polite" className="sr-only">
        {copiedPublicLink ? "Link copiado" : ""}
      </span>
    </span>
  );

  return (
    <div
      className={`form-card form-card--interactive elevated${showFillSummary ? "" : " form-card--no-summary"}`}
      data-form-type={form.type}
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
    >
      <div role="img" aria-label={typeIconLabel} className="form-card-icon" style={{ width: 46, height: 46, borderRadius: 12, background: typeBackground, display: "flex", alignItems: "center", justifyContent: "center", color: typeColor, flexShrink: 0 }}><Icon name={typeIcon} size={20} /></div>
      <div className="form-card-main" style={{ flex: 1, minWidth: 0 }}>
        <div className="form-card-title-row" style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
          <div className="form-card-title-wrap" style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.25 }}>{displayTitle}</span>
            {formattedDate && (
              <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.textSecondary, whiteSpace: "nowrap" }}>
                {formattedDate}
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
          <StatusBadge status={form.status} avoidDanger={isScaleForm} />
          {canCreateForms(user) && isScaleForm && <TypeBadge type={form.type} />}
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
          style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginTop: 12 }}
          onClick={event => event.stopPropagation()}
        >
          <Btn icon="link" onClick={openPublicForm}>Responder</Btn>
          {canOpenResults && (
            form.type === "escala_organ"
              ? <Btn v="secondary" icon="edit" onClick={openResults}>Editar escala</Btn>
              : <Btn v="secondary" icon="eye" onClick={openResults}>Ver resultados</Btn>
          )}
          {!showFillSummary && (
          <div
            className="card-secondary-actions card-secondary-actions--bottom"
            style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end", marginLeft: "auto" }}
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
            {shareButton}
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
            {canCreateForms(user) && <Btn v={isScaleForm ? "warning" : "danger"} icon="trash" sz="sm" style={LIST_ACTION_STYLE} title="Excluir" aria-label="Excluir" onClick={() => onDeleteForm?.(form)} />}
          </div>
          )}
        </div>
      </div>
      {showFillSummary && (
        <div className="form-card-side" style={{ display: "grid", gap: 10, flexShrink: 0, width: 246 }}>
          <div className="fill-summary" style={{ textAlign: "right", minWidth: 0, padding: "14px 16px", borderRadius: 12, background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}` }}>
            <div style={{ fontSize: 11, color: COLORS.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.45 }}>Preenchimento</div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "flex-end", gap: 3, marginTop: 4 }}>
              <strong style={{ fontSize: 24, fontWeight: 800, color: typeColor, lineHeight: 1 }}>{responses}</strong>
              <span style={{ fontSize: 14, fontWeight: 700, color: COLORS.textMuted }}>/ {total}</span>
            </div>
            <div style={{ fontSize: 12, color: COLORS.textSecondary, marginTop: 4 }}>{form.type === "escala_organ" ? "vagas preenchidas" : "respostas recebidas"}</div>
            <div style={{ width: "100%", height: 7, background: COLORS.borderLight, borderRadius: 99, marginTop: 10, overflow: "hidden" }}>
              <div style={{ width: `${fillPercent}%`, height: "100%", background: form.status === "fechado" ? COLORS.textMuted : typeColor, borderRadius: 99 }} />
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
              {shareButton}
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
              {canCreateForms(user) && <Btn v={isScaleForm ? "warning" : "danger"} icon="trash" sz="sm" style={LIST_ACTION_STYLE} title="Excluir" aria-label="Excluir" onClick={() => onDeleteForm?.(form)} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
