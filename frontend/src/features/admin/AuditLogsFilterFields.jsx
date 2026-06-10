import React from "react";

export const AuditLogsFilterFields = ({ draftFilters, updateFilter }) => (
  <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
    <AuditTextInput label="Período inicial" type="date" value={draftFilters.from} onChange={value => updateFilter("from", value)} />
    <AuditTextInput label="Período final" type="date" value={draftFilters.to} onChange={value => updateFilter("to", value)} />
    <AuditTextInput label="Usuário" value={draftFilters.actor} placeholder="Nome do actor" onChange={value => updateFilter("actor", value)} />
    <AuditTextInput label="Tela" value={draftFilters.screen} placeholder="configurações, auth..." onChange={value => updateFilter("screen", value)} />
    <AuditTextInput label="Categoria" value={draftFilters.category} placeholder="forms, admin..." onChange={value => updateFilter("category", value)} />
    <AuditTextInput label="Ação" value={draftFilters.action} placeholder="create_form" onChange={value => updateFilter("action", value)} />
    <AuditSelect label="Status" value={draftFilters.status} onChange={value => updateFilter("status", value)} options={["success", "failure", "denied", "conflict"]} />
    <AuditSelect label="Nível" value={draftFilters.level} onChange={value => updateFilter("level", value)} options={["info", "warn", "error"]} />
    <AuditTextInput label="Tipo de entidade" value={draftFilters.entityType} placeholder="form, user..." onChange={value => updateFilter("entityType", value)} />
    <AuditTextInput label="Id da entidade" value={draftFilters.entityId} placeholder="1" onChange={value => updateFilter("entityId", value)} />
    <AuditTextInput label="Texto" value={draftFilters.search} placeholder="Pesquisar mensagem ou contexto" onChange={value => updateFilter("search", value)} style={{ gridColumn: "1 / -1" }} />
  </div>
);

const AuditTextInput = ({ label, value, onChange, placeholder = "", type = "text", style }) => (
  <label className="msg-field" style={style}>
    <span className="msg-label">{label}</span>
    <input className="msg-input" type={type} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} />
  </label>
);

const AuditSelect = ({ label, value, onChange, options }) => (
  <label className="msg-field">
    <span className="msg-label">{label}</span>
    <select className="msg-input" value={value} onChange={event => onChange(event.target.value)}>
      <option value="">Todos</option>
      {options.map(option => <option key={option} value={option}>{option[0].toUpperCase() + option.slice(1)}</option>)}
    </select>
  </label>
);
