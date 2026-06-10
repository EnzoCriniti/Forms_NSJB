import React from "react";

const gridTwo = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 };
const gridFour = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 10 };

export const ExternalBasesCoreEditorPanel = ({
  externalBaseDraft,
  setExternalBaseDraft,
}) => (
  <>
    <span className="msg-hint">
      Cadastre uma lista externa sincronizada para usar em campos do formulário. Essas bases não substituem a base central de sócios.
    </span>
    <label className="msg-field">
      <span className="msg-label">Seletor por base</span>
      <input className="msg-input" value={externalBaseDraft.name} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, name: e.target.value })} placeholder="Ex.: Congregações, Turnos, Equipes" />
    </label>
    <label className="msg-field">
      <span className="msg-label">Descrição</span>
      <textarea className="msg-input" value={externalBaseDraft.description} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, description: e.target.value })} placeholder="Explique onde essa base será usada no sistema." rows={3} />
    </label>
    <label className="msg-field">
      <span className="msg-label">Link público do Google Sheets</span>
      <input className="msg-input" value={externalBaseDraft.sheetUrl} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, sheetUrl: e.target.value })} placeholder="https://docs.google.com/spreadsheets/d/..." />
    </label>
    <div style={gridTwo}>
      <label className="msg-field">
        <span className="msg-label">Aba / intervalo</span>
        <input className="msg-input" value={externalBaseDraft.range} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, range: e.target.value })} placeholder="Itens!A:B" />
      </label>
      <label className="msg-field">
        <span className="msg-label">Frequência da sincronização (horas)</span>
        <input className="msg-input" type="number" min="1" value={externalBaseDraft.syncFrequencyHours || 24} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, syncFrequencyHours: Number(e.target.value) || 24 })} />
      </label>
    </div>
    <div style={gridFour}>
      <label className="msg-field">
        <span className="msg-label">Coluna do valor</span>
        <input className="msg-input" value={externalBaseDraft.valueColumn} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, valueColumn: e.target.value })} placeholder="A" />
      </label>
      <label className="msg-field">
        <span className="msg-label">Coluna do rótulo</span>
        <input className="msg-input" value={externalBaseDraft.labelColumn} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, labelColumn: e.target.value })} placeholder="B" />
      </label>
      <label className="msg-field">
        <span className="msg-label">Coluna da descrição</span>
        <input className="msg-input" value={externalBaseDraft.descriptionColumn} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, descriptionColumn: e.target.value })} placeholder="C" />
      </label>
      <label className="msg-field">
        <span className="msg-label">Coluna de ativo</span>
        <input className="msg-input" value={externalBaseDraft.activeColumn} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, activeColumn: e.target.value })} placeholder="D" />
      </label>
    </div>
  </>
);
