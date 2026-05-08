/**
 * @file frontend/src/components/FormListToolbar.jsx
 * @summary Barra de busca e filtros da listagem.
 * @responsibility Manter a composicao de filtros fora da tela principal.
 */

import React from "react";
import { COLORS, Icon } from "./ui";

const controlStyle = {
  minHeight: 38,
  padding: "8px 10px",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  fontSize: 13,
  fontFamily: "inherit",
  background: COLORS.surface,
  color: COLORS.text,
  cursor: "pointer",
  width: "auto",
  boxShadow: "none",
};

const searchStyle = {
  width: "100%",
  minHeight: 38,
  padding: "8px 38px 8px 34px",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  fontSize: 13,
  fontFamily: "inherit",
  outline: "none",
  background: COLORS.surface,
  color: COLORS.text,
  boxSizing: "border-box",
  boxShadow: "none",
};

export const FormListToolbar = ({
  search,
  onSearchChange,
  onClearSearch,
  status,
  onStatusChange,
  type,
  onTypeChange,
  label,
  onLabelChange,
  sortBy,
  onSortChange,
  showAdminFilters = false,
  labels = [],
}) => (
  <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap", alignItems: "center", padding: 12, background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, boxShadow: "var(--shadow-sm)" }}>
    <div style={{ position: "relative", flex: "1 1 260px", minWidth: 220 }}>
      <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: COLORS.textMuted }}><Icon name="search" size={16} /></div>
      <input value={search} onChange={event => onSearchChange(event.target.value)} placeholder="Buscar por titulo, data, classificacao ou status..." style={searchStyle} />
      {search && (
        <button
          type="button"
          aria-label="Limpar busca"
          onClick={onClearSearch}
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            width: 28,
            height: 28,
            border: "none",
            borderRadius: 8,
            background: COLORS.surfaceAlt,
            color: COLORS.textSecondary,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name="close" size={12} />
        </button>
      )}
    </div>
    {showAdminFilters && (
      <>
        <select value={status || ""} onChange={event => onStatusChange(event.target.value || null)} style={controlStyle}>
          <option value="">Todos os status</option>
          <option value="aberto">Aberto</option>
          <option value="fechado">Fechado</option>
          <option value="rascunho">Rascunho</option>
          <option value="arquivado">Arquivado</option>
        </select>
        <select value={type || ""} onChange={event => onTypeChange(event.target.value || null)} style={controlStyle}>
          <option value="">Todos os tipos</option>
          <option value="presenca">Presenca</option>
          <option value="escala_organ">Escala da Organ</option>
        </select>
        <select value={label || ""} onChange={event => onLabelChange(event.target.value ? Number(event.target.value) : null)} style={controlStyle}>
          <option value="">Todas as classificacoes</option>
          {labels.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </>
    )}
    <select value={sortBy} onChange={event => onSortChange(event.target.value)} style={controlStyle}>
      <option value="date_desc">Mais recentes</option>
      <option value="title">Titulo</option>
      <option value="status">Status</option>
      <option value="responses">Mais preenchidos</option>
    </select>
  </div>
);
