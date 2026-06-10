import React from "react";
import { formatDate } from "../lib/forms";
import { PublicReadingToolbar } from "./PublicReadingToolbar";
import { Icon } from "./ui";

export const PublicTopCompact = ({ form, onBack, description, actionLabel, actionHref, actionIcon = "eye", readingControls }) => {
  const displayTitle = form?.date ? `${form.title} - ${formatDate(form.date)}` : form?.title || "NSJB Forms";
  const descriptionText = String(description || "").trim();
  const handleAction = () => {
    if (!actionHref) return;
    window.location.hash = actionHref.startsWith("#") ? actionHref : `#${actionHref}`;
  };

  return (
    <div>
      <PublicReadingToolbar {...readingControls} />
      <div className="public-top" style={{ background: "var(--header-bg)", borderRadius: "16px 16px 0 0", padding: "24px", color: "var(--header-fg)" }}>
      <div className="public-top-compact-row" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 18, alignItems: "start" }}>
        <div className="public-top-compact-main" style={{ minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.02em" }}>{displayTitle}</h1>
          <p style={{ margin: "6px 0 0", color: "var(--header-fg-muted)", fontSize: 13 }}>{form?.type === "escala_organ" ? "Escala da Organ" : "Formulário de Presença"}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12, alignItems: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 999, background: "var(--header-control-bg)", border: "1px solid var(--header-control-border)", fontSize: 11, fontWeight: 700 }}>
              <Icon name="form" size={12} />
              NSJB Forms
            </span>
          </div>
        </div>
        <div className="public-top-compact-side" style={{ display: "grid", gap: 10 }}>
          <div className="public-top-compact-actions" style={{ display: "grid", gridTemplateColumns: onBack ? "auto" : "1fr", gap: 10, justifyContent: onBack ? "end" : "stretch" }}>
            {actionHref && <button onClick={handleAction} style={{ border: "1px solid var(--header-control-border)", color: "var(--header-fg)", background: "var(--header-control-bg)", borderRadius: 10, padding: "10px 13px", cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap" }}><Icon name={actionIcon} size={14} /> {actionLabel || "Resultados"}</button>}
            {onBack && <button onClick={onBack} style={{ border: "1px solid var(--header-control-border)", color: "var(--header-fg)", background: "var(--header-control-bg)", borderRadius: 10, padding: "10px 13px", cursor: "pointer", fontWeight: 700 }}>Voltar</button>}
          </div>
        </div>
      </div>
      {descriptionText && (
        <p className="public-top-description">{descriptionText}</p>
      )}
      </div>
    </div>
  );
};
