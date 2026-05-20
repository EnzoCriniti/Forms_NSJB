/**
 * @file frontend/src/components/publicUi.jsx
 * @summary Componentes compartilhados das telas publicas.
 * @responsibility Isolar barra de leitura, topos publicos e tela de fechamento.
 */

import React, { useEffect, useState } from "react";
import { formatDate, formatDateTime } from "../lib/forms";
import { buildPublicFormPath } from "../lib/appShell";
import { STORAGE_KEYS } from "../lib/appConstants";
import { COLORS, Btn, Icon, ThemeIcon } from "./ui";

export const PublicReadingToolbar = ({
  theme,
  fontScale = 1,
  onToggleTheme,
  onIncreaseFontScale,
  onDecreaseFontScale,
  onBack,
  backHref,
}) => {
  const resolveInitialTheme = () => {
    if (theme) return theme;
    if (typeof document !== "undefined" && document.documentElement.dataset.theme) {
      return document.documentElement.dataset.theme;
    }
    if (typeof window !== "undefined") {
      return window.localStorage?.getItem(STORAGE_KEYS.theme) || "light";
    }
    return "light";
  };

  const resolveInitialFontScale = () => {
    if (fontScale) return Number(fontScale) || 1;
    if (typeof window !== "undefined") {
      const stored = Number(window.localStorage?.getItem(STORAGE_KEYS.fontScale));
      if (!Number.isNaN(stored) && stored > 0) {
        return stored;
      }
    }
    return 1;
  };

  const [localTheme, setLocalTheme] = useState(resolveInitialTheme);
  const [localFontScale, setLocalFontScale] = useState(resolveInitialFontScale);

  useEffect(() => {
    if (theme) {
      setLocalTheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    if (fontScale) {
      setLocalFontScale(Number(fontScale) || 1);
    }
  }, [fontScale]);

  const applyTheme = nextTheme => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.theme = nextTheme;
    }
    if (typeof window !== "undefined") {
      window.localStorage?.setItem(STORAGE_KEYS.theme, nextTheme);
      window.dispatchEvent(new CustomEvent("nsjb-preferences-change", { detail: { theme: nextTheme } }));
    }
    setLocalTheme(nextTheme);
  };

  const applyFontScale = nextScale => {
    const normalized = Math.min(1.3, Math.max(0.9, Number(nextScale) || 1));
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty("--app-font-scale", String(normalized));
      document.documentElement.dataset.fontScale = normalized > 1 ? "large" : "normal";
    }
    if (typeof window !== "undefined") {
      window.localStorage?.setItem(STORAGE_KEYS.fontScale, String(normalized));
      window.dispatchEvent(new CustomEvent("nsjb-preferences-change", { detail: { fontScale: normalized } }));
    }
    setLocalFontScale(normalized);
  };

  const handleDecrease = () => {
    if (onDecreaseFontScale) {
      onDecreaseFontScale();
    } else {
      applyFontScale(localFontScale - 0.1);
    }
  };

  const handleIncrease = () => {
    if (onIncreaseFontScale) {
      onIncreaseFontScale();
    } else {
      applyFontScale(localFontScale + 0.1);
    }
  };

  const handleThemeToggle = () => {
    const nextTheme = localTheme === "dark" ? "light" : "dark";
    if (onToggleTheme) {
      onToggleTheme();
    } else {
      applyTheme(nextTheme);
    }
  };

  const fontControlStyle = {
    minHeight: 34,
    padding: "6px 10px",
    border: localTheme === "dark" ? "1px solid rgba(255,255,255,0.26)" : "1px solid rgba(15, 38, 24, 0.12)",
    background: localTheme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.96)",
    color: localTheme === "dark" ? "#fff" : "var(--text)",
    fontWeight: 800,
    borderRadius: 10,
    boxShadow: "none",
  };

  return (
    <div className="public-reading-toolbar" data-theme={localTheme} aria-label="Ajustes de leitura">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {(onBack || backHref) && (
          <Btn
            v="ghost"
            sz="sm"
            icon="back"
            onClick={() => {
              if (onBack) {
                onBack();
                return;
              }
              window.location.hash = backHref.startsWith("#") ? backHref : `#${backHref}`;
            }}
            title="Voltar"
            aria-label="Voltar"
            style={{ ...fontControlStyle, width: 34, justifyContent: "center", padding: 0 }}
          />
        )}
        <span className="public-reading-toolbar__zoom" title="Zoom do texto">{Math.round(localFontScale * 100)}%</span>
      </div>
      <div className="public-reading-toolbar__actions">
        <Btn
          v="ghost"
          sz="sm"
          onClick={handleDecrease}
          title="Diminuir fonte"
          aria-label="Diminuir fonte"
          disabled={localFontScale <= 0.9}
          style={fontControlStyle}
        >
          A-
        </Btn>
        <Btn
          v="ghost"
          sz="sm"
          onClick={handleIncrease}
          title="Aumentar fonte"
          aria-label="Aumentar fonte"
          disabled={localFontScale >= 1.3}
          style={fontControlStyle}
        >
          A+
        </Btn>
        <Btn
          v="ghost"
          sz="sm"
          onClick={handleThemeToggle}
          title={localTheme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
          aria-label={localTheme === "dark" ? "Mudar para modo claro" : "Mudar para modo escuro"}
          style={{ ...fontControlStyle, width: 34, justifyContent: "center", padding: 0, fontWeight: 900 }}
        >
          <ThemeIcon theme={localTheme} size={16} />
        </Btn>
      </div>
    </div>
  );
};

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
      <div className="public-top" style={{ background: COLORS.primary, borderRadius: "16px 16px 0 0", padding: "24px", color: "#fff" }}>
      <div className="public-top-compact-row" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 18, alignItems: "start" }}>
        <div className="public-top-compact-main" style={{ minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.02em" }}>{displayTitle}</h1>
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
            {actionHref && <button onClick={handleAction} style={{ border: "1px solid rgba(255,255,255,0.35)", color: "#fff", background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "10px 13px", cursor: "pointer", fontWeight: 700, whiteSpace: "nowrap" }}><Icon name={actionIcon} size={14} /> {actionLabel || "Resultados"}</button>}
            {onBack && <button onClick={onBack} style={{ border: "1px solid rgba(255,255,255,0.35)", color: "#fff", background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 13px", cursor: "pointer", fontWeight: 700 }}>Voltar</button>}
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

export const PublicTop = ({ form, onBack }) => {
  const [copied, setCopied] = useState(false);
  const publicPath = buildPublicFormPath(form);
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
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, lineHeight: 1.08, letterSpacing: "-0.02em" }}>{form?.title || "NSJB Forms"}</h1>
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

export const ClosedPublicScreen = ({ form, onBack, actionLabel, actionHref, message, title = "Formulário fechado", readingControls }) => (
  <div style={{ maxWidth: 620, margin: "0 auto" }}>
    <PublicTopCompact form={form} onBack={onBack} actionLabel={actionLabel} actionHref={actionHref} readingControls={readingControls} />
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderTop: "none", borderRadius: "0 0 16px 16px", padding: "36px 24px", textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", background: COLORS.dangerLight, color: COLORS.danger }}><Icon name="warning" size={28} /></div>
      <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>{title}</h2>
      <p style={{ margin: "0 auto", maxWidth: 460, fontSize: 13, lineHeight: 1.55, color: COLORS.textSecondary }}>{message || form?.closingText || "Este formulário não está mais aceitando respostas."}</p>
      <p style={{ margin: "14px 0 0", fontSize: 12, color: COLORS.textMuted }}>Fechamento: {formatDateTime(form?.closing)}</p>
    </div>
  </div>
);
