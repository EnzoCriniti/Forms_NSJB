/**
 * @file frontend/src/screens/CreateFormScreen.jsx
 * @summary Tela de criacao e edicao de formularios.
 * @responsibility Configurar estrutura dinamica, templates e resultados.
 */

import React, { useEffect, useMemo, useState } from "react";
import { COLORS, Btn, resolveActionErrorMessage } from "../components/ui";
import { CreateFormTemplateBar } from "../components/CreateFormTemplateBar";
import { FieldEditorPanel, FormBasicsPanel, FormContextPanel, FormFooterPanel, FormHeaderPanel, FormModePanel, FormPreviewPanel, FormTypeSetupPanel, PresenceFieldsPanel, ScaleEditorPanel, ResultsConfigPanel } from "./createFormPanels";
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
  buildCreateFormInitialState,
  buildFieldDraftDefaults,
  buildFieldDraftFromExistingField,
  buildFieldDraftFromCatalogItem,
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
    const nextState = buildCreateFormInitialState({ form, isDuplicateMode });
    setFormat(nextState.format);
    setFormMode(nextState.formMode);
    setPreset(nextState.preset);
    setTitle(nextState.title);
    setDesc(nextState.desc);
    setSelLabels(nextState.selLabels);
    setEventDate(nextState.eventDate);
    setClosingDate(nextState.closingDate);
    setStatus(nextState.status);
    setTotalExpected(nextState.totalExpected);
    setClosingText(nextState.closingText);
    setFields(nextState.fields);
    setResultsConfig(nextState.resultsConfig);
    setScaleLimit(nextState.scaleLimit);
    setScaleDraft(nextState.scaleDraft);
    setSetupStep(nextState.setupStep);
  }, [form, isDuplicateMode]);

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
  const templateSummary = format === "escala_organ"
    ? `Salvando ${scaleDraft.length} secoes como template reutilizavel.`
    : `Salvando ${fields.length} campos como template reutilizavel.`;
  const templateDescription = format === "presenca"
    ? "campos, configuracao de resultados, descricao, texto de fechamento e classificacoes."
    : "secoes da escala, descricao, texto de fechamento e classificacoes.";
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
    const draft = buildFieldDraftDefaults({ hasPrimaryLinkedField });
    setEditingFieldId(draft.editingFieldId);
    setNType(draft.nType);
    setNFieldMode(draft.nFieldMode);
    setNCatalogId(draft.nCatalogId);
    setNLabel(draft.nLabel);
    setNRequired(draft.nRequired);
    setNPersonRole(draft.nPersonRole);
    setNGridRows(draft.nGridRows);
    setNGridCols(draft.nGridCols);
    setNValidation(draft.nValidation);
    setAddOpen(draft.addOpen);
  };

  const openNewFieldDraft = () => {
    resetFieldDraft();
    if (!canUseMembersBase) {
      setNType("yes_no");
    }
    setAddOpen(true);
  };

  const startEditField = field => {
    const draft = buildFieldDraftFromExistingField(field, { fields });
    setEditingFieldId(draft.editingFieldId);
    setNType(draft.nType);
    setNFieldMode(draft.nFieldMode);
    setNCatalogId(draft.nCatalogId);
    setNLabel(draft.nLabel);
    setNRequired(draft.nRequired);
    setNPersonRole(draft.nPersonRole);
    setNGridRows(draft.nGridRows);
    setNGridCols(draft.nGridCols);
    setNValidation(draft.nValidation);
    setAddOpen(draft.addOpen);
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
    const draft = buildFieldDraftFromCatalogItem(catalogItem, { hasPrimaryLinkedField, editingFieldId });
    setNType(draft.nType);
    setNLabel(draft.nLabel);
    setNPersonRole(draft.nPersonRole);
    setNGridRows(draft.nGridRows);
    setNGridCols(draft.nGridCols);
    setNValidation(draft.nValidation);
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
      <FormHeaderPanel
        onBack={goBack}
        title={form && !isDuplicateMode ? "Editar Formulario" : "Novo Formulario"}
        subtitle={showTypeSetup ? "Escolha o tipo antes de abrir o editor" : "Configure o formulario e salve na base local"}
      />

      {showTypeSetup && (
        <FormTypeSetupPanel
          format={format}
          onSelectFormat={nextFormat => {
            setFormat(nextFormat);
            setPreset(null);
            if (nextFormat === "presenca") {
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
          onContinue={() => setSetupStep("editor")}
        />
      )}

      {!showTypeSetup && (
      <>
      {isEditingExistingForm && (
        <FormContextPanel
          title="Tipo do formulario"
          body={format === "escala_organ" ? "Escala da Organ" : "Presenca"}
          footer="O tipo e a estrutura do formulario vigente ficam travados na edicao. Para mudar isso, use duplicacao ou crie um novo formulario."
        />
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

      <FormBasicsPanel
        inp={inp}
        formTitle={formTitle}
        shouldPresetTitle={shouldPresetTitle}
        onTitleChange={event => {
          if (shouldPresetTitle) return;
          setTitle(event.target.value);
        }}
        previewDescription={desc}
        onDescriptionChange={event => setDesc(event.target.value)}
        eventDate={eventDate}
        onEventDateChange={event => setEventDate(event.target.value)}
        closingDate={closingDate}
        onClosingDateChange={event => setClosingDate(event.target.value)}
        status={status}
        onStatusChange={event => setStatus(event.target.value)}
        linkedPeopleField={linkedPeopleField}
        peopleCount={people.length}
        onTotalExpectedChange={event => setTotalExpected(event.target.value)}
        totalExpected={totalExpected}
        formMode={formMode}
        closingText={closingText}
        onClosingTextChange={event => setClosingText(event.target.value)}
        labels={labels}
        selectedLabels={selLabels}
        onToggleLabel={togLabel}
        peopleConfigLabel={formMode === FORM_MODES.NUCLEO ? (membersConfig.sheetUrl ? "Google Sheets configurado." : "Configure a fonte em Configuracoes > Base de socios.") : "Base central bloqueada neste formulario geral."}
      />

      <FormPreviewPanel
        showPreview={showPreview}
        format={format}
        previewTitle={previewTitle}
        previewDescription={previewDescription}
        previewClosingText={previewClosingText}
        fields={fields}
        people={people}
        scaleDraft={scaleDraft}
        scaleLimit={scaleLimit}
      />

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

      <FormFooterPanel
        format={format}
        isEditingExistingForm={isEditingExistingForm}
        saving={saving}
        hasError={saveError}
        onOpenPresetModal={() => setPresetModal(true)}
        onSubmit={() => submitForm(status)}
        canSubmit={Boolean(formTitle.trim())}
        presetModal={presetModal}
        presetName={presetName}
        onPresetNameChange={event => setPresetName(event.target.value)}
        onSaveTemplate={saveAsTemplate}
        onClosePresetModal={() => { setPresetModal(false); setPresetName(""); }}
        saveSuccess={saveSuccess}
        onCloseSaveSuccess={() => {
          setSaveSuccess(null);
          goBack();
        }}
        onGoBack={goBack}
        saveSuccessTitle={saveSuccess?.title}
        saveSuccessMessage={saveSuccess?.message}
        submitButtonLabel={`${form && !isDuplicateMode ? "Salvar" : "Publicar"} ${format === "escala_organ" ? "Escala" : "Formulario"}`}
        saveButtonLabel={event ? "Voltar para o evento" : "Voltar para Formularios"}
        templateSummary={templateSummary}
        templateDescription={templateDescription}
        templateButtonLabel="Salvar como Template"
      />
      </>
      )}
    </div>
  );
};

