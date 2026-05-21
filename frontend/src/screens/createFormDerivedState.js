/**
 * @file frontend/src/screens/createFormDerivedState.js
 * @summary Estado derivado do editor de criacao de formulario.
 * @responsibility Calcular catalogos, origens de selecao e disponibilidade do editor de campos.
 */

import { FORM_MODES, getPeopleBaseFieldRole, hasLinkedPeopleField, isMembersSelectionField } from "../lib/forms";
import { FIELD_TYPES, FORM_MODE_OPTIONS } from "./createFormDefaults";

export const buildCreateFormDerivedState = ({
  format,
  formMode,
  fields,
  fieldCatalog = [],
  scaleTaskCatalog = [],
  externalBases = [],
  resultsConfig,
  editingFieldId,
  nFieldMode,
  nType,
  nCatalogId,
  nLabel,
}) => {
  const linkedPeopleField = hasLinkedPeopleField({ fieldDefinitions: fields });
  const totalizableFields = (fields || []).filter(field => field.total);
  const activeFieldCatalog = fieldCatalog.filter(item => item.active !== false);
  const activeScaleTaskCatalog = scaleTaskCatalog.filter(item => item.active !== false);
  const externalBaseMap = new Map((externalBases || []).map(base => [String(base.id), base]));
  const availableTotals = totalizableFields.filter(field => !resultsConfig.totalsLayout.some(item => String(item.fieldId) === String(field.id)));
  const canUseMembersBase = format === "presenca" && formMode === FORM_MODES.NUCLEO;
  const hasPrimaryLinkedField = fields.some(field => field.type === "person_select" && getPeopleBaseFieldRole({ fieldDefinitions: fields }, field) === "primary");
  const editingField = fields.find(field => String(field.id) === String(editingFieldId)) || null;
  const canOfferMembersSelector = canUseMembersBase && !hasPrimaryLinkedField;
  const filteredFieldTypes = canUseMembersBase && (canOfferMembersSelector || editingField?.type === "person_select")
    ? FIELD_TYPES
    : FIELD_TYPES.filter(type => type.v !== "person_select" || editingField?.type === "person_select");
  const filteredFieldCatalog = activeFieldCatalog.filter(item => {
    if (item.type !== "person_select") return true;
    if (item?.selectionSource?.kind === "external_base") return true;
    if (!canUseMembersBase) return false;
    if (canOfferMembersSelector) return true;
    return editingField?.catalogFieldId && String(item.id) === String(editingField.catalogFieldId) && isMembersSelectionField(editingField);
  });
  const selectedCatalogItem = nFieldMode === "catalog"
    ? filteredFieldCatalog.find(item => String(item.id) === String(nCatalogId))
    : null;
  const activeSelectionSource = nType !== "person_select"
    ? null
    : (selectedCatalogItem?.selectionSource?.kind === "external_base" ? selectedCatalogItem.selectionSource : { kind: "members" });
  const currentFieldSourceLabel = nFieldMode === "catalog"
    ? (selectedCatalogItem ? `Campo da biblioteca: ${selectedCatalogItem.name}` : "Selecione um campo base")
    : "Campo local deste formulario";
  const membersFieldsCount = fields.filter(isMembersSelectionField).length;
  const activeModeOption = FORM_MODE_OPTIONS.find(option => option.id === formMode) || FORM_MODE_OPTIONS[0];
  const isFieldSaveDisabled = (nFieldMode === "catalog" && !nCatalogId)
    || (nType !== "person_select" && !nLabel.trim())
    || (!canUseMembersBase && nFieldMode === "local" && nType === "person_select");

  return {
    linkedPeopleField,
    totalizableFields,
    activeFieldCatalog,
    activeScaleTaskCatalog,
    externalBaseMap,
    availableTotals,
    canUseMembersBase,
    hasPrimaryLinkedField,
    editingField,
    canOfferMembersSelector,
    filteredFieldTypes,
    filteredFieldCatalog,
    selectedCatalogItem,
    activeSelectionSource,
    currentFieldSourceLabel,
    membersFieldsCount,
    activeModeOption,
    isFieldSaveDisabled,
  };
};
