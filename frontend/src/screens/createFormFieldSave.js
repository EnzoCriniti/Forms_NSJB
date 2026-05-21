/**
 * @file frontend/src/screens/createFormFieldSave.js
 * @summary Helpers de salvamento de campo na criacao de formulario.
 * @responsibility Montar o payload intermediario e o campo salvo a partir do rascunho.
 */

import { getCatalogGridSchema } from "./createFormFieldDraft";

export const buildFieldValidation = ({ nType, nValidation }) => {
  if (nType === "text") {
    const validation = {};
    if (nValidation.minLength !== "" && nValidation.minLength !== null && nValidation.minLength !== undefined && Number.isFinite(Number(nValidation.minLength))) validation.minLength = Number(nValidation.minLength);
    if (nValidation.maxLength !== "" && nValidation.maxLength !== null && nValidation.maxLength !== undefined && Number.isFinite(Number(nValidation.maxLength))) validation.maxLength = Number(nValidation.maxLength);
    return Object.keys(validation).length ? validation : undefined;
  }
  if (nType === "number") {
    const validation = {};
    if (nValidation.min !== "" && nValidation.min !== null && nValidation.min !== undefined && Number.isFinite(Number(nValidation.min))) validation.min = Number(nValidation.min);
    if (nValidation.max !== "" && nValidation.max !== null && nValidation.max !== undefined && Number.isFinite(Number(nValidation.max))) validation.max = Number(nValidation.max);
    return Object.keys(validation).length ? validation : undefined;
  }
  return undefined;
};

export const buildFieldSavePayload = ({
  fields,
  editingFieldId,
  nFieldMode,
  nCatalogId,
  nType,
  nLabel,
  nRequired,
  nPersonRole,
  nValidation,
  nGridRows,
  nGridCols,
  filteredFieldCatalog,
}) => {
  const catalogItem = nFieldMode === "catalog"
    ? filteredFieldCatalog.find(item => String(item.id) === String(nCatalogId))
    : null;
  const resolvedType = catalogItem?.type || nType;
  const label = nLabel.trim() || (resolvedType === "person_select" ? "Nome" : "");
  if (!label) return null;

  const catalogProps = catalogItem
    ? { catalogFieldId: catalogItem.id, catalogKey: catalogItem.key, catalogName: catalogItem.name }
    : {};
  const validation = buildFieldValidation({ nType: resolvedType, nValidation });
  const selectionSource = resolvedType === "person_select"
    ? (catalogItem?.selectionSource?.kind === "external_base"
        ? { kind: "external_base", externalBaseId: Number(catalogItem.selectionSource.externalBaseId) }
        : { kind: "members" })
    : undefined;
  const memberBinding = resolvedType === "person_select" && selectionSource?.kind !== "external_base"
    ? { source: "members", role: nPersonRole }
    : undefined;
  const gridProps = resolvedType === "grid"
    ? {
        gridRows: catalogItem ? getCatalogGridSchema(catalogItem).rows : nGridRows.filter(row => row.trim()),
        gridCols: catalogItem ? getCatalogGridSchema(catalogItem).cols : nGridCols.filter(col => col.trim()),
      }
    : {};

  const baseField = editingFieldId
    ? (fields || []).find(field => field.id === editingFieldId)
    : null;

  if (editingFieldId && !baseField) return null;

  return {
    resolvedType,
    label,
    catalogProps,
    validation,
    selectionSource,
    memberBinding,
    gridProps,
    baseField,
  };
};

export const mergeSavedField = ({ baseField, resolvedType, label, nRequired, catalogProps, validation, selectionSource, memberBinding, gridProps }) => {
  const nextField = {
    ...(baseField || {}),
    type: resolvedType,
    label,
    required: nRequired,
    total: resolvedType === "yes_no" || resolvedType === "number",
    ...catalogProps,
    ...(selectionSource ? { selectionSource } : {}),
    ...(memberBinding ? { memberBinding } : {}),
    validation,
    ...gridProps,
  };

  if (!baseField) {
    return {
      id: Date.now(),
      show: true,
      ...nextField,
    };
  }

  const {
    catalogFieldId,
    catalogKey,
    catalogName,
    ...rest
  } = nextField;

  return rest;
};
