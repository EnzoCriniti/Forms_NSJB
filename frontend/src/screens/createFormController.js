/**
 * @file frontend/src/screens/createFormController.js
 * @summary Controller local da tela de criacao e edicao de formularios.
 * @responsibility Agrupar estado, derived state e handlers consumidos por CreateFormScreen.
 */

import { useEffect, useMemo, useState } from "react";
import { COLORS } from "../components/ui";
import { FORM_MODES } from "../lib/forms";
import {
  FORM_MODE_OPTIONS,
  buildPresetTitle,
  createDefaultPresenceFields,
} from "./createFormDefaults";
import {
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

export const useCreateFormController = ({
  event,
  externalBases,
  fieldCatalog,
  form,
  isDuplicateMode,
  labels,
  membersConfig,
  onNavigate,
  onSaveForm,
  onSavePreset,
  people,
  presets,
  scaleTaskCatalog,
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
  const derived = useMemo(() => buildCreateFormDerivedState({
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
    ? `Salvando ${scaleDraft.length} seções como template reutilizável.`
    : `Salvando ${fields.length} campos como template reutilizável.`;
  const templateDescription = format === "presenca"
    ? "campos, configuração de resultados, descrição, texto de fechamento e classificações."
    : "seções da escala, descrição, texto de fechamento e classificações.";

  const fieldHandlers = buildCreateFormFieldHandlers({
    fieldDraft,
    setFieldDraft,
    fields,
    setFields,
    setFormMode,
    resultsConfig,
    setResultsConfig,
    setPreset,
    setTotalExpected,
    filteredFieldCatalog: derived.filteredFieldCatalog,
    hasPrimaryLinkedField: derived.hasPrimaryLinkedField,
    canUseMembersBase: derived.canUseMembersBase,
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

  const scaleHandlers = buildCreateFormScaleHandlers({
    scaleDraft,
    setScaleDraft,
    setScaleLimit,
    activeScaleTaskCatalog: derived.activeScaleTaskCatalog,
  });
  const setupHandlers = buildCreateFormSetupHandlers({
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

  const templateHandlers = buildCreateFormTemplateHandlers({
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
  const submitHandlers = buildCreateFormSubmitHandlers({
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
    linkedPeopleField: derived.linkedPeopleField,
    setSaving,
    setSaveError,
    setSaveSuccess,
  });

  return {
    format,
    isEditingExistingForm,
    showTypeSetup,
    headerProps: {
      onBack: goBack,
      title: form && !isDuplicateMode ? "Editar Formulário" : "Novo Formulário",
      subtitle: showTypeSetup ? "Escolha o tipo antes de abrir o editor" : "Configure o formulário e salve na base local",
    },
    typeSetupProps: {
      format,
      onSelectFormat: setupHandlers.selectFormat,
      onContinue: setupHandlers.continueSetup,
    },
    contextProps: {
      title: "Tipo do formulário",
      body: format === "escala_organ" ? "Escala da Organ" : "Presença",
      footer: "O tipo e a estrutura do formulário vigente ficam travados na edição. Para mudar isso, use duplicação ou crie um novo formulário.",
    },
    modePanelProps: {
      activeModeOption: derived.activeModeOption,
      formMode,
      membersFieldsCount: derived.membersFieldsCount,
      options: FORM_MODE_OPTIONS,
      onSelectMode: fieldHandlers.handleModeSelect,
    },
    templateBarProps: {
      format,
      preset,
      presets,
      formMode,
      onApplyTemplate: templateHandlers.applyTemplate,
      onClearTemplate: templateHandlers.clearTemplate,
    },
    previewToggleProps: {
      variant: showPreview ? "secondary" : "primary",
      label: showPreview ? "Ocultar visualização" : "Visualizar formulário",
      onClick: setupHandlers.togglePreview,
    },
    basicsProps: {
      inp,
      formTitle,
      shouldPresetTitle,
      onTitleChange: setupHandlers.handleTitleChange,
      previewDescription: desc,
      onDescriptionChange: event => setDesc(event.target.value),
      eventDate,
      onEventDateChange: event => setEventDate(event.target.value),
      closingDate,
      onClosingDateChange: event => setClosingDate(event.target.value),
      status,
      onStatusChange: event => setStatus(event.target.value),
      linkedPeopleField: derived.linkedPeopleField,
      peopleCount: people.length,
      onTotalExpectedChange: event => setTotalExpected(event.target.value),
      totalExpected,
      formMode,
      closingText,
      onClosingTextChange: event => setClosingText(event.target.value),
      labels,
      selectedLabels: selLabels,
      onToggleLabel: setupHandlers.togLabel,
      peopleConfigLabel: formMode === FORM_MODES.NUCLEO ? (membersConfig.sheetUrl ? "Google Sheets configurado." : "Configure a fonte em Configurações > Base de sócios.") : "Base central bloqueada neste formulário geral.",
    },
    previewProps: {
      showPreview,
      format,
      previewTitle,
      previewDescription,
      previewClosingText,
      fields,
      people,
      scaleDraft,
      scaleLimit,
    },
    scaleEditorProps: {
      scaleLimit,
      scaleDraft,
      activeScaleTaskCatalog: derived.activeScaleTaskCatalog,
      inp,
      onScaleLimitChange: scaleHandlers.updateScaleLimit,
      onUpdateScale: scaleHandlers.updateScale,
      onSetScaleMode: scaleHandlers.setScaleMode,
      onApplyScaleCatalog: scaleHandlers.applyScaleCatalog,
      onRemoveScaleSection: scaleHandlers.removeScaleSection,
      onAddScale: scaleHandlers.addScale,
    },
    presenceSectionProps: {
      fieldsPanel: {
        addOpen,
        externalBaseMap: derived.externalBaseMap,
        fields,
        formMode,
        onOpenNewFieldDraft: fieldHandlers.openNewFieldDraft,
        onRemoveField: fieldHandlers.handleRemoveField,
        onStartEditField: fieldHandlers.startEditField,
        onToggleFieldShow: fieldHandlers.handleToggleFieldShow,
      },
      fieldEditor: {
        addOpen,
        activeSelectionSource: derived.activeSelectionSource,
        currentFieldSourceLabel: derived.currentFieldSourceLabel,
        externalBaseMap: derived.externalBaseMap,
        fieldLabel,
        filteredFieldCatalog: derived.filteredFieldCatalog,
        filteredFieldTypes: derived.filteredFieldTypes,
        formMode,
        hasPrimaryLinkedField: derived.hasPrimaryLinkedField,
        inp,
        inpSm,
        isEditingField: Boolean(editingFieldId),
        isFieldSaveDisabled: derived.isFieldSaveDisabled,
        nCatalogId,
        nFieldMode,
        nGridCols,
        nGridRows,
        nLabel,
        nRequired,
        nType,
        nValidation,
        onAddField: fieldHandlers.addField,
        onAddGridCol: fieldHandlers.addGridCol,
        onAddGridRow: fieldHandlers.addGridRow,
        onApplyFieldCatalog: fieldHandlers.applyFieldCatalog,
        onApplyScalePreset: fieldHandlers.applyScalePreset,
        onOpenNewFieldDraft: fieldHandlers.openNewFieldDraft,
        onRemoveGridCol: fieldHandlers.removeGridCol,
        onRemoveGridRow: fieldHandlers.removeGridRow,
        onResetFieldDraft: fieldHandlers.resetFieldDraft,
        onSetFieldMode: fieldHandlers.setFieldMode,
        onSetNLabel: fieldHandlers.setNLabel,
        onSetNRequired: fieldHandlers.setNRequired,
        onSetNType: fieldHandlers.setFieldType,
        onSetNValidation: fieldHandlers.setNValidation,
        onUpdateGridCol: fieldHandlers.updateGridCol,
        onUpdateGridRow: fieldHandlers.updateGridRow,
        people,
      },
      resultsConfig: {
        availableTotals: derived.availableTotals,
        linkedPeopleField: derived.linkedPeopleField,
        onAddTotalField: handleAddTotalField,
        onChangeResultsConfig: setResultsConfig,
        onMoveTotalLayout: handleMoveTotalLayout,
        resultsConfig,
        totalizableFields: derived.totalizableFields,
      },
    },
    footerProps: {
      format,
      isEditingExistingForm,
      saving,
      hasError: saveError,
      onOpenPresetModal: setupHandlers.openPresetModal,
      onSubmit: submitHandlers.handleSubmitCurrentStatus,
      canSubmit: Boolean(formTitle.trim()),
      presetModal,
      presetName,
      onPresetNameChange: setupHandlers.handlePresetNameChange,
      onSaveTemplate: templateHandlers.saveAsTemplate,
      onClosePresetModal: setupHandlers.closePresetModal,
      saveSuccess,
      onCloseSaveSuccess: submitHandlers.closeSaveSuccess,
      onGoBack: goBack,
      saveSuccessTitle: saveSuccess?.title,
      saveSuccessMessage: saveSuccess?.message,
      submitButtonLabel: `${form && !isDuplicateMode ? "Salvar" : "Publicar"} ${format === "escala_organ" ? "Escala" : "Formulário"}`,
      saveButtonLabel: event ? "Voltar para o evento" : "Voltar para Formulários",
      templateSummary,
      templateDescription,
      templateButtonLabel: "Salvar como Template",
    },
  };
};
