import { FORM_MODES } from "../lib/forms";
import {
  buildAppliedCatalogFieldDraft,
  buildFieldDraftDefaults,
  buildFieldDraftFromExistingField,
  buildFieldTypeTransition,
  buildOpenFieldDraft,
} from "./createFormFieldDraft";
import { buildFieldSavePayload, mergeSavedField } from "./createFormFieldSave";
import { appendListItem, removeFieldById, removeListItemAtIndex, toggleFieldShow, updateListItemAtIndex } from "./createFormListHelpers";
import { normalizePeopleBaseBindings } from "./createFormMemberBindings";
import { buildCreateFormModeTransition } from "./createFormModeTransition";

export const buildCreateFormFieldHandlers = ({
  fieldDraft,
  setFieldDraft,
  fields,
  setFields,
  setFormMode,
  resultsConfig,
  setResultsConfig,
  setPreset,
  setTotalExpected,
  filteredFieldCatalog,
  hasPrimaryLinkedField,
  canUseMembersBase,
}) => {
  const {
    editingFieldId,
    nType,
    nFieldMode,
    nCatalogId,
    nLabel,
    nRequired,
    nPersonRole,
    nGridRows,
    nGridCols,
    nValidation,
  } = fieldDraft;

  const updateFieldDraft = patch => {
    setFieldDraft(current => ({
      ...current,
      ...(typeof patch === "function" ? patch(current) : patch),
    }));
  };

  const updateFieldDraftValue = (key, value) => {
    updateFieldDraft(current => ({
      [key]: typeof value === "function" ? value(current[key]) : value,
    }));
  };

  const setNType = value => updateFieldDraftValue("nType", value);
  const setNFieldMode = value => updateFieldDraftValue("nFieldMode", value);
  const setNCatalogId = value => updateFieldDraftValue("nCatalogId", value);
  const setNLabel = value => updateFieldDraftValue("nLabel", value);
  const setNRequired = value => updateFieldDraftValue("nRequired", value);
  const setNGridRows = value => updateFieldDraftValue("nGridRows", value);
  const setNGridCols = value => updateFieldDraftValue("nGridCols", value);
  const setNValidation = value => updateFieldDraftValue("nValidation", value);

  const applyFieldDraftState = draft => setFieldDraft(draft);

  const syncModeWithFields = nextMode => {
    const transition = buildCreateFormModeTransition({
      nextMode,
      fields,
      currentNFieldMode: nFieldMode,
      currentNType: nType,
      currentNCatalogId: nCatalogId,
      currentResultsConfig: resultsConfig,
    });
    setPreset(null);
    setFormMode(nextMode);
    setFields(transition.fields);
    setNType(transition.nextType);
    setNCatalogId(transition.nextCatalogId);
    setResultsConfig(transition.resultsConfig);
    if (transition.totalExpected !== undefined) {
      setTotalExpected(transition.totalExpected);
    }
    if (nextMode === FORM_MODES.GERAL) {
      setTotalExpected("");
    }
  };

  const resetFieldDraft = () => {
    applyFieldDraftState(buildFieldDraftDefaults({ hasPrimaryLinkedField }));
  };

  const openNewFieldDraft = () => {
    applyFieldDraftState(buildOpenFieldDraft({ canUseMembersBase, hasPrimaryLinkedField }));
  };

  const startEditField = field => {
    applyFieldDraftState(buildFieldDraftFromExistingField(field, { fields }));
  };

  const addField = () => {
    const payload = buildFieldSavePayload({
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
    });
    if (!payload) return;
    const nextField = mergeSavedField(payload);
    const nextFields = editingFieldId
      ? fields.map(field => (field.id === editingFieldId ? nextField : field))
      : [...fields, nextField];
    setFields(normalizePeopleBaseBindings(nextFields));
    resetFieldDraft();
  };

  const applyFieldCatalog = catalogId => {
    const draft = buildAppliedCatalogFieldDraft({
      catalogId,
      filteredFieldCatalog,
      hasPrimaryLinkedField,
      currentDraft: fieldDraft,
    });
    if (!draft) {
      setNCatalogId(catalogId);
      return;
    }
    applyFieldDraftState(draft);
  };

  const setFieldMode = mode => {
    setNFieldMode(mode);
    if (mode === "local") setNCatalogId("");
  };

  const setFieldType = nextType => {
    const transition = buildFieldTypeTransition({ nextType, hasPrimaryLinkedField });
    updateFieldDraft({
      nType: transition.nType,
      nPersonRole: transition.nPersonRole,
      nGridRows: transition.nGridRows,
      nGridCols: transition.nGridCols,
      nValidation: transition.nValidation,
    });
  };

  return {
    addField,
    addGridCol: () => setNGridCols(appendListItem(nGridCols)),
    addGridRow: () => setNGridRows(appendListItem(nGridRows)),
    applyFieldCatalog,
    applyScalePreset: cols => setNGridCols(cols),
    handleModeSelect: syncModeWithFields,
    handleRemoveField: fieldId => setFields(removeFieldById(fields, fieldId)),
    handleToggleFieldShow: fieldId => setFields(toggleFieldShow(fields, fieldId)),
    openNewFieldDraft,
    removeGridCol: index => setNGridCols(removeListItemAtIndex(nGridCols, index)),
    removeGridRow: index => setNGridRows(removeListItemAtIndex(nGridRows, index)),
    resetFieldDraft,
    setFieldMode,
    setFieldType,
    setNLabel,
    setNRequired,
    setNValidation,
    startEditField,
    updateGridCol: (index, value) => setNGridCols(updateListItemAtIndex(nGridCols, index, value)),
    updateGridRow: (index, value) => setNGridRows(updateListItemAtIndex(nGridRows, index, value)),
  };
};
