import { resolveActionErrorMessage } from "../components/ui";
import { buildCreateFormPayload } from "./createFormPayload";
import { buildCreateFormSaveOutcome } from "./createFormState";

export const buildCreateFormSubmitHandlers = ({
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
}) => {
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

  return {
    closeSaveSuccess: () => {
      setSaveSuccess(null);
      goBack();
    },
    handleSubmitCurrentStatus: () => submitForm(status),
    submitForm,
  };
};
