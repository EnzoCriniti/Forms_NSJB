/**
 * @file frontend/src/features/admin/adminField.jsx
 * @summary Campo visual compartilhado do admin.
 * @responsibility Fornecer wrapper simples para campos dos paineis administrativos.
 */

import React from "react";

export const AdminField = ({ children, style }) => (
  <div className="admin-field" style={{ display: "grid", gap: 6, ...style }}>
    {children}
  </div>
);
