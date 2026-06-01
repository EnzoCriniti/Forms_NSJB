import React from "react";
import { Btn, COLORS } from "../../components/ui";
import { emptyPersonPresetDraft, messagingInputStyle, personKeyOf } from "./messagingSettingsShared";

export const MessagingPresetsEditorPanel = ({
  draft,
  setDraft,
  search,
  setSearch,
  filteredPeople,
  selectedSet,
  togglePerson,
  feedback,
  busy,
  onSubmit,
  onCancel,
}) => (
  <div>
    <h4 style={{ margin: "0 0 10px" }}>{draft.id ? "Editar preset" : "Novo preset de pessoas"}</h4>
    <div style={{ display: "grid", gap: 12 }}>
      <label style={{ display: "grid", gap: 6, fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>
        Nome do preset
        <input value={draft.name} onChange={event => setDraft(current => ({ ...current, name: event.target.value }))} placeholder="Ex.: Coordenadores" style={messagingInputStyle} />
      </label>
      <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar pessoas..." style={messagingInputStyle} />
      <div style={{ maxHeight: 260, overflowY: "auto", border: `1px solid ${COLORS.borderLight}`, borderRadius: 8, padding: 8, background: COLORS.surface }}>
        {filteredPeople.length === 0 ? (
          <div style={{ padding: 12, fontSize: 12, color: COLORS.textMuted }}>Nenhuma pessoa encontrada.</div>
        ) : filteredPeople.map(person => {
          const key = personKeyOf(person);
          return (
            <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 4px", fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" checked={selectedSet.has(key)} onChange={() => togglePerson(key)} />
              <span style={{ flex: 1 }}>{person.name}{person.grau ? ` (${person.grau})` : ""}</span>
              {!person.phone && <span style={{ fontSize: 10, color: COLORS.warning }}>sem telefone</span>}
            </label>
          );
        })}
      </div>
      <div style={{ fontSize: 11, color: COLORS.textMuted }}>{draft.personKeys.length} pessoa(s) selecionada(s)</div>
      {feedback}
      <div style={{ display: "flex", gap: 8 }}>
        <Btn onClick={onSubmit} loading={busy} disabled={!draft.name.trim()}>{draft.id ? "Salvar preset" : "Criar preset"}</Btn>
        {draft.id && <Btn v="ghost" onClick={onCancel}>Cancelar</Btn>}
      </div>
    </div>
  </div>
);
