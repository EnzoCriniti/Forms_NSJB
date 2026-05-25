/**
 * @file frontend/src/lib/appFormHandlers.js
 * @summary Montagem dos handlers de formularios usados pelo App principal.
 * @responsibility Agrupar wrappers de formularios, respostas e escala fora de App.jsx.
 */

import { archiveAppForm, claimAppEscalaSlot, deleteAppForm, saveAppEscala, saveAppForm, saveAppResponse, startDuplicateForm } from "./appFormActions";

export const buildAppFormHandlers = ({
  activeEventId,
  buildDuplicateFormDraft,
  buildEscalaMetrics,
  buildSaveFormPayloadFromExisting,
  canCreateForms,
  claimEscalaSlot,
  currentUser,
  deleteForm,
  events,
  refreshBootstrap,
  refreshEscalaForForm,
  removeFormDetail,
  removeFormIdFromEvents,
  replaceBootstrapList,
  saveEscala,
  saveEvent,
  saveForm,
  saveResponse,
  setActiveFormId,
  setBootstrap,
  setDraftForm,
  setEditingFormId,
  setEscalaDetails,
  setPinnedFormsByUser,
  setResponseDetails,
  setScreen,
  togglePinnedIdForUser,
  updateBootstrapFormMetrics,
  upsertFormDetail,
}) => ({
  handleSaveForm: async payload => saveAppForm({
    payload,
    activeEventId,
    events,
    saveForm,
    saveEvent,
    refreshBootstrap,
    setActiveFormId,
    setBootstrap,
    setDraftForm,
    setEditingFormId,
    replaceBootstrapList,
  }),

  handleDuplicateForm: form => {
    startDuplicateForm({
      form,
      currentUser,
      canCreateForms,
      buildDuplicateFormDraft,
      setActiveFormId,
      setDraftForm,
      setEditingFormId,
      setScreen,
    });
  },

  handleArchiveForm: async (form, nextStatus) => archiveAppForm({
    form,
    nextStatus,
    currentUser,
    canCreateForms,
    buildSaveFormPayloadFromExisting,
    saveForm,
    refreshBootstrap,
    setActiveFormId,
    setDraftForm,
    setEditingFormId,
  }),

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
