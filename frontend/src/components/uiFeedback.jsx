import React from "react";
import { Icon } from "./uiIcons";

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
