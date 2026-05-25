/**
 * @file frontend/src/screens/CreateFormScreen.jsx
 * @summary Tela de criacao e edicao de formularios.
 * @responsibility Configurar estrutura dinamica, templates e resultados.
 */

import React, { useEffect, useMemo, useState } from "react";
import { COLORS, Btn } from "../components/ui";
import { CreateFormTemplateBar } from "../components/CreateFormTemplateBar";
import { FormBasicsPanel, FormContextPanel, FormHeaderPanel, FormModePanel, FormTypeSetupPanel } from "../features/forms/createFormPanels/setupPanels";
import { FieldEditorPanel, PresenceFieldsPanel } from "../features/forms/createFormPanels/fieldPanels";
import { FormFooterPanel, FormPreviewPanel, ResultsConfigPanel, ScaleEditorPanel } from "../features/forms/createFormPanels/finalPanels";
import { FORM_MODES, getPeopleBaseFieldRole, isMembersSelectionField, summarizeFieldValidation } from "../lib/forms";
import {
  FIELD_TYPES,
  FORM_MODE_OPTIONS,
  buildPresetTitle,
  createDefaultPresenceFields,
} from "./createFormDefaults";
import {
  SCALE_PRESETS,
  buildFieldDraftDefaults,
} from "./createFormFieldDraft";
import { createDefaultScaleSections } from "./createFormScaleDraft";
import { moveItem } from "./createFormListHelpers";
import {
  addTotalLayoutField,
  createDefaultResultsConfig,
} from "./createFormResultsConfig";
import {
  buildCreateFormInitialState,
} from "./createFormState";
import { buildCreateFormDerivedState } from "./createFormDerivedState";
import { buildCreateFormFieldHandlers } from "./createFormFieldHandlers";
import { buildCreateFormScaleHandlers } from "./createFormScaleHandlers";
import { buildCreateFormSetupHandlers } from "./createFormSetupHandlers";
import { buildCreateFormTemplateHandlers } from "./createFormTemplateHandlers";
import { buildCreateFormSubmitHandlers } from "./createFormSubmitHandlers";

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
  const {
    addField,
    addGridCol,
    addGridRow,
    applyFieldCatalog,
    applyScalePreset,
    handleModeSelect,
    handleRemoveField,
    handleToggleFieldShow,
    openNewFieldDraft,
    removeGridCol,
    removeGridRow,
    resetFieldDraft,
    setFieldMode,
    setFieldType,
    setNLabel,
    setNRequired,
    setNValidation,
    startEditField,
    updateGridCol,
    updateGridRow,
  } = buildCreateFormFieldHandlers({
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
  });
  const handleMoveTotalLayout = (index, direction) => {
    setResultsConfig(current => ({ ...current, totalsLayout: moveItem(current.totalsLayout, index, direction) }));
  };
  const handleAddTotalField = field => {
    setResultsConfig(current => ({
      ...current,
      totalsLayout: addTotalLayoutField(current.totalsLayout, field),
    }));
  };

  const {
    addScale,
    applyScaleCatalog,
    removeScaleSection,
    setScaleMode,
    updateScale,
    updateScaleLimit,
  } = buildCreateFormScaleHandlers({
    scaleDraft,
    setScaleDraft,
    setScaleLimit,
    activeScaleTaskCatalog,
  });
  const {
    closePresetModal,
    continueSetup,
    handlePresetNameChange,
    handleTitleChange,
    openPresetModal,
    selectFormat,
    togLabel,
    togglePreview,
  } = buildCreateFormSetupHandlers({
    shouldPresetTitle,
    setTitle,
    setPreset,
    setFormat,
    setFormMode,
    setFields,
    setResultsConfig,
    setScaleDraft,
    setScaleLimit,
    setSetupStep,
    setShowPreview,
    setPresetModal,
    setPresetName,
    setSelLabels,
  });

  const { applyTemplate, clearTemplate, saveAsTemplate } = buildCreateFormTemplateHandlers({
    presets,
    presetName,
    setPresetName,
    setPresetModal,
    onSavePreset,
    format,
    setFormat,
    formMode,
    setFormMode,
    desc,
    setDesc,
    closingText,
    setClosingText,
    selLabels,
    setSelLabels,
    fields,
    setFields,
    resultsConfig,
    setResultsConfig,
    scaleLimit,
    setScaleLimit,
    scaleDraft,
    setScaleDraft,
    setPreset,
  });
  const { closeSaveSuccess, handleSubmitCurrentStatus } = buildCreateFormSubmitHandlers({
    onSaveForm,
    goBack,
    status,
    form,
    isDuplicateMode,
    format,
    formMode,
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
    setSaving,
    setSaveError,
    setSaveSuccess,
  });

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

