import React from "react";
import { Btn, COLORS, FieldControl, NotePanel } from "../../components/ui";
import { ADMIN_INPUT_STYLE } from "./adminSettingsConstants";

const buildEmptyExternalBaseDraft = () => ({
  name: "",
  description: "",
  sourceType: "google_sheets",
  sheetUrl: "",
  range: "Itens!A:B",
  valueColumn: "A",
  labelColumn: "B",
  descriptionColumn: "",
  activeColumn: "",
  syncEnabled: true,
  syncFrequencyHours: 24,
  active: true,
  items: [],
});

export const ExternalBasesEditorPanel = ({
  externalBaseDraft,
  setExternalBaseDraft,
  submitExternalBase,
  submitExternalBaseSync,
  busyAction,
}) => (
  <div style={{ display: "grid", gap: 10 }}>
    <NotePanel>
      Cadastre uma lista externa sincronizada para usar em campos do formulario. Essas bases nao substituem a base central de socios.
    </NotePanel>
    <FieldControl label="Seletor por base">
      <input value={externalBaseDraft.name} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, name: e.target.value })} placeholder="Ex: Congregacoes, Turnos, Equipes" style={ADMIN_INPUT_STYLE} />
    </FieldControl>
    <FieldControl label="Descricao">
      <textarea value={externalBaseDraft.description} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, description: e.target.value })} placeholder="Explique onde essa base sera usada no sistema." rows={3} style={ADMIN_INPUT_STYLE} />
    </FieldControl>
    <FieldControl label="Link publico do Google Sheets">
      <input value={externalBaseDraft.sheetUrl} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, sheetUrl: e.target.value })} placeholder="https://docs.google.com/spreadsheets/d/..." style={ADMIN_INPUT_STYLE} />
    </FieldControl>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      <FieldControl label="Aba / intervalo">
        <input value={externalBaseDraft.range} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, range: e.target.value })} placeholder="Itens!A:B" style={ADMIN_INPUT_STYLE} />
      </FieldControl>
      <FieldControl label="Frequencia da sincronizacao (horas)">
        <input type="number" min="1" value={externalBaseDraft.syncFrequencyHours || 24} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, syncFrequencyHours: Number(e.target.value) || 24 })} style={ADMIN_INPUT_STYLE} />
      </FieldControl>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }}>
      <FieldControl label="Coluna do valor">
        <input value={externalBaseDraft.valueColumn} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, valueColumn: e.target.value })} placeholder="A" style={ADMIN_INPUT_STYLE} />
      </FieldControl>
      <FieldControl label="Coluna do rotulo">
        <input value={externalBaseDraft.labelColumn} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, labelColumn: e.target.value })} placeholder="B" style={ADMIN_INPUT_STYLE} />
      </FieldControl>
      <FieldControl label="Coluna da descricao">
        <input value={externalBaseDraft.descriptionColumn} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, descriptionColumn: e.target.value })} placeholder="C" style={ADMIN_INPUT_STYLE} />
      </FieldControl>
      <FieldControl label="Coluna de ativo">
        <input value={externalBaseDraft.activeColumn} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, activeColumn: e.target.value })} placeholder="D" style={ADMIN_INPUT_STYLE} />
      </FieldControl>
    </div>
    <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: COLORS.textSecondary }}>
      <input type="checkbox" checked={externalBaseDraft.syncEnabled !== false} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, syncEnabled: e.target.checked })} /> Permitir sincronizacao automatica
    </label>
    <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: COLORS.textSecondary }}>
      <input type="checkbox" checked={externalBaseDraft.active !== false} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, active: e.target.checked })} /> Disponivel para novos campos
    </label>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Btn onClick={submitExternalBase} loading={busyAction === "externalBase"}>{externalBaseDraft.id ? "Salvar base" : "Criar base"}</Btn>
      <Btn v="secondary" onClick={() => submitExternalBaseSync(externalBaseDraft.id)} disabled={!externalBaseDraft.id || !externalBaseDraft.sheetUrl} loading={busyAction === `externalBaseSync:${externalBaseDraft.id}`}>Sincronizar agora</Btn>
      {externalBaseDraft.id && <Btn v="ghost" onClick={() => setExternalBaseDraft(buildEmptyExternalBaseDraft())}>Cancelar</Btn>}
    </div>
  </div>
);
