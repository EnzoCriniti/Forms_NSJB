import { resolveActionErrorMessage } from "../../components/ui";

export const runMessagingSettingsAction = async ({
  execute,
  loadingMessage,
  onSuccess,
  setBusy,
  setFeedback,
  successMessage,
}) => {
  setBusy?.(true);
  if (loadingMessage) {
    setFeedback({ tone: "loading", message: loadingMessage });
  }

  try {
    const result = await execute();
    onSuccess?.(result);
    if (successMessage) {
      setFeedback({ tone: "success", message: successMessage });
    }
    return result;
  } catch (error) {
    setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    return null;
  } finally {
    setBusy?.(false);
  }
};
