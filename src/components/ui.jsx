/**
 * @file src/components/ui.jsx
 * @summary Componentes visuais base.
 * @responsibility Reunir cores, icones, badges e elementos de UI compartilhados.
 */

import React, { useState } from "react";
import { formatDate, formatDateTime } from "../lib/forms";

export const COLORS = {
  primary: "var(--primary)",
  primaryLight: "var(--primary-light)",
  primaryDark: "var(--primary-dark)",
  accent: "var(--accent)",
  danger: "var(--danger)",
  dangerLight: "var(--danger-light)",
  warning: "var(--warning)",
  warningLight: "var(--warning-light)",
  surface: "var(--surface)",
  surfaceAlt: "var(--surface-alt)",
  border: "var(--border)",
  borderLight: "var(--border-light)",
  text: "var(--text)",
  textSecondary: "var(--text-secondary)",
  textMuted: "var(--text-muted)",
};

export const Icon = ({ name, size = 18 }) => {
  const icons = {
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    list: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
    chart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="12" width="4" height="9" /><rect x="10" y="7" width="4" height="14" /><rect x="17" y="3" width="4" height="18" /></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
    eye: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    link: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
    close: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>,
    upload: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>,
    back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>,
    save: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>,
    grid: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
    download: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    form: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>,
    clipboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>,
    warning: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
    info: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>,
    user: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    sortAsc: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 19V5" /><path d="M5 12l7-7 7 7" /></svg>,
    sortDesc: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14" /><path d="M19 12l-7 7-7-7" /></svg>,
    sortNone: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35"><path d="M7 15l5 5 5-5" /><path d="M7 9l5-5 5 5" /></svg>,
    lock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
    share: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>,
    pin: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 4l6 6" /><path d="M18 2l4 4-5 5-4-4z" /><path d="M9 11 2 22" /><path d="M12.5 8.5 15.5 11.5" /><path d="M5 18l4-4 7-1-5-5-1 7z" /></svg>,
    archive: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="5" rx="1" /><path d="M5 9v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9" /><path d="M10 13h4" /></svg>,
  };
  return icons[name] || null;
};

export const Badge = ({ label, small, labels = [] }) => {
  const item = typeof label === "object" ? label : labels.find(entry => entry.id === label);
  return <span className="ui-badge" style={{ background: item?.color || "var(--text-secondary)", color: "#fff", padding: small ? "3px 8px" : "4px 10px", whiteSpace: "nowrap" }}>{item?.name || ""}</span>;
};

export const resolveActionErrorMessage = error => {
  const message = String(error?.message || "").trim();
  if (error?.code === "AUTH_INVALID_PAYLOAD" || /usuario e senha sao obrigatorios/i.test(message)) {
    return "Informe usuário e senha.";
  }
  if (error?.code === "AUTH_INVALID_CREDENTIALS" || /usuario ou senha invalidos/i.test(message)) {
    return "Usuário ou senha inválidos.";
  }
  if (error?.code === "AUTH_ADMIN_SESSION_ACTIVE" || /administrador conectado em outro dispositivo/i.test(message)) {
    return "Já existe um administrador conectado em outro dispositivo. Aguarde o logout ou o timeout de inatividade.";
  }
  const isNetworkError = !error?.status && /fetch|network|failed to fetch|networkerror/i.test(message);
  if (isNetworkError) {
    return "Falha de comunicação com a API. Verifique a conexão e tente novamente.";
  }
  if (error?.status === 409 && error?.code === "ESCALA_CONFLICT") {
    return message || "A vaga já foi preenchida por outra pessoa. Recarregue a página e tente novamente.";
  }
  return message || "Não foi possível concluir a operação. Tente novamente.";
};

export const StatusBadge = ({ status }) => {
  const map = {
    aberto: { bg: COLORS.primaryLight, c: COLORS.accent, t: "Aberto" },
    fechado: { bg: COLORS.dangerLight, c: COLORS.danger, t: "Fechado" },
    rascunho: { bg: COLORS.warningLight, c: COLORS.warning, t: "Rascunho" },
    arquivado: { bg: COLORS.surfaceAlt, c: COLORS.textSecondary, t: "Arquivado" },
  };
  const item = map[status] || map.rascunho;
  return <span className="ui-badge" style={{ background: item.bg, color: item.c }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: item.c, flex: "0 0 auto" }} />{item.t}</span>;
};

export const Btn = ({ children, v = "primary", sz = "md", icon, onClick, style: extra, disabled, loading = false, type = "button", className = "", ...props }) => {
  const pad = sz === "sm" ? "6px 12px" : sz === "lg" ? "12px 24px" : "8px 16px";
  const fs = sz === "sm" ? 12 : sz === "lg" ? 15 : 13;
  const vars = {
    primary: { background: COLORS.primary, color: "#fff" },
    secondary: { background: COLORS.surfaceAlt, color: COLORS.text, border: `1px solid ${COLORS.border}` },
    ghost: { background: "transparent", color: COLORS.textSecondary, padding: "6px 8px" },
    warning: { background: COLORS.warningLight, color: "#b86e00", border: `1px solid ${COLORS.warning}` },
    danger: { background: COLORS.dangerLight, color: COLORS.danger },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-variant={v}
      data-size={sz}
      className={`ui-btn${className ? ` ${className}` : ""}`}
      {...props}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, border: "none", borderRadius: 8,
        cursor: disabled || loading ? "not-allowed" : "pointer", fontWeight: 600, fontFamily: "inherit",
        transition: "all 0.15s", opacity: disabled || loading ? 0.5 : 1, padding: pad, fontSize: fs,
        ...vars[v], ...extra,
      }}
    >{loading && <span className="ui-spinner" aria-hidden="true" />}{icon && !loading && <Icon name={icon} size={sz === "sm" ? 14 : 16} />}{children}</button>
  );
};

export const FeedbackBanner = ({ tone = "info", title, message, fixed = false }) => {
  if (!message) return null;
  const config = {
    success: { bg: "var(--feedback-success-bg)", border: "var(--feedback-success-border)", color: "var(--feedback-success-text)", icon: "check", label: title || "Sucesso" },
    error: { bg: "var(--feedback-error-bg)", border: "var(--feedback-error-border)", color: "var(--feedback-error-text)", icon: "warning", label: title || "Erro" },
    loading: { bg: "var(--feedback-loading-bg)", border: "var(--feedback-loading-border)", color: "var(--feedback-loading-text)", icon: "spinner", label: title || "Processando" },
    info: { bg: "var(--feedback-info-bg)", border: "var(--feedback-info-border)", color: "var(--feedback-info-text)", icon: "info", label: title || "Aviso" },
  }[tone] || null;
  if (!config) return null;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`ui-feedback ui-feedback--${tone}${fixed ? " ui-feedback--fixed" : ""}`}
      style={{ background: config.bg, borderColor: config.border, color: config.color }}
    >
      <span className="ui-feedback__icon" style={{ background: config.border, color: config.color }}>
        {config.icon === "spinner" ? <span className="ui-spinner" aria-hidden="true" /> : <Icon name={config.icon} size={14} />}
      </span>
      <div className="ui-feedback__content">
        <strong>{config.label}</strong>
        <span>{message}</span>
      </div>
    </div>
  );
};

export const ConfirmModal = ({
  open,
  title,
  message,
  children,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "danger",
  busy = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ width: "min(440px, 100%)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto", background: tone === "danger" ? COLORS.dangerLight : COLORS.warningLight, color: tone === "danger" ? COLORS.danger : COLORS.warning }}>
            <Icon name={tone === "danger" ? "trash" : "warning"} size={20} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 17 }}>{title}</h3>
            <p style={{ margin: "8px 0 0", color: COLORS.textSecondary, fontSize: 13, lineHeight: 1.5 }}>{message}</p>
          </div>
        </div>
        {children && <div style={{ marginTop: 16 }}>{children}</div>}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 20 }}>
          <Btn v="secondary" onClick={onCancel} disabled={busy}>{cancelLabel}</Btn>
          <Btn v={tone === "danger" ? "danger" : "warning"} onClick={onConfirm} loading={busy} disabled={confirmDisabled}>{confirmLabel}</Btn>
        </div>
      </div>
    </div>
  );
};

export const TypeBadge = ({ type }) => (
  <span className="ui-badge" style={{ background: type === "escala_organ" ? "var(--type-scale-bg)" : COLORS.primaryLight, color: type === "escala_organ" ? "var(--type-scale-text)" : COLORS.primary }}>
    {type === "escala_organ" ? "Escala da Organ" : "Presença"}
  </span>
);

export const PublicTopCompact = ({ form, onBack }) => {
  const displayTitle = form?.date ? `${form.title} - ${formatDate(form.date)}` : form?.title || "NSJB Forms";

  return (
    <div className="public-top" style={{ background: COLORS.primary, borderRadius: "16px 16px 0 0", padding: "24px", color: "#fff" }}>
      <div className="public-top-compact-row" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 18, alignItems: "start" }}>
        <div className="public-top-compact-main" style={{ minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, lineHeight: 1.15 }}>{displayTitle}</h1>
          <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.84)", fontSize: 13 }}>{form?.type === "escala_organ" ? "Escala da Organ" : "Formulário de Presença"}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12, alignItems: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 999, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", fontSize: 11, fontWeight: 700 }}>
              <Icon name="form" size={12} />
              NSJB Forms
            </span>
          </div>
        </div>
        <div className="public-top-compact-side" style={{ display: "grid", gap: 10 }}>
          <div className="public-top-compact-actions" style={{ display: "grid", gridTemplateColumns: onBack ? "auto" : "1fr", gap: 10, justifyContent: onBack ? "end" : "stretch" }}>
            {onBack && <button onClick={onBack} style={{ border: "1px solid rgba(255,255,255,0.35)", color: "#fff", background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 13px", cursor: "pointer", fontWeight: 700 }}>Voltar</button>}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PublicTop = ({ form, onBack }) => {
  const [copied, setCopied] = useState(false);
  const publicPath = form?.slug ? `#/f/${form.slug}` : "";
  const copyTarget = publicPath ? `${window.location.href.split("#")[0]}${publicPath}` : "";

  const handleCopy = async () => {
    if (!copyTarget || !navigator?.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(copyTarget);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="public-top" style={{ background: COLORS.primary, borderRadius: "16px 16px 0 0", padding: "24px", color: "#fff" }}>
      <div className="public-top-row" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", alignItems: "center", gap: 18 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 999, background: "rgba(255,255,255,0.14)", border: "1px solid rgba(255,255,255,0.22)", fontSize: 11, fontWeight: 800, letterSpacing: 0.3, marginBottom: 12 }}>
            <Icon name="link" size={12} />
            Link público
          </div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, lineHeight: 1.15 }}>{form?.title || "NSJB Forms"}</h1>
          <p style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.84)", fontSize: 13 }}>{form?.type === "escala_organ" ? "Escala da Organ" : "Formulário de Presença"}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12, alignItems: "center" }}>
            {publicPath && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 999, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", fontSize: 11, fontWeight: 700 }}>
                <Icon name="share" size={12} />
                {publicPath}
              </span>
            )}
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 999, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", fontSize: 11, fontWeight: 700 }}>
              <Icon name="form" size={12} />
              NSJB Forms
            </span>
          </div>
        </div>
        <div className="public-top-meta" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <div style={{ textAlign: "left", border: "1px solid rgba(255,255,255,0.28)", borderRadius: 12, padding: "10px 12px", minWidth: 180 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.72)", textTransform: "uppercase", fontWeight: 800 }}>Sessão</div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{form?.sessionName || "Sessão"}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.84)", marginTop: 2 }}>{formatDate(form?.date)}</div>
          </div>
          {publicPath && <Btn v="secondary" sz="sm" icon="clipboard" onClick={handleCopy}>{copied ? "Link copiado" : "Copiar link"}</Btn>}
          {onBack && <button onClick={onBack} style={{ border: "1px solid rgba(255,255,255,0.35)", color: "#fff", background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 13px", cursor: "pointer", fontWeight: 700 }}>Painel</button>}
        </div>
      </div>
    </div>
  );
};

export const ClosedPublicScreen = ({ form, onBack }) => (
  <div style={{ maxWidth: 620, margin: "0 auto" }}>
    <PublicTopCompact form={form} onBack={onBack} />
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderTop: "none", borderRadius: "0 0 16px 16px", padding: "36px 24px", textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", background: COLORS.dangerLight, color: COLORS.danger }}><Icon name="warning" size={28} /></div>
      <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>Formulário fechado</h2>
      <p style={{ margin: "0 auto", maxWidth: 460, fontSize: 13, lineHeight: 1.55, color: COLORS.textSecondary }}>{form?.closingText || "Este formulário não está mais aceitando respostas."}</p>
      <p style={{ margin: "14px 0 0", fontSize: 12, color: COLORS.textMuted }}>Fechamento: {formatDateTime(form?.closing)}</p>
    </div>
  </div>
);
