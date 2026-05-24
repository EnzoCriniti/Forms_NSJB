/**
 * @file frontend/src/features/admin/adminSettingsActions.js
 * @summary Acoes auxiliares da central administrativa.
 * @responsibility Padronizar fluxo de busy, feedback, sucesso e erro dos submits administrativos.
 */

import { resolveActionErrorMessage } from "../../components/ui";

export const runAdminSubmitAction = async ({
  actionKey,
  loadingMessage,
  successMessage,
  setBusyAction,
  setFeedback,
  execute,
  onSuccess,
}) => {
  setBusyAction(actionKey);
  setFeedback({ tone: "loading", message: loadingMessage });
  try {
    const result = await execute();
    if (onSuccess) onSuccess(result);
    const resolvedSuccessMessage = typeof successMessage === "function" ? successMessage(result) : successMessage;
    setFeedback({ tone: "success", message: resolvedSuccessMessage });
    return result;
  } catch (error) {
    setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    return null;
  } finally {
    setBusyAction(null);
  }
};
