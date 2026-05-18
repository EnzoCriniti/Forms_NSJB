/**
 * @file frontend/src/screens/CreateFormScreen.jsx
 * @summary Tela de criacao e edicao de formularios.
 * @responsibility Configurar estrutura dinamica, templates e resultados.
 */

import React, { useEffect, useMemo, useState } from "react";
import { COLORS, Icon, Btn, FieldControl, SurfacePanel, resolveActionErrorMessage } from "../components/ui";
import { CreateFormLivePreview } from "../components/CreateFormLivePreview";
import { CreateFormTemplateBar } from "../components/CreateFormTemplateBar";
import { FieldEditorPanel, FormModePanel, PresenceFieldsPanel, ScaleEditorPanel, ResultsConfigPanel } from "./createFormPanels";
import { FORM_MODES, getFormMode, getPeopleBaseFieldRole, getScalePersonLimit, hasLinkedPeopleField, isMembersSelectionField, summarizeFieldValidation } from "../lib/forms";
import {
  FIELD_TYPES,
  DEFAULT_GRID_ROWS,
  DEFAULT_GRID_COLS,
  SCALE_PRESETS,
  FORM_MODE_OPTIONS,
  buildPresetTitle,
  createDefaultPresenceFields,
  createDefaultResultsConfig,
  createDefaultScaleSections,
  createLocalScaleSection,
  ensurePrimaryMembersField,
  getAutomaticTotalStyle,
  getCatalogGridSchema,
  moveItem,
  normalizePeopleBaseBindings,
  removeMembersBaseFields,
  syncResultsConfigWithFields,
  buildFieldValidation,
} from "./createFormDomain";

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
  event = null,
  isDuplicateMode = false,
}) => {
  const goBack = () => onNavigate(event ? "events" : "list");
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
  const [setupStep, setSetupStep] = useState("type");

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
      setSetupStep("type");
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
    setSetupStep("editor");
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
  const shouldPresetTitle = Boolean(event) && !form && (format === "presenca" || format === "escala_organ");
  const presetTitle = shouldPresetTitle ? buildPresetTitle(format, event) : "";
  const formTitle = shouldPresetTitle ? presetTitle : title;
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
  const isEditingExistingForm = Boolean(form) && !isDuplicateMode;
  const showTypeSetup = !form && !isDuplicateMode && setupStep === "type";
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
  const handleModeSelect = nextMode => syncModeWithFields(nextMode, fields);
  const handleToggleFieldShow = fieldId => setFields(fields.map(item => item.id === fieldId ? { ...item, show: !item.show } : item));
  const handleRemoveField = fieldId => setFields(fields.filter(item => item.id !== fieldId));
  const handleMoveTotalLayout = (index, direction) => {
    setResultsConfig(current => ({ ...current, totalsLayout: moveItem(current.totalsLayout, index, direction) }));
  };
  const handleAddTotalField = field => {
    setResultsConfig(current => ({
      ...current,
      totalsLayout: [...current.totalsLayout, { fieldId: field.id, style: getAutomaticTotalStyle(field) }],
    }));
  };

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
  const updateGridRow = (index, value) => setNGridRows(nGridRows.map((row, rowIndex) => rowIndex === index ? value : row));
  const removeGridRow = index => setNGridRows(nGridRows.filter((_, rowIndex) => rowIndex !== index));
  const addGridRow = () => setNGridRows([...nGridRows, ""]);
  const updateGridCol = (index, value) => setNGridCols(nGridCols.map((col, colIndex) => colIndex === index ? value : col));
  const removeGridCol = index => setNGridCols(nGridCols.filter((_, colIndex) => colIndex !== index));
  const addGridCol = () => setNGridCols([...nGridCols, ""]);

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

  const addField = () => {
    const catalogItem = nFieldMode === "catalog" ? filteredFieldCatalog.find(item => String(item.id) === String(nCatalogId)) : null;
    const resolvedType = catalogItem?.type || nType;
    const label = nLabel.trim() || (resolvedType === "person_select" ? "Nome" : "");
    if (!label) return;
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

  const applyScalePreset = cols => setNGridCols(cols);

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
        <Btn v="ghost" icon="back" onClick={goBack} aria-label="Voltar" />
        <div className="create-form-mobile-hero__swatch" aria-hidden="true" />
        <div>
          <h2 style={{ margin: 0, fontSize: 22 }}>{form && !isDuplicateMode ? "Editar Formulario" : "Novo Formulario"}</h2>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: COLORS.textMuted }}>{showTypeSetup ? "Escolha o tipo antes de abrir o editor" : "Configure o formulario e salve na base local"}</p>
        </div>
      </div>

      {showTypeSetup && (
        <div className="create-form-start-card">
          <div style={{ fontSize: 11, fontWeight: 900, color: COLORS.primary, textTransform: "uppercase", letterSpacing: 0.6 }}>Etapa inicial</div>
          <h3 style={{ margin: "4px 0 4px", fontSize: 20, color: COLORS.text }}>Qual estrutura voce vai criar?</h3>
          <p style={{ margin: 0, fontSize: 13, color: COLORS.textSecondary, lineHeight: 1.5 }}>
            A escolha define o editor correto e evita carregar configuracoes que nao pertencem ao tipo do formulario.
          </p>
        </div>
      )}

      {showTypeSetup && (
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
      )}

      {showTypeSetup && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <Btn icon="check" onClick={() => setSetupStep("editor")}>Continuar para o editor</Btn>
        </div>
      )}

      {!showTypeSetup && (
      <>
      {isEditingExistingForm && (
        <SurfacePanel style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.textSecondary, marginBottom: 4 }}>Tipo do formulario</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: COLORS.text }}>
            {format === "escala_organ" ? "Escala da Organ" : "Presenca"}
          </div>
          <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 4 }}>
            O tipo e a estrutura do formulario vigente ficam travados na edicao. Para mudar isso, use duplicacao ou crie um novo formulario.
          </div>
        </SurfacePanel>
      )}

      {!isEditingExistingForm && format === "presenca" && (
        <FormModePanel
          activeModeOption={activeModeOption}
          formMode={formMode}
          membersFieldsCount={membersFieldsCount}
          options={FORM_MODE_OPTIONS}
          onSelectMode={handleModeSelect}
        />
      )}

      {!isEditingExistingForm && (
        <CreateFormTemplateBar
          format={format}
          preset={preset}
          presets={presets}
          formMode={formMode}
          onApplyTemplate={applyTemplate}
          onClearTemplate={() => applyTemplate(null)}
        />
      )}

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
          <FieldControl label="Titulo" required>
            <input
              value={formTitle}
              onChange={event => {
                if (shouldPresetTitle) return;
                setTitle(event.target.value);
              }}
              readOnly={shouldPresetTitle}
              placeholder={shouldPresetTitle ? "Titulo padronizado pelo evento" : "Ex: Presenca Sessao de Escala - 02/05/2026"}
              aria-readonly={shouldPresetTitle}
              style={{
                ...inp,
                fontSize: 14,
                background: shouldPresetTitle ? COLORS.surfaceAlt : COLORS.surface,
                cursor: shouldPresetTitle ? "not-allowed" : "text",
              }}
            />
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>
              {shouldPresetTitle
                ? "O nome deste formulario e padronizado pelo evento."
                : "O nome pode ser editado nesta tela."}
            </div>
          </FieldControl>
        </div>
        <FieldControl label="Descricao / Instrucoes">
          <textarea value={desc} onChange={event => setDesc(event.target.value)} rows={3} placeholder="Prezada Irmandade..." style={{ ...inp, resize: "vertical" }} />
        </FieldControl>
        <div className="create-form-meta-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <FieldControl label="Abertura programada" hint="O formulario vai para aberto automaticamente nesta data.">
            <input type="date" value={eventDate} onChange={event => setEventDate(event.target.value)} style={inp} />
          </FieldControl>
          <FieldControl label="Fechamento automatico" hint="Quando chegar este horario, o formulario fecha sozinho.">
            <input type="datetime-local" value={closingDate} onChange={event => setClosingDate(event.target.value)} style={inp} />
          </FieldControl>
          <FieldControl label="Status">
            <select value={status} onChange={event => setStatus(event.target.value)} style={inp}>
              <option value="rascunho">Rascunho</option>
              <option value="aberto">Aberto</option>
              <option value="fechado">Fechado</option>
              <option value="arquivado">Arquivado</option>
            </select>
          </FieldControl>
        </div>
        <div className="create-form-meta-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <FieldControl label="Total esperado" hint={linkedPeopleField
            ? `Se deixar em branco, o total sera assumido pela base carregada (${people.length} pessoas).`
            : formMode === FORM_MODES.GERAL
              ? "Formulario geral nao usa a base central, entao o sistema nao controla faltantes esperados."
              : "Sem vinculo com a base completa, o sistema nao controla faltantes esperados."}>
            <input
              type="number"
              min="0"
              value={linkedPeopleField ? totalExpected : ""}
              onChange={event => setTotalExpected(event.target.value)}
              placeholder={linkedPeopleField ? String(people.length || "") : "Disponivel apenas com campo de pessoa vinculada"}
              disabled={!linkedPeopleField}
              style={{ ...inp, opacity: linkedPeopleField ? 1 : 0.7 }}
            />
          </FieldControl>
          <FieldControl label="Texto de fechamento">
            <input value={closingText} onChange={event => setClosingText(event.target.value)} style={inp} />
          </FieldControl>
        </div>
      </div>

      <FieldControl label="Classificacoes" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {labels.map(label => (
            <button key={label.id} onClick={() => togLabel(label.id)} style={{ padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, border: "2px solid", cursor: "pointer", transition: "all 0.15s", borderColor: selLabels.includes(label.id) ? label.color : COLORS.borderLight, background: selLabels.includes(label.id) ? label.color : "transparent", color: selLabels.includes(label.id) ? "#fff" : label.color }}>{label.name}</button>
          ))}
        </div>
      </FieldControl>

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
        <ScaleEditorPanel
          scaleLimit={scaleLimit}
          scaleDraft={scaleDraft}
          activeScaleTaskCatalog={activeScaleTaskCatalog}
          inp={inp}
          onScaleLimitChange={value => setScaleLimit(value)}
          onUpdateScale={updateScale}
          onSetScaleMode={setScaleMode}
          onApplyScaleCatalog={applyScaleCatalog}
          onRemoveScaleSection={index => setScaleDraft(scaleDraft.filter((_, sectionIndex) => sectionIndex !== index))}
          onAddScale={addScale}
        />
      )}

      {format === "presenca" && (
        <>
          <PresenceFieldsPanel
            fields={fields}
            FIELD_TYPES={FIELD_TYPES}
            formMode={formMode}
            isMembersSelectionField={isMembersSelectionField}
            getPeopleBaseFieldRole={getPeopleBaseFieldRole}
            summarizeFieldValidation={summarizeFieldValidation}
            externalBaseMap={externalBaseMap}
            onStartEditField={startEditField}
            onToggleFieldShow={handleToggleFieldShow}
            onRemoveField={handleRemoveField}
            onOpenNewFieldDraft={openNewFieldDraft}
            addOpen={addOpen}
            fieldEditor={(
              <FieldEditorPanel
                addOpen={addOpen}
                inp={inp}
                inpSm={inpSm}
                nType={nType}
                nFieldMode={nFieldMode}
                nCatalogId={nCatalogId}
                nLabel={nLabel}
                nRequired={nRequired}
                nValidation={nValidation}
                nGridRows={nGridRows}
                nGridCols={nGridCols}
                formMode={formMode}
                filteredFieldCatalog={filteredFieldCatalog}
                filteredFieldTypes={filteredFieldTypes}
                currentFieldSourceLabel={currentFieldSourceLabel}
                activeSelectionSource={activeSelectionSource}
                externalBaseMap={externalBaseMap}
                hasPrimaryLinkedField={hasPrimaryLinkedField}
                fieldLabel={fieldLabel}
                people={people}
                onSetFieldMode={setFieldMode}
                onApplyFieldCatalog={applyFieldCatalog}
                onSetNType={nextType => {
                  setNType(nextType);
                  setNPersonRole(nextType === "person_select" && hasPrimaryLinkedField ? "secondary" : "primary");
                  setNGridRows(DEFAULT_GRID_ROWS);
                  setNGridCols(DEFAULT_GRID_COLS);
                  setNValidation({});
                }}
                onSetNLabel={setNLabel}
                onSetNRequired={setNRequired}
                onSetNValidation={setNValidation}
                onUpdateGridRow={updateGridRow}
                onRemoveGridRow={removeGridRow}
                onAddGridRow={addGridRow}
                onUpdateGridCol={updateGridCol}
                onRemoveGridCol={removeGridCol}
                onAddGridCol={addGridCol}
                onApplyScalePreset={applyScalePreset}
                scalePresets={SCALE_PRESETS}
                onAddField={addField}
                onOpenNewFieldDraft={openNewFieldDraft}
                onResetFieldDraft={resetFieldDraft}
                isFieldSaveDisabled={isFieldSaveDisabled}
                isEditingField={Boolean(editingFieldId)}
              />
            )}
          />

          <ResultsConfigPanel
            resultsConfig={resultsConfig}
            linkedPeopleField={linkedPeopleField}
            totalizableFields={totalizableFields}
            availableTotals={availableTotals}
            FIELD_TYPES={FIELD_TYPES}
            onChangeResultsConfig={setResultsConfig}
            onMoveTotalLayout={handleMoveTotalLayout}
            onAddTotalField={handleAddTotalField}
          />
        </>
      )}

      <div className="create-form-footer-actions" style={{ display: "flex", gap: 10, justifyContent: "space-between", borderTop: `1px solid ${COLORS.borderLight}`, paddingTop: 16, flexWrap: "wrap" }}>
        {!isEditingExistingForm && (
          <Btn v="secondary" icon="save" onClick={() => setPresetModal(true)}>Salvar como Template</Btn>
        )}
        <Btn icon="check" onClick={() => submitForm(status)} disabled={!formTitle.trim()} loading={saving}>{saving ? "Salvando..." : `${form && !isDuplicateMode ? "Salvar" : "Publicar"} ${format === "escala_organ" ? "Escala" : "Formulario"}`}</Btn>
      </div>
      {saveError && (
        <div style={{ marginTop: 12, background: COLORS.dangerLight, border: `1px solid ${COLORS.danger}`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: COLORS.danger }}>
          {saveError}
        </div>
      )}

      {!isEditingExistingForm && presetModal && (
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
                  goBack();
                }}
              >
                {event ? "Voltar para o evento" : "Voltar para Formularios"}
              </Btn>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};

