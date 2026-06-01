import React from "react";
import { Btn, COLORS } from "../../components/ui";

export const ExternalBasesSyncEditorPanel = ({
  externalBaseDraft,
  setExternalBaseDraft,
  submitExternalBase,
  submitExternalBaseSync,
  busyAction,
}) => (
  <>
    <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: COLORS.textSecondary }}>
      <input type="checkbox" checked={externalBaseDraft.syncEnabled !== false} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, syncEnabled: e.target.checked })} /> Permitir sincronizacao automatica
    </label>
    <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12, color: COLORS.textSecondary }}>
      <input type="checkbox" checked={externalBaseDraft.active !== false} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, active: e.target.checked })} /> Disponivel para novos campos
    </label>
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Btn onClick={submitExternalBase} loading={busyAction === "externalBase"}>{externalBaseDraft.id ? "Salvar base" : "Criar base"}</Btn>
      <Btn v="secondary" onClick={() => submitExternalBaseSync(externalBaseDraft.id)} disabled={!externalBaseDraft.id || !externalBaseDraft.sheetUrl} loading={busyAction === `externalBaseSync:${externalBaseDraft.id}`}>Sincronizar agora</Btn>
      {externalBaseDraft.id && <Btn v="ghost" onClick={() => setExternalBaseDraft({
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
      })}>Cancelar</Btn>}
    </div>
  </>
);
