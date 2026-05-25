import React from "react";
import { Btn } from "../../components/ui";
import { DEFAULT_GRID_COLS, DEFAULT_GRID_ROWS } from "../../lib/gridDefaults";
import { PaginatedList } from "./adminPaginatedList";
import { fieldCategoryLabels, fieldTypeLabels, getExternalBaseName } from "./adminSettingsConstants";

export const FieldCatalogListPanel = ({
  externalBases,
  fieldCatalog,
  onDeleteFieldCatalogItem,
  requestDelete,
  setFieldCatalogDraft,
}) => (
  <PaginatedList
    items={fieldCatalog}
    emptyText="Nenhum campo base cadastrado."
    renderItem={item => (
      <div key={item.id} className="settings-row catalog-row">
        <div>
          <strong>{item.name}</strong>
          <div>{item.defaultLabel || item.name} - {fieldTypeLabels[item.type]} - {fieldCategoryLabels[item.category]} - {item.active ? "Ativo" : "Inativo"}</div>
          <div>Id: {item.key}</div>
          {item.type === "person_select" && (
            <div>Vinculo: {item.selectionSource?.kind === "external_base" ? `Base externa ${getExternalBaseName(externalBases, item.selectionSource.externalBaseId)}` : "Base central de socios"}</div>
          )}
          {item.description && <div>{item.description}</div>}
        </div>
        <Btn
          v="secondary"
          sz="sm"
          onClick={() => setFieldCatalogDraft({
            key: item.key || "",
            name: item.name || "",
            type: item.type || "yes_no",
            category: item.category || "presenca",
            defaultLabel: item.defaultLabel || "",
            gridSchema: item.gridSchema || { rows: DEFAULT_GRID_ROWS, cols: DEFAULT_GRID_COLS },
            selectionSource: item.selectionSource || { kind: "members" },
            description: item.description || "",
            active: item.active !== false,
            id: item.id,
          })}
        >
          Editar
        </Btn>
        <Btn v="danger" sz="sm" onClick={() => requestDelete(
          "Excluir campo base",
          `Tem certeza que deseja excluir o campo base ${item.name}?`,
          "Excluir",
          () => onDeleteFieldCatalogItem(item.id),
        )}>Remover</Btn>
      </div>
    )}
  />
);
