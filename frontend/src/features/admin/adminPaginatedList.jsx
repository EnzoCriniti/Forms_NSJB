/**
 * @file frontend/src/features/admin/adminPaginatedList.jsx
 * @summary Lista paginada compartilhada do admin.
 * @responsibility Renderizar listas curtas com paginacao local.
 */

import React, { useState } from "react";
import { Btn, COLORS } from "../../components/ui";
import { PAGE_SIZE } from "./adminSettingsConstants";

export const PaginatedList = ({ items, emptyText, renderItem }) => {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = items.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  if (items.length === 0) {
    return <div style={{ color: COLORS.textMuted, fontSize: 12, padding: "12px 0" }}>{emptyText}</div>;
  }

  return (
    <div>
      {visible.map(renderItem)}
      {items.length > PAGE_SIZE && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: COLORS.textMuted }}>
            {((safePage - 1) * PAGE_SIZE) + 1}-{Math.min(safePage * PAGE_SIZE, items.length)} de {items.length}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <Btn v="secondary" sz="sm" onClick={() => setPage(current => Math.max(1, current - 1))} disabled={safePage === 1}>Anterior</Btn>
            <Btn v="secondary" sz="sm" onClick={() => setPage(current => Math.min(totalPages, current + 1))} disabled={safePage === totalPages}>Proxima</Btn>
          </div>
        </div>
      )}
    </div>
  );
};
