/**
 * @file frontend/src/components/uiBadges.jsx
 * @summary Badges compartilhados da UI base.
 * @responsibility Renderizar marcadores visuais de labels, status e tipo de formulario.
 */

import React from "react";
import { COLORS } from "./uiTheme";

export const Badge = ({ label, small, labels = [] }) => {
  const item = typeof label === "object" ? label : labels.find(entry => entry.id === label);
  return <span className="ui-badge" style={{ background: item?.color || "var(--text-secondary)", color: "#fff", padding: small ? "3px 8px" : "4px 10px", whiteSpace: "nowrap" }}>{item?.name || ""}</span>;
};

export const StatusBadge = ({ status, avoidDanger = false }) => {
  const map = {
    aberto: { bg: COLORS.primaryLight, c: COLORS.accent, t: "Aberto" },
    fechado: { bg: COLORS.dangerLight, c: COLORS.danger, t: "Fechado" },
    rascunho: { bg: COLORS.warningLight, c: COLORS.warning, t: "Rascunho" },
    pronto: { bg: COLORS.primaryLight, c: COLORS.primary, t: "Pronto" },
    publicado: { bg: COLORS.primaryLight, c: COLORS.accent, t: "Publicado" },
    encerrado: { bg: COLORS.surfaceAlt, c: COLORS.textSecondary, t: "Encerrado" },
    arquivado: { bg: COLORS.surfaceAlt, c: COLORS.textSecondary, t: "Arquivado" },
  };
  const item = avoidDanger && status === "fechado"
    ? { bg: "var(--type-scale-bg)", c: "var(--type-scale-text)", t: "Fechado" }
    : (map[status] || map.rascunho);
  return <span className="ui-badge" style={{ background: item.bg, color: item.c }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: item.c, flex: "0 0 auto" }} />{item.t}</span>;
};

export const TypeBadge = ({ type }) => (
  <span className="ui-badge" style={{ background: type === "escala_organ" ? "var(--type-scale-bg)" : "var(--type-presence-bg)", color: type === "escala_organ" ? "var(--type-scale-text)" : "var(--type-presence-text)" }}>
    {type === "escala_organ" ? "Formulario interno" : "Presen\u00e7a"}
  </span>
);
