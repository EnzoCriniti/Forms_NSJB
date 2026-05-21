/**
 * @file frontend/src/screens/createFormFieldDraft.js
 * @summary Helpers do rascunho de campo na criacao de formulario.
 * @responsibility Definir defaults de grade e montar transicoes do editor de campos.
 */

import { getPeopleBaseFieldRole, isMembersSelectionField } from "../lib/forms";

export const DEFAULT_GRID_ROWS = ["Opcao 1", "Opcao 2"];
export const DEFAULT_GRID_COLS = ["0", "1", "2", "3"];

export const SCALE_PRESETS = [
  { label: "0 a 3", cols: ["0", "1", "2", "3"] },
  { label: "0 a 5", cols: ["0", "1", "2", "3", "4", "5"] },
  { label: "1 a 5", cols: ["1", "2", "3", "4", "5"] },
  { label: "Ruim / Bom", cols: ["Ruim", "Regular", "Bom", "Otimo"] },
  { label: "Discordo / Concordo", cols: ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"] },
];

export const getCatalogGridSchema = item => ({
  rows: item?.gridSchema?.rows?.length ? item.gridSchema.rows : DEFAULT_GRID_ROWS,
  cols: item?.gridSchema?.cols?.length ? item.gridSchema.cols : DEFAULT_GRID_COLS,
});

export const buildFieldDraftDefaults = ({ hasPrimaryLinkedField = false } = {}) => ({
  editingFieldId: null,
  nType: "yes_no",
  nFieldMode: "local",
  nCatalogId: "",
  nLabel: "",
  nRequired: false,
  nPersonRole: hasPrimaryLinkedField ? "secondary" : "primary",
  nGridRows: DEFAULT_GRID_ROWS,
  nGridCols: DEFAULT_GRID_COLS,
  nValidation: {},
  addOpen: false,
});

export const buildFieldDraftFromExistingField = (field, { fields = [] } = {}) => ({
  editingFieldId: field?.id ?? null,
  nType: field?.type || "yes_no",
  nFieldMode: field?.catalogFieldId ? "catalog" : "local",
  nCatalogId: field?.catalogFieldId || "",
  nLabel: field?.label || "",
  nRequired: Boolean(field?.required),
  nPersonRole: field && isMembersSelectionField(field)
    ? (getPeopleBaseFieldRole({ fieldDefinitions: fields }, field) || "primary")
    : "secondary",
  nGridRows: field?.gridRows?.length ? field.gridRows : DEFAULT_GRID_ROWS,
  nGridCols: field?.gridCols?.length ? field.gridCols : DEFAULT_GRID_COLS,
  nValidation: field?.validation || {},
  addOpen: true,
});

export const buildFieldDraftFromCatalogItem = (catalogItem, { hasPrimaryLinkedField = false, editingFieldId = null } = {}) => {
  if (!catalogItem) return {};
  return {
    nType: catalogItem.type,
    nLabel: catalogItem.defaultLabel,
    nPersonRole: catalogItem.type === "person_select" && hasPrimaryLinkedField && !editingFieldId ? "secondary" : "primary",
    nGridRows: catalogItem.type === "grid" ? getCatalogGridSchema(catalogItem).rows : DEFAULT_GRID_ROWS,
    nGridCols: catalogItem.type === "grid" ? getCatalogGridSchema(catalogItem).cols : DEFAULT_GRID_COLS,
    nValidation: {},
  };
};

export const buildOpenFieldDraft = ({ canUseMembersBase = true, hasPrimaryLinkedField = false } = {}) => ({
  ...buildFieldDraftDefaults({ hasPrimaryLinkedField }),
  nType: canUseMembersBase ? "yes_no" : "yes_no",
  addOpen: true,
});

export const buildAppliedCatalogFieldDraft = ({
  catalogId,
  filteredFieldCatalog = [],
  currentDraft,
  hasPrimaryLinkedField = false,
}) => {
  const catalogItem = filteredFieldCatalog.find(item => String(item.id) === String(catalogId));
  if (!catalogItem) {
    return null;
  }
  const draft = buildFieldDraftFromCatalogItem(catalogItem, {
    hasPrimaryLinkedField,
    editingFieldId: currentDraft?.editingFieldId,
  });
  return {
    ...currentDraft,
    ...draft,
    nCatalogId: catalogId,
  };
};

export const buildFieldTypeTransition = ({ nextType, hasPrimaryLinkedField = false }) => ({
  nType: nextType,
  nPersonRole: nextType === "person_select" && hasPrimaryLinkedField ? "secondary" : "primary",
  nGridRows: DEFAULT_GRID_ROWS,
  nGridCols: DEFAULT_GRID_COLS,
  nValidation: {},
});
