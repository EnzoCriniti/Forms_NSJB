import { createDefaultPresenceFields } from "./createFormDefaults";
import { createDefaultResultsConfig } from "./createFormResultsConfig";
import { createDefaultScaleSections } from "./createFormScaleDraft";
import { buildCreateFormTemplatePayload, buildCreateFormTemplateState } from "./createFormTemplates";

export const buildCreateFormTemplateHandlers = ({
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
}) => {
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

  return {
    applyTemplate,
    clearTemplate: () => applyTemplate(null),
    saveAsTemplate,
  };
};
