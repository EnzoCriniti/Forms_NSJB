import React from "react";
import { Btn } from "../../components/ui";

export const ExternalBasesSyncEditorPanel = ({
  externalBaseDraft,
  setExternalBaseDraft,
  submitExternalBase,
  submitExternalBaseSync,
  busyAction,
}) => (
  <>
    <label className="msg-check">
      <input type="checkbox" checked={externalBaseDraft.syncEnabled !== false} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, syncEnabled: e.target.checked })} /> Permitir sincronização automática
    </label>
    <label className="msg-check">
      <input type="checkbox" checked={externalBaseDraft.active !== false} onChange={e => setExternalBaseDraft({ ...externalBaseDraft, active: e.target.checked })} /> Disponível para novos campos
    </label>
    <div className="msg-actions" style={{ flexWrap: "wrap" }}>
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
