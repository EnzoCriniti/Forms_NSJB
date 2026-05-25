import React from "react";
import { Btn } from "../../components/ui";
import { PaginatedList } from "./adminPaginatedList";
import { taskCategoryLabels } from "./adminSettingsConstants";

export const ScaleTaskCatalogListPanel = ({
  onDeleteScaleTaskCatalogItem,
  requestDelete,
  scaleTaskCatalog,
  setScaleTaskDraft,
}) => (
  <PaginatedList
    items={scaleTaskCatalog}
    emptyText="Nenhuma tarefa base cadastrada."
    renderItem={item => (
      <div key={item.id} className="settings-row catalog-row">
        <div>
          <strong>{item.name}</strong>
          <div>{item.defaultLabel || item.name} - {taskCategoryLabels[item.category]} - {item.active ? "Ativa" : "Inativa"}</div>
          <div>Id: {item.key}</div>
          {item.description && <div>{item.description}</div>}
        </div>
        <Btn
          v="secondary"
          sz="sm"
          onClick={() => setScaleTaskDraft({
            key: item.key || "",
            name: item.name || "",
            category: item.category || "cozinha",
            defaultLabel: item.defaultLabel || "",
            description: item.description || "",
            active: item.active !== false,
            id: item.id,
          })}
        >
          Editar
        </Btn>
        <Btn v="danger" sz="sm" onClick={() => requestDelete(
          "Excluir tarefa base",
          `Tem certeza que deseja excluir a tarefa base ${item.name}?`,
          "Excluir",
          () => onDeleteScaleTaskCatalogItem(item.id),
        )}>Remover</Btn>
      </div>
    )}
  />
);
