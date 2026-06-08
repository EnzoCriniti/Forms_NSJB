/**
 * @file frontend/src/lib/appFormCreateHandlers.js
 * @summary Handlers de criacao, duplicacao e arquivamento de formularios usados pelo shell principal.
 * @responsibility Conectar acoes de entrada de formulario aos setters e servicos do App.
 */

import { archiveAppForm, saveAppForm, startDuplicateForm } from "./appFormEntryActions";

export const buildAppFormCreateHandlers = ({
  activeEventId,
  buildDuplicateFormDraft,
  buildSaveFormPayloadFromExisting,
  canCreateForms,
  currentUser,
  events,
  refreshBootstrap,
  saveEvent,
  saveForm,
  setActiveFormId,
  setBootstrap,
  setDraftForm,
  setEditingFormId,
  setScreen,
  replaceBootstrapList,
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
});
