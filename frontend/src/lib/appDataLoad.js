/**
 * @file frontend/src/lib/appDataLoad.js
 * @summary Carregamento de detalhes do shell do app.
 * @responsibility Padronizar leitura incremental de respostas e secoes de escala por formulario.
 */

export const hasLoadedFormDetails = ({ bootstrapDetails = {}, details = {}, formId }) => (
  Object.prototype.hasOwnProperty.call(bootstrapDetails || {}, formId)
    || Object.prototype.hasOwnProperty.call(details || {}, formId)
);

export const isDetailLoadInFlight = ({ detailLoading, kind, formId }) => (
  detailLoading?.kind === kind && detailLoading.formId === formId
);

export const removeFormDetail = (details, formId) => {
  const next = { ...details };
  delete next[formId];
  return next;
};

export const upsertFormDetail = (details, formId, value) => ({
  ...details,
  [formId]: value,
});

export const shouldSkipDetailLoad = ({
  force = false,
  kind,
  formId,
  bootstrapDetails = {},
  details = {},
  detailLoading = null,
}) => (
  !force && (
    hasLoadedFormDetails({ bootstrapDetails, details, formId })
      || isDetailLoadInFlight({ detailLoading, kind, formId })
  )
);

export const loadFormResponsesDetail = async ({
  formId,
  bootstrapResponsesByForm,
  responseDetails,
  detailLoading,
  setDetailLoading,
  setResponseDetails,
  setError,
  fetchFormResponses,
}) => {
  if (shouldSkipDetailLoad({
    kind: "responses",
    formId,
    bootstrapDetails: bootstrapResponsesByForm,
    details: responseDetails,
    detailLoading,
  })) return;

  setDetailLoading({ kind: "responses", formId });
  try {
    const result = await fetchFormResponses(formId);
    setResponseDetails(prev => upsertFormDetail(prev, formId, result.responses || []));
  } catch (loadError) {
    setError(loadError.message || "Erro ao carregar dados.");
  } finally {
    setDetailLoading(current => isDetailLoadInFlight({ detailLoading: current, kind: "responses", formId }) ? null : current);
  }
};

export const loadFormEscalaDetail = async ({
  formId,
  force = false,
  bootstrapEscalaByForm,
  escalaDetails,
  detailLoading,
  setDetailLoading,
  setEscalaDetails,
  setError,
  fetchFormEscala,
}) => {
  if (shouldSkipDetailLoad({
    force,
    kind: "escala",
    formId,
    bootstrapDetails: bootstrapEscalaByForm,
    details: escalaDetails,
    detailLoading,
  })) return;

  setDetailLoading({ kind: "escala", formId });
  try {
    const result = await fetchFormEscala(formId);
    setEscalaDetails(prev => upsertFormDetail(prev, formId, result.sections || []));
  } catch (loadError) {
    setError(loadError.message || "Erro ao carregar dados.");
  } finally {
    setDetailLoading(current => isDetailLoadInFlight({ detailLoading: current, kind: "escala", formId }) ? null : current);
  }
};
