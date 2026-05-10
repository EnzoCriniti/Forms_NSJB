/**
 * @file frontend/src/screens/CreateFormScreen.jsx
 * @summary Tela de criacao e edicao de formularios.
 * @responsibility Configurar estrutura dinamica, templates e resultados.
 */

import React, { useEffect, useMemo, useState } from "react";
import { COLORS, Icon, Btn, resolveActionErrorMessage } from "../components/ui";
import { CreateFormFieldPreview } from "../components/CreateFormFieldPreview";
import { CreateFormLivePreview } from "../components/CreateFormLivePreview";
import { CreateFormTemplateBar } from "../components/CreateFormTemplateBar";
import { FORM_MODES, getFormMode, getPeopleBaseFieldRole, getScalePersonLimit, hasLinkedPeopleField, isMembersSelectionField, summarizeFieldValidation } from "../lib/forms";

const FIELD_TYPES = [
  { v: "person_select", l: "Seletor por base" },
  { v: "yes_no", l: "Sim / Nao" },
  { v: "number", l: "Numerico" },
  { v: "text", l: "Texto Curto" },
  { v: "grid", l: "Grade / Matriz" },
];

const DEFAULT_GRID_ROWS = ["Opcao 1", "Opcao 2"];
const DEFAULT_GRID_COLS = ["0", "1", "2", "3"];

const SCALE_PRESETS = [
  { label: "0 a 3", cols: ["0", "1", "2", "3"] },
  { label: "0 a 5", cols: ["0", "1", "2", "3", "4", "5"] },
  { label: "1 a 5", cols: ["1", "2", "3", "4", "5"] },
  { label: "Ruim / Bom", cols: ["Ruim", "Regular", "Bom", "Otimo"] },
  { label: "Discordo / Concordo", cols: ["Discordo totalmente", "Discordo", "Neutro", "Concordo", "Concordo totalmente"] },
];

const FORM_MODE_OPTIONS = [
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

const createDefaultMemberField = () => ({
  id: Date.now(),
  type: "person_select",
  label: "Nome",
  required: true,
  show: true,
  total: false,
  selectionSource: { kind: "members" },
  memberBinding: { source: "members", role: "primary" },
});

const createDefaultPresenceFields = formMode => formMode === FORM_MODES.NUCLEO
  ? [createDefaultMemberField()]
  : [];

const createDefaultScaleSections = () => [
];

const createLocalScaleSection = () => ({ source: "local", title: "Nova secao", responsaveis: 1, auxiliares: 2 });

const getCatalogGridSchema = item => ({
  rows: item?.gridSchema?.rows?.length ? item.gridSchema.rows : DEFAULT_GRID_ROWS,
  cols: item?.gridSchema?.cols?.length ? item.gridSchema.cols : DEFAULT_GRID_COLS,
});

const stripMemberBinding = field => {
  const { memberBinding, ...rest } = field || {};
  return rest;
};

const removeMembersBaseFields = fields => (fields || []).filter(field => !isMembersSelectionField(field));

const ensurePrimaryMembersField = fields => {
  const nextFields = Array.isArray(fields) ? [...fields] : [];
  if (nextFields.some(isMembersSelectionField)) return nextFields;
  return [createDefaultMemberField(), ...nextFields];
};

const moveItem = (items, index, direction) => {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(index, 1);
  next.splice(targetIndex, 0, item);
  return next;
};

const createDefaultResultsConfig = fields => ({
  searchEnabled: true,
  showLinkedRoster: true,
  blockDuplicatePersonResponses: false,
  formMode: fields.some(isMembersSelectionField) ? FORM_MODES.NUCLEO : FORM_MODES.GERAL,
  totalsLayout: (fields || []).filter(field => field.total).map(field => ({
    fieldId: field.id,
    style: field.type === "yes_no" ? "split" : "number",
  })),
});

const getAutomaticTotalStyle = field => field.type === "yes_no" ? "split" : "number";
const normalizeTotalStyle = (field, style) => {
  if (field?.type === "yes_no") {
    return style === "split" || style === "bar" ? "split" : "split";
  }
  return style === "number" || style === "metric" ? "number" : "number";
};

const syncResultsConfigWithFields = (config, fields) => {
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
    formMode: config?.formMode || (fields.some(isMembersSelectionField) ? FORM_MODES.NUCLEO : FORM_MODES.GERAL),
    totalsLayout: currentLayout,
  };
};

export const CreateFormScreen = ({
  onNavigate,
  people = [],
  membersConfig = {},
  externalBases = [],
  labels = [],
  presets = [],
  fieldCatalog = [],
  scaleTaskCatalog = [],
  onSavePreset = () => {},
  onSaveForm = () => {},
  form,
  isDuplicateMode = false,
}) => {
  const [format, setFormat] = useState("presenca");
  const [formMode, setFormMode] = useState(FORM_MODES.NUCLEO);
  const [preset, setPreset] = useState(null);
  const [presetName, setPresetName] = useState("");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [selLabels, setSelLabels] = useState([]);
  const [eventDate, setEventDate] = useState("");
  const [closingDate, setClosingDate] = useState("");
  const [status, setStatus] = useState("rascunho");
  const [totalExpected, setTotalExpected] = useState("");
  const [closingText, setClosingText] = useState("Este formulario nao esta mais aceitando respostas.");
  const [fields, setFields] = useState(createDefaultPresenceFields(FORM_MODES.NUCLEO));
  const [resultsConfig, setResultsConfig] = useState(() => createDefaultResultsConfig(createDefaultPresenceFields(FORM_MODES.NUCLEO)));
  const [scaleLimit, setScaleLimit] = useState(1);
  const [scaleDraft, setScaleDraft] = useState(createDefaultScaleSections());
  const [addOpen, setAddOpen] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [nType, setNType] = useState("yes_no");
  const [nFieldMode, setNFieldMode] = useState("local");
  const [nCatalogId, setNCatalogId] = useState("");
  const [nLabel, setNLabel] = useState("");
  const [nRequired, setNRequired] = useState(false);
  const [nPersonRole, setNPersonRole] = useState("primary");
  const [nGridRows, setNGridRows] = useState(DEFAULT_GRID_ROWS);
  const [nGridCols, setNGridCols] = useState(DEFAULT_GRID_COLS);
  const [nValidation, setNValidation] = useState({});
  const [presetModal, setPresetModal] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!form) {
      const defaultFields = createDefaultPresenceFields(FORM_MODES.NUCLEO);
      setFormat("presenca");
      setFormMode(FORM_MODES.NUCLEO);
      setPreset(null);
      setTitle("");
      setDesc("");
      setSelLabels([]);
      setEventDate("");
      setClosingDate("");
      setStatus("rascunho");
      setTotalExpected("");
      setClosingText("Este formulario nao esta mais aceitando respostas.");
      setFields(defaultFields);
      setResultsConfig(createDefaultResultsConfig(defaultFields));
      setScaleLimit(1);
      setScaleDraft(createDefaultScaleSections());
      return;
    }
    const nextMode = getFormMode(form);
    const nextFields = form.fieldDefinitions?.length ? form.fieldDefinitions : createDefaultPresenceFields(nextMode);
    setFormat(form.type);
    setFormMode(nextMode);
    setPreset(null);
    setTitle(form.title || "");
    setDesc(form.description || "");
    setSelLabels(form.labels || []);
    setEventDate(form.date || "");
    setClosingDate(form.closing || "");
    setStatus(form.status || "rascunho");
    setTotalExpected(form.totalExpected > 0 ? String(form.totalExpected) : "");
    setClosingText(form.closingText || "");
    setFields(nextFields);
    setResultsConfig(syncResultsConfigWithFields({
      ...(form.resultsConfig || createDefaultResultsConfig(nextFields)),
      formMode: nextMode,
    }, nextFields));
    setScaleLimit(getScalePersonLimit(form));
    setScaleDraft(form.scaleSections?.length ? form.scaleSections : createDefaultScaleSections());
  }, [form]);

  const inp = { width: "100%", padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box", background: COLORS.surface, color: COLORS.text };
  const inpSm = { ...inp, padding: "6px 10px", fontSize: 12 };
  const fieldLabel = nLabel.trim() || (nType === "person_select" ? "Nome" : "Novo campo");
  const linkedPeopleField = useMemo(() => hasLinkedPeopleField({ fieldDefinitions: fields }), [fields]);
  const totalizableFields = useMemo(() => fields.filter(field => field.total), [fields]);
  const activeFieldCatalog = useMemo(() => fieldCatalog.filter(item => item.active !== false), [fieldCatalog]);
  const activeScaleTaskCatalog = useMemo(() => scaleTaskCatalog.filter(item => item.active !== false), [scaleTaskCatalog]);
  const externalBaseMap = useMemo(() => new Map((externalBases || []).map(base => [String(base.id), base])), [externalBases]);
  const availableTotals = useMemo(() => totalizableFields.filter(field => !resultsConfig.totalsLayout.some(item => String(item.fieldId) === String(field.id))), [resultsConfig.totalsLayout, totalizableFields]);
  const canUseMembersBase = format === "presenca" && formMode === FORM_MODES.NUCLEO;
  const isFieldSaveDisabled = (nFieldMode === "catalog" && !nCatalogId)
    || (nType !== "person_select" && !nLabel.trim())
    || (!canUseMembersBase && nFieldMode === "local" && nType === "person_select");
  const previewTitle = title.trim();
  const previewDescription = desc.trim();
  const previewClosingText = closingText.trim();
  const hasPrimaryLinkedField = useMemo(() => fields.some(field => field.type === "person_select" && getPeopleBaseFieldRole({ fieldDefinitions: fields }, field) === "primary"), [fields]);
  const editingField = useMemo(
    () => fields.find(field => String(field.id) === String(editingFieldId)) || null,
    [editingFieldId, fields],
  );
  const canOfferMembersSelector = canUseMembersBase && !hasPrimaryLinkedField;
  const filteredFieldTypes = useMemo(() => {
    const shouldKeepCurrentPersonType = editingField?.type === "person_select";
    if (canUseMembersBase && (canOfferMembersSelector || shouldKeepCurrentPersonType)) return FIELD_TYPES;
    return FIELD_TYPES.filter(type => type.v !== "person_select" || shouldKeepCurrentPersonType);
  }, [canOfferMembersSelector, canUseMembersBase, editingField]);
  const filteredFieldCatalog = useMemo(() => {
    const isEditingCatalogMembersField = editingField?.catalogFieldId
      && editingField?.type === "person_select"
      && isMembersSelectionField(editingField);
    return activeFieldCatalog.filter(item => {
      if (item.type !== "person_select") return true;
      if (item?.selectionSource?.kind === "external_base") return true;
      if (!canUseMembersBase) return false;
      if (canOfferMembersSelector) return true;
      return isEditingCatalogMembersField && String(item.id) === String(editingField.catalogFieldId);
    });
  }, [activeFieldCatalog, canOfferMembersSelector, canUseMembersBase, editingField]);
  const activeModeOption = useMemo(
    () => FORM_MODE_OPTIONS.find(option => option.id === formMode) || FORM_MODE_OPTIONS[0],
    [formMode],
  );
  const membersFieldsCount = useMemo(
    () => fields.filter(isMembersSelectionField).length,
    [fields],
  );
  const selectedCatalogItem = useMemo(
    () => nFieldMode === "catalog"
      ? filteredFieldCatalog.find(item => String(item.id) === String(nCatalogId))
      : null,
    [filteredFieldCatalog, nCatalogId, nFieldMode],
  );
  const activeSelectionSource = useMemo(() => {
    if (nType !== "person_select") return null;
    if (selectedCatalogItem?.selectionSource?.kind === "external_base") return selectedCatalogItem.selectionSource;
    return { kind: "members" };
  }, [nType, selectedCatalogItem]);
  const currentFieldSourceLabel = nFieldMode === "catalog"
    ? (selectedCatalogItem ? `Campo da biblioteca: ${selectedCatalogItem.name}` : "Selecione um campo base")
    : "Campo local deste formulario";

  const syncModeWithFields = (nextMode, nextFields) => {
    const normalizedFields = nextMode === FORM_MODES.NUCLEO
      ? normalizePeopleBaseBindings(ensurePrimaryMembersField(nextFields))
      : normalizePeopleBaseBindings(removeMembersBaseFields(nextFields));
    setPreset(null);
    setFormMode(nextMode);
    setFields(normalizedFields);
    if (nextMode === FORM_MODES.GERAL && nFieldMode === "local" && nType === "person_select") {
      setNType("yes_no");
    }
    if (nextMode === FORM_MODES.GERAL && nFieldMode === "catalog") {
      const selectedCatalogItem = filteredFieldCatalog.find(item => String(item.id) === String(nCatalogId));
      if (selectedCatalogItem?.type === "person_select" && selectedCatalogItem?.selectionSource?.kind !== "external_base") {
        setNCatalogId("");
        setNType("yes_no");
      }
    }
    setResultsConfig(current => syncResultsConfigWithFields({
      ...current,
      formMode: nextMode,
      showLinkedRoster: nextMode === FORM_MODES.NUCLEO ? current.showLinkedRoster : false,
    }, normalizedFields));
    if (nextMode === FORM_MODES.GERAL) {
      setTotalExpected("");
    }
  };

  const togLabel = id => setSelLabels(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  const updateScale = (index, patch) => setScaleDraft(scaleDraft.map((section, sectionIndex) => sectionIndex === index ? { ...section, ...patch } : section));
  const addScale = () => setScaleDraft([...scaleDraft, createLocalScaleSection()]);

  const resetFieldDraft = () => {
    setEditingFieldId(null);
    setNType("yes_no");
    setNFieldMode("local");
    setNCatalogId("");
    setNLabel("");
    setNRequired(false);
    setNPersonRole(hasPrimaryLinkedField ? "secondary" : "primary");
    setNGridRows(DEFAULT_GRID_ROWS);
    setNGridCols(DEFAULT_GRID_COLS);
    setNValidation({});
    setAddOpen(false);
  };

  const openNewFieldDraft = () => {
    resetFieldDraft();
    if (!canUseMembersBase) {
      setNType("yes_no");
    }
    setAddOpen(true);
  };

  const startEditField = field => {
    setEditingFieldId(field.id);
    setNType(field.type);
    setNFieldMode(field.catalogFieldId ? "catalog" : "local");
    setNCatalogId(field.catalogFieldId || "");
    setNLabel(field.label);
    setNRequired(Boolean(field.required));
    setNPersonRole(isMembersSelectionField(field) ? (getPeopleBaseFieldRole({ fieldDefinitions: fields }, field) || "primary") : "secondary");
    setNGridRows(field.gridRows?.length ? field.gridRows : DEFAULT_GRID_ROWS);
    setNGridCols(field.gridCols?.length ? field.gridCols : DEFAULT_GRID_COLS);
    setNValidation(field.validation || {});
    setAddOpen(true);
  };

  const normalizePeopleBaseBindings = nextFields => {
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

  const addField = () => {
    const catalogItem = nFieldMode === "catalog" ? filteredFieldCatalog.find(item => String(item.id) === String(nCatalogId)) : null;
    const resolvedType = catalogItem?.type || nType;
    const label = nLabel.trim() || (resolvedType === "person_select" ? "Nome" : "");
    if (!label) return;
    const catalogProps = catalogItem
      ? { catalogFieldId: catalogItem.id, catalogKey: catalogItem.key, catalogName: catalogItem.name }
      : {};
    const validation = buildFieldValidation();
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
    if (editingFieldId) {
      const nextFields = fields.map(field => {
        if (field.id !== editingFieldId) return field;
        const {
          catalogFieldId,
          catalogKey,
          catalogName,
          gridRows,
          gridCols,
          ...baseField
        } = field;
        return {
          ...baseField,
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
      });
      setFields(normalizePeopleBaseBindings(nextFields));
    } else {
      const nextFields = [...fields, { id: Date.now(), type: resolvedType, label, required: nRequired, show: true, total: resolvedType === "yes_no" || resolvedType === "number", ...catalogProps, ...(selectionSource ? { selectionSource } : {}), ...(memberBinding ? { memberBinding } : {}), validation, ...gridProps }];
      setFields(normalizePeopleBaseBindings(nextFields));
    }
    resetFieldDraft();
  };

  const applyFieldCatalog = catalogId => {
    setNCatalogId(catalogId);
    const catalogItem = filteredFieldCatalog.find(item => String(item.id) === String(catalogId));
    if (!catalogItem) return;
    setNType(catalogItem.type);
    setNLabel(catalogItem.defaultLabel);
    if (catalogItem.type === "person_select") {
      setNPersonRole(hasPrimaryLinkedField && !editingFieldId ? "secondary" : "primary");
    }
    if (catalogItem.type === "grid") {
      const schema = getCatalogGridSchema(catalogItem);
      setNGridRows(schema.rows);
      setNGridCols(schema.cols);
    }
    setNValidation({});
  };

  const setFieldMode = mode => {
    setNFieldMode(mode);
    if (mode === "local") setNCatalogId("");
  };

  const setScaleMode = (index, mode) => {
    updateScale(index, mode === "local" ? { source: "local", catalogTaskId: "", catalogKey: "", catalogName: "" } : { source: "catalog" });
  };

  const applyScaleCatalog = (index, catalogId) => {
    const catalogItem = activeScaleTaskCatalog.find(item => String(item.id) === String(catalogId));
    updateScale(index, catalogItem
      ? { source: "catalog", catalogTaskId: catalogItem.id, catalogKey: catalogItem.key, catalogName: catalogItem.name, title: catalogItem.defaultLabel }
      : { source: "catalog", catalogTaskId: "", catalogKey: "", catalogName: "" });
  };

  const applyTemplate = templateId => {
    setPreset(templateId || null);
    if (!templateId) {
      const defaultFields = createDefaultPresenceFields(formMode);
      if (format === "presenca") {
        setFields(defaultFields);
        setResultsConfig(createDefaultResultsConfig(defaultFields));
      } else {
        setScaleDraft(createDefaultScaleSections());
        setScaleLimit(1);
      }
      return;
    }
    const found = presets.find(item => String(item.id) === String(templateId));
    if (!found) return;
    const nextMode = getFormMode(found);
    const nextFields = found.fieldDefinitions?.length ? found.fieldDefinitions : createDefaultPresenceFields(nextMode);
    setFormat(found.type);
    setFormMode(nextMode);
    if (found.fieldDefinitions?.length) setFields(found.fieldDefinitions);
    if (found.scaleSections?.length) setScaleDraft(found.scaleSections);
    if (found.desc !== undefined) setDesc(found.desc);
    if (found.closingText) setClosingText(found.closingText);
    if (found.labels?.length) setSelLabels(found.labels);
    setResultsConfig(syncResultsConfigWithFields({ ...(found.resultsConfig || createDefaultResultsConfig(nextFields)), formMode: nextMode }, nextFields));
    setScaleLimit(getScalePersonLimit(found));
  };

  const saveAsTemplate = async () => {
    if (!presetName.trim()) return;
    const normalizedFields = formMode === FORM_MODES.NUCLEO
      ? normalizePeopleBaseBindings(ensurePrimaryMembersField(fields))
      : normalizePeopleBaseBindings(removeMembersBaseFields(fields));
    await onSavePreset({
      type: format,
      name: presetName.trim(),
      desc,
      closingText,
      labels: selLabels,
      fieldDefinitions: format === "presenca" ? normalizedFields : [],
      resultsConfig: format === "presenca"
        ? syncResultsConfigWithFields({ ...resultsConfig, formMode }, normalizedFields)
        : { ...resultsConfig, maxAssignmentsPerPerson: scaleLimit },
      scaleSections: format === "escala_organ" ? scaleDraft : [],
    });
    setPresetName("");
    setPresetModal(false);
  };

  const updateGridRow = (index, value) => setNGridRows(nGridRows.map((row, rowIndex) => rowIndex === index ? value : row));
  const updateGridCol = (index, value) => setNGridCols(nGridCols.map((col, colIndex) => colIndex === index ? value : col));
  const applyScalePreset = cols => setNGridCols(cols);
  const buildFieldValidation = () => {
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

  const submitForm = async nextStatus => {
    setSaving(true);
    setSaveError("");
    try {
      const normalizedFields = formMode === FORM_MODES.NUCLEO
        ? normalizePeopleBaseBindings(ensurePrimaryMembersField(fields))
        : normalizePeopleBaseBindings(removeMembersBaseFields(fields));
      await onSaveForm({
        id: form?.id,
        slug: form?.slug,
        type: format,
        status: nextStatus,
        title,
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
      });
      setSaveSuccess({
        title: form && !isDuplicateMode ? "Formulario alterado com sucesso" : "Formulario salvo com sucesso",
        message: form && !isDuplicateMode
          ? "As alteracoes foram gravadas e ja estao disponiveis na listagem."
          : "O formulario foi salvo e ja esta disponivel na listagem.",
      });
    } catch (error) {
      setSaveError(resolveActionErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="create-form-header create-form-mobile-hero" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Btn v="ghost" icon="back" onClick={() => onNavigate("list")} />
        <div className="create-form-mobile-hero__swatch" aria-hidden="true" />
        <div>
          <h2 style={{ margin: 0, fontSize: 22 }}>{form && !isDuplicateMode ? "Editar Formulario" : "Novo Formulario"}</h2>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: COLORS.textMuted }}>Configure o formulario e salve na base local</p>
        </div>
      </div>

      <div className="create-form-type-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginBottom: 14 }}>
        {[
          { id: "presenca", title: "Presenca", desc: "Perguntas, acompanhantes, totalizacao e controle de envio." },
          { id: "escala_organ", title: "Escala da Organ", desc: "Planilha de tarefas com responsaveis e auxiliares." },
        ].map(option => (
          <button
            className="create-form-type-card"
            key={option.id}
            onClick={() => {
              setFormat(option.id);
              setPreset(null);
              if (option.id === "presenca") {
                const defaultFields = createDefaultPresenceFields(FORM_MODES.NUCLEO);
                setFormMode(FORM_MODES.NUCLEO);
                setFields(defaultFields);
                setResultsConfig(createDefaultResultsConfig(defaultFields));
              } else {
                setFormMode(FORM_MODES.GERAL);
                setScaleDraft(createDefaultScaleSections());
                setScaleLimit(1);
              }
            }}
            style={{ textAlign: "left", padding: 16, borderRadius: 12, border: `2px solid ${format === option.id ? COLORS.primary : COLORS.borderLight}`, background: format === option.id ? COLORS.primaryLight : COLORS.surface, color: COLORS.text, cursor: "pointer" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
              <strong style={{ fontSize: 14 }}>{option.title}</strong>
              {format === option.id && <Icon name="check" size={16} />}
            </div>
            <p style={{ margin: "7px 0 0", fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.45 }}>{option.desc}</p>
          </button>
        ))}
      </div>

      {format === "presenca" && (
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary }}>Modo do formulario</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 2 }}>Escolha a estrutura antes de continuar montando os campos.</div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.primary, background: COLORS.primaryLight, borderRadius: 999, padding: "6px 10px" }}>
              {activeModeOption.badge}
            </div>
          </div>
          <div className="create-form-type-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
            {FORM_MODE_OPTIONS.map(option => (
              <button
                key={option.id}
                onClick={() => syncModeWithFields(option.id, fields)}
                style={{ textAlign: "left", padding: 14, borderRadius: 12, border: `2px solid ${formMode === option.id ? COLORS.primary : COLORS.borderLight}`, background: formMode === option.id ? COLORS.primaryLight : COLORS.surface, color: COLORS.text, cursor: "pointer", display: "grid", gap: 10 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                  <div>
                    <strong style={{ fontSize: 14 }}>{option.title}</strong>
                    <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.textMuted, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.4 }}>{option.badge}</div>
                  </div>
                  {formMode === option.id && <Icon name="check" size={16} />}
                </div>
                <p style={{ margin: "7px 0 0", fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.45 }}>{option.desc}</p>
                <div style={{ display: "grid", gap: 5 }}>
                  {option.bullets.map(item => (
                    <div key={item} style={{ fontSize: 11, color: COLORS.textSecondary, display: "flex", alignItems: "center", gap: 6 }}>
                      <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: 999, background: formMode === option.id ? COLORS.primary : COLORS.textMuted, flex: "0 0 auto" }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
          <div style={{ marginTop: 12, borderRadius: 12, border: `1px solid ${COLORS.borderLight}`, background: COLORS.surfaceAlt, padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.text }}>Modo ativo: {activeModeOption.title}</div>
                <div style={{ fontSize: 11, color: COLORS.textSecondary, marginTop: 3 }}>{activeModeOption.desc}</div>
              </div>
              <div style={{ fontSize: 11, color: COLORS.textMuted }}>
                {formMode === FORM_MODES.NUCLEO ? `${membersFieldsCount} campo(s) ligado(s) a base central` : "Base central desativada neste formulario"}
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {(formMode === FORM_MODES.NUCLEO
                ? ["Nome da base central incluso", "Resumo final habilitavel", "Controle por grau disponivel"]
                : ["Campos livres sem vinculo central", "Seletores apenas por bases externas", "Resultados sem faltantes do nucleo"]
              ).map(item => (
                <span key={item} style={{ fontSize: 11, color: COLORS.textSecondary, background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 999, padding: "6px 10px" }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <CreateFormTemplateBar
        format={format}
        preset={preset}
        presets={presets}
        formMode={formMode}
        onApplyTemplate={applyTemplate}
        onClearTemplate={() => applyTemplate(null)}
      />

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Btn
          v={showPreview ? "secondary" : "primary"}
          icon="eye"
          onClick={() => setShowPreview(prev => !prev)}
        >
          {showPreview ? "Ocultar visualizacao" : "Visualizar formulario"}
        </Btn>
      </div>

      <div style={{ display: "grid", gap: 14, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, display: "block", marginBottom: 4 }}>Titulo *</label>
            <input value={title} onChange={event => setTitle(event.target.value)} placeholder="Ex: Presenca Sessao de Escala - 02/05/2026" style={{ ...inp, fontSize: 14 }} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, display: "block", marginBottom: 4 }}>Descricao / Instrucoes</label>
          <textarea value={desc} onChange={event => setDesc(event.target.value)} rows={3} placeholder="Prezada Irmandade..." style={{ ...inp, resize: "vertical" }} />
        </div>
        <div className="create-form-meta-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, display: "block", marginBottom: 4 }}>Abertura programada</label>
            <input type="date" value={eventDate} onChange={event => setEventDate(event.target.value)} style={inp} />
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>O formulario vai para aberto automaticamente nesta data.</div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, display: "block", marginBottom: 4 }}>Fechamento automatico</label>
            <input type="datetime-local" value={closingDate} onChange={event => setClosingDate(event.target.value)} style={inp} />
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>Quando chegar este horario, o formulario fecha sozinho.</div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, display: "block", marginBottom: 4 }}>Status</label>
            <select value={status} onChange={event => setStatus(event.target.value)} style={inp}>
              <option value="rascunho">Rascunho</option>
              <option value="aberto">Aberto</option>
              <option value="fechado">Fechado</option>
              <option value="arquivado">Arquivado</option>
            </select>
          </div>
        </div>
        <div className="create-form-meta-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, display: "block", marginBottom: 4 }}>Total esperado</label>
            <input
              type="number"
              min="0"
              value={linkedPeopleField ? totalExpected : ""}
              onChange={event => setTotalExpected(event.target.value)}
              placeholder={linkedPeopleField ? String(people.length || "") : "Disponivel apenas com campo de pessoa vinculada"}
              disabled={!linkedPeopleField}
              style={{ ...inp, opacity: linkedPeopleField ? 1 : 0.7 }}
            />
            <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>
              {linkedPeopleField
                ? `Se deixar em branco, o total sera assumido pela base carregada (${people.length} pessoas).`
                : formMode === FORM_MODES.GERAL
                  ? "Formulario geral nao usa a base central, entao o sistema nao controla faltantes esperados."
                  : "Sem vinculo com a base completa, o sistema nao controla faltantes esperados."}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, display: "block", marginBottom: 4 }}>Texto de fechamento</label>
            <input value={closingText} onChange={event => setClosingText(event.target.value)} style={inp} />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary, display: "block", marginBottom: 8 }}>Classificacoes</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {labels.map(label => (
            <button key={label.id} onClick={() => togLabel(label.id)} style={{ padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, border: "2px solid", cursor: "pointer", transition: "all 0.15s", borderColor: selLabels.includes(label.id) ? label.color : COLORS.borderLight, background: selLabels.includes(label.id) ? label.color : "transparent", color: selLabels.includes(label.id) ? "#fff" : label.color }}>{label.name}</button>
          ))}
        </div>
      </div>

      <div className="create-form-people-bar" style={{ background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 10, padding: "10px 14px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name="user" size={14} />
        <span style={{ fontSize: 12, color: COLORS.textMuted }}>
          <strong style={{ color: COLORS.text }}>{people.length} pessoas</strong> carregadas. {formMode === FORM_MODES.NUCLEO ? (membersConfig.sheetUrl ? "Google Sheets configurado." : "Configure a fonte em Configuracoes > Base de socios.") : "Base central bloqueada neste formulario geral."}
        </span>
      </div>

      {showPreview && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, textTransform: "uppercase", letterSpacing: 0.4 }}>
                Pre-visualizacao do formulario
              </div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
                Esta area mostra como o link publico esta ficando com base no rascunho atual.
              </div>
            </div>
          </div>
          <CreateFormLivePreview
            format={format}
            title={previewTitle}
            description={previewDescription}
            closingText={previewClosingText}
            fields={fields}
            people={people}
            scaleSections={scaleDraft}
            scaleLimit={scaleLimit}
          />
        </div>
      )}

      {format === "escala_organ" && (
        <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Modelo da Escala da Organ</div>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.5 }}>Defina as secoes, quantos responsaveis e quantos auxiliares cada uma tera.</p>
          <div style={{ display: "grid", gap: 6, maxWidth: 280, marginBottom: 14 }}>
            <label htmlFor="scale-person-limit" style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSecondary }}>Limite por pessoa na escala</label>
            <input
              id="scale-person-limit"
              type="number"
              min="1"
              value={scaleLimit}
              onChange={event => setScaleLimit(Math.max(1, Number(event.target.value) || 1))}
              style={inp}
            />
            <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.4 }}>Define quantas vagas a mesma pessoa pode ocupar no total desta escala.</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {scaleDraft.map((section, index) => (
              <div className="create-form-scale-row" key={index} style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr 110px 110px auto", gap: 8, alignItems: "end", background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 10, padding: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: COLORS.textSecondary, display: "block", marginBottom: 4 }}>Origem da secao</label>
                  <div className="create-form-segmented" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    <button disabled={activeScaleTaskCatalog.length === 0} onClick={() => setScaleMode(index, "catalog")} style={{ border: `1px solid ${(section.source === "catalog" || section.catalogTaskId) ? COLORS.primary : COLORS.border}`, background: (section.source === "catalog" || section.catalogTaskId) ? COLORS.primaryLight : COLORS.surface, color: (section.source === "catalog" || section.catalogTaskId) ? COLORS.primary : COLORS.textSecondary, borderRadius: 8, padding: "8px 10px", fontSize: 12, fontWeight: 800, cursor: activeScaleTaskCatalog.length === 0 ? "not-allowed" : "pointer", opacity: activeScaleTaskCatalog.length === 0 ? 0.55 : 1 }}>Tarefa existente</button>
                    <button onClick={() => setScaleMode(index, "local")} style={{ border: `1px solid ${(!section.catalogTaskId && section.source !== "catalog") ? COLORS.primary : COLORS.border}`, background: (!section.catalogTaskId && section.source !== "catalog") ? COLORS.primaryLight : COLORS.surface, color: (!section.catalogTaskId && section.source !== "catalog") ? COLORS.primary : COLORS.textSecondary, borderRadius: 8, padding: "8px 10px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Tarefa local</button>
                  </div>
                  {(section.source === "catalog" || section.catalogTaskId) && (
                    <select value={section.catalogTaskId || ""} onChange={event => applyScaleCatalog(index, event.target.value)} style={{ ...inp, marginTop: 6 }}>
                      <option value="">Selecione uma tarefa base</option>
                      {activeScaleTaskCatalog.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                    </select>
                  )}
                </div>
                <label style={{ fontSize: 11, color: COLORS.textSecondary }}>Descricao na escala<input value={section.title} onChange={event => updateScale(index, { title: event.target.value })} style={{ ...inp, marginTop: 4 }} /></label>
                <label style={{ fontSize: 11, color: COLORS.textSecondary }}>Responsaveis<input type="number" min="0" value={section.responsaveis} onChange={event => updateScale(index, { responsaveis: Number(event.target.value) })} style={{ ...inp, marginTop: 4 }} /></label>
                <label style={{ fontSize: 11, color: COLORS.textSecondary }}>Auxiliares<input type="number" min="0" value={section.auxiliares} onChange={event => updateScale(index, { auxiliares: Number(event.target.value) })} style={{ ...inp, marginTop: 4 }} /></label>
                <button aria-label={`Remover secao ${index + 1}`} onClick={() => setScaleDraft(scaleDraft.filter((_, sectionIndex) => sectionIndex !== index))} style={{ background: "none", border: "none", color: COLORS.danger, cursor: "pointer", alignSelf: "flex-end", padding: "10px 4px" }}><Icon name="trash" size={16} /></button>
              </div>
            ))}
          </div>
          <Btn v="secondary" icon="plus" sz="sm" onClick={addScale} style={{ marginTop: 10 }}>Adicionar secao</Btn>
        </div>
      )}

      {format === "presenca" && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <label style={{ fontSize: 14, fontWeight: 700 }}>Campos do Formulario</label>
            <span style={{ fontSize: 11, color: COLORS.textMuted }}>{fields.length} campo{fields.length !== 1 ? "s" : ""} configurado{fields.length !== 1 ? "s" : ""}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {fields.map((field, index) => (
              <div className="create-form-field-row" key={field.id} style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: COLORS.primaryLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: COLORS.primary, flexShrink: 0 }}>{index + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{field.label}{field.required ? <span style={{ color: COLORS.danger, marginLeft: 2 }}>*</span> : ""}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 1 }}>
                    {FIELD_TYPES.find(type => type.v === field.type)?.l}
                    {field.type === "grid" && field.gridRows?.length ? ` - ${field.gridRows.length} linhas x ${field.gridCols?.length ?? 0} colunas` : ""}
                  </div>
                  {field.type === "person_select" && (
                    <div style={{ fontSize: 11, color: field.selectionSource?.kind === "external_base" ? COLORS.accent : getPeopleBaseFieldRole({ fieldDefinitions: fields }, field) === "primary" ? COLORS.primary : COLORS.textMuted, marginTop: 2 }}>
                      {field.selectionSource?.kind === "external_base"
                        ? `Vinculado a ${externalBaseMap.get(String(field.selectionSource.externalBaseId || ""))?.name || "base externa"}`
                        : getPeopleBaseFieldRole({ fieldDefinitions: fields }, field) === "primary"
                          ? "Campo principal da base central"
                          : "Campo auxiliar da base central"}
                    </div>
                  )}
                  {summarizeFieldValidation(field) && (
                    <div style={{ fontSize: 11, color: COLORS.accent, marginTop: 2 }}>
                      Validação: {summarizeFieldValidation(field)}
                    </div>
                  )}
                </div>
                <div className="create-form-field-actions" style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: COLORS.textSecondary, cursor: "pointer" }}>
                    <input type="checkbox" checked={field.show} onChange={() => setFields(fields.map(item => item.id === field.id ? { ...item, show: !item.show } : item))} /> Exibir
                  </label>
                  <button aria-label={`Editar ${field.label}`} onClick={() => startEditField(field)} style={{ background: "none", border: "none", color: COLORS.textSecondary, cursor: "pointer", padding: 2 }}><Icon name="edit" size={14} /></button>
                  <button
                    aria-label={`Remover ${field.label}`}
                    disabled={formMode === FORM_MODES.NUCLEO && isMembersSelectionField(field) && getPeopleBaseFieldRole({ fieldDefinitions: fields }, field) === "primary"}
                    onClick={() => setFields(fields.filter(item => item.id !== field.id))}
                    style={{ background: "none", border: "none", color: COLORS.textMuted, cursor: "pointer", padding: 2, opacity: formMode === FORM_MODES.NUCLEO && isMembersSelectionField(field) && getPeopleBaseFieldRole({ fieldDefinitions: fields }, field) === "primary" ? 0.35 : 1 }}
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {addOpen ? (
            <div style={{ marginTop: 10, background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.text }}>Editor de campo</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.45, marginTop: 4 }}>
                  Monte o campo em etapas. Primeiro escolha a origem e depois ajuste so o necessario para este formulario.
                </div>
              </div>
              <div className="create-form-editor-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: 14 }}>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, display: "block", marginBottom: 6 }}>1. Origem do campo</label>
                      <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.4, marginBottom: 8 }}>
                        Decida se o campo nasce so aqui ou se aproveita um campo base que ja foi configurado.
                      </div>
                      <div className="create-form-segmented" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
                        <button disabled={filteredFieldCatalog.length === 0} onClick={() => setFieldMode("catalog")} style={{ border: `1px solid ${nFieldMode === "catalog" ? COLORS.primary : COLORS.border}`, background: nFieldMode === "catalog" ? COLORS.primaryLight : COLORS.surface, color: nFieldMode === "catalog" ? COLORS.primary : COLORS.textSecondary, borderRadius: 8, padding: "8px 10px", fontSize: 12, fontWeight: 800, cursor: filteredFieldCatalog.length === 0 ? "not-allowed" : "pointer", opacity: filteredFieldCatalog.length === 0 ? 0.55 : 1 }}>Da biblioteca</button>
                        <button onClick={() => setFieldMode("local")} style={{ border: `1px solid ${nFieldMode === "local" ? COLORS.primary : COLORS.border}`, background: nFieldMode === "local" ? COLORS.primaryLight : COLORS.surface, color: nFieldMode === "local" ? COLORS.primary : COLORS.textSecondary, borderRadius: 8, padding: "8px 10px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>Somente neste formulario</button>
                      </div>
                      {nFieldMode === "catalog" && (
                        <select value={nCatalogId} onChange={event => applyFieldCatalog(event.target.value)} style={inp}>
                          <option value="">Selecione um campo base</option>
                          {filteredFieldCatalog.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                        </select>
                      )}
                      {nFieldMode === "local" && (
                        <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.4 }}>
                          {formMode === FORM_MODES.NUCLEO
                            ? "Este campo fica apenas neste formulario e nao entra no catalogo global."
                            : "No formulario geral, campos locais nao usam a base central de socios."}
                        </div>
                      )}
                    </div>
                    <div style={{ borderTop: `1px solid ${COLORS.borderLight}`, paddingTop: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, marginBottom: 6 }}>Resumo da origem</div>
                      <div style={{ padding: 10, borderRadius: 10, background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, fontSize: 11, color: COLORS.textSecondary }}>
                        {currentFieldSourceLabel}
                      </div>
                      {nFieldMode === "catalog" && (
                        <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 6 }}>
                          O tipo e o vinculo base chegam da configuracao global do campo selecionado.
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: 14, display: "grid", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, marginBottom: 6 }}>2. Definicao principal</div>
                      <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.4, marginBottom: 8 }}>
                        Escolha o tipo e escreva o texto que vai aparecer para quem responder.
                      </div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, display: "block", marginBottom: 4 }}>Tipo do campo</label>
                      <select value={nType} disabled={nFieldMode === "catalog"} onChange={event => {
                        const nextType = event.target.value;
                        setNType(nextType);
                        setNPersonRole(nextType === "person_select" && hasPrimaryLinkedField ? "secondary" : "primary");
                        setNGridRows(DEFAULT_GRID_ROWS);
                        setNGridCols(DEFAULT_GRID_COLS);
                        setNValidation({});
                      }} style={{ ...inp, opacity: nFieldMode === "catalog" ? 0.75 : 1 }}>
                        {filteredFieldTypes.map(type => <option key={type.v} value={type.v}>{type.l}</option>)}
                      </select>
                      {nFieldMode === "catalog" && (
                        <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>
                          O tipo vem da configuracao global do campo base.
                        </div>
                      )}
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, display: "block", marginBottom: 4 }}>
                        {nType === "person_select" ? "Rotulo (ex: Nome)" : "Pergunta / Rotulo"}
                      </label>
                      <input value={nLabel} onChange={event => setNLabel(event.target.value)} placeholder={nType === "person_select" ? "Nome" : "Ex: Vai ao Jantar?"} style={inp} autoFocus />
                    </div>
                    {nType === "person_select" && (
                      <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
                        <div style={{ padding: 12, borderRadius: 10, background: COLORS.primaryLight, border: `1px solid ${COLORS.borderLight}` }}>
                          <div style={{ fontSize: 12, fontWeight: 800, color: COLORS.primary, marginBottom: 4 }}>Origem configurada no campo</div>
                          <div style={{ fontSize: 11, color: COLORS.textSecondary, lineHeight: 1.45 }}>
                            {formMode === FORM_MODES.NUCLEO
                              ? "Campos locais usam a base central de socios. Quando o campo vem da biblioteca, a origem ja chega definida ali. Este editor nao troca a base."
                              : "Formulario geral nao usa a base central. Para seletor por base, use um campo da biblioteca ligado a uma base externa."}
                          </div>
                        </div>
                        <div style={{ display: "grid", gap: 6 }}>
                          <label style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary }}>Origem ativa</label>
                          <div style={{ padding: 10, borderRadius: 10, border: `1px solid ${COLORS.borderLight}`, background: COLORS.surface }}>
                            {activeSelectionSource?.kind === "external_base"
                              ? `Base externa: ${externalBaseMap.get(String(activeSelectionSource.externalBaseId || ""))?.name || "base externa"}`
                              : "Base central de socios"}
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.45 }}>
                          {formMode === FORM_MODES.NUCLEO
                            ? "Se a lista vier da biblioteca, a origem ja foi definida na configuracao do campo."
                            : "Campos gerais so aceitam seletores ligados a bases externas configuradas na biblioteca."}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: 14, display: "grid", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.textSecondary, marginBottom: 6 }}>3. Ajustes extras</div>
                      <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.4 }}>
                        Esta etapa so aparece para finalizar validacoes, obrigatoriedade ou a montagem de grade.
                      </div>
                    </div>
                    {(nType === "text" || nType === "number") && (
                      <div className="create-form-validation-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.textSecondary, display: "block" }}>
                          {nType === "text" ? "Minimo de caracteres" : "Valor minimo"}
                          <input
                            type="number"
                            min="0"
                            value={nType === "text" ? (nValidation.minLength ?? "") : (nValidation.min ?? "")}
                            onChange={event => setNValidation(prev => ({ ...prev, [nType === "text" ? "minLength" : "min"]: event.target.value }))}
                            style={{ ...inp, marginTop: 4 }}
                          />
                        </label>
                        <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.textSecondary, display: "block" }}>
                          {nType === "text" ? "Maximo de caracteres" : "Valor maximo"}
                          <input
                            type="number"
                            min="0"
                            value={nType === "text" ? (nValidation.maxLength ?? "") : (nValidation.max ?? "")}
                            onChange={event => setNValidation(prev => ({ ...prev, [nType === "text" ? "maxLength" : "max"]: event.target.value }))}
                            style={{ ...inp, marginTop: 4 }}
                          />
                        </label>
                      </div>
                    )}
                    {nType === "grid" && nFieldMode === "catalog" && (
                      <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.4, background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: 14 }}>
                        A matriz deste campo vem da biblioteca global. Para alterar linhas ou colunas, edite o campo base em Configuracoes &gt; Campos e tarefas.
                      </div>
                    )}
                    {nType === "grid" && nFieldMode === "local" && (
                      <div style={{ display: "grid", gap: 10, background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: 14 }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.textSecondary, marginBottom: 4 }}>Linhas (itens a avaliar)</div>
                          {nGridRows.map((row, index) => (
                            <div key={index} style={{ display: "flex", gap: 6, marginBottom: 5 }}>
                              <input value={row} onChange={event => updateGridRow(index, event.target.value)} placeholder={`Linha ${index + 1}`} style={{ ...inpSm, flex: 1 }} />
                              <button onClick={() => setNGridRows(nGridRows.filter((_, rowIndex) => rowIndex !== index))} style={{ background: "none", border: "none", color: COLORS.danger, cursor: "pointer", padding: "0 4px" }}><Icon name="close" size={12} /></button>
                            </div>
                          ))}
                          <button onClick={() => setNGridRows([...nGridRows, ""])} style={{ fontSize: 11, color: COLORS.primary, background: "none", border: "none", cursor: "pointer", padding: "2px 0", display: "flex", alignItems: "center", gap: 4 }}><Icon name="plus" size={11} /> Adicionar linha</button>
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: COLORS.textSecondary, marginBottom: 4 }}>Escala de resposta (colunas)</div>
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                            {SCALE_PRESETS.map(scalePreset => (
                              <button key={scalePreset.label} onClick={() => applyScalePreset(scalePreset.cols)} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 99, border: `1px solid ${COLORS.border}`, background: JSON.stringify(nGridCols) === JSON.stringify(scalePreset.cols) ? COLORS.primaryLight : COLORS.surface, color: COLORS.textSecondary, cursor: "pointer", whiteSpace: "nowrap" }}>{scalePreset.label}</button>
                            ))}
                          </div>
                          {nGridCols.map((col, index) => (
                            <div key={index} style={{ display: "flex", gap: 6, marginBottom: 5 }}>
                              <input value={col} onChange={event => updateGridCol(index, event.target.value)} placeholder={`Coluna ${index + 1}`} style={{ ...inpSm, flex: 1 }} />
                              <button onClick={() => setNGridCols(nGridCols.filter((_, colIndex) => colIndex !== index))} style={{ background: "none", border: "none", color: COLORS.danger, cursor: "pointer", padding: "0 4px" }}><Icon name="close" size={12} /></button>
                            </div>
                          ))}
                          <button onClick={() => setNGridCols([...nGridCols, ""])} style={{ fontSize: 11, color: COLORS.primary, background: "none", border: "none", cursor: "pointer", padding: "2px 0", display: "flex", alignItems: "center", gap: 4 }}><Icon name="plus" size={11} /> Adicionar coluna</button>
                        </div>
                      </div>
                    )}
                    <div style={{ padding: 12, borderRadius: 10, border: `1px solid ${COLORS.borderLight}`, background: COLORS.surfaceAlt }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: COLORS.textSecondary, cursor: "pointer" }}>
                        <input type="checkbox" checked={nRequired} onChange={event => setNRequired(event.target.checked)} /> Campo obrigatorio
                      </label>
                    </div>
                    {nType !== "text" && nType !== "number" && nType !== "grid" && !nRequired && (
                      <div style={{ fontSize: 11, color: COLORS.textMuted, lineHeight: 1.4 }}>
                        Esse campo nao precisa de configuracao extra. Se o texto ja estiver certo, ele pode ser adicionado agora.
                      </div>
                    )}
                  </div>
                  <div className="create-form-inline-actions" style={{ display: "flex", gap: 6 }}>
                    <Btn sz="sm" onClick={addField} disabled={isFieldSaveDisabled}>{editingFieldId ? "Salvar campo" : "Adicionar"}</Btn>
                    <Btn v="ghost" sz="sm" onClick={resetFieldDraft}>Cancelar</Btn>
                  </div>
                </div>
                <CreateFormFieldPreview
                  fieldLabel={fieldLabel}
                  fieldType={nType}
                  required={nRequired}
                  people={people}
                  gridRows={nGridRows}
                  gridCols={nGridCols}
                />
              </div>
            </div>
          ) : (
            <button onClick={openNewFieldDraft} style={{ marginTop: 8, width: "100%", padding: 12, border: `2px dashed ${COLORS.border}`, borderRadius: 10, background: "transparent", fontSize: 13, color: COLORS.textSecondary, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Icon name="plus" size={14} /> Adicionar Campo
            </button>
          )}

          <div style={{ marginTop: 18, background: COLORS.surface, border: `1px solid ${COLORS.borderLight}`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Configuracao dos Resultados</div>
            <p style={{ margin: "0 0 14px", fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.5 }}>
              Ajuste a visualizacao da totalizacao e os recursos da planilha final.
            </p>
            <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: COLORS.textSecondary, cursor: "pointer" }}>
                <input type="checkbox" checked={resultsConfig.searchEnabled !== false} onChange={event => setResultsConfig({ ...resultsConfig, searchEnabled: event.target.checked })} />
                Habilitar pesquisa na planilha de respostas
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: linkedPeopleField ? COLORS.textSecondary : COLORS.textMuted, cursor: linkedPeopleField ? "pointer" : "default" }}>
                <input type="checkbox" checked={linkedPeopleField && resultsConfig.showLinkedRoster !== false} disabled={!linkedPeopleField} onChange={event => setResultsConfig({ ...resultsConfig, showLinkedRoster: event.target.checked })} />
                Exibir lista da base vinculada e destacar faltantes
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: COLORS.textSecondary, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={resultsConfig.blockDuplicatePersonResponses === true}
                  onChange={event => setResultsConfig({ ...resultsConfig, blockDuplicatePersonResponses: event.target.checked })}
                />
                Bloquear nova resposta quando a pessoa ja respondeu
              </label>
            </div>

            <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, marginBottom: 8 }}>Ordem da totalizacao</div>
            {totalizableFields.length === 0 ? (
              <div style={{ fontSize: 12, color: COLORS.textMuted }}>Adicione campos totalizaveis para configurar esta area.</div>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {resultsConfig.totalsLayout.map((item, index) => {
                  const field = totalizableFields.find(current => String(current.id) === String(item.fieldId));
                  if (!field) return null;
                  return (
                    <div className="create-form-total-row" key={field.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center", background: COLORS.surfaceAlt, border: `1px solid ${COLORS.borderLight}`, borderRadius: 10, padding: 10 }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.text }}>{field.label}</div>
                        <div style={{ fontSize: 11, color: COLORS.textMuted }}>
                          Tipo: {FIELD_TYPES.find(type => type.v === field.type)?.l} • Exibicao automatica
                        </div>
                      </div>
                      <div className="create-form-inline-actions" style={{ display: "flex", gap: 6 }}>
                        <Btn v="ghost" sz="sm" onClick={() => setResultsConfig({ ...resultsConfig, totalsLayout: moveItem(resultsConfig.totalsLayout, index, -1) })} disabled={index === 0}>Subir</Btn>
                        <Btn v="ghost" sz="sm" onClick={() => setResultsConfig({ ...resultsConfig, totalsLayout: moveItem(resultsConfig.totalsLayout, index, 1) })} disabled={index === resultsConfig.totalsLayout.length - 1}>Descer</Btn>
                        <Btn v="ghost" sz="sm" onClick={() => setResultsConfig({ ...resultsConfig, totalsLayout: resultsConfig.totalsLayout.filter(layoutItem => String(layoutItem.fieldId) !== String(item.fieldId)) })}>Remover</Btn>
                      </div>
                    </div>
                  );
                })}
                {availableTotals.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                    {availableTotals.map(field => (
                      <Btn
                        key={field.id}
                        v="secondary"
                        sz="sm"
                        onClick={() => setResultsConfig({
                          ...resultsConfig,
                          totalsLayout: [...resultsConfig.totalsLayout, { fieldId: field.id, style: getAutomaticTotalStyle(field) }],
                        })}
                      >
                        Adicionar {field.label}
                      </Btn>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="create-form-footer-actions" style={{ display: "flex", gap: 10, justifyContent: "space-between", borderTop: `1px solid ${COLORS.borderLight}`, paddingTop: 16, flexWrap: "wrap" }}>
        <Btn v="secondary" icon="save" onClick={() => setPresetModal(true)}>Salvar como Template</Btn>
        <Btn icon="check" onClick={() => submitForm(status)} disabled={!title.trim()} loading={saving}>{saving ? "Salvando..." : `${form && !isDuplicateMode ? "Salvar" : "Publicar"} ${format === "escala_organ" ? "Escala" : "Formulario"}`}</Btn>
      </div>
      {saveError && (
        <div style={{ marginTop: 12, background: COLORS.dangerLight, border: `1px solid ${COLORS.danger}`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: COLORS.danger }}>
          {saveError}
        </div>
      )}

      {presetModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ width: 420 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>Salvar como Template</h3>
            <p style={{ margin: "0 0 6px", fontSize: 12, color: COLORS.textSecondary }}>
              Salvando {format === "escala_organ" ? `${scaleDraft.length} secoes` : `${fields.length} campos`} como template reutilizavel.
            </p>
            <div style={{ background: COLORS.surfaceAlt, borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: 12, color: COLORS.textSecondary, lineHeight: 1.6 }}>
              <strong style={{ color: COLORS.text }}>O template vai salvar:</strong>{" "}
              {format === "presenca" ? "campos, configuracao de resultados, descricao, texto de fechamento e classificacoes." : "secoes da escala, descricao, texto de fechamento e classificacoes."}
            </div>
            <label style={{ fontSize: 11, fontWeight: 600, color: COLORS.textSecondary, display: "block", marginBottom: 4 }}>Nome do template</label>
            <input value={presetName} onChange={event => setPresetName(event.target.value)} placeholder="Ex: Sessao de Escala Padrao" style={{ ...inp, marginBottom: 16 }} autoFocus onKeyDown={event => { if (event.key === "Enter") saveAsTemplate(); }} />
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <Btn v="secondary" onClick={() => { setPresetModal(false); setPresetName(""); }}>Cancelar</Btn>
              <Btn icon="save" onClick={saveAsTemplate} disabled={!presetName.trim()}>Salvar Template</Btn>
            </div>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ width: 420 }}>
            <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>{saveSuccess.title}</h3>
            <p style={{ margin: "0 0 18px", fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.5 }}>
              {saveSuccess.message}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <Btn
                icon="check"
                onClick={() => {
                  setSaveSuccess(null);
                  onNavigate("list");
                }}
              >
                Voltar para Formularios
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
