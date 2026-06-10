import React from "react";
import { Btn } from "../../components/ui";
import { personKeyOf } from "./messagingSettingsShared";

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
    <h4 className="msg-subtitle">{draft.id ? "Editar preset" : "Novo preset de pessoas"}</h4>
    <div className="msg-form">
      <label className="msg-field">
        <span className="msg-label">Nome do preset</span>
        <input
          className="msg-input"
          value={draft.name}
          onChange={event => setDraft(current => ({ ...current, name: event.target.value }))}
          placeholder="Ex.: Coordenadores"
        />
      </label>
      <input
        className="msg-input"
        value={search}
        onChange={event => setSearch(event.target.value)}
        placeholder="Buscar pessoas..."
      />
      <div className="msg-people">
        {filteredPeople.length === 0 ? (
          <div className="msg-hint" style={{ padding: 12 }}>Nenhuma pessoa encontrada.</div>
        ) : filteredPeople.map(person => {
          const key = personKeyOf(person);
          return (
            <label key={key} className="msg-people__row">
              <input type="checkbox" checked={selectedSet.has(key)} onChange={() => togglePerson(key)} />
              <span style={{ flex: 1 }}>{person.name}{person.grau ? ` (${person.grau})` : ""}</span>
              {!person.phone && <span className="msg-people__tag">sem telefone</span>}
            </label>
          );
        })}
      </div>
      <div className="msg-hint">{draft.personKeys.length} pessoa(s) selecionada(s)</div>
      {feedback}
      <div className="msg-actions">
        <Btn onClick={onSubmit} loading={busy} disabled={!draft.name.trim()}>{draft.id ? "Salvar preset" : "Criar preset"}</Btn>
        {draft.id && <Btn v="ghost" onClick={onCancel}>Cancelar</Btn>}
      </div>
    </div>
  </div>
);
