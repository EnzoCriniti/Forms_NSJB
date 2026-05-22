/**
 * @file frontend/src/screens/CreateFormScreen.jsx
 * @summary Tela de criacao e edicao de formularios.
 * @responsibility Configurar estrutura dinamica, templates e resultados.
 */

import React, { useEffect, useMemo, useState } from "react";
import { COLORS, Btn, resolveActionErrorMessage } from "../components/ui";
import { CreateFormTemplateBar } from "../components/CreateFormTemplateBar";
import { FieldEditorPanel, FormBasicsPanel, FormContextPanel, FormFooterPanel, FormHeaderPanel, FormModePanel, FormPreviewPanel, FormTypeSetupPanel, PresenceFieldsPanel, ScaleEditorPanel, ResultsConfigPanel } from "./createFormPanels";
import { FORM_MODES, getPeopleBaseFieldRole, isMembersSelectionField, summarizeFieldValidation } from "../lib/forms";
import {
  FIELD_TYPES,
  FORM_MODE_OPTIONS,
  buildPresetTitle,
  createDefaultPresenceFields,
} from "./createFormDefaults";
import {
  SCALE_PRESETS,
  buildAppliedCatalogFieldDraft,
  buildFieldDraftDefaults,
  buildFieldDraftFromExistingField,
  buildFieldTypeTransition,
  buildOpenFieldDraft,
} from "./createFormFieldDraft";
import {
  buildFieldSavePayload,
  mergeSavedField,
} from "./createFormFieldSave";
import {
  normalizePeopleBaseBindings,
} from "./createFormMemberBindings";
import {
  appendScaleSection,
  buildScaleCatalogPatch,
  buildScaleModePatch,
  createDefaultScaleSections,
  updateScaleSection,
} from "./createFormScaleDraft";
import {
  appendListItem,
  moveItem,
  removeFieldById,
  removeListItemAtIndex,
  toggleFieldShow,
  updateListItemAtIndex,
} from "./createFormListHelpers";
import {
  addTotalLayoutField,
  createDefaultResultsConfig,
} from "./createFormResultsConfig";
import {
  buildCreateFormFormatSelectionState,
  buildCreateFormInitialState,
  buildCreateFormSaveOutcome,
} from "./createFormState";
import { buildCreateFormModeTransition } from "./createFormModeTransition";
import { buildCreateFormDerivedState } from "./createFormDerivedState";
import { buildCreateFormTemplatePayload, buildCreateFormTemplateState } from "./createFormTemplates";
import { buildCreateFormPayload } from "./createFormPayload";

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
  const [fieldDraft, setFieldDraft] = useState(() => buildFieldDraftDefaults());
  const [presetModal, setPresetModal] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [setupStep, setSetupStep] = useState("type");
  const {
    addOpen,
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
  const {
    linkedPeopleField,
    totalizableFields,
    activeScaleTaskCatalog,
    externalBaseMap,
    availableTotals,
    canUseMembersBase,
    hasPrimaryLinkedField,
    filteredFieldTypes,
    filteredFieldCatalog,
    activeSelectionSource,
    currentFieldSourceLabel,
    membersFieldsCount,
    activeModeOption,
    isFieldSaveDisabled,
  } = useMemo(() => buildCreateFormDerivedState({
    format,
    formMode,
    fields,
    fieldCatalog,
    scaleTaskCatalog,
    externalBases,
    resultsConfig,
    editingFieldId,
    nFieldMode,
    nType,
    nCatalogId,
    nLabel,
  }), [format, formMode, fields, fieldCatalog, scaleTaskCatalog, externalBases, resultsConfig, editingFieldId, nFieldMode, nType, nCatalogId, nLabel]);
  const previewTitle = title.trim();
  const previewDescription = desc.trim();
  const previewClosingText = closingText.trim();
  const shouldPresetTitle = Boolean(event) && !form && (format === "presenca" || format === "escala_organ");
  const presetTitle = shouldPresetTitle ? buildPresetTitle(format, event) : "";
  const formTitle = shouldPresetTitle ? presetTitle : title;
  const isEditingExistingForm = Boolean(form) && !isDuplicateMode;
  const showTypeSetup = !form && !isDuplicateMode && setupStep === "type";
  const templateSummary = format === "escala_organ"
    ? `Salvando ${scaleDraft.length} secoes como template reutilizavel.`
    : `Salvando ${fields.length} campos como template reutilizavel.`;
  const templateDescription = format === "presenca"
    ? "campos, configuracao de resultados, descricao, texto de fechamento e classificacoes."
    : "secoes da escala, descricao, texto de fechamento e classificacoes.";
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
  const handleModeSelect = nextMode => syncModeWithFields(nextMode);
  const handleToggleFieldShow = fieldId => setFields(toggleFieldShow(fields, fieldId));
  const handleRemoveField = fieldId => setFields(removeFieldById(fields, fieldId));
  const handleMoveTotalLayout = (index, direction) => {
    setResultsConfig(current => ({ ...current, totalsLayout: moveItem(current.totalsLayout, index, direction) }));
  };
  const handleAddTotalField = field => {
    setResultsConfig(current => ({
      ...current,
      totalsLayout: addTotalLayoutField(current.totalsLayout, field),
    }));
  };
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

  const togLabel = id => setSelLabels(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  const updateScale = (index, patch) => setScaleDraft(updateScaleSection(scaleDraft, index, patch));
  const addScale = () => setScaleDraft(appendScaleSection(scaleDraft));
  const updateGridRow = (index, value) => setNGridRows(updateListItemAtIndex(nGridRows, index, value));
  const removeGridRow = index => setNGridRows(removeListItemAtIndex(nGridRows, index));
  const addGridRow = () => setNGridRows(appendListItem(nGridRows));
  const updateGridCol = (index, value) => setNGridCols(updateListItemAtIndex(nGridCols, index, value));
  const removeGridCol = index => setNGridCols(removeListItemAtIndex(nGridCols, index));
  const addGridCol = () => setNGridCols(appendListItem(nGridCols));
  const togglePreview = () => setShowPreview(prev => !prev);
  const openPresetModal = () => setPresetModal(true);
  const closePresetModal = () => {
    setPresetModal(false);
    setPresetName("");
  };
  const handlePresetNameChange = event => setPresetName(event.target.value);
  const handleSubmitCurrentStatus = () => submitForm(status);
  const closeSaveSuccess = () => {
    setSaveSuccess(null);
    goBack();
  };
  const handleTitleChange = event => {
    if (shouldPresetTitle) return;
    setTitle(event.target.value);
  };
  const selectFormat = nextFormat => {
    setPreset(null);
    const nextState = buildCreateFormFormatSelectionState(nextFormat);
    setFormat(nextState.format);
    setFormMode(nextState.formMode);
    setFields(nextState.fields);
    if (nextState.resultsConfig) setResultsConfig(nextState.resultsConfig);
    if (nextState.scaleDraft) setScaleDraft(nextState.scaleDraft);
    if (nextState.scaleLimit !== undefined) setScaleLimit(nextState.scaleLimit);
  };
  const continueSetup = () => setSetupStep("editor");

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

  const setScaleMode = (index, mode) => {
    updateScale(index, buildScaleModePatch(mode));
  };

  const applyScaleCatalog = (index, catalogId) => {
    updateScale(index, buildScaleCatalogPatch(catalogId, activeScaleTaskCatalog));
  };
  const updateScaleLimit = value => setScaleLimit(value);
  const removeScaleSection = index => setScaleDraft(removeListItemAtIndex(scaleDraft, index));

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
    const nextState = buildCreateFormTemplateState(found);
    setFormat(nextState.format);
    setFormMode(nextState.formMode);
    if (nextState.fields) setFields(nextState.fields);
    if (nextState.scaleDraft) setScaleDraft(nextState.scaleDraft);
    if (nextState.desc !== null) setDesc(nextState.desc);
    if (nextState.closingText !== null) setClosingText(nextState.closingText);
    if (nextState.selLabels) setSelLabels(nextState.selLabels);
    setResultsConfig(nextState.resultsConfig);
    setScaleLimit(nextState.scaleLimit);
  };
  const clearTemplate = () => applyTemplate(null);

  const saveAsTemplate = async () => {
    if (!presetName.trim()) return;
    await onSavePreset(buildCreateFormTemplatePayload({
      type: format,
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
    }));
    setPresetName("");
    setPresetModal(false);
  };

  const applyScalePreset = cols => setNGridCols(cols);

  const submitForm = async nextStatus => {
    setSaving(true);
    setSaveError("");
    try {
      await onSaveForm(buildCreateFormPayload({
        form,
        format,
        formMode,
        status: nextStatus,
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
      }));
      setSaveSuccess(buildCreateFormSaveOutcome({ form, isDuplicateMode }));
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
          onSelectFormat={selectFormat}
          onContinue={continueSetup}
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
          onClearTemplate={clearTemplate}
        />
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Btn
          v={showPreview ? "secondary" : "primary"}
          icon="eye"
          onClick={togglePreview}
        >
          {showPreview ? "Ocultar visualizacao" : "Visualizar formulario"}
        </Btn>
      </div>

      <FormBasicsPanel
        inp={inp}
        formTitle={formTitle}
        shouldPresetTitle={shouldPresetTitle}
        onTitleChange={handleTitleChange}
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
          onScaleLimitChange={updateScaleLimit}
          onUpdateScale={updateScale}
          onSetScaleMode={setScaleMode}
          onApplyScaleCatalog={applyScaleCatalog}
          onRemoveScaleSection={removeScaleSection}
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
                onSetNType={setFieldType}
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
        onOpenPresetModal={openPresetModal}
        onSubmit={handleSubmitCurrentStatus}
        canSubmit={Boolean(formTitle.trim())}
        presetModal={presetModal}
        presetName={presetName}
        onPresetNameChange={handlePresetNameChange}
        onSaveTemplate={saveAsTemplate}
        onClosePresetModal={closePresetModal}
        saveSuccess={saveSuccess}
        onCloseSaveSuccess={closeSaveSuccess}
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

