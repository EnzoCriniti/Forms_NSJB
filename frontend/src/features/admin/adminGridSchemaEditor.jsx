/**
 * @file frontend/src/features/admin/adminGridSchemaEditor.jsx
 * @summary Editor de schema de grade administrativo.
 * @responsibility Editar linhas, colunas e presets dos campos de grade.
 */

import React from "react";
import { COLORS } from "../../components/ui";
import { GridSchemaRowsEditor } from "./GridSchemaRowsEditor";
import { GridSchemaColumnsEditor } from "./GridSchemaColumnsEditor";

export const GridSchemaEditor = ({ value, onChange }) => {
  return (
    <div style={{ display: "grid", gap: 10, background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 10 }}>
      <GridSchemaRowsEditor value={value} onChange={onChange} />
      <GridSchemaColumnsEditor value={value} onChange={onChange} />
    </div>
  );
};
