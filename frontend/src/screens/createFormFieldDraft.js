/**
 * @file frontend/src/screens/createFormFieldDraft.js
 * @summary Helpers do rascunho de campo na criacao de formulario.
 * @responsibility Definir defaults de grade e montar transicoes do editor de campos.
 */

import { getPeopleBaseFieldRole, isMembersSelectionField } from "../lib/forms";
export { DEFAULT_GRID_COLS, DEFAULT_GRID_ROWS, SCALE_PRESETS } from "../lib/gridDefaults";
import { DEFAULT_GRID_COLS, DEFAULT_GRID_ROWS } from "../lib/gridDefaults";

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
  nScheduleText: "",
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
  nLabel: field?.baseLabel || field?.label || "",
  nScheduleText: field?.scheduleText || "",
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
    nScheduleText: "",
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
