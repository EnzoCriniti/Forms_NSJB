/**
 * @file frontend/src/components/MessageStatusBadge.jsx
 * @summary Badge visual para o status de mensagens em eventos.
 * @responsibility Mapear status -> cor + rotulo curto.
 */

import React from "react";
import { COLORS } from "./ui";

const MAP = {
  rascunho: { bg: COLORS.warningLight, fg: COLORS.warning, label: "Rascunho" },
  agendada: { bg: COLORS.primaryLight, fg: COLORS.primary, label: "Agendada" },
  pronta: { bg: COLORS.primaryLight, fg: COLORS.accent, label: "Pronta" },
  disparada: { bg: COLORS.surfaceAlt, fg: COLORS.success || COLORS.primary, label: "Disparada" },
  cancelada: { bg: COLORS.surfaceAlt, fg: COLORS.textSecondary, label: "Cancelada" },
};

export const MessageStatusBadge = ({ status }) => {
  const item = MAP[status] || MAP.rascunho;
  return (
    <span
      className="ui-badge"
      style={{
        background: item.bg,
        color: item.fg,
        fontSize: 11,
        fontWeight: 700,
        padding: "2px 10px",
        borderRadius: 999,
        display: "inline-flex",
        alignItems: "center",
        whiteSpace: "nowrap",
      }}
    >
      {item.label}
    </span>
  );
};

export const MESSAGE_TYPE_LABELS = {
  new_scale: "Anuncio (grupo)",
  fill_reminder: "Lembrete de presença",
  open_slots: "Vagas em aberto",
};
