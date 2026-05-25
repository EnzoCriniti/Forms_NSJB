/**
 * @file frontend/src/features/events/components/eventMessageManualPersonPicker.jsx
 * @summary Picker manual de pessoas para mensagens diretas de evento.
 */

import React from "react";
import { COLORS } from "../../../components/ui";

export const ManualPersonPicker = ({ people, selected, onChange, inputStyle }) => {
  const [search, setSearch] = React.useState("");
  const sorted = React.useMemo(() => [...people].sort((a, b) => String(a.name).localeCompare(String(b.name), "pt-BR")), [people]);
  const filtered = React.useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return sorted;
    return sorted.filter(person => String(person.name || "").toLowerCase().includes(needle));
  }, [sorted, search]);
  const selectedSet = React.useMemo(() => new Set((selected || []).map(String)), [selected]);

  const toggle = key => {
    const next = new Set(selectedSet);
    if (next.has(key)) next.delete(key); else next.add(key);
    onChange(Array.from(next));
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar pessoas..." style={inputStyle} />
      <div style={{ maxHeight: 200, overflowY: "auto", border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 8, background: COLORS.surface }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 12, fontSize: 12, color: COLORS.textMuted }}>Nenhuma pessoa encontrada.</div>
        ) : filtered.map(person => {
          const key = String(person.id);
          return (
            <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 4px", fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={selectedSet.has(key)} onChange={() => toggle(key)} />
              <span style={{ flex: 1 }}>{person.name}{person.grau ? ` (${person.grau})` : ""}</span>
              {!person.phone && <span style={{ fontSize: 10, color: COLORS.warning }}>sem telefone</span>}
            </label>
          );
        })}
      </div>
      <div style={{ fontSize: 11, color: COLORS.textMuted }}>{(selected || []).length} pessoa(s) selecionada(s)</div>
    </div>
  );
};
