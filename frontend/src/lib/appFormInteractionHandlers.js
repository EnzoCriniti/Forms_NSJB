/**
 * @file frontend/src/lib/appFormInteractionHandlers.js
 * @summary Handlers de interacao com formularios, respostas e escala usados pelo shell principal.
 * @responsibility Conectar mutacoes de formulario e respostas aos setters e servicos do App.
 */

import { claimAppEscalaSlot, deleteAppForm, saveAppEscala, saveAppResponse } from "./appFormMutationActions";

export const buildAppFormInteractionHandlers = ({
  buildEscalaMetrics,
  claimEscalaSlot,
  currentUser,
  deleteForm,
  refreshBootstrap,
  refreshEscalaForForm,
  removeFormDetail,
  removeFormIdFromEvents,
  saveEscala,
  saveResponse,
  setBootstrap,
  setEscalaDetails,
  setPinnedFormsByUser,
  setResponseDetails,
  togglePinnedIdForUser,
  updateBootstrapFormMetrics,
  upsertFormDetail,
}) => ({
  handleTogglePinnedForm: formId => {
    setPinnedFormsByUser(prev => togglePinnedIdForUser(prev, currentUser?.id, formId));
  },

  handleDeleteForm: async (formId, masterKey) => deleteAppForm({
    formId,
    masterKey,
    deleteForm,
    refreshBootstrap,
    setBootstrap,
    setEscalaDetails,
    setResponseDetails,
    removeFormDetail,
    removeFormIdFromEvents,
  }),

  handleSaveResponse: async payload => {
    await saveAppResponse({
      payload,
      saveResponse,
      setBootstrap,
      setResponseDetails,
      updateBootstrapFormMetrics,
      upsertFormDetail,
    });
  },

  handleSaveEscala: async (formId, sections) => {
    await saveAppEscala({
      formId,
      sections,
      saveEscala,
      setBootstrap,
      setEscalaDetails,
      buildEscalaMetrics,
      updateBootstrapFormMetrics,
      upsertFormDetail,
    });
  },

  handleClaimEscalaSlot: async (formId, sectionIndex, slotIndex, person) => claimAppEscalaSlot({
    formId,
    sectionIndex,
    slotIndex,
    person,
    claimEscalaSlot,
    refreshEscalaForForm,
    setBootstrap,
    setEscalaDetails,
    buildEscalaMetrics,
    updateBootstrapFormMetrics,
    upsertFormDetail,
  }),
});
