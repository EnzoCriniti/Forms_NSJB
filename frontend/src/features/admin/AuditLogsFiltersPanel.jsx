import React from "react";
import { Btn, COLORS } from "../../components/ui";
import { ADMIN_INPUT_STYLE } from "./adminSettingsConstants";

export const AuditLogsFiltersPanel = ({
  draftFilters,
  updateFilter,
  clearFilters,
  applyFilters,
}) => (
  <>
    <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
      <AuditTextInput label="Periodo inicial" type="date" value={draftFilters.from} onChange={value => updateFilter("from", value)} />
      <AuditTextInput label="Periodo final" type="date" value={draftFilters.to} onChange={value => updateFilter("to", value)} />
      <AuditTextInput label="Usuario" value={draftFilters.actor} placeholder="Nome do actor" onChange={value => updateFilter("actor", value)} />
      <AuditTextInput label="Tela" value={draftFilters.screen} placeholder="configuracoes, auth..." onChange={value => updateFilter("screen", value)} />
      <AuditTextInput label="Categoria" value={draftFilters.category} placeholder="forms, admin..." onChange={value => updateFilter("category", value)} />
      <AuditTextInput label="Acao" value={draftFilters.action} placeholder="create_form" onChange={value => updateFilter("action", value)} />
      <AuditSelect label="Status" value={draftFilters.status} onChange={value => updateFilter("status", value)} options={["success", "failure", "denied", "conflict"]} />
      <AuditSelect label="Nivel" value={draftFilters.level} onChange={value => updateFilter("level", value)} options={["info", "warn", "error"]} />
      <AuditTextInput label="Tipo de entidade" value={draftFilters.entityType} placeholder="form, user..." onChange={value => updateFilter("entityType", value)} />
      <AuditTextInput label="Id da entidade" value={draftFilters.entityId} placeholder="1" onChange={value => updateFilter("entityId", value)} />
      <AuditTextInput label="Texto" value={draftFilters.search} placeholder="Pesquisar mensagem ou contexto" onChange={value => updateFilter("search", value)} style={{ gridColumn: "1 / -1" }} />
    </div>

    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <div style={{ color: COLORS.textMuted, fontSize: 12 }} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Btn v="secondary" sz="sm" onClick={clearFilters}>Limpar filtros</Btn>
        <Btn sz="sm" onClick={applyFilters}>Aplicar filtros</Btn>
      </div>
    </div>
  </>
);

const AuditTextInput = ({ label, value, onChange, placeholder = "", type = "text", style }) => (
  <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, ...style }}>
    {label}
    <input type={type} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} style={{ ...ADMIN_INPUT_STYLE, marginTop: 4 }} />
  </label>
);

const AuditSelect = ({ label, value, onChange, options }) => (
  <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>
    {label}
    <select value={value} onChange={event => onChange(event.target.value)} style={{ ...ADMIN_INPUT_STYLE, marginTop: 4 }}>
      <option value="">Todos</option>
      {options.map(option => <option key={option} value={option}>{option[0].toUpperCase() + option.slice(1)}</option>)}
    </select>
  </label>
);
