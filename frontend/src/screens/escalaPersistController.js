/**
 * @file frontend/src/screens/escalaPersistController.js
 * @summary Executor de persistencia das alteracoes da escala de resultados.
 */

import { useState } from "react";
import { resolveActionErrorMessage } from "../components/ui";

export const useEscalaPersistController = ({ onSaveSections, setFeedback }) => {
  const [busyAction, setBusyAction] = useState(null);

  const persistSections = async (next, successMessage = "Alteracoes salvas.") => {
    setFeedback({ tone: "loading", message: "Salvando escala..." });
    await onSaveSections(next);
    setFeedback({ tone: "success", message: successMessage });
  };

  const runPersistAction = async ({ busyKey, next, successMessage, afterSuccess }) => {
    setBusyAction(busyKey);
    try {
      await persistSections(next, successMessage);
      afterSuccess?.();
    } catch (error) {
      setFeedback({ tone: "error", message: resolveActionErrorMessage(error) });
    } finally {
      setBusyAction(null);
    }
  };

  return {
    busyAction,
    runPersistAction,
  };
};
