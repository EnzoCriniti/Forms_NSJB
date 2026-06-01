import React from "react";
import { Btn, COLORS } from "../../components/ui";

export const AuditLogsPaginationBar = ({
  total,
  fromIndex,
  toIndex,
  safePage,
  totalPages,
  setPage,
}) => {
  if (total <= 0) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
      <span style={{ fontSize: 11, color: COLORS.textMuted }}>
        {fromIndex}-{toIndex} de {total}
      </span>
      <div style={{ display: "flex", gap: 6 }}>
        <Btn v="secondary" sz="sm" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={safePage === 1}>Anterior</Btn>
        <Btn v="secondary" sz="sm" onClick={() => setPage(current => Math.min(totalPages, current + 1))} disabled={safePage === totalPages}>Proxima</Btn>
      </div>
    </div>
  );
};
