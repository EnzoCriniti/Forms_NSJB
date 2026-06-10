/**
 * @file frontend/src/features/events/components/eventPaginationControls.jsx
 * @summary Controles visuais de paginacao da area de eventos.
 */

import React from "react";
import { Btn, COLORS } from "../../../components/ui";

export const EventPaginationControls = ({ pagination, totalItems, onPrevious, onNext }) => {
  if (totalItems <= pagination.pageItems.length) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
      <div style={{ fontSize: 12, color: COLORS.textMuted }}>
        Exibindo {pagination.rangeStart} a {pagination.rangeEnd} de {totalItems}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Btn v="secondary" sz="sm" onClick={onPrevious} disabled={pagination.safePage === 1}>Anterior</Btn>
        <div style={{ display: "flex", alignItems: "center", fontSize: 13, color: COLORS.textSecondary, padding: "0 8px" }}>Página {pagination.safePage} de {pagination.totalPages}</div>
        <Btn v="secondary" sz="sm" onClick={onNext} disabled={pagination.safePage === pagination.totalPages}>Próxima</Btn>
      </div>
    </div>
  );
};
