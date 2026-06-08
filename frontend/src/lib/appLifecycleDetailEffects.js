import { useEffect } from "react";

export const useAppLifecycleDetailEffects = ({
  activeForm,
  detailLoading,
  error,
  escalaByForm,
  loadEscalaForForm,
  loadResponsesForForm,
  publicForm,
  publicResultsView,
  resolveAppDetailLoadRequest,
  responsesByForm,
  screen,
}) => {
  useEffect(() => {
    if (error) return undefined;
    const loadRequest = resolveAppDetailLoadRequest({
      publicForm,
      publicResultsView,
      screen,
      activeForm,
      responsesByForm,
      escalaByForm,
      detailLoading,
    });
    if (!loadRequest) return undefined;

    if (loadRequest.kind === "escala") {
      loadEscalaForForm(loadRequest.formId);
    } else {
      loadResponsesForForm(loadRequest.formId);
    }

    return undefined;
  }, [
    activeForm?.id,
    activeForm?.type,
    detailLoading?.formId,
    detailLoading?.kind,
    error,
    escalaByForm,
    publicForm?.closing,
    publicForm?.id,
    publicForm?.status,
    publicForm?.type,
    publicResultsView,
    responsesByForm,
    screen,
  ]);
};
