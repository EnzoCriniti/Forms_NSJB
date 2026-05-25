import { buildCreateFormFormatSelectionState } from "./createFormState";

export const buildCreateFormSetupHandlers = ({
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
}) => ({
  closePresetModal: () => {
    setPresetModal(false);
    setPresetName("");
  },
  continueSetup: () => setSetupStep("editor"),
  handlePresetNameChange: event => setPresetName(event.target.value),
  handleTitleChange: event => {
    if (shouldPresetTitle) return;
    setTitle(event.target.value);
  },
  openPresetModal: () => setPresetModal(true),
  selectFormat: nextFormat => {
    setPreset(null);
    const nextState = buildCreateFormFormatSelectionState(nextFormat);
    setFormat(nextState.format);
    setFormMode(nextState.formMode);
    setFields(nextState.fields);
    if (nextState.resultsConfig) setResultsConfig(nextState.resultsConfig);
    if (nextState.scaleDraft) setScaleDraft(nextState.scaleDraft);
    if (nextState.scaleLimit !== undefined) setScaleLimit(nextState.scaleLimit);
  },
  togLabel: id => setSelLabels(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]),
  togglePreview: () => setShowPreview(prev => !prev),
});
