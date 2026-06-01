import React from "react";
import { Btn, COLORS, SplitSection } from "../../components/ui";
import { PaginatedList } from "./adminPaginatedList";
import { ExternalBasesEditorPanel } from "./ExternalBasesEditorPanel";

export const ExternalBasesPanel = ({
  externalBaseDraft,
  setExternalBaseDraft,
  submitExternalBase,
  submitExternalBaseSync,
  busyAction,
  externalBases,
  requestDelete,
  onDeleteExternalBase,
}) => (
  <SplitSection
    leftTitle={externalBaseDraft.id ? "Editar base externa" : "Nova base externa"}
    rightTitle="Bases cadastradas"
    left={(
      <ExternalBasesEditorPanel
        externalBaseDraft={externalBaseDraft}
        setExternalBaseDraft={setExternalBaseDraft}
        submitExternalBase={submitExternalBase}
        submitExternalBaseSync={submitExternalBaseSync}
        busyAction={busyAction}
      />
    )}
    right={(
      <PaginatedList
        items={externalBases}
        emptyText="Nenhuma base externa cadastrada."
        renderItem={base => (
          <div key={base.id} className="settings-row">
            <div>
              <strong>{base.name}</strong>
              <div>{base.active === false ? "Inativa" : "Ativa"} â€¢ {base.items?.length || 0} opcao(oes) â€¢ {base.lastSyncedAt ? `Sincronizada em ${new Date(base.lastSyncedAt).toLocaleString("pt-BR")}` : "Ainda nao sincronizada"}</div>
              {base.description && <div>{base.description}</div>}
            </div>
            <Btn v="secondary" sz="sm" onClick={() => setExternalBaseDraft({ ...base, syncEnabled: base.syncEnabled !== false })}>Editar</Btn>
            <Btn v="danger" sz="sm" onClick={() => requestDelete(
              "Excluir base externa",
              `Tem certeza que deseja excluir a base externa ${base.name}?`,
              "Excluir",
              () => onDeleteExternalBase(base.id),
            )}>Remover</Btn>
          </div>
        )}
      />
    )}
  />
);
