/**
 * @file frontend/src/lib/appDataHandlers.js
 * @summary Montagem dos handlers de carregamento incremental do App.
 * @responsibility Agrupar refresh de bootstrap, status de chave e detalhes de formulario fora de App.jsx.
 */

import {
  loadFormEscalaDetail,
  loadFormResponsesDetail,
  refreshAppBootstrap,
  refreshFormDeleteKeyConfiguredStatus,
} from "./appDataLoad";
import {
  fetchBootstrap as apiFetchBootstrap,
  fetchFormDeleteKeyStatus as apiFetchFormDeleteKeyStatus,
  fetchFormEscala as apiFetchFormEscala,
  fetchFormResponses as apiFetchFormResponses,
} from "./api";

export const buildAppDataHandlers = ({
  activeFormId,
  bootstrap,
  currentUser,
  detailLoading,
  escalaDetails,
  fetchBootstrap = apiFetchBootstrap,
  fetchFormDeleteKeyStatus = apiFetchFormDeleteKeyStatus,
  fetchFormEscala = apiFetchFormEscala,
  fetchFormResponses = apiFetchFormResponses,
  normalizeBootstrap,
  pickActiveFormIdAfterBootstrap,
  responseDetails,
  setActiveFormId,
  setBootstrap,
  setDetailLoading,
  setError,
  setEscalaDetails,
  setFormDeleteKeyConfigured,
  setLoading,
  setResponseDetails,
  visibleFormsFor,
}) => {
  const refreshBootstrap = async ({ preserveSelection = true, silent = false, rethrow = false } = {}) => refreshAppBootstrap({
    preserveSelection,
    silent,
    rethrow,
    activeFormId,
    currentUser,
    setLoading,
    setError,
    setBootstrap,
    setActiveFormId,
    fetchBootstrap,
    normalizeBootstrap,
    pickActiveFormIdAfterBootstrap,
    visibleFormsFor,
  });

  const loadEscalaForForm = async (formId, { force = false } = {}) => {
    await loadFormEscalaDetail({
      formId,
      force,
      bootstrapEscalaByForm: bootstrap.escalaByForm,
      escalaDetails,
      detailLoading,
      setDetailLoading,
      setEscalaDetails,
      setError,
      fetchFormEscala,
    });
  };

  return {
    loadEscalaForForm,
    loadResponsesForForm: async formId => {
      await loadFormResponsesDetail({
        formId,
        bootstrapResponsesByForm: bootstrap.responsesByForm,
        responseDetails,
        detailLoading,
        setDetailLoading,
        setResponseDetails,
        setError,
        fetchFormResponses,
      });
    },
    refreshBootstrap,
    refreshEscalaForForm: async formId => loadEscalaForForm(formId, { force: true }),
    refreshFormDeleteKeyStatus: async () => refreshFormDeleteKeyConfiguredStatus({
      fetchFormDeleteKeyStatus,
      setFormDeleteKeyConfigured,
    }),
  };
};
