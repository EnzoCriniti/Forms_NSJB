import { FORM_MODES, formatDate, getFormMode, getPeopleBaseFieldRole, getScalePersonLimit, hasLinkedPeopleField, isMembersSelectionField } from "../lib/forms";

export const FIELD_TYPES = [
  { v: "person_select", l: "Seletor por base" },
  { v: "yes_no", l: "Sim / Nao" },
  { v: "number", l: "Numerico" },
  { v: "text", l: "Texto Curto" },
  { v: "grid", l: "Grade / Matriz" },
];

export const DEFAULT_GRID_ROWS = ["Opcao 1", "Opcao 2"];
export const DEFAULT_GRID_COLS = ["0", "1", "2", "3"];

export const SCALE_PRESETS = [
  { label: "0 a 3", cols: ["0", "1", "2", "3"] },
  { label: "0 a 5", cols: ["0", "1", "2", "3", "4", "5"] },
  { label: "1 a 5", cols: ["1", "2", "3", "4", "5"] },
  { label: "Ruim / Bom", cols: ["Ruim", "Regular", "Bom", "Otimo"] },
  { label: "Discordo / Concordo", cols: ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"] },
];

export const FORM_MODE_OPTIONS = [
  {
    id: FORM_MODES.NUCLEO,
    title: "Presenca do nucleo",
    desc: "Ja nasce com o campo Nome da base central e habilita faltantes, resumo e filtro por grau.",
    badge: "Base central ativa",
    bullets: ["Campo Nome obrigatorio", "Resumo e faltantes liberados", "Filtro por grau nos resultados"],
  },
  {
    id: FORM_MODES.GERAL,
    title: "Formulario geral",
    desc: "Nao usa a base central de socios. Permite campos livres e bases externas.",
    badge: "Fluxo livre",
    bullets: ["Sem nome fixo da base central", "Aceita bases externas no catalogo", "Sem logica de faltantes do nucleo"],
  },
];

export const createDefaultMemberField = () => ({
  id: Date.now(),
  type: "person_select",
  label: "Nome",
  required: true,
  show: true,
  total: false,
  selectionSource: { kind: "members" },
  memberBinding: { source: "members", role: "primary" },
});

export const createDefaultPresenceFields = formMode => formMode === FORM_MODES.NUCLEO
  ? [createDefaultMemberField()]
  : [];

export const createDefaultScaleSections = () => [];

export const createLocalScaleSection = () => ({ source: "local", title: "Nova secao", responsaveis: 1, auxiliares: 2 });

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
  if (!form || isDuplicateMode) {
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

export const buildPresetTitle = (format, event) => {
  const eventDate = event?.date ? ` - ${formatDate(event.date)}` : "";
  if (format === "presenca") {
    const eventTitle = String(event?.title || "").trim();
    return `Presenca${eventTitle ? ` ${eventTitle}` : ""}${eventDate}`;
  }
  if (format === "escala_organ") {
    return `Escala da Organ${eventDate}`;
  }
  return "";
};

export const getCatalogGridSchema = item => ({
  rows: item?.gridSchema?.rows?.length ? item.gridSchema.rows : DEFAULT_GRID_ROWS,
  cols: item?.gridSchema?.cols?.length ? item.gridSchema.cols : DEFAULT_GRID_COLS,
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

export const moveItem = (items, index, direction) => {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(targetIndex, 0, item);
  return next;
};

export const createDefaultResultsConfig = fields => ({
  searchEnabled: true,
  showLinkedRoster: true,
  blockDuplicatePersonResponses: false,
  publicResultsEnabled: false,
  formMode: fields.some(isMembersSelectionField) ? FORM_MODES.NUCLEO : FORM_MODES.GERAL,
  totalsLayout: (fields || []).filter(field => field.total).map(field => ({
    fieldId: field.id,
    style: field.type === "yes_no" ? "split" : "number",
  })),
});

export const getAutomaticTotalStyle = field => field.type === "yes_no" ? "split" : "number";

export const normalizeTotalStyle = (field, style) => {
  if (field?.type === "yes_no") {
    return style === "split" || style === "bar" ? "split" : "split";
  }
  return style === "number" || style === "metric" ? "number" : "number";
};

export const syncResultsConfigWithFields = (config, fields) => {
  const totalFields = (fields || []).filter(field => field.total);
  const totalFieldIds = new Set(totalFields.map(field => String(field.id)));
  const hasSavedLayout = Array.isArray(config?.totalsLayout) && config.totalsLayout.length > 0;
  const currentLayout = hasSavedLayout
    ? config.totalsLayout
        .filter(item => totalFieldIds.has(String(item.fieldId)))
        .map(item => {
          const field = totalFields.find(current => String(current.id) === String(item.fieldId));
          return {
            fieldId: field.id,
            style: normalizeTotalStyle(field, item.style || getAutomaticTotalStyle(field)),
          };
        })
    : totalFields.map(field => ({
        fieldId: field.id,
        style: getAutomaticTotalStyle(field),
      }));

  return {
    searchEnabled: config?.searchEnabled ?? true,
    showLinkedRoster: config?.showLinkedRoster ?? true,
    blockDuplicatePersonResponses: config?.blockDuplicatePersonResponses ?? false,
    publicResultsEnabled: config?.publicResultsEnabled ?? false,
    formMode: config?.formMode || (fields.some(isMembersSelectionField) ? FORM_MODES.NUCLEO : FORM_MODES.GERAL),
    totalsLayout: currentLayout,
  };
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
