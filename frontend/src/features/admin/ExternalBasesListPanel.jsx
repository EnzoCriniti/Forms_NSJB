import React from "react";
import { Btn } from "../../components/ui";
import { PaginatedList } from "./adminPaginatedList";

export const ExternalBasesListPanel = ({
  externalBases,
  requestDelete,
  onDeleteExternalBase,
  setExternalBaseDraft,
}) => (
  <PaginatedList
    items={externalBases}
    emptyText="Nenhuma base externa cadastrada."
    renderItem={base => (
      <div key={base.id} className="settings-row">
        <div style={{ minWidth: 0, flex: 1 }}>
          <strong>{base.name}</strong>
          <div>{base.active === false ? "Inativa" : "Ativa"} • {base.items?.length || 0} opção(ões) • {base.lastSyncedAt ? `Sincronizada em ${new Date(base.lastSyncedAt).toLocaleString("pt-BR")}` : "Ainda não sincronizada"}</div>
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
);
