import { FORM_MODES, getFormMode, getPeopleBaseFieldRole, getScalePersonLimit, hasLinkedPeopleField, isMembersSelectionField } from "../lib/forms";
import {
  appendScaleSection,
  buildScaleCatalogPatch,
  buildScaleModePatch,
  createDefaultScaleSections,
  createLocalScaleSection,
  updateScaleSection,
} from "./createFormScaleDraft";
import {
  createDefaultResultsConfig,
  syncResultsConfigWithFields,
} from "./createFormResultsConfig";
import {
  FIELD_TYPES,
  FORM_MODE_OPTIONS,
  createDefaultMemberField,
  createDefaultPresenceFields,
} from "./createFormDefaults";
import { getCatalogGridSchema } from "./createFormFieldDraft";
export {
  FIELD_TYPES,
  FORM_MODE_OPTIONS,
  buildPresetTitle,
  createDefaultMemberField,
  createDefaultPresenceFields,
} from "./createFormDefaults";
export {
  appendScaleSection,
  buildScaleCatalogPatch,
  buildScaleModePatch,
  createDefaultScaleSections,
  createLocalScaleSection,
  updateScaleSection,
} from "./createFormScaleDraft";

export {
  appendListItem,
  moveItem,
  removeFieldById,
  removeListItemAtIndex,
  toggleFieldShow,
  updateListItemAtIndex,
} from "./createFormListHelpers";

export {
  addTotalLayoutField,
  createDefaultResultsConfig,
  getAutomaticTotalStyle,
  normalizeTotalStyle,
  syncResultsConfigWithFields,
} from "./createFormResultsConfig";

export {
  buildAppliedCatalogFieldDraft,
  buildFieldDraftDefaults,
  buildFieldDraftFromCatalogItem,
  buildFieldDraftFromExistingField,
  buildFieldTypeTransition,
  buildOpenFieldDraft,
  DEFAULT_GRID_COLS,
  DEFAULT_GRID_ROWS,
  getCatalogGridSchema,
  SCALE_PRESETS,
} from "./createFormFieldDraft";

export {
  buildFieldSavePayload,
  buildFieldValidation,
  mergeSavedField,
} from "./createFormFieldSave";

export const normalizePresenceFieldsForMode = (fields, formMode) => (
  formMode === FORM_MODES.NUCLEO
    ? normalizePeopleBaseBindings(ensurePrimaryMembersField(fields))
    : normalizePeopleBaseBindings(removeMembersBaseFields(fields))
);

export const buildCreateFormPayload = ({
  form,
  format,
  formMode,
  status,
  formTitle,
  desc,
  selLabels,
  eventDate,
  closingDate,
  closingText,
  totalExpected,
  resultsConfig,
  scaleLimit,
  fields,
  scaleDraft,
  linkedPeopleField,
}) => {
  const normalizedFields = normalizePresenceFieldsForMode(fields, formMode);
  return {
    id: form?.id,
    slug: form?.slug,
    type: format,
    status,
    title: formTitle,
    sessionName: "",
    description: desc,
    labels: selLabels,
    date: eventDate,
    closing: closingDate,
    closingText,
    totalExpected: format === "presenca" && linkedPeopleField ? Number(totalExpected || 0) : 0,
    fieldDefinitions: format === "presenca" ? normalizedFields : [],
    resultsConfig: format === "presenca"
      ? syncResultsConfigWithFields({ ...resultsConfig, formMode }, normalizedFields)
      : { ...resultsConfig, maxAssignmentsPerPerson: scaleLimit },
    scaleSections: format === "escala_organ" ? scaleDraft : [],
  };
};

export const buildCreateFormTemplatePayload = ({
  type,
  presetName,
  desc,
  closingText,
  selLabels,
  format,
  formMode,
  fields,
  resultsConfig,
  scaleLimit,
  scaleDraft,
}) => {
  const normalizedFields = normalizePresenceFieldsForMode(fields, formMode);
  return {
    type,
    name: presetName.trim(),
    desc,
    closingText,
    labels: selLabels,
    fieldDefinitions: format === "presenca" ? normalizedFields : [],
    resultsConfig: format === "presenca"
      ? syncResultsConfigWithFields({ ...resultsConfig, formMode }, normalizedFields)
      : { ...resultsConfig, maxAssignmentsPerPerson: scaleLimit },
    scaleSections: format === "escala_organ" ? scaleDraft : [],
  };
};

export const buildCreateFormInitialState = ({ form, isDuplicateMode = false }) => {
  if (!form) {
    const format = "presenca";
    const formMode = FORM_MODES.NUCLEO;
    const fields = createDefaultPresenceFields(formMode);
    return {
      format,
      formMode,
      preset: null,
      title: "",
      desc: "",
      selLabels: [],
      eventDate: "",
      closingDate: "",
      status: "rascunho",
      totalExpected: "",
      closingText: "Este formulario nao esta mais aceitando respostas.",
      fields,
      resultsConfig: createDefaultResultsConfig(fields),
      scaleLimit: 1,
      scaleDraft: createDefaultScaleSections(),
      setupStep: "type",
    };
  }

  const formMode = getFormMode(form);
  const fields = form.fieldDefinitions?.length ? form.fieldDefinitions : createDefaultPresenceFields(formMode);
  return {
    format: form.type,
    formMode,
    preset: null,
    title: form.title || "",
    desc: form.description || "",
    selLabels: form.labels || [],
    eventDate: form.date || "",
    closingDate: form.closing || "",
    status: form.status || "rascunho",
    totalExpected: form.totalExpected > 0 ? String(form.totalExpected) : "",
    closingText: form.closingText || "",
    fields,
    resultsConfig: syncResultsConfigWithFields({
      ...(form.resultsConfig || createDefaultResultsConfig(fields)),
      formMode,
    }, fields),
    scaleLimit: getScalePersonLimit(form),
    scaleDraft: form.scaleSections?.length ? form.scaleSections : createDefaultScaleSections(),
    setupStep: "editor",
  };
};

export const buildCreateFormFormatSelectionState = nextFormat => {
  if (nextFormat === "presenca") {
    const formMode = FORM_MODES.NUCLEO;
    const fields = createDefaultPresenceFields(formMode);
    return {
      format: nextFormat,
      formMode,
      fields,
      resultsConfig: createDefaultResultsConfig(fields),
    };
  }

  return {
    format: nextFormat,
    formMode: FORM_MODES.GERAL,
    fields: createDefaultPresenceFields(FORM_MODES.GERAL),
    scaleDraft: createDefaultScaleSections(),
    scaleLimit: 1,
  };
};

export const buildCreateFormSaveOutcome = ({ form, isDuplicateMode = false }) => ({
  title: form && !isDuplicateMode ? "Formulario alterado com sucesso" : "Formulario salvo com sucesso",
  message: form && !isDuplicateMode
    ? "As alteracoes foram gravadas e ja estao disponiveis na listagem."
    : "O formulario foi salvo e ja esta disponivel na listagem.",
});

export const stripMemberBinding = field => {
  const { memberBinding, ...rest } = field || {};
  return rest;
};

export const removeMembersBaseFields = fields => (fields || []).filter(field => !isMembersSelectionField(field));

export const ensurePrimaryMembersField = fields => {
  const nextFields = Array.isArray(fields) ? [...fields] : [];
  if (nextFields.some(isMembersSelectionField)) return nextFields;
  return [createDefaultMemberField(), ...nextFields];
};

export const buildCreateFormModeTransition = ({
  nextMode,
  fields,
  currentNFieldMode,
  currentNType,
  currentNCatalogId,
  currentResultsConfig,
  filteredFieldCatalog = [],
}) => {
  const normalizedFields = nextMode === FORM_MODES.NUCLEO
    ? normalizePeopleBaseBindings(ensurePrimaryMembersField(fields))
    : normalizePeopleBaseBindings(removeMembersBaseFields(fields));

  let nextType = currentNType;
  let nextCatalogId = currentNCatalogId;

  if (nextMode === FORM_MODES.GERAL && currentNFieldMode === "local" && currentNType === "person_select") {
    nextType = "yes_no";
  }

  if (nextMode === FORM_MODES.GERAL && currentNFieldMode === "catalog") {
    const selectedCatalogItem = filteredFieldCatalog.find(item => String(item.id) === String(currentNCatalogId));
    if (selectedCatalogItem?.type === "person_select" && selectedCatalogItem?.selectionSource?.kind !== "external_base") {
      nextCatalogId = "";
      nextType = "yes_no";
    }
  }

  return {
    fields: normalizedFields,
    resultsConfig: syncResultsConfigWithFields({
      ...currentResultsConfig,
      formMode: nextMode,
      showLinkedRoster: nextMode === FORM_MODES.NUCLEO ? currentResultsConfig.showLinkedRoster : false,
    }, normalizedFields),
    nextType,
    nextCatalogId,
    totalExpected: nextMode === FORM_MODES.GERAL ? "" : undefined,
  };
};

export const buildCreateFormTemplateState = (template) => {
  if (!template) return null;
  const nextMode = getFormMode(template);
  const nextFields = template.fieldDefinitions?.length ? template.fieldDefinitions : createDefaultPresenceFields(nextMode);
  return {
    format: template.type,
    formMode: nextMode,
    fields: template.fieldDefinitions?.length ? template.fieldDefinitions : null,
    scaleDraft: template.scaleSections?.length ? template.scaleSections : null,
    desc: template.desc !== undefined ? template.desc : null,
    closingText: template.closingText !== undefined ? template.closingText : null,
    selLabels: template.labels?.length ? template.labels : null,
    resultsConfig: syncResultsConfigWithFields({
      ...(template.resultsConfig || createDefaultResultsConfig(nextFields)),
      formMode: nextMode,
    }, nextFields),
    scaleLimit: getScalePersonLimit(template),
  };
};

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

export const normalizePeopleBaseBindings = nextFields => {
  const personFields = nextFields.filter(isMembersSelectionField);
  if (personFields.length === 0) return nextFields.map(stripMemberBinding);

  const explicitPrimary = personFields.find(field => field?.memberBinding?.role === "primary");
  const fallbackPrimary = explicitPrimary || personFields[0];

  return nextFields.map(field => {
    if (field.type !== "person_select" || !isMembersSelectionField(field)) return stripMemberBinding(field);
    return {
      ...field,
      memberBinding: {
        source: "members",
        role: String(field.id) === String(fallbackPrimary.id) ? "primary" : "secondary",
      },
    };
  });
};
