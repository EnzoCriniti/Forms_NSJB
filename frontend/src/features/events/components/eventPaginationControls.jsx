/**
 * @file frontend/src/features/events/components/eventPaginationControls.jsx
 * @summary Controles visuais de paginacao da area de eventos.
 */

import React from "react";
import { Btn, COLORS } from "../../../components/ui";

export const EventPaginationControls = ({ pagination, totalItems, onPrevious, onNext }) => {
  if (totalItems <= pagination.pageItems.length) return null;

  const navStyle = disabled => ({
    width: 34,
    height: 34,
    minWidth: 34,
    minHeight: 34,
    padding: 0,
    borderRadius: 9,
    border: `1px solid ${COLORS.border}`,
    background: COLORS.surface,
    color: disabled ? COLORS.textMuted : COLORS.text,
    justifyContent: "center",
  });

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 20, fontSize: 12.5, color: COLORS.textMuted, flexWrap: "wrap" }}>
      <span>{pagination.rangeStart}–{pagination.rangeEnd} de {totalItems} evento{totalItems === 1 ? "" : "s"}</span>
      <div style={{ display: "flex", gap: 6 }}>
        <Btn v="ghost" sz="sm" onClick={onPrevious} disabled={pagination.safePage === 1} aria-label="Página anterior" title="Página anterior" style={navStyle(pagination.safePage === 1)}>‹</Btn>
        <Btn v="ghost" sz="sm" onClick={onNext} disabled={pagination.safePage === pagination.totalPages} aria-label="Próxima página" title="Próxima página" style={navStyle(pagination.safePage === pagination.totalPages)}>›</Btn>
      </div>
    </div>
  );
};
