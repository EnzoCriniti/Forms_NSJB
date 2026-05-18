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
